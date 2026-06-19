import { useState, useEffect } from "react";
import { supabase } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    due_date: new Date().toISOString().split("T")[0],
    category_id: "",
    is_recurring: true,
    recurring_frequency: "monthly",
    reminder_days: 3,
  });
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const d = isDark;

  useEffect(() => {
    checkUser();
    fetchCategories();
    fetchBills();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) navigate("/login");
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("type", "expense")
      .order("name");
    if (data) setCategories(data);
  };

  const fetchBills = async () => {
    const { data, error } = await supabase
      .from("bills")
      .select(`*, categories (name, icon, color)`)
      .order("due_date", { ascending: true });
    if (!error) {
      setBills(data);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase.from("bills").insert([
      {
        user_id: user.uid,
        name: formData.name,
        amount: parseFloat(formData.amount),
        due_date: formData.due_date,
        category_id: formData.category_id || null,
        is_recurring: formData.is_recurring,
        recurring_frequency: formData.is_recurring
          ? formData.recurring_frequency
          : null,
        reminder_days: parseInt(formData.reminder_days),
        is_paid: false,
      },
    ]);
    if (!error) {
      setShowModal(false);
      setFormData({
        name: "",
        amount: "",
        due_date: new Date().toISOString().split("T")[0],
        category_id: "",
        is_recurring: true,
        recurring_frequency: "monthly",
        reminder_days: 3,
      });
      fetchBills();
    }
  };

  const handleMarkPaid = async (billId, isPaid) => {
    const { error } = await supabase
      .from("bills")
      .update({ is_paid: !isPaid })
      .eq("id", billId);
    if (!error) fetchBills();
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this bill?")) {
      const { error } = await supabase.from("bills").delete().eq("id", id);
      if (!error) fetchBills();
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  };

  const getStatus = (daysUntil, isPaid) => {
    if (isPaid)
      return {
        label: "Paid",
        color: "#22c55e",
        bg: "rgba(34,197,94,0.1)",
        border: "rgba(34,197,94,0.2)",
      };
    if (daysUntil < 0)
      return {
        label: `Overdue ${Math.abs(daysUntil)}d`,
        color: "#ef4444",
        bg: "rgba(239,68,68,0.1)",
        border: "rgba(239,68,68,0.2)",
      };
    if (daysUntil === 0)
      return {
        label: "Due Today",
        color: "#f97316",
        bg: "rgba(249,115,22,0.1)",
        border: "rgba(249,115,22,0.2)",
      };
    if (daysUntil <= 3)
      return {
        label: `Due in ${daysUntil}d`,
        color: "#f59e0b",
        bg: "rgba(245,158,11,0.1)",
        border: "rgba(245,158,11,0.2)",
      };
    return {
      label: `In ${daysUntil}d`,
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.1)",
      border: "rgba(59,130,246,0.15)",
    };
  };

  const upcomingBills = bills
    .filter((b) => !b.is_paid && getDaysUntilDue(b.due_date) >= 0)
    .slice(0, 3);
  const overdueBills = bills.filter(
    (b) => !b.is_paid && getDaysUntilDue(b.due_date) < 0,
  );
  const paidBills = bills.filter((b) => b.is_paid);
  const totalUpcoming = upcomingBills.reduce(
    (s, b) => s + parseFloat(b.amount),
    0,
  );
  const totalOverdue = overdueBills.reduce(
    (s, b) => s + parseFloat(b.amount),
    0,
  );

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}; border-radius: 4px; }
    .bill-row { transition: background 0.15s ease; }
    .bill-row:hover { background: ${d ? "rgba(255,255,255,0.03)" : "rgba(37,99,235,0.03)"} !important; }
    .btn-hover { transition: all 0.15s ease; }
    .btn-hover:hover { transform: translateY(-1px); }
    .icon-btn { transition: all 0.15s ease; }
    .icon-btn:hover { transform: scale(1.1); }
    .stat-card { transition: transform 0.18s ease, box-shadow 0.18s ease; }
    .stat-card:hover { transform: translateY(-3px); }
    .modal-overlay { animation: fadeIn 0.18s ease; }
    .modal-box { animation: slideUp 0.22s ease; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    input[type="date"]::-webkit-calendar-picker-indicator { filter: ${d ? "invert(1) opacity(0.4)" : "opacity(0.4)"}; }
    input, select { outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
    input:focus, select:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; }
    .checkbox-custom { accent-color: #3b82f6; }
  `;

  const surface = d ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = d ? "#f1f5f9" : "#0f172a";
  const textSecondary = d ? "#94a3b8" : "#64748b";
  const inputBg = d ? "rgba(255,255,255,0.06)" : "#f8fafc";
  const inputBorder = d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: 10,
    border: `1px solid ${inputBorder}`,
    background: inputBg,
    color: textPrimary,
    fontSize: "0.9rem",
    fontFamily: "inherit",
  };

  const labelStyle = {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: 700,
    color: textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: d
          ? "linear-gradient(160deg,#070b18,#0d1224,#070b18)"
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
          background: d ? "rgba(7,11,24,0.9)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
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
              }}
            >
              ← Back
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                }}
              >
                🔔
              </div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  color: textPrimary,
                  letterSpacing: "-0.01em",
                }}
              >
                Bill Reminders
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={toggleDarkMode}
              className="icon-btn"
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
              className="btn-hover"
              onClick={() => setShowModal(true)}
              style={{
                padding: "8px 18px",
                borderRadius: 10,
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 12px rgba(37,99,235,0.35)",
              }}
            >
              + Add Bill
            </button>
          </div>
        </div>
      </div>

      <div
        style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px 60px" }}
      >
        {/* ── STAT CARDS ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {overdueBills.length > 0 && (
            <div
              className="stat-card"
              style={{
                padding: "20px 20px",
                borderRadius: 18,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                boxShadow: d ? "none" : "0 2px 12px rgba(239,68,68,0.08)",
              }}
            >
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  color: "#ef4444",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 10,
                }}
              >
                ⚠️ Overdue
              </div>
              <div
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 900,
                  color: "#ef4444",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {overdueBills.length}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#ef4444",
                  marginTop: 6,
                  fontWeight: 600,
                }}
              >
                ₹{totalOverdue.toLocaleString("en-IN")}
              </div>
            </div>
          )}
          <div
            className="stat-card"
            style={{
              padding: "20px 20px",
              borderRadius: 18,
              background: surface,
              border: `1px solid ${border}`,
              boxShadow: d ? "none" : "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: textSecondary,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              📅 Upcoming
            </div>
            <div
              style={{
                fontSize: "1.9rem",
                fontWeight: 900,
                color: textPrimary,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {upcomingBills.length}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: textSecondary,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              ₹{totalUpcoming.toLocaleString("en-IN")}
            </div>
          </div>
          <div
            className="stat-card"
            style={{
              padding: "20px 20px",
              borderRadius: 18,
              background: surface,
              border: `1px solid ${border}`,
              boxShadow: d ? "none" : "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: textSecondary,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              📋 Total Bills
            </div>
            <div
              style={{
                fontSize: "1.9rem",
                fontWeight: 900,
                color: textPrimary,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {bills.length}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: textSecondary,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              {paidBills.length} paid
            </div>
          </div>
          <div
            className="stat-card"
            style={{
              padding: "20px 20px",
              borderRadius: 18,
              background: surface,
              border: `1px solid ${border}`,
              boxShadow: d ? "none" : "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            <div
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: textSecondary,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 10,
              }}
            >
              ✅ Paid
            </div>
            <div
              style={{
                fontSize: "1.9rem",
                fontWeight: 900,
                color: "#22c55e",
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {paidBills.length}
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: textSecondary,
                marginTop: 6,
                fontWeight: 500,
              }}
            >
              this cycle
            </div>
          </div>
        </div>

        {/* ── BILLS LIST ── */}
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 0",
              color: textSecondary,
              fontSize: "0.9rem",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>Loading
            your bills...
          </div>
        ) : bills.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "72px 24px",
              borderRadius: 20,
              background: surface,
              border: `1px solid ${border}`,
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🔔</div>
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: textPrimary,
              }}
            >
              No bills yet
            </h3>
            <p
              style={{
                margin: "0 0 24px",
                color: textSecondary,
                fontSize: "0.9rem",
              }}
            >
              Add your first bill to start tracking due dates and reminders.
            </p>
            <button
              className="btn-hover"
              onClick={() => setShowModal(true)}
              style={{
                padding: "10px 24px",
                borderRadius: 10,
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Add Your First Bill
            </button>
          </div>
        ) : (
          <div
            style={{
              borderRadius: 20,
              background: surface,
              border: `1px solid ${border}`,
              overflow: "hidden",
              boxShadow: d ? "none" : "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            {/* list header */}
            <div
              style={{
                padding: "14px 20px",
                borderBottom: `1px solid ${border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: textSecondary,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                }}
              >
                All Bills — {bills.length}
              </span>
            </div>

            {bills.map((bill, idx) => {
              const daysUntil = getDaysUntilDue(bill.due_date);
              const status = getStatus(daysUntil, bill.is_paid);
              const iconBg = bill.categories?.color
                ? bill.categories.color + "22"
                : d
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(37,99,235,0.08)";

              return (
                <div
                  key={bill.id}
                  className="bill-row"
                  style={{
                    padding: "16px 20px",
                    borderBottom:
                      idx < bills.length - 1 ? `1px solid ${border}` : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.3rem",
                      flexShrink: 0,
                    }}
                  >
                    {bill.categories?.icon || "💳"}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "0.92rem",
                          color: textPrimary,
                        }}
                      >
                        {bill.name}
                      </span>
                      {bill.is_recurring && (
                        <span
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 20,
                            background: "rgba(124,58,237,0.12)",
                            color: d ? "#c4b5fd" : "#7c3aed",
                            border: "1px solid rgba(124,58,237,0.2)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          🔄 {bill.recurring_frequency}
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{ fontSize: "0.8rem", color: textSecondary }}
                      >
                        Due{" "}
                        {new Date(bill.due_date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span
                        style={{
                          fontSize: "0.73rem",
                          fontWeight: 700,
                          padding: "2px 9px",
                          borderRadius: 20,
                          background: status.bg,
                          color: status.color,
                          border: `1px solid ${status.border}`,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Amount + Actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "1rem",
                        color: textPrimary,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{parseFloat(bill.amount).toLocaleString("en-IN")}
                    </span>
                    <button
                      className="btn-hover"
                      onClick={() => handleMarkPaid(bill.id, bill.is_paid)}
                      style={{
                        padding: "6px 13px",
                        borderRadius: 8,
                        border: "none",
                        background: bill.is_paid
                          ? d
                            ? "rgba(255,255,255,0.07)"
                            : "rgba(0,0,0,0.06)"
                          : "rgba(34,197,94,0.15)",
                        color: bill.is_paid ? textSecondary : "#22c55e",
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        border: `1px solid ${bill.is_paid ? border : "rgba(34,197,94,0.25)"}`,
                      }}
                    >
                      {bill.is_paid ? "Unpay" : "✓ Paid"}
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => handleDelete(bill.id)}
                      style={{
                        width: 32,
                        height: 32,
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
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div
          className="modal-overlay"
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
              padding: "28px 28px",
              width: "100%",
              maxWidth: 460,
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              margin: "auto",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  🔔
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "1.05rem",
                    color: textPrimary,
                  }}
                >
                  Add Bill Reminder
                </span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: `1px solid ${border}`,
                  background: "transparent",
                  color: textSecondary,
                  cursor: "pointer",
                  fontSize: "1rem",
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
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <div>
                <label style={labelStyle}>Bill Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="e.g., Electricity, Netflix, Rent"
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
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
                    placeholder="1000"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Due Date *</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, due_date: e.target.value })
                    }
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Category (Optional)</label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  style={inputStyle}
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recurring toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: formData.is_recurring
                    ? d
                      ? "rgba(37,99,235,0.1)"
                      : "rgba(37,99,235,0.05)"
                    : d
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.03)",
                  border: `1px solid ${formData.is_recurring ? "rgba(37,99,235,0.25)" : border}`,
                  cursor: "pointer",
                }}
                onClick={() =>
                  setFormData({
                    ...formData,
                    is_recurring: !formData.is_recurring,
                  })
                }
              >
                <input
                  type="checkbox"
                  className="checkbox-custom"
                  checked={formData.is_recurring}
                  onChange={() => {}}
                  style={{ width: 16, height: 16, cursor: "pointer" }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: textPrimary,
                    }}
                  >
                    Recurring Bill
                  </div>
                  <div style={{ fontSize: "0.76rem", color: textSecondary }}>
                    Auto-repeats on a schedule
                  </div>
                </div>
              </div>

              {formData.is_recurring && (
                <div>
                  <label style={labelStyle}>Frequency</label>
                  <select
                    value={formData.recurring_frequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recurring_frequency: e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div>
                <label style={labelStyle}>Remind me (days before)</label>
                <input
                  type="number"
                  value={formData.reminder_days}
                  onChange={(e) =>
                    setFormData({ ...formData, reminder_days: e.target.value })
                  }
                  style={inputStyle}
                  min="1"
                  max="30"
                />
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: textSecondary,
                    fontWeight: 600,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-hover"
                  style={{
                    flex: 1,
                    padding: "11px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 4px 14px rgba(37,99,235,0.35)",
                  }}
                >
                  Add Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
