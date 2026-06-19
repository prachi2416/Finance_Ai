import { useState, useEffect } from "react";
import { supabase } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function Gamification() {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalExpenses: 0,
    totalIncome: 0,
    totalGoals: 0,
    completedGoals: 0,
    daysActive: 0,
  });
  const [badges, setBadges] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const d = isDark;

  const allBadges = [
    {
      id: "first_expense",
      name: "Getting Started",
      description: "Log your first expense",
      icon: "🌟",
      requirement: 1,
      type: "expense_count",
    },
    {
      id: "expense_master",
      name: "Expense Master",
      description: "Log 50 expenses",
      icon: "💰",
      requirement: 50,
      type: "expense_count",
    },
    {
      id: "income_tracker",
      name: "Income Tracker",
      description: "Log 10 income entries",
      icon: "💵",
      requirement: 10,
      type: "income_count",
    },
    {
      id: "goal_setter",
      name: "Goal Setter",
      description: "Create your first goal",
      icon: "🎯",
      requirement: 1,
      type: "goal_count",
    },
    {
      id: "goal_achiever",
      name: "Goal Achiever",
      description: "Complete 3 goals",
      icon: "🏆",
      requirement: 3,
      type: "completed_goals",
    },
    {
      id: "week_warrior",
      name: "Week Warrior",
      description: "7 day streak",
      icon: "🔥",
      requirement: 7,
      type: "streak",
    },
    {
      id: "month_master",
      name: "Month Master",
      description: "30 day streak",
      icon: "⭐",
      requirement: 30,
      type: "streak",
    },
    {
      id: "investor",
      name: "Investor",
      description: "Add 5 investments",
      icon: "📈",
      requirement: 5,
      type: "investment_count",
    },
    {
      id: "saver",
      name: "Super Saver",
      description: "Save ₹10,000",
      icon: "💎",
      requirement: 10000,
      type: "savings",
    },
    {
      id: "budget_planner",
      name: "Budget Planner",
      description: "Set up your first budget",
      icon: "📊",
      requirement: 1,
      type: "budget_count",
    },
  ];

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, created_at")
        .order("created_at", { ascending: false });
      const { data: income } = await supabase
        .from("income")
        .select("amount, created_at")
        .order("created_at", { ascending: false });
      const { data: goals } = await supabase.from("goals").select("*");
      const { data: investments } = await supabase
        .from("investments")
        .select("*");
      const totalExpAmt =
        expenses?.reduce((s, e) => s + parseFloat(e.amount || 0), 0) || 0;
      const totalIncAmt =
        income?.reduce((s, i) => s + parseFloat(i.amount || 0), 0) || 0;
      const totalGoals = goals?.length || 0;
      const completedGoals =
        goals?.filter(
          (g) => parseFloat(g.current_amount) >= parseFloat(g.target_amount),
        ).length || 0;
      const streak = calculateStreak(expenses, income);
      const allDates = [
        ...(expenses?.map((e) => e.created_at) || []),
        ...(income?.map((i) => i.created_at) || []),
      ];
      const uniqueDays = new Set(allDates.map((dd) => dd.split("T")[0])).size;
      setUserStats({
        currentStreak: streak.current,
        longestStreak: streak.longest,
        totalExpenses: expenses?.length || 0,
        totalIncome: income?.length || 0,
        totalGoals,
        completedGoals,
        daysActive: uniqueDays,
        expenseCount: expenses?.length || 0,
        incomeCount: income?.length || 0,
        investmentCount: investments?.length || 0,
        savings: totalIncAmt - totalExpAmt,
      });
      setBadges(
        calculateBadges({
          expenseCount: expenses?.length || 0,
          incomeCount: income?.length || 0,
          investmentCount: investments?.length || 0,
          goalCount: totalGoals,
          completedGoals,
          streak: streak.current,
          savings: totalIncAmt - totalExpAmt,
        }),
      );
      const activity = [
        ...(expenses
          ?.slice(0, 5)
          .map((e) => ({
            type: "expense",
            date: e.created_at,
            text: `Logged expense of ₹${parseFloat(e.amount).toLocaleString("en-IN")}`,
          })) || []),
        ...(income
          ?.slice(0, 5)
          .map((i) => ({
            type: "income",
            date: i.created_at,
            text: `Logged income of ₹${parseFloat(i.amount).toLocaleString("en-IN")}`,
          })) || []),
      ]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setRecentActivity(activity);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const calculateStreak = (expenses, income) => {
    const all = [...(expenses || []), ...(income || [])].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
    if (!all.length) return { current: 0, longest: 0 };
    let currentStreak = 0,
      longestStreak = 0,
      tempStreak = 1;
    let lastDate = new Date(all[0].created_at);
    lastDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastDate) / 86400000);
    if (diffDays <= 1) currentStreak = 1;
    for (let i = 1; i < all.length; i++) {
      const cur = new Date(all[i].created_at);
      cur.setHours(0, 0, 0, 0);
      const diff = Math.floor((lastDate - cur) / 86400000);
      if (diff === 1) {
        tempStreak++;
        if (diffDays <= 1) currentStreak = tempStreak;
      } else if (diff > 1) {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
      lastDate = cur;
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
    return { current: currentStreak, longest: longestStreak };
  };

  const calculateBadges = (stats) =>
    allBadges.filter((badge) => {
      switch (badge.type) {
        case "expense_count":
          return stats.expenseCount >= badge.requirement;
        case "income_count":
          return stats.incomeCount >= badge.requirement;
        case "goal_count":
          return stats.goalCount >= badge.requirement;
        case "completed_goals":
          return stats.completedGoals >= badge.requirement;
        case "streak":
          return stats.streak >= badge.requirement;
        case "investment_count":
          return stats.investmentCount >= badge.requirement;
        case "savings":
          return stats.savings >= badge.requirement;
        default:
          return false;
      }
    });

  const progressPct = Math.round((badges.length / allBadges.length) * 100);
  const surface = d ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = d ? "#f1f5f9" : "#0f172a";
  const textSecondary = d ? "#94a3b8" : "#64748b";
  const textMuted = d ? "#475569" : "#94a3b8";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}; border-radius: 4px; }
    .card-hover { transition: transform 0.18s ease; }
    .card-hover:hover { transform: translateY(-3px); }
    .badge-card { transition: transform 0.15s ease; }
    .badge-card:hover { transform: translateY(-4px) scale(1.02); }
    .activity-row { transition: background 0.14s ease; }
    .activity-row:hover { background: ${d ? "rgba(255,255,255,0.04)" : "rgba(37,99,235,0.04)"} !important; }
    .back-btn { transition: all 0.15s ease; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    .fade-up { animation: fadeUp 0.4s ease both; }

    .hero-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .badges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(155px, 1fr));
      gap: 12px;
    }
    .header-progress { display: flex; }

    @media (max-width: 700px) {
      .hero-grid { grid-template-columns: 1fr !important; }
      .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (max-width: 480px) {
      .badges-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .header-progress { display: none !important; }
    }
  `;

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: d
            ? "linear-gradient(160deg,#070b18,#0d1224)"
            : "linear-gradient(160deg,#f0f4ff,#fafbff)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <style>{css}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🏆</div>
          <p style={{ color: textSecondary, fontSize: "0.95rem" }}>
            Loading your achievements...
          </p>
        </div>
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

      {/* ── HEADER ── */}
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
            height: 60,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <button
            className="back-btn"
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textSecondary,
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            ← Back
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: "linear-gradient(135deg,#f59e0b,#ef4444)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                boxShadow: "0 2px 10px rgba(245,158,11,0.35)",
                flexShrink: 0,
              }}
            >
              🏆
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.05rem",
                color: textPrimary,
                letterSpacing: "-0.01em",
              }}
            >
              Achievements
            </span>
          </div>
          <div
            className="header-progress"
            style={{ alignItems: "center", gap: 8, flexShrink: 0 }}
          >
            <span
              style={{
                fontSize: "0.78rem",
                color: textMuted,
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {badges.length}/{allBadges.length} badges
            </span>
            <div
              style={{
                width: 80,
                height: 6,
                borderRadius: 6,
                background: d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  background: "linear-gradient(90deg,#f59e0b,#ef4444)",
                  borderRadius: 6,
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ width: "100%", padding: "20px 20px 60px" }}>
        {/* STREAK + PROGRESS */}
        <div className="hero-grid fade-up" style={{ marginBottom: 16 }}>
          <div
            style={{
              borderRadius: 20,
              padding: "28px 24px",
              background: "linear-gradient(135deg,#f97316 0%,#ef4444 100%)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(249,115,22,0.3)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -20,
                left: -10,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.75)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Current Streak
                </span>
                <span style={{ fontSize: "1.8rem" }}>🔥</span>
              </div>
              <div
                style={{
                  fontSize: "3.5rem",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {userStats.currentStreak}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.8)",
                  marginBottom: 14,
                }}
              >
                days in a row
              </div>
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.15)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 600,
                  }}
                >
                  🏅 Longest: {userStats.longestStreak} days
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              borderRadius: 20,
              padding: "28px 24px",
              background: "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(37,99,235,0.3)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.75)",
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  Badge Progress
                </span>
                <span style={{ fontSize: "1.8rem" }}>⭐</span>
              </div>
              <div
                style={{
                  fontSize: "3.5rem",
                  fontWeight: 900,
                  color: "#fff",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {badges.length}
                <span style={{ fontSize: "1.8rem", opacity: 0.6 }}>
                  /{allBadges.length}
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.8)",
                  marginBottom: 14,
                }}
              >
                badges earned
              </div>
              <div
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.2)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPct}%`,
                    background: "#fff",
                    borderRadius: 8,
                    transition: "width 1.2s ease",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 600,
                }}
              >
                {progressPct}% complete
              </div>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="stats-grid fade-up" style={{ marginBottom: 16 }}>
          {[
            {
              icon: "💸",
              value: userStats.totalExpenses,
              label: "Expenses Logged",
              color: "#ef4444",
            },
            {
              icon: "💵",
              value: userStats.totalIncome,
              label: "Income Entries",
              color: "#22c55e",
            },
            {
              icon: "🎯",
              value: `${userStats.completedGoals}/${userStats.totalGoals}`,
              label: "Goals Done",
              color: "#3b82f6",
            },
            {
              icon: "📅",
              value: userStats.daysActive,
              label: "Days Active",
              color: "#f59e0b",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="card-hover"
              style={{
                padding: "18px 14px",
                borderRadius: 16,
                background: surface,
                border: `1px solid ${border}`,
                textAlign: "center",
                boxShadow: d ? "none" : "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>
                {s.icon}
              </div>
              <div
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 900,
                  color: s.color,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: textSecondary,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* BADGES */}
        <div
          style={{
            borderRadius: 20,
            background: surface,
            border: `1px solid ${border}`,
            overflow: "hidden",
            marginBottom: 16,
            boxShadow: d ? "none" : "0 4px 20px rgba(0,0,0,0.06)",
          }}
          className="fade-up"
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 800,
                  color: textPrimary,
                  letterSpacing: "-0.01em",
                }}
              >
                Your Badges
              </h2>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: "0.78rem",
                  color: textSecondary,
                }}
              >
                {badges.length} earned · {allBadges.length - badges.length}{" "}
                remaining
              </p>
            </div>
            <div
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.25)",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#f59e0b",
              }}
            >
              {progressPct}% Complete
            </div>
          </div>
          <div style={{ padding: "16px" }}>
            <div className="badges-grid">
              {allBadges.map((badge) => {
                const earned = badges.some((b) => b.id === badge.id);
                return (
                  <div
                    key={badge.id}
                    className="badge-card"
                    style={{
                      padding: "16px 12px",
                      borderRadius: 16,
                      textAlign: "center",
                      background: earned
                        ? d
                          ? "rgba(245,158,11,0.1)"
                          : "rgba(245,158,11,0.06)"
                        : d
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.02)",
                      border: `1px solid ${earned ? "rgba(245,158,11,0.35)" : border}`,
                      filter: earned ? "none" : "grayscale(1)",
                      opacity: earned ? 1 : 0.45,
                      boxShadow: earned
                        ? d
                          ? "0 0 20px rgba(245,158,11,0.12)"
                          : "0 4px 16px rgba(245,158,11,0.1)"
                        : "none",
                    }}
                  >
                    <div style={{ fontSize: "2rem", marginBottom: 8 }}>
                      {badge.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: earned
                          ? d
                            ? "#fcd34d"
                            : "#92400e"
                          : textSecondary,
                        marginBottom: 4,
                        lineHeight: 1.3,
                      }}
                    >
                      {badge.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: textMuted,
                        lineHeight: 1.4,
                        marginBottom: earned ? 10 : 0,
                      }}
                    >
                      {badge.description}
                    </div>
                    {earned && (
                      <span
                        style={{
                          display: "inline-block",
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: "rgba(245,158,11,0.2)",
                          color: "#f59e0b",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          border: "1px solid rgba(245,158,11,0.3)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        ✓ EARNED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div
          style={{
            borderRadius: 20,
            background: surface,
            border: `1px solid ${border}`,
            overflow: "hidden",
            boxShadow: d ? "none" : "0 4px 20px rgba(0,0,0,0.06)",
          }}
          className="fade-up"
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${border}`,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: 800,
                color: textPrimary,
                letterSpacing: "-0.01em",
              }}
            >
              Recent Activity
            </h2>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: "0.78rem",
                color: textSecondary,
              }}
            >
              Your latest financial actions
            </p>
          </div>
          {recentActivity.length > 0 ? (
            <div>
              {recentActivity.map((act, i) => (
                <div
                  key={i}
                  className="activity-row"
                  style={{
                    padding: "14px 20px",
                    borderBottom:
                      i < recentActivity.length - 1
                        ? `1px solid ${border}`
                        : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 11,
                      flexShrink: 0,
                      background:
                        act.type === "expense"
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(34,197,94,0.1)",
                      border: `1px solid ${act.type === "expense" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                    }}
                  >
                    {act.type === "expense" ? "💸" : "💵"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: textPrimary,
                      }}
                    >
                      {act.text}
                    </p>
                    <p
                      style={{
                        margin: "2px 0 0",
                        fontSize: "0.76rem",
                        color: textMuted,
                      }}
                    >
                      {new Date(act.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: "0.71rem",
                      fontWeight: 700,
                      background:
                        act.type === "expense"
                          ? "rgba(239,68,68,0.1)"
                          : "rgba(34,197,94,0.1)",
                      color: act.type === "expense" ? "#ef4444" : "#22c55e",
                      border: `1px solid ${act.type === "expense" ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                    }}
                  >
                    {act.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: 10 }}>📭</div>
              <p
                style={{ margin: 0, color: textSecondary, fontSize: "0.9rem" }}
              >
                No recent activity yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
