// About.jsx
import { useDarkMode } from "../DarkModeContext";
import { useEffect, useRef, useState } from "react";

// ─── Intersection Observer hook for scroll reveals ───
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ─── Animated counter ───
function Counter({ target, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);
  return (
    <span ref={ref}>
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

// ─── Section wrapper with reveal ───
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function About() {
  const { isDark } = useDarkMode();

  const d = isDark;

  const features = [
    {
      icon: "💸",
      title: "Smart Expense Tracking",
      desc: "Log and categorize every transaction automatically. Understand exactly where your money goes — by day, week, or month — with intuitive visual breakdowns.",
      badge: "Core",
    },
    {
      icon: "📈",
      title: "Investment Portfolio",
      desc: "Track your NSE/BSE stocks and mutual funds in real time. See your total gain/loss, individual stock performance, and portfolio allocation — all in one dashboard.",
      badge: "Live Data",
    },
    {
      icon: "🎯",
      title: "Savings Goals",
      desc: "Create goals for anything — emergency fund, vacation, home. Set a target, contribute regularly, and watch your progress bars fill up month by month.",
      badge: "Goals",
    },
    {
      icon: "🤖",
      title: "AI Financial Advisor",
      desc: "Ask anything about your finances — tax planning, which stock to buy, can I afford this phone, how much do I save for retirement. Get personalized, India-specific answers instantly, no internet required.",
      badge: "Offline AI",
    },
    {
      icon: "📊",
      title: "Analytics & Insights",
      desc: "Beautiful charts reveal spending patterns, income trends, and investment performance. Identify where you can save more and celebrate when you improve.",
      badge: "Visual",
    },
    {
      icon: "🔔",
      title: "Budget Alerts",
      desc: "Set monthly budget limits per category. Get notified the moment you're close to overspending — before it's too late to adjust.",
      badge: "Alerts",
    },
  ];

  const values = [
    {
      icon: "🔒",
      title: "Your Data, Your Privacy",
      desc: "We never sell your financial data. Your information stays encrypted and is only used to power your personal dashboard.",
    },
    {
      icon: "🇮🇳",
      title: "Built for India",
      desc: "From GST categories to NSE/BSE stocks, PPF, ELSS, and Indian tax slabs — every feature is designed for Indian financial reality.",
    },
    {
      icon: "⚡",
      title: "Offline-First AI",
      desc: "Our AI advisor works without internet. All financial knowledge is embedded — so advice is instant, private, and always available.",
    },
    {
      icon: "🎓",
      title: "Financial Education",
      desc: "We don't just show numbers. We explain them — so you understand why, not just what, empowering smarter decisions every day.",
    },
  ];

  const faqs = [
    {
      q: "Is Finance.ai free to use?",
      a: "Yes — core features including expense tracking, goals, and the AI advisor are completely free. We believe financial clarity should be accessible to everyone.",
    },
    {
      q: "How does the AI advisor work without internet?",
      a: "Our AI advisor has deep knowledge of Indian finance — tax laws, mutual funds, stocks, loan rates, insurance, and more — all embedded directly in the app. It uses your actual financial data (income, expenses, portfolio) to give personalized answers instantly, without sending anything to an external server.",
    },
    {
      q: "Is my financial data secure?",
      a: "Absolutely. All data is encrypted in transit and at rest. We follow industry-standard security practices and never share or sell your personal financial information to third parties.",
    },
    {
      q: "Can I track my stocks and mutual funds?",
      a: "Yes. Finance.ai supports NSE and BSE stocks. Enter your buy price and quantity, and the app tracks current value, gain/loss percentage, and portfolio allocation automatically.",
    },
    {
      q: "What kind of questions can I ask the AI advisor?",
      a: "Almost anything India-finance related — 'Can I afford an iPhone 16?', 'How much tax will I pay this year?', 'Where should I invest ₹10,000/month?', 'Should I take a home loan?', 'Am I on track for retirement?' — and you'll get specific answers based on your numbers.",
    },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: d
          ? "linear-gradient(160deg, #070b18 0%, #0d1224 50%, #070b18 100%)"
          : "linear-gradient(160deg, #f0f4ff 0%, #fafbff 50%, #f0f4ff 100%)",
        paddingTop: 80,
        paddingBottom: 80,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        overflowX: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&family=Instrument+Serif:ital@0;1&display=swap');
        .faq-answer { overflow: hidden; transition: max-height 0.38s ease, opacity 0.3s ease; }
        .feature-card { transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
        .feature-card:hover { transform: translateY(-4px); }
        .value-card { transition: transform 0.2s ease, background 0.2s ease; }
        .value-card:hover { transform: translateY(-3px); }
        .faq-row { transition: background 0.18s ease; cursor: pointer; }
        .faq-row:hover { background: ${d ? "rgba(255,255,255,0.04)" : "rgba(37,99,235,0.04)"} !important; }
        .badge { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; padding: 3px 9px; border-radius: 20px; }
        .stat-glow { position: relative; }
        .stat-glow::after { content: ''; position: absolute; inset: -1px; border-radius: inherit; background: linear-gradient(135deg, rgba(37,99,235,0.3), rgba(124,58,237,0.3)); z-index: -1; filter: blur(12px); opacity: 0; transition: opacity 0.3s; }
        .stat-glow:hover::after { opacity: 1; }
      `}</style>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        {/* ── HERO ── */}
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <Reveal delay={0}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 16px",
                borderRadius: 30,
                background: d ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.08)",
                border: `1px solid ${d ? "rgba(37,99,235,0.3)" : "rgba(37,99,235,0.2)"}`,
                marginBottom: 28,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block",
                  boxShadow: "0 0 6px #22c55e",
                }}
              />
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  color: d ? "#93c5fd" : "#2563eb",
                  letterSpacing: "0.03em",
                }}
              >
                India's Personal Finance Platform
              </span>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h1
              style={{
                fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: d ? "#f1f5f9" : "#0f172a",
                margin: "0 0 20px",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              We're on a mission to make{" "}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                financial clarity
              </span>{" "}
              accessible to every Indian
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p
              style={{
                fontSize: "1.08rem",
                lineHeight: 1.75,
                color: d ? "#94a3b8" : "#475569",
                maxWidth: 640,
                margin: "0 auto 40px",
                fontWeight: 400,
              }}
            >
              Finance.ai was built because most Indians have no clear picture of
              where their money goes, how their investments are performing, or
              whether they're on track for their goals. We fix that — with a
              single, intelligent platform.
            </p>
          </Reveal>

          {/* Stats row */}
          <Reveal delay={240}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              {[
                { num: 50, suffix: "K+", label: "Active Users" },
                { num: 98, suffix: "%", label: "AI Answer Rate" },
                { num: 4.8, suffix: "★", label: "App Rating", noCounter: true },
                { num: 100, suffix: "%", label: "Data Privacy" },
              ].map((s, i) => (
                <div
                  key={i}
                  className="stat-glow"
                  style={{
                    padding: "20px 28px",
                    borderRadius: 18,
                    background: d ? "rgba(255,255,255,0.04)" : "#ffffff",
                    border: `1px solid ${d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
                    textAlign: "center",
                    minWidth: 120,
                    boxShadow: d ? "none" : "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.8rem",
                      fontWeight: 900,
                      color: d ? "#f1f5f9" : "#0f172a",
                      letterSpacing: "-0.04em",
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1,
                    }}
                  >
                    {s.noCounter ? (
                      s.num + s.suffix
                    ) : (
                      <Counter target={s.num} suffix={s.suffix} />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: "0.77rem",
                      color: d ? "#64748b" : "#94a3b8",
                      fontWeight: 600,
                      marginTop: 6,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* ── OUR STORY ── */}
        <Reveal delay={0}>
          <div
            style={{
              borderRadius: 24,
              padding: "44px 48px",
              background: d ? "rgba(255,255,255,0.03)" : "#ffffff",
              border: `1px solid ${d ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
              boxShadow: d ? "none" : "0 4px 24px rgba(0,0,0,0.06)",
              marginBottom: 40,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* decorative gradient blob */}
            <div
              style={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 220,
                height: 220,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -40,
                left: -40,
                width: 160,
                height: 160,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 48,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "#2563eb",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 12,
                  }}
                >
                  Our Story
                </div>
                <h2
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: d ? "#f1f5f9" : "#0f172a",
                    lineHeight: 1.25,
                    letterSpacing: "-0.02em",
                    marginBottom: 16,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Born out of a real financial frustration
                </h2>
                <p
                  style={{
                    fontSize: "0.93rem",
                    lineHeight: 1.8,
                    color: d ? "#94a3b8" : "#475569",
                    marginBottom: 16,
                  }}
                >
                  The idea for Finance.ai came from a simple observation — most
                  Indians are hardworking, earning well, yet they end each month
                  unsure of where it all went. Expensive financial advisors are
                  out of reach for most. Spreadsheets are tedious. Generic apps
                  don't understand Indian financial products.
                </p>
                <p
                  style={{
                    fontSize: "0.93rem",
                    lineHeight: 1.8,
                    color: d ? "#94a3b8" : "#475569",
                  }}
                >
                  So we built Finance.ai — a platform that knows India: our tax
                  slabs, our PPF and ELSS rules, our NSE/BSE stocks, our salary
                  structures. A platform where anyone can ask{" "}
                  <em>"should I buy this phone?"</em> or{" "}
                  <em>"how much tax do I owe?"</em> and get a real answer in
                  seconds.
                </p>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {[
                  {
                    emoji: "🗓️",
                    text: "Founded with one goal — make personal finance simple for every Indian household.",
                  },
                  {
                    emoji: "🧠",
                    text: "Built an AI advisor with deep knowledge of Indian tax law, markets, and savings instruments — works 100% offline.",
                  },
                  {
                    emoji: "🚀",
                    text: "Grew to 50,000+ users by focusing on accuracy, privacy, and genuinely useful advice — not noise.",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 14,
                      alignItems: "flex-start",
                      padding: "14px 16px",
                      borderRadius: 14,
                      background: d
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(37,99,235,0.04)",
                      border: `1px solid ${d ? "rgba(255,255,255,0.06)" : "rgba(37,99,235,0.08)"}`,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.3rem",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      {item.emoji}
                    </span>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.87rem",
                        lineHeight: 1.65,
                        color: d ? "#94a3b8" : "#475569",
                      }}
                    >
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── FEATURES ── */}
        <Reveal delay={0}>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#2563eb",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              What We Offer
            </div>
            <h2
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: d ? "#f1f5f9" : "#0f172a",
                letterSpacing: "-0.02em",
                margin: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Everything you need. Nothing you don't.
            </h2>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                className="feature-card"
                style={{
                  height: "100%",
                  padding: "24px 22px",
                  borderRadius: 18,
                  background: d ? "rgba(255,255,255,0.03)" : "#ffffff",
                  border: `1px solid ${d ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                  boxShadow: d ? "none" : "0 2px 12px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "1.8rem" }}>{f.icon}</span>
                  <span
                    className="badge"
                    style={{
                      background: d
                        ? "rgba(37,99,235,0.15)"
                        : "rgba(37,99,235,0.08)",
                      color: d ? "#93c5fd" : "#2563eb",
                      border: `1px solid ${d ? "rgba(37,99,235,0.3)" : "rgba(37,99,235,0.15)"}`,
                    }}
                  >
                    {f.badge}
                  </span>
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "0.97rem",
                    fontWeight: 700,
                    color: d ? "#e2e8f0" : "#1e293b",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {f.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.85rem",
                    lineHeight: 1.7,
                    color: d ? "#94a3b8" : "#64748b",
                  }}
                >
                  {f.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── AI ADVISOR SPOTLIGHT ── */}
        <Reveal delay={0}>
          <div
            style={{
              borderRadius: 24,
              padding: "40px 44px",
              background:
                "linear-gradient(135deg, rgba(37,99,235,0.12) 0%, rgba(124,58,237,0.1) 100%)",
              border: `1px solid ${d ? "rgba(96,165,250,0.2)" : "rgba(37,99,235,0.15)"}`,
              marginBottom: 40,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -80,
                right: -80,
                width: 280,
                height: 280,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 40,
                alignItems: "center",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontSize: "1.8rem" }}>🤖</span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: d ? "#93c5fd" : "#2563eb",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    AI Advisor — How It Works
                  </span>
                </div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: d ? "#f1f5f9" : "#0f172a",
                    letterSpacing: "-0.02em",
                    marginBottom: 14,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  The advisor that knows Indian finance inside out
                </h2>
                <p
                  style={{
                    fontSize: "0.92rem",
                    lineHeight: 1.8,
                    color: d ? "#94a3b8" : "#475569",
                    marginBottom: 20,
                  }}
                >
                  Unlike chatbots that rely on external AI APIs, our advisor is
                  built entirely in-app. It contains deep, structured knowledge
                  of Indian tax laws, NSE/BSE markets, mutual funds, PPF, EPF,
                  home loans, insurance, and more — and it answers over{" "}
                  <strong style={{ color: d ? "#e2e8f0" : "#1e293b" }}>
                    90% of personal finance questions
                  </strong>{" "}
                  correctly and instantly.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {[
                    "No internet needed",
                    "Uses your real numbers",
                    "India-specific advice",
                    "Instant responses",
                    "100% private",
                  ].map((t, i) => (
                    <span
                      key={i}
                      style={{
                        padding: "5px 13px",
                        borderRadius: 20,
                        background: d
                          ? "rgba(96,165,250,0.12)"
                          : "rgba(37,99,235,0.08)",
                        color: d ? "#93c5fd" : "#1d4ed8",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        border: `1px solid ${d ? "rgba(96,165,250,0.2)" : "rgba(37,99,235,0.15)"}`,
                      }}
                    >
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ flexShrink: 0 }}>
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 24,
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "2.4rem",
                    boxShadow: "0 8px 32px rgba(37,99,235,0.3)",
                  }}
                >
                  🤖
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── VALUES ── */}
        <Reveal delay={0}>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#2563eb",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              Our Values
            </div>
            <h2
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: d ? "#f1f5f9" : "#0f172a",
                letterSpacing: "-0.02em",
                margin: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              What we stand for
            </h2>
          </div>
        </Reveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 14,
            marginBottom: 52,
          }}
        >
          {values.map((v, i) => (
            <Reveal key={i} delay={i * 60}>
              <div
                className="value-card"
                style={{
                  padding: "24px 20px",
                  borderRadius: 18,
                  background: d ? "rgba(255,255,255,0.03)" : "#ffffff",
                  border: `1px solid ${d ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
                  boxShadow: d ? "none" : "0 2px 12px rgba(0,0,0,0.05)",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: 12 }}>
                  {v.icon}
                </div>
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: "0.93rem",
                    fontWeight: 700,
                    color: d ? "#e2e8f0" : "#1e293b",
                  }}
                >
                  {v.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.82rem",
                    lineHeight: 1.7,
                    color: d ? "#94a3b8" : "#64748b",
                  }}
                >
                  {v.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* ── FAQ ── */}
        <Reveal delay={0}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#2563eb",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              FAQ
            </div>
            <h2
              style={{
                fontSize: "1.9rem",
                fontWeight: 800,
                color: d ? "#f1f5f9" : "#0f172a",
                letterSpacing: "-0.02em",
                margin: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Common questions
            </h2>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              border: `1px solid ${d ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)"}`,
              background: d ? "rgba(255,255,255,0.02)" : "#ffffff",
              boxShadow: d ? "none" : "0 4px 20px rgba(0,0,0,0.06)",
              marginBottom: 52,
            }}
          >
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  style={{
                    borderBottom:
                      i < faqs.length - 1
                        ? `1px solid ${d ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`
                        : "none",
                  }}
                >
                  <div
                    className="faq-row"
                    onClick={() => setOpenFaq(open ? null : i)}
                    style={{
                      padding: "20px 26px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 16,
                      background: open
                        ? d
                          ? "rgba(37,99,235,0.06)"
                          : "rgba(37,99,235,0.03)"
                        : "transparent",
                      userSelect: "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.93rem",
                        fontWeight: 600,
                        color: d ? "#e2e8f0" : "#1e293b",
                        lineHeight: 1.45,
                      }}
                    >
                      {faq.q}
                    </span>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: open
                          ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                          : d
                            ? "rgba(255,255,255,0.06)"
                            : "rgba(0,0,0,0.05)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "background 0.2s ease",
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d={open ? "M2 8L6 4L10 8" : "M2 4L6 8L10 4"}
                          stroke={open ? "#ffffff" : d ? "#64748b" : "#94a3b8"}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <div
                    className="faq-answer"
                    style={{ maxHeight: open ? 200 : 0, opacity: open ? 1 : 0 }}
                  >
                    <p
                      style={{
                        margin: 0,
                        padding: "0 26px 20px",
                        fontSize: "0.88rem",
                        lineHeight: 1.75,
                        color: d ? "#94a3b8" : "#475569",
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* ── CTA FOOTER ── */}
        <Reveal delay={0}>
          <div
            style={{
              textAlign: "center",
              padding: "48px 40px",
              borderRadius: 24,
              background: "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -60,
                left: "50%",
                transform: "translateX(-50%)",
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                pointerEvents: "none",
              }}
            />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: "2.4rem", marginBottom: 14 }}>₹</div>
              <h2
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "#ffffff",
                  letterSpacing: "-0.02em",
                  marginBottom: 12,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Take control of your financial future — today
              </h2>
              <p
                style={{
                  fontSize: "0.95rem",
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.7,
                  maxWidth: 480,
                  margin: "0 auto 28px",
                }}
              >
                Join thousands of Indians who use Finance.ai every day to spend
                smarter, invest better, and build the life they want.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="/dashboard"
                  style={{
                    padding: "12px 28px",
                    borderRadius: 12,
                    background: "#ffffff",
                    color: "#1d4ed8",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    textDecoration: "none",
                    letterSpacing: "-0.01em",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    display: "inline-block",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 24px rgba(0,0,0,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.2)";
                  }}
                >
                  Go to Dashboard →
                </a>
                <a
                  href="/ai-advisor"
                  style={{
                    padding: "12px 28px",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    textDecoration: "none",
                    letterSpacing: "-0.01em",
                    border: "1px solid rgba(255,255,255,0.25)",
                    transition: "background 0.15s ease, transform 0.15s ease",
                    display: "inline-block",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.transform = "";
                  }}
                >
                  Try AI Advisor 🤖
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
