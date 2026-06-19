import { useState, useEffect } from "react";
import { auth, db } from "../firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function AIBudgetAdjuster() {
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [suggestedBudget, setSuggestedBudget] = useState(null);
  const [spendingData, setSpendingData] = useState(null);
  const [adjustmentReason, setAdjustmentReason] = useState(null);
  const [categoryMap, setCategoryMap] = useState({});
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const d = isDark;

  const defaultCategoryDefs = [
    { id: "food", name: "Food & Dining", icon: "🍽️", color: "#f97316" },
    { id: "transport", name: "Transportation", icon: "🚗", color: "#3b82f6" },
    { id: "shopping", name: "Shopping", icon: "🛍️", color: "#ec4899" },
    {
      id: "entertainment",
      name: "Entertainment",
      icon: "🎬",
      color: "#a855f7",
    },
    { id: "bills", name: "Bills & Utilities", icon: "📄", color: "#eab308" },
    { id: "healthcare", name: "Healthcare", icon: "🏥", color: "#ef4444" },
    { id: "education", name: "Education", icon: "📚", color: "#22c55e" },
    { id: "travel", name: "Travel", icon: "✈️", color: "#06b6d4" },
    { id: "personal", name: "Personal Care", icon: "💅", color: "#f43f5e" },
    { id: "others", name: "Others", icon: "📦", color: "#6b7280" },
  ];

  const priorityWeights = {
    bills: 1.0,
    healthcare: 1.0,
    transport: 0.95,
    food: 0.9,
    education: 0.85,
    personal: 0.8,
    others: 0.75,
    shopping: 0.65,
    entertainment: 0.6,
    travel: 0.55,
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate("/login");
        return;
      }
      fetchAllData(u.uid);
    });
    return () => unsub();
  }, []);

  const fetchAllData = async (uid) => {
    // Build category map immediately so UI doesn't wait
    const builtMap = {};
    defaultCategoryDefs.forEach((c) => {
      builtMap[c.id] = c;
    });
    setCategoryMap(builtMap);

    // Fetch in parallel
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const cutoff = threeMonthsAgo.toISOString().split("T")[0];

    const [catSnap, expSnap, incSnap] = await Promise.all([
      getDocs(query(collection(db, "categories"), where("user_id", "==", uid))),
      getDocs(
        query(
          collection(db, "expenses"),
          where("user_id", "==", uid),
          where("date", ">=", cutoff),
        ),
      ),
      getDocs(
        query(
          collection(db, "income"),
          where("user_id", "==", uid),
          where("date", ">=", cutoff),
        ),
      ),
    ]);

    catSnap.docs.forEach((d) => {
      builtMap[d.id] = { id: d.id, ...d.data() };
    });
    setCategoryMap({ ...builtMap });

    const categorySpending = {};
    Object.keys(builtMap).forEach((id) => {
      categorySpending[id] = 0;
    });
    expSnap.docs.forEach((d) => {
      const exp = d.data();
      const catId = exp.category_id || "others";
      categorySpending[catId] !== undefined
        ? (categorySpending[catId] += parseFloat(exp.amount || 0))
        : (categorySpending["others"] =
            (categorySpending["others"] || 0) + parseFloat(exp.amount || 0));
    });

    const avgCategorySpending = {};
    Object.entries(categorySpending).forEach(([id, total]) => {
      avgCategorySpending[id] = total / 3;
    });

    const totalIncome = incSnap.docs.reduce(
      (s, d) => s + parseFloat(d.data().amount || 0),
      0,
    );
    const avgMonthlyIncome = totalIncome / 3;

    const initialBudget = {};
    Object.keys(avgCategorySpending).forEach((id) => {
      initialBudget[id] = Math.round(avgCategorySpending[id] * 1.1);
    });

    setCurrentBudget(initialBudget);
    setSpendingData({
      avgCategorySpending,
      avgMonthlyIncome,
      totalExpenses: Object.values(avgCategorySpending).reduce(
        (s, v) => s + v,
        0,
      ),
    });
    setLoading(false);
  };

  const adjustBudgetWithAI = async () => {
    if (!currentBudget || !spendingData) return;
    setAdjusting(true);
    await new Promise((r) => setTimeout(r, 1400));

    const { avgCategorySpending, avgMonthlyIncome } = spendingData;
    const totalActual = Object.values(avgCategorySpending).reduce(
      (s, v) => s + v,
      0,
    );
    const hasIncome = avgMonthlyIncome > 0;
    const budgetEnvelope = hasIncome
      ? avgMonthlyIncome * 0.8
      : totalActual * 0.9;

    const scores = {};
    let totalScore = 0;
    Object.keys(avgCategorySpending).forEach((id) => {
      const actual = avgCategorySpending[id] || 0;
      if (!actual) return;
      const weight =
        priorityWeights[id] ??
        Object.entries(priorityWeights).find(([k]) => id.includes(k))?.[1] ??
        0.75;
      scores[id] = actual * weight;
      totalScore += scores[id];
    });

    const newBudget = {};
    Object.keys(avgCategorySpending).forEach((id) => {
      const actual = avgCategorySpending[id] || 0;
      if (!actual) {
        newBudget[id] = 0;
        return;
      }
      const share =
        totalScore > 0
          ? scores[id] / totalScore
          : 1 / Object.keys(scores).length;
      newBudget[id] = Math.round(budgetEnvelope * share);
    });

    const increased = [],
      decreased = [];
    Object.keys(newBudget).forEach((id) => {
      const diff = (newBudget[id] || 0) - (currentBudget[id] || 0);
      const pct = currentBudget[id] > 0 ? (diff / currentBudget[id]) * 100 : 0;
      const name = categoryMap[id]?.name || id;
      if (diff > 50) increased.push({ id, name, diff, pct });
      else if (diff < -50) decreased.push({ id, name, diff, pct });
    });

    const totalNewBudget = Object.values(newBudget).reduce((s, v) => s + v, 0);
    const impliedSavings = hasIncome ? avgMonthlyIncome - totalNewBudget : 0;
    const recs = [];

    if (hasIncome) {
      recs.push({
        type: "optimize",
        title: "20% Savings Target Applied",
        description: `Income ₹${Math.round(avgMonthlyIncome).toLocaleString("en-IN")} → Reserved ₹${Math.round(avgMonthlyIncome * 0.2).toLocaleString("en-IN")} for savings → ₹${Math.round(budgetEnvelope).toLocaleString("en-IN")} for expenses.`,
        action: `Reallocated across ${Object.keys(newBudget).filter((id) => newBudget[id] > 0).length} active categories by priority.`,
      });
    } else {
      recs.push({
        type: "reduce",
        title: "10% Reduction Target",
        description: `No income data. Targeting 10% cut: ₹${Math.round(totalActual).toLocaleString("en-IN")} → ₹${Math.round(budgetEnvelope).toLocaleString("en-IN")}.`,
        action: "Add income records for savings-rate optimisation.",
      });
    }
    if (increased.length)
      recs.push({
        type: "optimize",
        title: `Increased — ${increased.length} ${increased.length === 1 ? "Category" : "Categories"}`,
        description: increased
          .map(
            (i) =>
              `${categoryMap[i.id]?.icon || ""} ${i.name}: +₹${Math.abs(i.diff).toLocaleString("en-IN")} (+${Math.abs(i.pct).toFixed(0)}%)`,
          )
          .join("  ·  "),
        action: "Under-budgeted relative to actual usage.",
      });
    if (decreased.length)
      recs.push({
        type: "alert",
        title: `Trimmed — ${decreased.length} ${decreased.length === 1 ? "Category" : "Categories"}`,
        description: decreased
          .map(
            (i) =>
              `${categoryMap[i.id]?.icon || ""} ${i.name}: −₹${Math.abs(i.diff).toLocaleString("en-IN")} (${i.pct.toFixed(0)}%)`,
          )
          .join("  ·  "),
        action: "Discretionary or over-buffered. Freed up for savings.",
      });
    if (hasIncome && impliedSavings > 0)
      recs.push({
        type: "optimize",
        title: "Projected Monthly Savings",
        description: `₹${Math.round(impliedSavings).toLocaleString("en-IN")}/month following this budget.`,
        action: `${((impliedSavings / avgMonthlyIncome) * 100).toFixed(1)}% of income — ${impliedSavings / avgMonthlyIncome >= 0.2 ? "on track with the 20% rule 🎉" : "add income sources to hit 20%."}`,
      });

    setSuggestedBudget(newBudget);
    setAdjustmentReason({ recommendations: recs });
    setAdjusting(false);
  };

  const applyBudget = () => {
    if (suggestedBudget) {
      setCurrentBudget(suggestedBudget);
      setSuggestedBudget(null);
      setAdjustmentReason(null);
    }
  };

  const totalCurrentBudget = currentBudget
    ? Object.values(currentBudget).reduce((s, v) => s + v, 0)
    : 0;
  const totalSuggestedBudget = suggestedBudget
    ? Object.values(suggestedBudget).reduce((s, v) => s + v, 0)
    : 0;
  const totalActualSpending = spendingData?.totalExpenses || 0;
  const activeCategories = currentBudget
    ? Object.keys(currentBudget).filter(
        (id) =>
          currentBudget[id] > 0 ||
          (spendingData?.avgCategorySpending[id] || 0) > 0,
      )
    : [];

  const surface = d ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = d ? "#f1f5f9" : "#0f172a";
  const textSecondary = d ? "#94a3b8" : "#64748b";
  const textMuted = d ? "#475569" : "#94a3b8";
  const inputBg = d ? "rgba(255,255,255,0.05)" : "#f8fafc";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}; border-radius: 4px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:1} }
    .fade-up { animation: fadeUp 0.35s ease both; }
    .spin { animation: spin 0.75s linear infinite; }
    .btn-hover { transition: all 0.15s ease; }
    .btn-hover:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.08); }
    .row-hover { transition: background 0.13s ease; }
    .row-hover:hover { background: ${d ? "rgba(255,255,255,0.03)" : "rgba(37,99,235,0.03)"} !important; }
    .card-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .stat-cols { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
    @media(max-width:680px) {
      .card-cols { grid-template-columns: 1fr !important; }
      .stat-cols { grid-template-columns: 1fr 1fr !important; }
    }
  `;

  const recColors = {
    optimize: {
      bg: d ? "rgba(34,197,94,0.08)" : "rgba(34,197,94,0.06)",
      bar: "#22c55e",
      text: d ? "#86efac" : "#15803d",
    },
    alert: {
      bg: d ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.06)",
      bar: "#f59e0b",
      text: d ? "#fcd34d" : "#92400e",
    },
    reduce: {
      bg: d ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)",
      bar: "#ef4444",
      text: d ? "#fca5a5" : "#991b1b",
    },
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: d
            ? "linear-gradient(160deg,#070b18,#0d1224)"
            : "linear-gradient(160deg,#f0f4ff,#fafbff)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans',sans-serif",
          gap: 14,
        }}
      >
        <style>{css}</style>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: `3px solid ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
            borderTopColor: "#3b82f6",
          }}
          className="spin"
        />
        <p
          style={{ color: textSecondary, fontSize: "0.9rem", fontWeight: 500 }}
        >
          Loading budget data…
        </p>
      </div>
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: d
          ? "linear-gradient(160deg,#070b18 0%,#0d1224 50%,#070b18 100%)"
          : "linear-gradient(160deg,#f0f4ff,#fafbff,#f0f4ff)",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{css}</style>

      {/* HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: d ? "rgba(7,11,24,0.92)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          style={{
            width: "100%",
            padding: "0 20px",
            height: 58,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            className="btn-hover"
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textSecondary,
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            ← Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "linear-gradient(135deg,#22c55e,#3b82f6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.95rem",
                flexShrink: 0,
              }}
            >
              🤖
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1rem",
                color: textPrimary,
                letterSpacing: "-0.01em",
              }}
            >
              AI Budget Adjuster
            </span>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button
              className="btn-hover"
              onClick={adjustBudgetWithAI}
              disabled={adjusting || activeCategories.length === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 18px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg,#22c55e,#16a34a)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor:
                  activeCategories.length === 0 || adjusting
                    ? "not-allowed"
                    : "pointer",
                fontFamily: "inherit",
                opacity: activeCategories.length === 0 ? 0.5 : 1,
                boxShadow: "0 2px 12px rgba(34,197,94,0.3)",
              }}
            >
              {adjusting ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.3)",
                      borderTopColor: "#fff",
                    }}
                    className="spin"
                  />
                  Analysing…
                </>
              ) : (
                "✦ Auto-Adjust"
              )}
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", padding: "18px 20px 48px" }}>
        {/* ALERTS */}
        {activeCategories.length === 0 && (
          <div
            className="fade-up"
            style={{
              marginBottom: 14,
              padding: "11px 16px",
              borderRadius: 12,
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.22)",
              color: d ? "#fcd34d" : "#92400e",
              fontSize: "0.83rem",
              fontWeight: 500,
            }}
          >
            ⚠️ No expense data for the last 3 months. Add expenses first, then
            use the adjuster.
          </div>
        )}
        {spendingData?.avgMonthlyIncome === 0 && (
          <div
            className="fade-up"
            style={{
              marginBottom: 14,
              padding: "11px 16px",
              borderRadius: 12,
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.2)",
              color: d ? "#93c5fd" : "#1e40af",
              fontSize: "0.83rem",
              fontWeight: 500,
            }}
          >
            ℹ️ No income records found. Add income for smarter 20% savings-rate
            optimisation.
          </div>
        )}

        {/* STAT CARDS */}
        <div className="stat-cols fade-up" style={{ marginBottom: 14 }}>
          {[
            {
              label: "Current Budget",
              value: `₹${Math.round(totalCurrentBudget).toLocaleString("en-IN")}`,
              sub: "per month",
              color: "#3b82f6",
            },
            {
              label: "Actual Spending",
              value: `₹${Math.round(totalActualSpending).toLocaleString("en-IN")}`,
              sub: "3-month avg/month",
              color: "#f97316",
            },
            {
              label:
                totalActualSpending > totalCurrentBudget
                  ? "Overspending"
                  : "Under Budget",
              value: `₹${Math.abs(Math.round(totalActualSpending - totalCurrentBudget)).toLocaleString("en-IN")}`,
              sub:
                totalCurrentBudget > 0
                  ? `${((Math.abs(totalActualSpending - totalCurrentBudget) / totalCurrentBudget) * 100).toFixed(1)}%`
                  : "—",
              color:
                totalActualSpending > totalCurrentBudget
                  ? "#ef4444"
                  : "#22c55e",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                padding: "16px 18px",
                borderRadius: 16,
                background: surface,
                border: `1px solid ${border}`,
                boxShadow: d ? "none" : "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 8,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "1.55rem",
                  fontWeight: 900,
                  color: s.color,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: textSecondary }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* SUGGESTED BUDGET BANNER */}
        {suggestedBudget && (
          <div
            className="fade-up"
            style={{
              marginBottom: 14,
              padding: "13px 18px",
              borderRadius: 14,
              background:
                "linear-gradient(135deg,rgba(34,197,94,0.1),rgba(59,130,246,0.1))",
              border: "1px solid rgba(34,197,94,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.2rem" }}>✅</span>
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: d ? "#86efac" : "#15803d",
                  }}
                >
                  AI Suggestion Ready
                </div>
                <div style={{ fontSize: "0.76rem", color: textSecondary }}>
                  New budget: ₹
                  {Math.round(totalSuggestedBudget).toLocaleString("en-IN")}
                  /month vs current ₹
                  {Math.round(totalCurrentBudget).toLocaleString("en-IN")}/month
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn-hover"
                onClick={applyBudget}
                style={{
                  padding: "7px 16px",
                  borderRadius: 9,
                  border: "none",
                  background: "linear-gradient(135deg,#22c55e,#16a34a)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Apply Budget
              </button>
              <button
                className="btn-hover"
                onClick={() => {
                  setSuggestedBudget(null);
                  setAdjustmentReason(null);
                }}
                style={{
                  padding: "7px 14px",
                  borderRadius: 9,
                  border: `1px solid ${border}`,
                  background: "transparent",
                  color: textSecondary,
                  fontWeight: 600,
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* BUDGET COMPARISON */}
        <div className="card-cols fade-up" style={{ marginBottom: 14 }}>
          {/* Current */}
          <div
            style={{
              borderRadius: 18,
              background: surface,
              border: `1px solid ${border}`,
              overflow: "hidden",
              boxShadow: d ? "none" : "0 3px 14px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    color: textPrimary,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Current Budget
                </h2>
                <p
                  style={{
                    fontSize: "0.74rem",
                    color: textSecondary,
                    marginTop: 1,
                  }}
                >
                  Based on 3-month avg + 10% buffer
                </p>
              </div>
              <div
                style={{
                  padding: "4px 10px",
                  borderRadius: 20,
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: d ? "#93c5fd" : "#1d4ed8",
                }}
              >
                ₹{Math.round(totalCurrentBudget).toLocaleString("en-IN")}
              </div>
            </div>
            <div style={{ padding: "10px 6px" }}>
              {activeCategories.length === 0 ? (
                <p
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: textMuted,
                    fontSize: "0.85rem",
                  }}
                >
                  No spending data yet.
                </p>
              ) : (
                activeCategories.map((id) => {
                  const amount = currentBudget[id] || 0;
                  const actual = spendingData?.avgCategorySpending[id] || 0;
                  const pct =
                    amount > 0 ? Math.min((actual / amount) * 100, 100) : 100;
                  const isOver = actual > amount;
                  const cat = categoryMap[id];
                  return (
                    <div
                      key={id}
                      className="row-hover"
                      style={{ padding: "8px 12px", borderRadius: 10 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: textPrimary,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span>{cat?.icon || "📦"}</span>
                          {cat?.name || id}
                        </span>
                        <div style={{ textAlign: "right" }}>
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 800,
                              color: textPrimary,
                            }}
                          >
                            ₹{Math.round(amount).toLocaleString("en-IN")}
                          </span>
                          <span
                            style={{
                              fontSize: "0.72rem",
                              color: textMuted,
                              marginLeft: 6,
                            }}
                          >
                            ₹{Math.round(actual).toLocaleString("en-IN")} spent
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          height: 5,
                          borderRadius: 5,
                          background: d
                            ? "rgba(255,255,255,0.07)"
                            : "rgba(0,0,0,0.07)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            borderRadius: 5,
                            background: isOver ? "#ef4444" : "#22c55e",
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Suggested */}
          <div
            style={{
              borderRadius: 18,
              background: surface,
              border: `1px solid ${suggestedBudget ? "rgba(34,197,94,0.3)" : border}`,
              overflow: "hidden",
              boxShadow: suggestedBudget
                ? d
                  ? "0 0 0 1px rgba(34,197,94,0.2)"
                  : "0 3px 20px rgba(34,197,94,0.1)"
                : d
                  ? "none"
                  : "0 3px 14px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 800,
                    color: textPrimary,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {suggestedBudget
                    ? "AI Suggested Budget"
                    : "Waiting for Adjustment"}
                </h2>
                <p
                  style={{
                    fontSize: "0.74rem",
                    color: textSecondary,
                    marginTop: 1,
                  }}
                >
                  {suggestedBudget
                    ? "Priority-weighted reallocation"
                    : "Click Auto-Adjust to generate"}
                </p>
              </div>
              {suggestedBudget && (
                <div
                  style={{
                    padding: "4px 10px",
                    borderRadius: 20,
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: "#22c55e",
                  }}
                >
                  ₹{Math.round(totalSuggestedBudget).toLocaleString("en-IN")}
                </div>
              )}
            </div>

            {suggestedBudget ? (
              <div style={{ padding: "10px 6px" }}>
                {activeCategories.map((id) => {
                  const amount = suggestedBudget[id] || 0;
                  const current = currentBudget[id] || 0;
                  const actual = spendingData?.avgCategorySpending[id] || 0;
                  const change = amount - current;
                  const changePct = current > 0 ? (change / current) * 100 : 0;
                  const cat = categoryMap[id];
                  const usagePct =
                    amount > 0 ? Math.min((actual / amount) * 100, 100) : 0;
                  const isOver = actual > amount;
                  return (
                    <div
                      key={id}
                      className="row-hover"
                      style={{ padding: "8px 12px", borderRadius: 10 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 5,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: textPrimary,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span>{cat?.icon || "📦"}</span>
                          {cat?.name || id}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 800,
                              color: textPrimary,
                            }}
                          >
                            ₹{Math.round(amount).toLocaleString("en-IN")}
                          </span>
                          {Math.abs(change) > 10 ? (
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 800,
                                padding: "2px 7px",
                                borderRadius: 20,
                                background:
                                  change > 0
                                    ? "rgba(34,197,94,0.12)"
                                    : "rgba(239,68,68,0.12)",
                                color: change > 0 ? "#22c55e" : "#ef4444",
                                border: `1px solid ${change > 0 ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
                              }}
                            >
                              {change > 0 ? "▲" : "▼"}
                              {Math.abs(changePct).toFixed(0)}%
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: "0.68rem",
                                padding: "2px 7px",
                                borderRadius: 20,
                                background: d
                                  ? "rgba(255,255,255,0.06)"
                                  : "rgba(0,0,0,0.05)",
                                color: textMuted,
                              }}
                            >
                              ≈
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          height: 5,
                          borderRadius: 5,
                          background: d
                            ? "rgba(255,255,255,0.07)"
                            : "rgba(0,0,0,0.07)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${usagePct}%`,
                            borderRadius: 5,
                            background: isOver ? "#ef4444" : "#3b82f6",
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "48px 20px",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 16,
                    background: d
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.6rem",
                  }}
                >
                  🤖
                </div>
                <p
                  style={{
                    color: textMuted,
                    fontSize: "0.85rem",
                    textAlign: "center",
                    maxWidth: 200,
                    lineHeight: 1.6,
                  }}
                >
                  Click{" "}
                  <strong style={{ color: textSecondary }}>Auto-Adjust</strong>{" "}
                  to get AI-powered suggestions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RECOMMENDATIONS */}
        {adjustmentReason && (
          <div
            className="fade-up"
            style={{
              borderRadius: 18,
              background: surface,
              border: `1px solid ${border}`,
              overflow: "hidden",
              marginBottom: 14,
              boxShadow: d ? "none" : "0 3px 14px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${border}`,
              }}
            >
              <h2
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  color: textPrimary,
                  letterSpacing: "-0.01em",
                }}
              >
                AI Analysis
              </h2>
              <p
                style={{
                  fontSize: "0.74rem",
                  color: textSecondary,
                  marginTop: 1,
                }}
              >
                Reasoning behind the new budget
              </p>
            </div>
            <div
              style={{
                padding: "12px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {adjustmentReason.recommendations.map((rec, i) => {
                const c = recColors[rec.type] || recColors.optimize;
                return (
                  <div
                    key={i}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: c.bg,
                      borderLeft: `3px solid ${c.bar}`,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: c.text,
                        marginBottom: 4,
                      }}
                    >
                      {rec.title}
                    </div>
                    <div
                      style={{
                        fontSize: "0.8rem",
                        color: textSecondary,
                        lineHeight: 1.6,
                        marginBottom: 4,
                      }}
                    >
                      {rec.description}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: textMuted }}>
                      <strong style={{ color: textSecondary }}>→</strong>{" "}
                      {rec.action}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INFO BOX */}
        <div
          className="fade-up"
          style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.18)",
          }}
        >
          <p
            style={{
              fontSize: "0.8rem",
              color: d ? "#86efac" : "#15803d",
              lineHeight: 1.7,
            }}
          >
            <strong>🤖 How it works:</strong> Analyses your last 3 months of
            spending by category and reallocates your budget intelligently —
            protecting essentials, trimming discretionary spend, and targeting a
            20% savings rate when income data is available.
          </p>
        </div>
      </div>
    </div>
  );
}
