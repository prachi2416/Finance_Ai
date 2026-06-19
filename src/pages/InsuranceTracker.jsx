import { useState, useEffect } from "react";
import { supabase } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function InsuranceTracker() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: "health",
    provider: "",
    policy_number: "",
    premium_amount: "",
    coverage_amount: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    premium_frequency: "yearly",
  });
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const d = isDark;

  useEffect(() => {
    checkUser();
    fetchPolicies();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) navigate("/login");
  };

  const fetchPolicies = async () => {
    const { data, error } = await supabase
      .from("insurance_policies")
      .select("*")
      .order("end_date", { ascending: true });
    if (!error) {
      setPolicies(data);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("insurance_policies").insert([
      {
        user_id: user.uid,
        type: formData.type,
        provider: formData.provider,
        policy_number: formData.policy_number || null,
        premium_amount: parseFloat(formData.premium_amount),
        coverage_amount: parseFloat(formData.coverage_amount) || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        premium_frequency: formData.premium_frequency,
      },
    ]);
    if (!error) {
      setShowModal(false);
      setFormData({
        type: "health",
        provider: "",
        policy_number: "",
        premium_amount: "",
        coverage_amount: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        premium_frequency: "yearly",
      });
      fetchPolicies();
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this policy?")) {
      const { error } = await supabase
        .from("insurance_policies")
        .delete()
        .eq("id", id);
      if (!error) fetchPolicies();
    }
  };

  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(endDate);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry - today) / 86400000);
  };

  const typeConfig = {
    health: {
      icon: "🏥",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.12)",
      border: "rgba(34,197,94,0.25)",
    },
    life: {
      icon: "❤️",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
      border: "rgba(239,68,68,0.25)",
    },
    vehicle: {
      icon: "🚗",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.12)",
      border: "rgba(59,130,246,0.25)",
    },
    home: {
      icon: "🏠",
      color: "#a855f7",
      bg: "rgba(168,85,247,0.12)",
      border: "rgba(168,85,247,0.25)",
    },
    other: {
      icon: "🛡️",
      color: "#6b7280",
      bg: "rgba(107,114,128,0.12)",
      border: "rgba(107,114,128,0.25)",
    },
  };

  const calcAnnual = (amount, freq) =>
    freq === "monthly"
      ? amount * 12
      : freq === "quarterly"
        ? amount * 4
        : amount;

  const activePolicies = policies.filter(
    (p) => getDaysUntilExpiry(p.end_date) > 0,
  );
  const expiringSoon = activePolicies.filter(
    (p) => getDaysUntilExpiry(p.end_date) <= 30,
  );
  const totalCoverage = activePolicies.reduce(
    (s, p) => s + (parseFloat(p.coverage_amount) || 0),
    0,
  );
  const totalAnnualPremium = activePolicies.reduce(
    (s, p) => s + calcAnnual(parseFloat(p.premium_amount), p.premium_frequency),
    0,
  );

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
    .card-hov { transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .card-hov:hover { transform: translateY(-3px); }
    input, select, textarea { outline: none; transition: border-color 0.15s, box-shadow 0.15s; font-family: inherit; }
    input:focus, select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; }
    input[type=date]::-webkit-calendar-picker-indicator { filter: ${d ? "invert(1) opacity(0.4)" : "opacity(0.4)"}; }
    .stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
    .policy-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px,1fr)); gap: 14px; }
    @media(max-width:700px) { .stat-grid { grid-template-columns: repeat(2,1fr) !important; } }
    @media(max-width:480px) { .policy-grid { grid-template-columns: 1fr !important; } }
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
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.95rem",
                flexShrink: 0,
              }}
            >
              🛡️
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
                Insurance Tracker
              </span>
              <div style={{ fontSize: "0.7rem", color: textMuted }}>
                Manage all your policies
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
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.83rem",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 12px rgba(59,130,246,0.3)",
              }}
            >
              + Add Policy
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", padding: "18px 20px 48px" }}>
        {/* STATS */}
        <div className="stat-grid fade-up" style={{ marginBottom: 16 }}>
          {[
            {
              icon: "📋",
              label: "Active Policies",
              value: activePolicies.length,
              color: "#3b82f6",
              sub: "currently active",
            },
            {
              icon: "🛡️",
              label: "Total Coverage",
              value: `₹${(totalCoverage / 100000).toFixed(1)}L`,
              color: "#22c55e",
              sub: "total protected",
            },
            {
              icon: "💰",
              label: "Annual Premium",
              value: `₹${(totalAnnualPremium / 1000).toFixed(0)}K`,
              color: "#f97316",
              sub: "yearly cost",
            },
            ...(expiringSoon.length > 0
              ? [
                  {
                    icon: "🔔",
                    label: "Expiring Soon",
                    value: expiringSoon.length,
                    color: "#ef4444",
                    sub: "within 30 days",
                  },
                ]
              : [
                  {
                    icon: "✅",
                    label: "All Clear",
                    value: "0",
                    color: "#22c55e",
                    sub: "none expiring soon",
                  },
                ]),
          ].map((s, i) => (
            <div
              key={i}
              className="card-hov"
              style={{
                padding: "16px 18px",
                borderRadius: 16,
                background:
                  s.color === "#ef4444" && expiringSoon.length > 0
                    ? "rgba(239,68,68,0.08)"
                    : surface,
                border: `1px solid ${s.color === "#ef4444" && expiringSoon.length > 0 ? "rgba(239,68,68,0.2)" : border}`,
                boxShadow: d ? "none" : "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: "1.3rem", marginBottom: 8 }}>
                {s.icon}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  color: s.color,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  marginBottom: 3,
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "0.73rem", color: textSecondary }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* POLICIES */}
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
                borderTopColor: "#3b82f6",
              }}
              className="spin"
            />
            <p style={{ color: textSecondary, fontSize: "0.88rem" }}>
              Loading policies…
            </p>
          </div>
        ) : policies.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 24px",
              borderRadius: 20,
              background: surface,
              border: `1px solid ${border}`,
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 14 }}>🛡️</div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: textPrimary,
              }}
            >
              No policies tracked yet
            </h3>
            <p
              style={{
                margin: "0 0 22px",
                color: textSecondary,
                fontSize: "0.88rem",
              }}
            >
              Add your first insurance policy to start tracking.
            </p>
            <button
              className="btn-hov"
              onClick={() => setShowModal(true)}
              style={{
                padding: "9px 22px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Add First Policy
            </button>
          </div>
        ) : (
          <div className="policy-grid fade-up">
            {policies.map((policy) => {
              const days = getDaysUntilExpiry(policy.end_date);
              const expired = days <= 0;
              const soon = days > 0 && days <= 30;
              const cfg = typeConfig[policy.type] || typeConfig.other;
              const annual = calcAnnual(
                parseFloat(policy.premium_amount),
                policy.premium_frequency,
              );
              const statusBg = expired
                ? "rgba(239,68,68,0.1)"
                : soon
                  ? "rgba(245,158,11,0.1)"
                  : "rgba(34,197,94,0.1)";
              const statusColor = expired
                ? "#ef4444"
                : soon
                  ? "#f59e0b"
                  : "#22c55e";
              const statusBorder = expired
                ? "rgba(239,68,68,0.2)"
                : soon
                  ? "rgba(245,158,11,0.2)"
                  : "rgba(34,197,94,0.2)";
              const statusText = expired
                ? "❌ Expired"
                : soon
                  ? `⚠️ Expires in ${days}d`
                  : `✅ Active · ${days}d left`;
              return (
                <div
                  key={policy.id}
                  className="card-hov"
                  style={{
                    borderRadius: 18,
                    background: surface,
                    border: `1px solid ${border}`,
                    overflow: "hidden",
                    opacity: expired ? 0.65 : 1,
                    boxShadow: d ? "none" : "0 3px 14px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Card top accent bar */}
                  <div
                    style={{
                      height: 4,
                      background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}88)`,
                    }}
                  />
                  <div style={{ padding: "16px 16px 14px" }}>
                    {/* Header row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: 12,
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.3rem",
                          }}
                        >
                          {cfg.icon}
                        </div>
                        <div>
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: "0.92rem",
                              color: textPrimary,
                              textTransform: "capitalize",
                            }}
                          >
                            {policy.type} Insurance
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: textSecondary,
                              marginTop: 1,
                            }}
                          >
                            {policy.provider}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(policy.id)}
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          border: `1px solid ${border}`,
                          background: "transparent",
                          color: "#ef4444",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.85rem",
                        }}
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Details */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 7,
                        marginBottom: 12,
                      }}
                    >
                      {policy.policy_number && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: textMuted,
                              fontWeight: 600,
                            }}
                          >
                            Policy No
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: textPrimary,
                            }}
                          >
                            {policy.policy_number}
                          </span>
                        </div>
                      )}
                      {policy.coverage_amount && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: textMuted,
                              fontWeight: 600,
                            }}
                          >
                            Coverage
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              color: "#22c55e",
                            }}
                          >
                            ₹
                            {(
                              parseFloat(policy.coverage_amount) / 100000
                            ).toFixed(1)}
                            L
                          </span>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: textMuted,
                            fontWeight: 600,
                          }}
                        >
                          Premium
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#f97316",
                          }}
                        >
                          ₹
                          {parseFloat(policy.premium_amount).toLocaleString(
                            "en-IN",
                          )}{" "}
                          / {policy.premium_frequency}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: textMuted,
                            fontWeight: 600,
                          }}
                        >
                          Annual Cost
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: textPrimary,
                          }}
                        >
                          ₹
                          {annual.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: textMuted,
                            fontWeight: 600,
                          }}
                        >
                          Valid Until
                        </span>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: textPrimary,
                          }}
                        >
                          {new Date(policy.end_date).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div
                      style={{
                        padding: "7px 12px",
                        borderRadius: 10,
                        background: statusBg,
                        border: `1px solid ${statusBorder}`,
                        textAlign: "center",
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        color: statusColor,
                      }}
                    >
                      {statusText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
              maxWidth: 440,
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
                    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  🛡️
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "1rem",
                    color: textPrimary,
                  }}
                >
                  Add Policy
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
                <label style={labelStyle}>Insurance Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  style={inputStyle}
                  required
                >
                  <option value="health">🏥 Health</option>
                  <option value="life">❤️ Life</option>
                  <option value="vehicle">🚗 Vehicle</option>
                  <option value="home">🏠 Home</option>
                  <option value="other">🛡️ Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Provider / Company *</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) =>
                    setFormData({ ...formData, provider: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="e.g., Star Health, LIC, HDFC ERGO"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Policy Number{" "}
                  <span style={{ fontWeight: 400, textTransform: "none" }}>
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.policy_number}
                  onChange={(e) =>
                    setFormData({ ...formData, policy_number: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="Policy number"
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div>
                  <label style={labelStyle}>Premium (₹) *</label>
                  <input
                    type="number"
                    step="1"
                    value={formData.premium_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        premium_amount: e.target.value,
                      })
                    }
                    style={inputStyle}
                    placeholder="5000"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Frequency *</label>
                  <select
                    value={formData.premium_frequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        premium_frequency: e.target.value,
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
                <label style={labelStyle}>Coverage Amount (₹)</label>
                <input
                  type="number"
                  step="1"
                  value={formData.coverage_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coverage_amount: e.target.value,
                    })
                  }
                  style={inputStyle}
                  placeholder="500000"
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
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
                <div>
                  <label style={labelStyle}>End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    style={inputStyle}
                    required
                  />
                </div>
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
                    background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.86rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                  }}
                >
                  Add Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
