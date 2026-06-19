import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function RetirementCalculator() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyExpenses, setMonthlyExpenses] = useState(50000);
  const [currentSavings, setCurrentSavings] = useState(500000);
  const [monthlySavings, setMonthlySavings] = useState(10000);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [inflationRate, setInflationRate] = useState(6);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const d = isDark;

  const calculate = () => {
    const ytr = retirementAge - currentAge;
    const yir = lifeExpectancy - retirementAge;
    const fvCurrent = currentSavings * Math.pow(1 + expectedReturn / 100, ytr);
    const mr = expectedReturn / 100 / 12;
    const months = ytr * 12;
    const fvMonthly = monthlySavings * ((Math.pow(1 + mr, months) - 1) / mr);
    const totalCorpus = fvCurrent + fvMonthly;
    const futureMonthlyExp =
      monthlyExpenses * Math.pow(1 + inflationRate / 100, ytr);
    const realReturn =
      (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1;
    const requiredCorpus = (futureMonthlyExp * 12) / realReturn;
    const surplus = totalCorpus - requiredCorpus;
    const reqMonthlySavings =
      surplus < 0
        ? (requiredCorpus - fvCurrent) / ((Math.pow(1 + mr, months) - 1) / mr)
        : monthlySavings;
    return {
      totalCorpus,
      requiredCorpus,
      surplus,
      futureMonthlyExp,
      ytr,
      yir,
      reqMonthlySavings,
    };
  };

  const r = calculate();
  const onTrack = r.surplus >= 0;

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
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    .fade-up { animation: fadeUp 0.35s ease both; }
    .btn-hov { transition: all 0.15s ease; }
    .btn-hov:hover { transform: translateY(-1px); }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    @media(max-width:800px) { .grid-2 { grid-template-columns: 1fr !important; } }
    input[type=range] { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; border-radius: 4px; outline: none; cursor: pointer; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; cursor: pointer; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.3); }
  `;

  const SliderRow = ({
    label,
    value,
    display,
    min,
    max,
    step = 1,
    onChange,
    accentColor = "#3b82f6",
    trackBg,
  }) => {
    const pct = ((value - min) / (max - min)) * 100;
    return (
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <label
            style={{
              fontSize: "0.83rem",
              fontWeight: 600,
              color: textSecondary,
            }}
          >
            {label}
          </label>
          <div
            style={{
              padding: "4px 12px",
              borderRadius: 20,
              background: `${accentColor}18`,
              border: `1px solid ${accentColor}33`,
            }}
          >
            <span
              style={{
                fontSize: "0.88rem",
                fontWeight: 800,
                color: accentColor,
              }}
            >
              {display}
            </span>
          </div>
        </div>
        <style>{`
          .slider-${label.replace(/\s/g, "")}::-webkit-slider-thumb { background: ${accentColor}; }
          .slider-${label.replace(/\s/g, "")} { background: linear-gradient(to right, ${accentColor} ${pct}%, ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} ${pct}%); }
        `}</style>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`slider-${label.replace(/\s/g, "")}`}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: "0.68rem", color: textMuted }}>
            {typeof min === "number" && min >= 1000
              ? `₹${min.toLocaleString("en-IN")}`
              : `${min}`}
          </span>
          <span style={{ fontSize: "0.68rem", color: textMuted }}>
            {typeof max === "number" && max >= 1000
              ? `₹${max.toLocaleString("en-IN")}`
              : `${max}`}
          </span>
        </div>
      </div>
    );
  };

  const DetailRow = ({ label, value, color }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: `1px solid ${border}`,
      }}
    >
      <span
        style={{ fontSize: "0.85rem", color: textSecondary, fontWeight: 500 }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "1rem",
          fontWeight: 800,
          color: color || textPrimary,
        }}
      >
        {value}
      </span>
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
                background: "linear-gradient(135deg,#f59e0b,#f97316)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.95rem",
              }}
            >
              🌅
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
                Retirement Calculator
              </span>
              <div style={{ fontSize: "0.7rem", color: textMuted }}>
                Plan your financial future
              </div>
            </div>
          </div>
          <button
            className="btn-hov"
            onClick={toggleDarkMode}
            style={{
              marginLeft: "auto",
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
        </div>
      </div>

      <div style={{ width: "100%", padding: "18px 20px 48px" }}>
        {/* STATUS BANNER */}
        <div
          className="fade-up"
          style={{
            marginBottom: 16,
            borderRadius: 18,
            padding: "20px 22px",
            background: onTrack
              ? "linear-gradient(135deg,rgba(34,197,94,0.15),rgba(16,185,129,0.1))"
              : "linear-gradient(135deg,rgba(239,68,68,0.15),rgba(245,158,11,0.1))",
            border: `1px solid ${onTrack ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: "1.4rem",
                fontWeight: 900,
                color: onTrack ? "#22c55e" : "#ef4444",
                letterSpacing: "-0.02em",
                marginBottom: 4,
              }}
            >
              {onTrack ? "✅ On Track!" : "⚠️ Shortfall Detected"}
            </div>
            <div style={{ fontSize: "0.83rem", color: textSecondary }}>
              {onTrack ? "Surplus of" : "Shortfall of"}{" "}
              <strong style={{ color: onTrack ? "#22c55e" : "#ef4444" }}>
                ₹{(Math.abs(r.surplus) / 10000000).toFixed(2)} Cr
              </strong>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "0.7rem",
                color: textMuted,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 4,
              }}
            >
              Retirement in
            </div>
            <div
              style={{
                fontSize: "1.8rem",
                fontWeight: 900,
                color: textPrimary,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {r.ytr}{" "}
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: textSecondary,
                }}
              >
                years
              </span>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ alignItems: "start" }}>
          {/* LEFT — INPUTS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Personal */}
            <div
              className="fade-up"
              style={{
                borderRadius: 18,
                background: surface,
                border: `1px solid ${border}`,
                padding: "18px 20px",
                boxShadow: d ? "none" : "0 3px 14px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: `1px solid ${border}`,
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>👤</span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    color: textPrimary,
                  }}
                >
                  Personal Details
                </span>
              </div>
              <SliderRow
                label="Current Age"
                value={currentAge}
                display={`${currentAge} yrs`}
                min={20}
                max={65}
                onChange={setCurrentAge}
                accentColor="#3b82f6"
              />
              <SliderRow
                label="Retirement Age"
                value={retirementAge}
                display={`${retirementAge} yrs`}
                min={currentAge + 1}
                max={75}
                onChange={setRetirementAge}
                accentColor="#6366f1"
              />
              <SliderRow
                label="Life Expectancy"
                value={lifeExpectancy}
                display={`${lifeExpectancy} yrs`}
                min={retirementAge + 1}
                max={100}
                onChange={setLifeExpectancy}
                accentColor="#a855f7"
              />
            </div>

            {/* Financial */}
            <div
              className="fade-up"
              style={{
                borderRadius: 18,
                background: surface,
                border: `1px solid ${border}`,
                padding: "18px 20px",
                boxShadow: d ? "none" : "0 3px 14px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: `1px solid ${border}`,
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>💰</span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    color: textPrimary,
                  }}
                >
                  Financial Details
                </span>
              </div>
              <SliderRow
                label="Monthly Expenses"
                value={monthlyExpenses}
                display={`₹${(monthlyExpenses / 1000).toFixed(0)}K`}
                min={10000}
                max={200000}
                step={5000}
                onChange={setMonthlyExpenses}
                accentColor="#f97316"
              />
              <SliderRow
                label="Current Savings"
                value={currentSavings}
                display={`₹${(currentSavings / 100000).toFixed(1)}L`}
                min={0}
                max={10000000}
                step={50000}
                onChange={setCurrentSavings}
                accentColor="#22c55e"
              />
              <SliderRow
                label="Monthly Savings"
                value={monthlySavings}
                display={`₹${(monthlySavings / 1000).toFixed(0)}K`}
                min={1000}
                max={100000}
                step={1000}
                onChange={setMonthlySavings}
                accentColor="#3b82f6"
              />
              <SliderRow
                label="Expected Return"
                value={expectedReturn}
                display={`${expectedReturn}%`}
                min={6}
                max={15}
                step={0.5}
                onChange={setExpectedReturn}
                accentColor="#a855f7"
              />
              <SliderRow
                label="Inflation Rate"
                value={inflationRate}
                display={`${inflationRate}%`}
                min={3}
                max={10}
                step={0.5}
                onChange={setInflationRate}
                accentColor="#ef4444"
              />
            </div>
          </div>

          {/* RIGHT — RESULTS */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Summary numbers */}
            <div
              className="fade-up"
              style={{
                borderRadius: 18,
                background: surface,
                border: `1px solid ${border}`,
                padding: "18px 20px",
                boxShadow: d ? "none" : "0 3px 14px rgba(0,0,0,0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: `1px solid ${border}`,
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>📋</span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    color: textPrimary,
                  }}
                >
                  Retirement Summary
                </span>
              </div>
              <DetailRow label="Years to Retirement" value={`${r.ytr} years`} />
              <DetailRow label="Years in Retirement" value={`${r.yir} years`} />
              <DetailRow
                label="Corpus You'll Build"
                value={`₹${(r.totalCorpus / 10000000).toFixed(2)} Cr`}
                color="#3b82f6"
              />
              <DetailRow
                label="Corpus Required"
                value={`₹${(r.requiredCorpus / 10000000).toFixed(2)} Cr`}
                color="#f97316"
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingTop: 10,
                }}
              >
                <span
                  style={{
                    fontSize: "0.85rem",
                    color: textSecondary,
                    fontWeight: 500,
                  }}
                >
                  Future Monthly Expenses
                </span>
                <span
                  style={{
                    fontSize: "1rem",
                    fontWeight: 800,
                    color: textPrimary,
                  }}
                >
                  ₹
                  {r.futureMonthlyExp.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>

            {/* Recommendation */}
            <div
              className="fade-up"
              style={{
                borderRadius: 18,
                padding: "18px 20px",
                background: onTrack
                  ? d
                    ? "rgba(34,197,94,0.07)"
                    : "rgba(34,197,94,0.05)"
                  : d
                    ? "rgba(245,158,11,0.07)"
                    : "rgba(245,158,11,0.05)",
                border: `1px solid ${onTrack ? "rgba(34,197,94,0.2)" : "rgba(245,158,11,0.2)"}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>💡</span>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "0.92rem",
                    color: textPrimary,
                  }}
                >
                  Recommendation
                </span>
              </div>
              {onTrack ? (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {[
                    "You're on track for a comfortable retirement!",
                    `Continue saving ₹${monthlySavings.toLocaleString("en-IN")}/month consistently`,
                    "Review your retirement plan annually",
                    "Diversify investments for better risk management",
                  ].map((text, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          color: "#22c55e",
                          flexShrink: 0,
                          fontSize: "0.85rem",
                        }}
                      >
                        {i === 0 ? "✅" : "•"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.85rem",
                          color: textSecondary,
                          lineHeight: 1.55,
                          fontWeight: i === 0 ? 600 : 400,
                        }}
                      >
                        {text}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: "#f59e0b", flexShrink: 0 }}>⚠️</span>
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: textSecondary,
                        fontWeight: 600,
                      }}
                    >
                      Increase savings to reach your retirement goal
                    </span>
                  </div>
                  <div
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: d
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.03)",
                      border: `1px solid ${border}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.72rem",
                        color: textMuted,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: 6,
                      }}
                    >
                      Required Monthly Savings
                    </div>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 900,
                        color: "#f59e0b",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      ₹
                      {r.reqMonthlySavings.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div
                      style={{
                        fontSize: "0.76rem",
                        color: textMuted,
                        marginTop: 4,
                      }}
                    >
                      Increase by ₹
                      {(r.reqMonthlySavings - monthlySavings).toLocaleString(
                        "en-IN",
                        { maximumFractionDigits: 0 },
                      )}
                      /month
                    </div>
                  </div>
                  {[
                    "Reduce post-retirement expenses",
                    "Consider retiring a few years later",
                  ].map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 8 }}>
                      <span
                        style={{
                          color: textMuted,
                          flexShrink: 0,
                          fontSize: "0.85rem",
                        }}
                      >
                        •
                      </span>
                      <span
                        style={{ fontSize: "0.85rem", color: textSecondary }}
                      >
                        {t}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assumptions */}
            <div
              className="fade-up"
              style={{
                borderRadius: 18,
                padding: "16px 20px",
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.15)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: "1rem" }}>📌</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: d ? "#93c5fd" : "#1e40af",
                  }}
                >
                  Key Assumptions
                </span>
              </div>
              {[
                `Investment returns constant at ${expectedReturn}% p.a.`,
                `Inflation at ${inflationRate}% p.a.`,
                `Post-retirement corpus generates real returns`,
                `All values in today's rupees unless stated`,
              ].map((t, i) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 8, marginBottom: 6 }}
                >
                  <span
                    style={{
                      color: d ? "#93c5fd" : "#3b82f6",
                      flexShrink: 0,
                      fontSize: "0.75rem",
                      marginTop: 2,
                    }}
                  >
                    •
                  </span>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: d ? "#93c5fd" : "#1e40af",
                      lineHeight: 1.55,
                    }}
                  >
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
