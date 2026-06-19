import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useDarkMode } from "../DarkModeContext";
import { useGuest } from "../GuestContext";

function ProfessionalMale() {
  return (
    <svg
      viewBox="0 0 200 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 200, height: "auto" }}
    >
      <ellipse cx="100" cy="372" rx="52" ry="8" fill="rgba(0,0,0,0.18)" />
      <rect x="68" y="270" width="28" height="95" rx="10" fill="#1e293b" />
      <rect x="104" y="270" width="28" height="95" rx="10" fill="#1e293b" />
      <line
        x1="82"
        y1="270"
        x2="82"
        y2="360"
        stroke="#0f172a"
        strokeWidth="1.5"
      />
      <line
        x1="118"
        y1="270"
        x2="118"
        y2="360"
        stroke="#0f172a"
        strokeWidth="1.5"
      />
      <rect x="62" y="354" width="38" height="14" rx="7" fill="#0f172a" />
      <rect x="98" y="354" width="38" height="14" rx="7" fill="#0f172a" />
      <path
        d="M52 180 Q48 220 46 270 L154 270 Q152 220 148 180 Q140 160 130 155 L100 168 L70 155 Q60 160 52 180Z"
        fill="#1e3a8a"
      />
      <path d="M100 168 L86 195 L100 210 L114 195 Z" fill="#f8fafc" />
      <path d="M100 168 L70 155 L64 185 L86 195 Z" fill="#1e40af" />
      <path d="M100 168 L130 155 L136 185 L114 195 Z" fill="#1e40af" />
      <path
        d="M88 165 L100 168 L112 165 L108 155 L100 160 L92 155 Z"
        fill="#f8fafc"
      />
      <path d="M97 168 L95 190 L100 218 L105 190 L103 168 Z" fill="#3b82f6" />
      <circle cx="100" cy="225" r="3" fill="#1e40af" />
      <circle cx="100" cy="242" r="3" fill="#1e40af" />
      <path
        d="M52 180 Q38 200 34 240 Q32 260 36 270 L54 270 Q56 250 60 230 Q64 205 68 195Z"
        fill="#1e40af"
      />
      <rect x="30" y="258" width="26" height="14" rx="5" fill="#f8fafc" />
      <ellipse cx="43" cy="282" rx="13" ry="16" fill="#FBBF9A" />
      <path
        d="M148 180 Q162 200 166 240 Q168 260 164 270 L146 270 Q144 250 140 230 Q136 205 132 195Z"
        fill="#1e40af"
      />
      <rect x="144" y="258" width="26" height="14" rx="5" fill="#f8fafc" />
      <ellipse cx="157" cy="282" rx="13" ry="16" fill="#FBBF9A" />
      <rect x="90" y="140" width="20" height="22" rx="6" fill="#FBBF9A" />
      <ellipse cx="100" cy="110" rx="40" ry="44" fill="#FBBF9A" />
      <ellipse cx="60" cy="112" rx="7" ry="9" fill="#FBBF9A" />
      <ellipse cx="140" cy="112" rx="7" ry="9" fill="#FBBF9A" />
      <path
        d="M62 90 Q64 55 100 52 Q136 55 138 90 Q132 68 100 66 Q68 68 62 90Z"
        fill="#1a0a00"
      />
      <path
        d="M76 94 Q83 90 90 92"
        stroke="#3d2000"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M110 92 Q117 90 124 94"
        stroke="#3d2000"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="83" cy="104" rx="9" ry="8" fill="white" />
      <ellipse cx="117" cy="104" rx="9" ry="8" fill="white" />
      <circle cx="84" cy="105" r="4" fill="#1a0a00" />
      <circle cx="118" cy="105" r="4" fill="#1a0a00" />
      <circle cx="86" cy="103" r="2" fill="white" />
      <circle cx="120" cy="103" r="2" fill="white" />
      <path
        d="M100 108 Q96 118 94 122 Q100 124 106 122 Q104 118 100 108Z"
        fill="#F5A87A"
        opacity="0.7"
      />
      <path
        d="M88 132 Q100 142 112 132"
        stroke="#c2855a"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M91 133 Q100 140 109 133 Q100 136 91 133Z"
        fill="white"
        opacity="0.8"
      />
      <ellipse cx="71" cy="120" rx="10" ry="7" fill="#f87171" opacity="0.12" />
      <ellipse cx="129" cy="120" rx="10" ry="7" fill="#f87171" opacity="0.12" />
      <rect x="27" y="264" width="12" height="8" rx="2" fill="#334155" />
      <rect x="28" y="265" width="10" height="6" rx="1.5" fill="#0ea5e9" />
    </svg>
  );
}

function ProfessionalFemale() {
  return (
    <svg
      viewBox="0 0 200 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", maxWidth: 200, height: "auto" }}
    >
      <ellipse cx="100" cy="372" rx="52" ry="8" fill="rgba(0,0,0,0.18)" />
      <path d="M64 272 Q62 320 64 368 L82 368 Q84 330 86 290Z" fill="#1e293b" />
      <path
        d="M136 272 Q138 320 136 368 L118 368 Q116 330 114 290Z"
        fill="#1e293b"
      />
      <rect x="58" y="358" width="30" height="12" rx="6" fill="#4c1d95" />
      <rect x="112" y="358" width="30" height="12" rx="6" fill="#4c1d95" />
      <rect x="74" y="358" width="4" height="14" rx="2" fill="#3b0764" />
      <rect x="128" y="358" width="4" height="14" rx="2" fill="#3b0764" />
      <path
        d="M56 178 Q50 218 48 272 L152 272 Q150 218 144 178 Q136 158 124 153 L100 167 L76 153 Q64 158 56 178Z"
        fill="#581c87"
      />
      <path d="M48 245 Q50 272 152 272 Q150 245 148 230 Z" fill="#4c1d95" />
      <path d="M100 167 L87 192 L100 210 L113 192 Z" fill="#f8fafc" />
      <path d="M100 167 L76 153 L68 183 L87 192 Z" fill="#6d28d9" />
      <path d="M100 167 L124 153 L132 183 L113 192 Z" fill="#6d28d9" />
      <path
        d="M88 165 L100 168 L112 165 L110 154 L100 160 L90 154 Z"
        fill="#fdf4ff"
      />
      <circle cx="100" cy="220" r="3.5" fill="#4c1d95" />
      <circle cx="100" cy="235" r="3.5" fill="#4c1d95" />
      <path
        d="M56 178 Q42 200 38 242 Q36 260 40 272 L58 272 Q60 252 64 232 Q68 205 76 192Z"
        fill="#6d28d9"
      />
      <rect x="32" y="260" width="28" height="14" rx="5" fill="#fdf4ff" />
      <ellipse cx="46" cy="283" rx="12" ry="15" fill="#FBBF9A" />
      <path
        d="M144 178 Q158 200 162 242 Q164 260 160 272 L142 272 Q140 252 136 232 Q132 205 124 192Z"
        fill="#6d28d9"
      />
      <rect x="140" y="260" width="28" height="14" rx="5" fill="#fdf4ff" />
      <ellipse cx="154" cy="283" rx="12" ry="15" fill="#FBBF9A" />
      <rect x="91" y="140" width="18" height="20" rx="6" fill="#FBBF9A" />
      <path
        d="M88 155 Q100 162 112 155"
        stroke="#fbbf24"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="100" cy="160" r="2.5" fill="#fbbf24" />
      <ellipse cx="100" cy="106" rx="38" ry="42" fill="#FBBF9A" />
      <ellipse cx="62" cy="108" rx="7" ry="9" fill="#FBBF9A" />
      <ellipse cx="138" cy="108" rx="7" ry="9" fill="#FBBF9A" />
      <circle cx="62" cy="116" r="4" fill="#a855f7" />
      <circle cx="138" cy="116" r="4" fill="#a855f7" />
      <path
        d="M64 100 Q62 60 100 54 Q138 60 136 100 Q130 72 100 68 Q70 72 64 100Z"
        fill="#3d1a00"
      />
      <path
        d="M66 110 Q68 155 70 165 L80 162 Q76 130 74 100 Q70 80 100 74 Q130 80 126 100 Q124 130 120 162 L130 165 Q132 155 134 110 Q138 75 100 68 Q62 75 66 110Z"
        fill="#5c2a00"
      />
      <path
        d="M74 88 Q82 83 90 86"
        stroke="#3d1a00"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M110 86 Q118 83 126 88"
        stroke="#3d1a00"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="82" cy="99" rx="10" ry="9" fill="white" />
      <ellipse cx="118" cy="99" rx="10" ry="9" fill="white" />
      <circle cx="82" cy="100" r="5" fill="#2d1a00" />
      <circle cx="118" cy="100" r="5" fill="#2d1a00" />
      <circle cx="84" cy="98" r="2.5" fill="white" />
      <circle cx="120" cy="98" r="2.5" fill="white" />
      <path
        d="M72 94 Q82 89 92 94"
        stroke="#1a0a00"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M108 94 Q118 89 128 94"
        stroke="#1a0a00"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M100 104 Q96 113 94 117 Q100 120 106 117 Q104 113 100 104Z"
        fill="#F5A87A"
        opacity="0.6"
      />
      <path
        d="M87 128 Q94 124 100 125 Q106 124 113 128 Q106 133 100 134 Q94 133 87 128Z"
        fill="#e11d48"
        opacity="0.85"
      />
      <path
        d="M87 128 Q100 131 113 128 Q106 136 100 137 Q94 136 87 128Z"
        fill="#be185d"
        opacity="0.8"
      />
      <ellipse cx="70" cy="114" rx="12" ry="8" fill="#fda4af" opacity="0.25" />
      <ellipse cx="130" cy="114" rx="12" ry="8" fill="#fda4af" opacity="0.25" />
    </svg>
  );
}

function StatChip({ icon, label, value, delay = 0 }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 12,
        padding: "10px 16px",
        backdropFilter: "blur(12px)",
        animation: `chipFloat 3s ease-in-out ${delay}s infinite`,
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: 10,
            fontFamily: "DM Sans, sans-serif",
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {label}
        </div>
        <div
          style={{
            color: "white",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "DM Sans, sans-serif",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();
  const { enterGuestMode } = useGuest();

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Invalid email or password. Please try again.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your connection.");
          break;
        default:
          setError(err.message || "Login failed. Please try again.");
      }
    }
    setLoading(false);
  };

  const handleGuestMode = (e) => {
    e.preventDefault();
    enterGuestMode();
    navigate("/", { replace: true });
  };

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
        @keyframes chipFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }
        @keyframes panelIn    { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes formIn     { from{opacity:0;transform:translateX(32px)}  to{opacity:1;transform:translateX(0)} }
        @keyframes charFloat  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes orbPulse   { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.15);opacity:.9} }
        @keyframes spin       { to{transform:rotate(360deg)} }
        @keyframes errIn      { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .char-l { animation: charFloat 5s ease-in-out infinite; }
        .char-r { animation: charFloat 5s ease-in-out 1.2s infinite; }
        input::placeholder { color: rgba(148,163,184,0.6); }
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
              top: "-15%",
              left: "-10%",
              width: 500,
              height: 500,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(59,130,246,0.22) 0%,transparent 70%)",
              animation: "orbPulse 7s ease-in-out infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-15%",
              right: "-5%",
              width: 420,
              height: 420,
              borderRadius: "50%",
              background:
                "radial-gradient(circle,rgba(168,85,247,0.22) 0%,transparent 70%)",
              animation: "orbPulse 9s ease-in-out 1s infinite",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(59,130,246,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.05) 1px,transparent 1px)",
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
                boxShadow: "0 8px 24px rgba(59,130,246,0.4)",
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
                    background: "linear-gradient(135deg,#3b82f6,#a855f7)",
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
          style={{ position: "relative", zIndex: 2, padding: "32px 44px 0" }}
        >
          <h2
            style={{
              fontFamily: "Syne, sans-serif",
              fontWeight: 800,
              fontSize: 32,
              color: "white",
              margin: 0,
              lineHeight: 1.2,
              letterSpacing: -0.5,
            }}
          >
            Take control of
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#60a5fa,#c084fc)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              your finances
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
            AI-powered insights to help you track, plan, and grow your wealth
            effortlessly.
          </p>
        </div>

        {/* Stat chips */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            padding: "20px 44px 0",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxWidth: 300,
          }}
        >
          <StatChip
            icon="📈"
            label="Portfolio Growth"
            value="+24.6% this year"
            delay={0}
          />
          <StatChip
            icon="🎯"
            label="Budget Goals Met"
            value="8 of 10 targets"
            delay={0.8}
          />
          <StatChip
            icon="💡"
            label="AI Insights"
            value="Personalised daily"
            delay={1.6}
          />
        </div>

        {/* Characters */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "0 12px",
          }}
        >
          <div className="char-l" style={{ width: "44%", maxWidth: 200 }}>
            <ProfessionalMale />
          </div>
          <div className="char-r" style={{ width: "44%", maxWidth: 200 }}>
            <ProfessionalFemale />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 120,
            background: "linear-gradient(to top,rgba(2,6,23,0.5),transparent)",
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
          padding: "40px 32px",
          opacity: mounted ? 1 : 0,
          animation: mounted
            ? "formIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both"
            : "none",
          overflowY: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 32 }}>
            <h1
              style={{
                fontFamily: "Syne, sans-serif",
                fontWeight: 800,
                fontSize: 28,
                color: isDark ? "#f1f5f9" : "#0f172a",
                margin: "0 0 6px",
                letterSpacing: -0.5,
              }}
            >
              Welcome back 👋
            </h1>
            <p
              style={{
                color: isDark ? "#64748b" : "#94a3b8",
                fontSize: 14,
                margin: 0,
              }}
            >
              Sign in to your Finance.ai account
            </p>
          </div>

          {error && (
            <div
              style={{
                marginBottom: 20,
                padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#ef4444",
                fontSize: 13,
                animation: "errIn 0.3s ease",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            {/* Email */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: isDark ? "#94a3b8" : "#475569",
                  marginBottom: 7,
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
                    opacity: 0.5,
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
                  style={{
                    width: "100%",
                    padding: "13px 14px 13px 42px",
                    borderRadius: 12,
                    border: `2px solid ${focusedField === "email" ? "#3b82f6" : isDark ? "#1e293b" : "#e2e8f0"}`,
                    background: isDark ? "rgba(15,23,42,0.6)" : "white",
                    color: isDark ? "#f1f5f9" : "#0f172a",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s,box-shadow 0.2s",
                    boxShadow:
                      focusedField === "email"
                        ? "0 0 0 4px rgba(59,130,246,0.12)"
                        : "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
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
                    color: isDark ? "#94a3b8" : "#475569",
                  }}
                >
                  Password
                </label>
                <a
                  href="#"
                  style={{
                    fontSize: 12,
                    color: "#3b82f6",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 16,
                    opacity: 0.5,
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
                  placeholder="Enter your password"
                  required
                  style={{
                    width: "100%",
                    padding: "13px 14px 13px 42px",
                    borderRadius: 12,
                    border: `2px solid ${focusedField === "password" ? "#3b82f6" : isDark ? "#1e293b" : "#e2e8f0"}`,
                    background: isDark ? "rgba(15,23,42,0.6)" : "white",
                    color: isDark ? "#f1f5f9" : "#0f172a",
                    fontSize: 14,
                    outline: "none",
                    transition: "border-color 0.2s,box-shadow 0.2s",
                    boxShadow:
                      focusedField === "password"
                        ? "0 0 0 4px rgba(59,130,246,0.12)"
                        : "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

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
                  "linear-gradient(135deg,#3b82f6 0%,#6366f1 50%,#a855f7 100%)",
                color: "white",
                fontFamily: "DM Sans, sans-serif",
                fontWeight: 700,
                fontSize: 15,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 8px 28px rgba(99,102,241,0.38)",
                opacity: loading ? 0.75 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "transform 0.15s,box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 12px 36px rgba(99,102,241,0.48)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow =
                  "0 8px 28px rgba(99,102,241,0.38)";
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
                  Signing in…
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              margin: "20px 0",
              gap: 12,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: isDark ? "#1e293b" : "#e2e8f0",
              }}
            />
            <div
              style={{
                flex: 1,
                height: 1,
                background: isDark ? "#1e293b" : "#e2e8f0",
              }}
            />
          </div>


          <p
            style={{
              textAlign: "center",
              fontSize: 14,
              color: isDark ? "#64748b" : "#94a3b8",
              marginTop: 24,
              marginBottom: 0,
            }}
          >
            Don't have an account?{" "}
            <a
              href="/signup"
              style={{
                color: "#3b82f6",
                fontWeight: 700,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#a855f7")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#3b82f6")}
            >
              Sign up free →
            </a>
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              marginTop: 28,
              paddingTop: 20,
              borderTop: `1px solid ${isDark ? "#0f172a" : "#f1f5f9"}`,
            }}
          >
            {[
              ["🔒", "256-bit SSL"],
              ["🛡️", "GDPR Safe"],
              ["⚡", "99.9% Uptime"],
            ].map(([icon, txt]) => (
              <div
                key={txt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  color: isDark ? "#475569" : "#94a3b8",
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
