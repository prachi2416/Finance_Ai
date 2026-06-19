import { useState, useEffect } from "react";
import { supabase } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    billing_cycle: "monthly",
    start_date: new Date().toISOString().split("T")[0],
    category: "entertainment",
  });
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const d = isDark;

  useEffect(() => {
    checkUser();
    fetchSubscriptions();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) navigate("/login");
  };

  const fetchSubscriptions = async () => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .order("next_billing_date", { ascending: true });
    if (!error) {
      setSubscriptions(data);
      setLoading(false);
    }
  };

  const calcNextBilling = (startDate, cycle) => {
    const start = new Date(startDate);
    const today = new Date();
    let next = new Date(start);
    while (next < today) {
      if (cycle === "monthly") next.setMonth(next.getMonth() + 1);
      else if (cycle === "quarterly") next.setMonth(next.getMonth() + 3);
      else if (cycle === "yearly") next.setFullYear(next.getFullYear() + 1);
    }
    return next.toISOString().split("T")[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const nextBillingDate = calcNextBilling(
      formData.start_date,
      formData.billing_cycle,
    );
    const { error } = await supabase.from("subscriptions").insert([
      {
        user_id: user.uid,
        name: formData.name,
        amount: parseFloat(formData.amount),
        billing_cycle: formData.billing_cycle,
        start_date: formData.start_date,
        next_billing_date: nextBillingDate,
        category: formData.category,
        is_active: true,
      },
    ]);
    if (!error) {
      setShowModal(false);
      setFormData({
        name: "",
        amount: "",
        billing_cycle: "monthly",
        start_date: new Date().toISOString().split("T")[0],
        category: "entertainment",
      });
      fetchSubscriptions();
    }
  };

  const handleToggle = async (id, isActive) => {
    const { error } = await supabase
      .from("subscriptions")
      .update({ is_active: !isActive })
      .eq("id", id);
    if (!error) fetchSubscriptions();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this subscription?")) {
      const { error } = await supabase
        .from("subscriptions")
        .delete()
        .eq("id", id);
      if (!error) fetchSubscriptions();
    }
  };

  const monthlyEquiv = (amount, cycle) => {
    if (cycle === "monthly") return amount;
    if (cycle === "quarterly") return amount / 3;
    if (cycle === "yearly") return amount / 12;
    return 0;
  };

  const daysUntilBilling = (nextDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const billing = new Date(nextDate);
    billing.setHours(0, 0, 0, 0);
    return Math.ceil((billing - today) / 86400000);
  };

  const catConfig = {
    entertainment: {
      icon: "🎬",
      color: "#a855f7",
      bg: "rgba(168,85,247,0.12)",
      border: "rgba(168,85,247,0.25)",
    },
    music: {
      icon: "🎵",
      color: "#ec4899",
      bg: "rgba(236,72,153,0.12)",
      border: "rgba(236,72,153,0.25)",
    },
    software: {
      icon: "💻",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.25)",
    },
    cloud: {
      icon: "☁️",
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.12)",
      border: "rgba(6,182,212,0.25)",
    },
    fitness: {
      icon: "💪",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.12)",
      border: "rgba(34,197,94,0.25)",
    },
    news: {
      icon: "📰",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.25)",
    },
    education: {
      icon: "📚",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      border: "rgba(16,185,129,0.25)",
    },
    other: {
      icon: "📦",
      color: "#6b7280",
      bg: "rgba(107,114,128,0.12)",
      border: "rgba(107,114,128,0.25)",
    },
  };

  const active = subscriptions.filter((s) => s.is_active);
  const inactive = subscriptions.filter((s) => !s.is_active);
  const totalMonthly = active.reduce(
    (s, sub) => s + monthlyEquiv(parseFloat(sub.amount), sub.billing_cycle),
    0,
  );
  const totalYearly = totalMonthly * 12;

  const surface = d ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = d ? "#f1f5f9" : "#0f172a";
  const textSecondary = d ? "#94a3b8" : "#64748b";
  const textMuted = d ? "#475569" : "#94a3b8";
  const inputBg = d ? "rgba(255,255,255,0.05)" : "#f8fafc";
  const inputBorder = d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}; border-radius: 4px; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin { to{transform:rotate(360deg)} }
    @keyframes modalIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    .fade-up { animation: fadeUp 0.35s ease both; }
    .spin { animation: spin 0.75s linear infinite; }
    .modal-box { animation: modalIn 0.22s ease both; }
    .btn-hov { transition: all 0.15s ease; }
    .btn-hov:hover { transform: translateY(-1px); filter: brightness(1.08); }
    .card-hov { transition: transform 0.18s ease; }
    .card-hov:hover { transform: translateY(-2px); }
    input, select { outline: none; transition: border-color 0.15s, box-shadow 0.15s; font-family: inherit; }
    input:focus, select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; }
    input[type=date]::-webkit-calendar-picker-indicator { filter: ${d ? "invert(1) opacity(0.4)" : "opacity(0.4)"}; }
    .stat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
    .sub-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(260px,1fr)); gap: 13px; }
    @media(max-width:600px) { .stat-grid { grid-template-columns: 1fr 1fr !important; } .sub-grid { grid-template-columns: 1fr !important; } }
  `;

  const inputStyle = {
    width: "100%",
    padding: "9px 13px",
    borderRadius: 10,
    border: `1px solid ${inputBorder}`,
    background: inputBg,
    color: textPrimary,
    fontSize: "0.88rem",
  };
  const labelStyle = {
    display: "block",
    fontSize: "0.74rem",
    fontWeight: 700,
    color: textSecondary,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  const SubCard = ({ sub, isInactive = false }) => {
    const days = daysUntilBilling(sub.next_billing_date);
    const me = monthlyEquiv(parseFloat(sub.amount), sub.billing_cycle);
    const cfg = catConfig[sub.category] || catConfig.other;
    const billingStatus =
      days < 0
        ? {
            label: "⚠️ Overdue",
            color: "#ef4444",
            bg: "rgba(239,68,68,0.1)",
            border: "rgba(239,68,68,0.2)",
          }
        : days === 0
          ? {
              label: "🔔 Billing Today",
              color: "#f59e0b",
              bg: "rgba(245,158,11,0.1)",
              border: "rgba(245,158,11,0.2)",
            }
          : days <= 3
            ? {
                label: `🔔 ${days}d left`,
                color: "#f97316",
                bg: "rgba(249,115,22,0.1)",
                border: "rgba(249,115,22,0.2)",
              }
            : {
                label: `📅 ${days}d`,
                color: "#3b82f6",
                bg: "rgba(59,130,246,0.1)",
                border: "rgba(59,130,246,0.15)",
              };
    return (
      <div
        className="card-hov"
        style={{
          borderRadius: 16,
          background: surface,
          border: `1px solid ${border}`,
          overflow: "hidden",
          opacity: isInactive ? 0.6 : 1,
          boxShadow: d ? "none" : "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            height: 3,
            background: `linear-gradient(90deg,${cfg.color},${cfg.color}66)`,
          }}
        />
        <div style={{ padding: "14px 14px 12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                }}
              >
                {cfg.icon}
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    color: textPrimary,
                  }}
                >
                  {sub.name}
                </div>
                <div
                  style={{
                    fontSize: "0.72rem",
                    color: textMuted,
                    textTransform: "capitalize",
                  }}
                >
                  {sub.category}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDelete(sub.id)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                color: "#ef4444",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
              }}
            >
              🗑️
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 8,
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 900,
                  color: textPrimary,
                  letterSpacing: "-0.02em",
                }}
              >
                ₹{parseFloat(sub.amount).toLocaleString("en-IN")}
              </span>
              <span
                style={{ fontSize: "0.72rem", color: textMuted, marginLeft: 4 }}
              >
                / {sub.billing_cycle}
              </span>
            </div>
            {sub.billing_cycle !== "monthly" && (
              <div style={{ fontSize: "0.75rem", color: textSecondary }}>
                ≈ ₹{me.toLocaleString("en-IN", { maximumFractionDigits: 0 })}/mo
              </div>
            )}
          </div>

          {!isInactive && (
            <div
              style={{
                marginBottom: 10,
                padding: "5px 10px",
                borderRadius: 8,
                background: billingStatus.bg,
                border: `1px solid ${billingStatus.border}`,
                fontSize: "0.75rem",
                fontWeight: 700,
                color: billingStatus.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{billingStatus.label}</span>
              <span style={{ fontWeight: 500, opacity: 0.8 }}>
                {new Date(sub.next_billing_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          )}

          <button
            className="btn-hov"
            onClick={() => handleToggle(sub.id, sub.is_active)}
            style={{
              width: "100%",
              padding: "7px",
              borderRadius: 9,
              border: `1px solid ${isInactive ? "rgba(34,197,94,0.3)" : border}`,
              background: isInactive ? "rgba(34,197,94,0.1)" : "transparent",
              color: isInactive ? "#22c55e" : textSecondary,
              fontWeight: 600,
              fontSize: "0.78rem",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {isInactive ? "Reactivate" : "Mark Inactive"}
          </button>
        </div>
      </div>
    );
  };

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
            className="btn-hov"
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
                background: "linear-gradient(135deg,#a855f7,#ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.95rem",
              }}
            >
              📺
            </div>
            <div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "0.98rem",
                  color: textPrimary,
                  letterSpacing: "-0.01em",
                }}
              >
                Subscriptions
              </span>
              <div style={{ fontSize: "0.7rem", color: textMuted }}>
                Track your recurring services
              </div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              className="btn-hov"
              onClick={toggleDarkMode}
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                cursor: "pointer",
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {d ? "☀️" : "🌙"}
            </button>
            <button
              className="btn-hov"
              onClick={() => setShowModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg,#a855f7,#ec4899)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.83rem",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 12px rgba(168,85,247,0.3)",
              }}
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", padding: "18px 20px 48px" }}>
        {/* STATS */}
        <div className="stat-grid fade-up" style={{ marginBottom: 16 }}>
          {[
            {
              icon: "✅",
              label: "Active",
              value: active.length,
              color: "#22c55e",
              sub: "subscriptions",
            },
            {
              icon: "💸",
              label: "Monthly Cost",
              value: `₹${totalMonthly.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
              color: "#f97316",
              sub: "per month",
            },
            {
              icon: "📅",
              label: "Yearly Cost",
              value: `₹${(totalYearly / 1000).toFixed(0)}K`,
              color: "#ef4444",
              sub: "per year",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="card-hov"
              style={{
                padding: "16px 18px",
                borderRadius: 16,
                background: surface,
                border: `1px solid ${border}`,
                boxShadow: d ? "none" : "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: "1.2rem", marginBottom: 7 }}>
                {s.icon}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 5,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "1.45rem",
                  fontWeight: 900,
                  color: s.color,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: 3,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "0.72rem", color: textSecondary }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "64px 0",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                border: `3px solid ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                borderTopColor: "#a855f7",
              }}
              className="spin"
            />
            <p style={{ color: textSecondary, fontSize: "0.88rem" }}>
              Loading subscriptions…
            </p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 24px",
              borderRadius: 20,
              background: surface,
              border: `1px solid ${border}`,
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 14 }}>📺</div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: textPrimary,
              }}
            >
              No subscriptions tracked
            </h3>
            <p
              style={{
                margin: "0 0 20px",
                color: textSecondary,
                fontSize: "0.88rem",
              }}
            >
              Add your first subscription to monitor recurring costs.
            </p>
            <button
              className="btn-hov"
              onClick={() => setShowModal(true)}
              style={{
                padding: "9px 22px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg,#a855f7,#ec4899)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Add Subscription
            </button>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <div style={{ marginBottom: 20 }} className="fade-up">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Active — {active.length}
                  </span>
                  <div style={{ flex: 1, height: 1, background: border }} />
                </div>
                <div className="sub-grid">
                  {active.map((sub) => (
                    <SubCard key={sub.id} sub={sub} />
                  ))}
                </div>
              </div>
            )}
            {inactive.length > 0 && (
              <div className="fade-up">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                    }}
                  >
                    Inactive — {inactive.length}
                  </span>
                  <div style={{ flex: 1, height: 1, background: border }} />
                </div>
                <div className="sub-grid">
                  {inactive.map((sub) => (
                    <SubCard key={sub.id} sub={sub} isInactive />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 50,
            overflowY: "auto",
          }}
        >
          <div
            className="modal-box"
            style={{
              background: d ? "#0d1224" : "#ffffff",
              border: `1px solid ${border}`,
              borderRadius: 22,
              padding: "24px",
              width: "100%",
              maxWidth: 420,
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              margin: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#a855f7,#ec4899)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  📺
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "1rem",
                    color: textPrimary,
                  }}
                >
                  Add Subscription
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: `1px solid ${border}`,
                  background: "transparent",
                  color: textSecondary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              <div>
                <label style={labelStyle}>Service Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="e.g., Netflix, Spotify, Amazon Prime"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="entertainment">🎬 Entertainment</option>
                  <option value="music">🎵 Music</option>
                  <option value="software">💻 Software</option>
                  <option value="cloud">☁️ Cloud Storage</option>
                  <option value="fitness">💪 Fitness</option>
                  <option value="news">📰 News</option>
                  <option value="education">📚 Education</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label style={labelStyle}>Amount (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    style={inputStyle}
                    placeholder="199"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Billing Cycle *</label>
                  <select
                    value={formData.billing_cycle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        billing_cycle: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Start Date *</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  style={inputStyle}
                  required
                />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: textSecondary,
                    fontWeight: 600,
                    fontSize: "0.86rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-hov"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg,#a855f7,#ec4899)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.86rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 4px 14px rgba(168,85,247,0.35)",
                  }}
                >
                  Add Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
