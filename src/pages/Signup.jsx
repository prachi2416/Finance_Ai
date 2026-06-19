import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseClient";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { useDarkMode } from "../DarkModeContext";

const PROFESSIONS = [
  { value: "student", label: "🎓 Student" },
  { value: "salaried_employee", label: "💼 Salaried Employee" },
  { value: "business_owner", label: "🏢 Business Owner" },
  { value: "shop_owner", label: "🏪 Shop Owner" },
  { value: "freelancer", label: "💻 Freelancer" },
  { value: "investor", label: "📈 Investor" },
];

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", type: "expense", icon: "🍔", color: "#ef4444" },
  { name: "Transportation", type: "expense", icon: "🚗", color: "#f59e0b" },
  { name: "Shopping", type: "expense", icon: "🛍️", color: "#8b5cf6" },
  { name: "Entertainment", type: "expense", icon: "🎬", color: "#ec4899" },
  { name: "Bills & Utilities", type: "expense", icon: "💡", color: "#3b82f6" },
  { name: "Healthcare", type: "expense", icon: "🏥", color: "#10b981" },
  { name: "Education", type: "expense", icon: "📚", color: "#6366f1" },
  { name: "Travel", type: "expense", icon: "✈️", color: "#14b8a6" },
  { name: "Groceries", type: "expense", icon: "🛒", color: "#22c55e" },
  { name: "Housing & Rent", type: "expense", icon: "🏠", color: "#f97316" },
  { name: "Utilities", type: "expense", icon: "⚡", color: "#0ea5e9" },
  { name: "Other", type: "expense", icon: "📦", color: "#64748b" },
  { name: "Salary", type: "income", icon: "💰", color: "#10b981" },
  { name: "Freelance", type: "income", icon: "💼", color: "#3b82f6" },
  { name: "Investment", type: "income", icon: "📈", color: "#8b5cf6" },
  { name: "Other Income", type: "income", icon: "💵", color: "#64748b" },
];

function PasswordStrength({ password }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) =>
    r.test(password),
  ).length;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: i <= score ? colors[score] : "rgba(100,116,139,0.2)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontSize: 11,
          color: colors[score],
          fontFamily: "DM Sans, sans-serif",
          fontWeight: 600,
        }}
      >
        {labels[score]}
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "14px 16px",
        animation: `slideUpCard 0.6s ease ${delay}s both`,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background:
            "linear-gradient(135deg,rgba(59,130,246,0.25),rgba(168,85,247,0.25))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "DM Sans, sans-serif",
            marginBottom: 2,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "rgba(148,163,184,0.7)",
            fontSize: 12,
            fontFamily: "DM Sans, sans-serif",
            lineHeight: 1.5,
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
}

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profession, setProfession] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ── 1. Create Firebase Auth user ───────────────────────────────────
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // ── 2. Set display name ────────────────────────────────────────────
      await updateProfile(user, { displayName: name });

      // ── 3. Save profile to Firestore → users/{uid} ─────────────────────
      // Using "users" collection to match Onboarding.jsx & other modules
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: email.trim(),
        full_name: name.trim(),
        profession: profession,
        onboarding_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // ── 4. Seed default categories for this user ───────────────────────
      // Static import at top of file — no dynamic import needed
      const categoryPromises = DEFAULT_CATEGORIES.map((cat) =>
        addDoc(collection(db, "categories"), {
          user_id: user.uid,
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          created_at: new Date().toISOString(),
        }),
      );
      await Promise.all(categoryPromises);

      console.log("✅ Signup complete — user saved to users/" + user.uid);
      navigate("/onboarding");
    } catch (err) {
      console.error("❌ Signup error:", err.code, err.message);
      switch (err.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;
        case "auth/weak-password":
          setError("Password should be at least 6 characters.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your connection.");
          break;
        case "permission-denied":
          setError(
            "Firestore permission denied — check your Firebase security rules.",
          );
          break;
        default:
          setError(err.message || "Signup failed. Please try again.");
      }
    }
    setLoading(false);
  };

  const completedFields = [name, email, password, profession].filter(
    Boolean,
  ).length;

  const inputStyle = (field) => ({
    width: "100%",
    padding: "13px 14px 13px 42px",
    borderRadius: 12,
    border: `2px solid ${focusedField === field ? "#3b82f6" : isDark ? "#1e293b" : "#e2e8f0"}`,
    background: isDark ? "rgba(15,23,42,0.6)" : "white",
    color: isDark ? "#f1f5f9" : "#0f172a",
    fontSize: 14,
    outline: "none",
    fontFamily: "DM Sans, sans-serif",
    transition: "border-color 0.2s,box-shadow 0.2s",
    boxShadow:
      focusedField === field ? "0 0 0 4px rgba(59,130,246,0.12)" : "none",
    boxSizing: "border-box",
  });

  const labelColor = isDark ? "#94a3b8" : "#475569";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        fontFamily: "DM Sans, sans-serif",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Syne:wght@700;800&display=swap');
        @keyframes panelIn    { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes formIn     { from{opacity:0;transform:translateX(32px)}  to{opacity:1;transform:translateX(0)} }
        @keyframes orbPulse   { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.15);opacity:.9} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes slideUpCard{ from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes errIn      { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        input::placeholder    { color: rgba(148,163,184,0.55); }
        select option         { background: #1e293b; color: #f1f5f9; }
      `}</style>

      {/* LEFT PANEL */}
      <div
        style={{
          flex: "0 0 52%",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(145deg,#020617 0%,#0a0f2e 40%,#0d1540 70%,#0f0728 100%)",
          display: "flex",
          flexDirection: "column",
          opacity: mounted ? 1 : 0,
          animation: mounted
            ? "panelIn 0.7s cubic-bezier(0.22,1,0.36,1) both"
            : "none",
        }}
      >
        {/* Orbs */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-12%",
              left: "-8%",
              width: 480,
              height: 480,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(168,85,247,0.22) 0%,transparent 70%)",
              animation: "orbPulse 8s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-10%",
              right: "-6%",
              width: 400,
              height: 400,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(59,130,246,0.2) 0%,transparent 70%)",
              animation: "orbPulse 10s ease-in-out 1s infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(168,85,247,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.04) 1px,transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
        </div>

        {/* Logo */}
        <div
          style={{ position: "relative", zIndex: 2, padding: "36px 44px 0" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "linear-gradient(135deg,#3b82f6,#a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 24px rgba(168,85,247,0.4)",
              }}
            >
              <span style={{ color: "white", fontSize: 20, fontWeight: 900 }}>
                ₹
              </span>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 800,
                  fontSize: 22,
                  color: "white",
                  lineHeight: 1,
                }}
              >
                Finance
                <span
                  style={{
                    background: "linear-gradient(135deg,#a855f7,#3b82f6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  .ai
                </span>
              </div>
              <div
                style={{
                  color: "rgba(148,163,184,0.7)",
                  fontSize: 11,
                  letterSpacing: 0.5,
                }}
              >
                Smart Financial Companion
              </div>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{ position: "relative", zIndex: 2, padding: "28px 44px 0" }}
        >
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: 30,
              color: "white",
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: -0.5,
            }}
          >
            Start your journey
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#c084fc,#60a5fa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              to financial freedom
            </span>
          </h2>
          <p
            style={{
              color: "rgba(148,163,184,0.75)",
              fontSize: 14,
              marginTop: 10,
              lineHeight: 1.6,
              maxWidth: 340,
            }}
          >
            Join thousands of smart Indians managing their money with AI
            precision.
          </p>
        </div>

        {/* Features */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "22px 44px 0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <FeatureCard
            icon="🤖"
            title="AI-Powered Insights"
            desc="Get personalized recommendations based on your spending patterns."
            delay={0.1}
          />
          <FeatureCard
            icon="📊"
            title="Smart Budgeting"
            desc="Set goals and track every rupee with beautiful dashboards."
            delay={0.25}
          />
          <FeatureCard
            icon="🔔"
            title="Smart Alerts"
            desc="Real-time notifications when you're close to your budget limits."
            delay={0.4}
          />
        </div>

        {/* Testimonial */}
        <div
          style={{ position: "relative", zIndex: 2, padding: "16px 44px 0" }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "16px",
              animation: "slideUpCard 0.6s ease 0.6s both",
            }}
          >
            <p
              style={{
                color: "rgba(226,232,240,0.85)",
                fontSize: 13,
                fontFamily: "DM Sans, sans-serif",
                fontStyle: "italic",
                margin: "0 0 12px",
                lineHeight: 1.6,
              }}
            >
              "Finance.ai completely changed how I manage money. I saved ₹40,000
              in just 3 months!"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#3b82f6,#a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                }}
              >
                👩‍💻
              </div>
              <div>
                <div
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  Prara Singh
                </div>
                <div
                  style={{
                    color: "rgba(148,163,184,0.6)",
                    fontSize: 11,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  Software Engineer, Mumbai
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User count */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "16px 44px 0",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div style={{ display: "flex" }}>
            {["👨‍💼", "👩‍💼", "👨‍🎓", "👩‍🎓", "👨‍💻"].map((e, i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: `hsl(${220 + i * 20},70%,40%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  marginLeft: i ? -8 : 0,
                  border: "2px solid rgba(2,6,23,0.8)",
                }}
              >
                {e}
              </div>
            ))}
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgba(148,163,184,0.8)",
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            <span style={{ color: "white", fontWeight: 700 }}>12,400+</span>{" "}
            users already saving smarter
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 80,
            background: "linear-gradient(to top,rgba(2,6,23,0.6),transparent)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isDark ? "#0b1120" : "#f8fafc",
          padding: "32px",
          opacity: mounted ? 1 : 0,
          animation: mounted
            ? "formIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both"
            : "none",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          {/* Progress bar */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: isDark ? "#64748b" : "#94a3b8",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Profile completion
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#3b82f6",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                {completedFields}/4 fields
              </span>
            </div>
            <div
              style={{
                height: 5,
                background: isDark ? "#1e293b" : "#e2e8f0",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(completedFields / 4) * 100}%`,
                  background: "linear-gradient(90deg,#3b82f6,#a855f7)",
                  borderRadius: 10,
                  transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
            </div>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 26,
                color: isDark ? "#f1f5f9" : "#0f172a",
                margin: "0 0 6px",
                letterSpacing: -0.5,
              }}
            >
              Create your account 🚀
            </h1>
            <p
              style={{
                color: isDark ? "#64748b" : "#94a3b8",
                fontSize: 14,
                margin: 0,
              }}
            >
              Free forever · No credit card required
            </p>
          </div>

          {error && (
            <div
              style={{
                marginBottom: 18,
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
                fontSize: 13,
                fontFamily: "DM Sans, sans-serif",
                animation: "errIn 0.3s ease",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form
            onSubmit={handleSignup}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Full Name */}
            <div style={{ color: labelColor }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 7,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Full Name
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    opacity: 0.45,
                    pointerEvents: "none",
                  }}
                >
                  👤
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your full name"
                  required
                  style={inputStyle("name")}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ color: labelColor }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 7,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Email Address
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    opacity: 0.45,
                    pointerEvents: "none",
                  }}
                >
                  ✉️
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  style={inputStyle("email")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ color: labelColor }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 7,
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "DM Sans, sans-serif",
                  }}
                >
                  Password
                </label>
                <span style={{ fontSize: 11, color: "#64748b" }}>
                  Min. 6 characters
                </span>
              </div>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    opacity: 0.45,
                    pointerEvents: "none",
                  }}
                >
                  🔒
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                  style={inputStyle("password")}
                />
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Profession */}
            <div style={{ color: labelColor }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 7,
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                Profession
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    opacity: 0.45,
                    pointerEvents: "none",
                    zIndex: 1,
                  }}
                >
                  💼
                </span>
                <select
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  onFocus={() => setFocusedField("profession")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputStyle("profession"),
                    cursor: "pointer",
                    appearance: "none",
                    WebkitAppearance: "none",
                  }}
                >
                  <option value="">Select your profession</option>
                  {PROFESSIONS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <span
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 12,
                    opacity: 0.4,
                    pointerEvents: "none",
                  }}
                >
                  ▼
                </span>
              </div>
            </div>

            {/* Terms */}
            <p
              style={{
                fontSize: 12,
                color: isDark ? "#475569" : "#94a3b8",
                margin: "2px 0 0",
                lineHeight: 1.5,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              By signing up you agree to our{" "}
              <a
                href="#"
                style={{
                  color: "#3b82f6",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                href="#"
                style={{
                  color: "#3b82f6",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Privacy Policy
              </a>
              .
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 13,
                border: "none",
                background:
                  "linear-gradient(135deg,#a855f7 0%,#6366f1 50%,#3b82f6 100%)",
                color: "white",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 28px rgba(168,85,247,0.38)",
                opacity: loading ? 0.75 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "transform 0.15s,box-shadow 0.15s",
                marginTop: 4,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 36px rgba(168,85,247,0.48)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow =
                  "0 8px 28px rgba(168,85,247,0.38)";
              }}
            >
              {loading ? (
                <>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      border: "2.5px solid rgba(255,255,255,0.35)",
                      borderTopColor: "white",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Creating account…
                </>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              color: isDark ? "#64748b" : "#94a3b8",
              marginTop: 20,
              marginBottom: 0,
              fontFamily: "DM Sans, sans-serif",
            }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              style={{
                color: "#3b82f6",
                fontWeight: 700,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a855f7")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3b82f6")}
            >
              Sign in →
            </a>
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 20,
              marginTop: 24,
              paddingTop: 20,
              borderTop: `1px solid ${isDark ? "#0f172a" : "#f1f5f9"}`,
              flexWrap: "wrap",
            }}
          >
            {[
              ["🔒", "256-bit SSL"],
              ["🛡️", "GDPR Safe"],
              ["🌟", "Free Forever"],
            ].map(([icon, txt]) => (
              <div
                key={txt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  color: isDark ? "#475569" : "#94a3b8",
                  fontFamily: "DM Sans, sans-serif",
                }}
              >
                <span>{icon}</span>
                {txt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
