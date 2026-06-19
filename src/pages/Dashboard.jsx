import { useState, useEffect } from "react";
import { auth, db } from "../firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { signOut } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    totalInvestments: 0,
  });
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
      } else {
        setUser(firebaseUser);
        setLoading(false);
        fetchStats(firebaseUser.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchStats = async (uid) => {
    try {
      const [expSnap, incSnap, invSnap] = await Promise.all([
        getDocs(query(collection(db, "expenses"), where("user_id", "==", uid))),
        getDocs(query(collection(db, "income"), where("user_id", "==", uid))),
        getDocs(
          query(collection(db, "investments"), where("user_id", "==", uid)),
        ),
      ]);

      const totalExpenses = expSnap.docs.reduce(
        (sum, d) => sum + parseFloat(d.data().amount || 0),
        0,
      );
      const totalIncome = incSnap.docs.reduce(
        (sum, d) => sum + parseFloat(d.data().amount || 0),
        0,
      );
      const totalInvestments = invSnap.docs.reduce(
        (sum, d) =>
          sum +
          parseFloat(d.data().buy_price || 0) *
            parseFloat(d.data().quantity || 0),
        0,
      );

      setStats({ totalExpenses, totalIncome, totalInvestments });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-300">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${isDark ? "bg-slate-950" : "bg-white"}`}
    >
      <style>{`
        @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-20px); } }
        @keyframes floatSlow { 0%, 100% { transform: translate(0, 0); } 33% { transform: translate(30px, -30px); } 66% { transform: translate(-20px, 20px); } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
        .animate-header { animation: fadeSlideDown 0.6s ease-out; }
        .animate-stat-card { animation: scaleIn 0.6s ease-out; }
        .animate-stat-card:nth-child(1) { animation-delay: 0.1s; }
        .animate-stat-card:nth-child(2) { animation-delay: 0.2s; }
        .animate-stat-card:nth-child(3) { animation-delay: 0.3s; }
        .animate-action-card { animation: fadeSlideUp 0.4s ease-out; animation-fill-mode: both; }
        .light-gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%); background-size: 400% 400%; animation: gradientShift 15s ease infinite; }
        .dark-gradient-bg { background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e3a8a 75%, #0c4a6e 100%); background-size: 400% 400%; animation: gradientShift 15s ease infinite; }
        .light-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.3; animation: floatSlow 25s ease-in-out infinite; }
        .light-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(102,126,234,0.6), transparent); top: -15%; left: -10%; }
        .light-orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(240,147,251,0.5), transparent); top: 40%; right: -10%; animation-delay: 5s; }
        .light-orb-3 { width: 700px; height: 700px; background: radial-gradient(circle, rgba(79,172,254,0.4), transparent); bottom: -20%; left: 20%; animation-delay: 10s; }
        .dark-orb { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.4; animation: floatSlow 25s ease-in-out infinite; }
        .dark-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(59,130,246,0.5), transparent); top: -15%; left: -10%; }
        .dark-orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(139,92,246,0.4), transparent); top: 40%; right: -10%; animation-delay: 5s; }
        .dark-orb-3 { width: 700px; height: 700px; background: radial-gradient(circle, rgba(236,72,153,0.3), transparent); bottom: -20%; left: 20%; animation-delay: 10s; }
        .light-particle { position: absolute; background: rgba(102,126,234,0.4); border-radius: 50%; animation: float 20s ease-in-out infinite; }
        .dark-particle { position: absolute; background: rgba(255,255,255,0.3); border-radius: 50%; animation: float 20s ease-in-out infinite; }
        .light-glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.9); box-shadow: 0 8px 32px rgba(102,126,234,0.15); }
        .dark-glass { background: rgba(15,23,42,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .light-stat-card { background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%); backdrop-filter: blur(20px); border: 2px solid rgba(255,255,255,1); box-shadow: 0 10px 40px rgba(102,126,234,0.2); transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
        .light-stat-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(102,126,234,0.3); }
        .dark-stat-card { background: linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.6) 100%); backdrop-filter: blur(20px); border: 1px solid rgba(59,130,246,0.2); box-shadow: 0 10px 40px rgba(0,0,0,0.3); transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
        .dark-stat-card:hover { transform: translateY(-8px); box-shadow: 0 20px 50px rgba(59,130,246,0.3); border-color: rgba(59,130,246,0.4); }
        .light-action-card { background: rgba(255,255,255,0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.9); box-shadow: 0 4px 20px rgba(102,126,234,0.15); transition: all 0.3s ease; }
        .light-action-card:hover { transform: translateY(-6px); box-shadow: 0 12px 35px rgba(102,126,234,0.25); background: rgba(255,255,255,0.95); }
        .dark-action-card { background: rgba(30,41,59,0.5); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: all 0.3s ease; }
        .dark-action-card:hover { transform: translateY(-6px); box-shadow: 0 12px 35px rgba(59,130,246,0.3); border-color: rgba(59,130,246,0.3); }
        .icon-wrapper { transition: transform 0.3s ease; }
        .light-action-card:hover .icon-wrapper, .dark-action-card:hover .icon-wrapper { transform: scale(1.1); }
        .gradient-text { background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-size: 200% 200%; animation: gradientShift 3s ease infinite; }
        .progress-bar { transition: width 1.5s ease-out; }
      `}</style>

      {/* Animated Background */}
      <div
        className={`fixed inset-0 ${isDark ? "dark-gradient-bg" : "light-gradient-bg"}`}
      >
        {isDark ? (
          <>
            <div className="dark-orb dark-orb-1"></div>
            <div className="dark-orb dark-orb-2"></div>
            <div className="dark-orb dark-orb-3"></div>
          </>
        ) : (
          <>
            <div className="light-orb light-orb-1"></div>
            <div className="light-orb light-orb-2"></div>
            <div className="light-orb light-orb-3"></div>
          </>
        )}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={isDark ? "dark-particle" : "light-particle"}
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${Math.random() * 15 + 15}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div
          className={`${isDark ? "dark-glass" : "light-glass"} animate-header`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div
                className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg ${isDark ? "" : "shadow-blue-500/30"}`}
              >
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h1 className="text-3xl font-extrabold gradient-text">
                  Finance AI Dashboard
                </h1>
                <p
                  className={`text-sm mt-1 ${isDark ? "text-blue-300/80" : "text-purple-700/80"}`}
                >
                  Intelligent Financial Management System
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/profile")}
                className={`p-3 rounded-xl ${isDark ? "dark-glass hover:bg-white/10" : "light-glass hover:bg-white"} transition-all duration-300 hover:scale-110 shadow-lg`}
                title="Profile"
              >
                <span className="text-xl">👤</span>
              </button>
              
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Welcome Card */}
          <div
            className={`${isDark ? "dark-glass" : "light-glass"} rounded-3xl shadow-2xl p-8 mb-8 animate-header relative overflow-hidden`}
          >
            <div
              className={`absolute top-0 right-0 w-64 h-64 ${isDark ? "bg-blue-500/10" : "bg-purple-400/20"} rounded-full -mr-32 -mt-32`}
              style={{ animation: "float 8s ease-in-out infinite" }}
            ></div>
            <div
              className={`absolute bottom-0 left-0 w-48 h-48 ${isDark ? "bg-purple-500/10" : "bg-pink-400/20"} rounded-full -ml-24 -mb-24`}
              style={{
                animation: "float 10s ease-in-out infinite",
                animationDelay: "2s",
              }}
            ></div>
            <div className="relative z-10">
              <div className="flex items-center space-x-4 mb-4">
                <div
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl"
                  style={{ animation: "pulse 2s ease-in-out infinite" }}
                >
                  <span className="text-3xl">👋</span>
                </div>
                <div>
                  <h2
                    className={`text-4xl font-bold mb-2 ${isDark ? "text-white" : "text-gray-800"}`}
                  >
                    Welcome back, {user?.displayName || user?.email}!
                  </h2>
                  <p
                    className={`text-lg flex items-center space-x-2 ${isDark ? "text-blue-200" : "text-purple-700"}`}
                  >
                    <span>🚀</span>
                    <span>
                      Your AI-powered financial command center is ready
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {/* Expenses */}
            <div
              className={`${isDark ? "dark-stat-card" : "light-stat-card"} rounded-3xl p-8 animate-stat-card`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wider mb-2 flex items-center space-x-2 ${isDark ? "text-blue-300" : "text-purple-700"}`}
                  >
                    <span>💸</span>
                    <span>Total Expenses</span>
                  </p>
                  <p
                    className={`text-5xl font-extrabold ${isDark ? "text-red-400" : "text-red-600"}`}
                  >
                    ₹
                    {stats.totalExpenses.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div
                  className={`p-5 rounded-2xl shadow-lg ${isDark ? "bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-500/30" : "bg-gradient-to-br from-red-100 to-pink-100 border-2 border-red-300"}`}
                >
                  <svg
                    className={`w-10 h-10 ${isDark ? "text-red-400" : "text-red-600"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </div>
              </div>
              <div
                className={`mt-6 h-3 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-gray-200"}`}
              >
                <div
                  className="progress-bar h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg"
                  style={{ width: "70%" }}
                ></div>
              </div>
              <p
                className={`text-xs mt-3 ${isDark ? "text-blue-300/70" : "text-gray-600"}`}
              >
                📉 Tracking your spending patterns
              </p>
            </div>

            {/* Income */}
            <div
              className={`${isDark ? "dark-stat-card" : "light-stat-card"} rounded-3xl p-8 animate-stat-card`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wider mb-2 flex items-center space-x-2 ${isDark ? "text-blue-300" : "text-purple-700"}`}
                  >
                    <span>💰</span>
                    <span>Total Income</span>
                  </p>
                  <p
                    className={`text-5xl font-extrabold ${isDark ? "text-green-400" : "text-green-600"}`}
                  >
                    ₹
                    {stats.totalIncome.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div
                  className={`p-5 rounded-2xl shadow-lg ${isDark ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30" : "bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300"}`}
                >
                  <svg
                    className={`w-10 h-10 ${isDark ? "text-green-400" : "text-green-600"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </div>
              </div>
              <div
                className={`mt-6 h-3 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-gray-200"}`}
              >
                <div
                  className="progress-bar h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full shadow-lg"
                  style={{ width: "85%" }}
                ></div>
              </div>
              <p
                className={`text-xs mt-3 ${isDark ? "text-blue-300/70" : "text-gray-600"}`}
              >
                📈 Your earnings are growing!
              </p>
            </div>

            {/* Savings */}
            <div
              className={`${isDark ? "dark-stat-card" : "light-stat-card"} rounded-3xl p-8 animate-stat-card`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wider mb-2 flex items-center space-x-2 ${isDark ? "text-blue-300" : "text-purple-700"}`}
                  >
                    <span>💎</span>
                    <span>Net Savings</span>
                  </p>
                  <p
                    className={`text-5xl font-extrabold ${stats.totalIncome - stats.totalExpenses >= 0 ? (isDark ? "text-cyan-400" : "text-blue-600") : isDark ? "text-red-400" : "text-red-600"}`}
                  >
                    ₹
                    {(stats.totalIncome - stats.totalExpenses).toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 },
                    )}
                  </p>
                </div>
                <div
                  className={`p-5 rounded-2xl shadow-lg ${isDark ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30" : "bg-gradient-to-br from-cyan-100 to-blue-100 border-2 border-blue-300"}`}
                >
                  <svg
                    className={`w-10 h-10 ${isDark ? "text-cyan-400" : "text-blue-600"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div
                className={`mt-6 h-3 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-gray-200"}`}
              >
                <div
                  className={`progress-bar h-full rounded-full shadow-lg ${stats.totalIncome - stats.totalExpenses >= 0 ? "bg-gradient-to-r from-cyan-500 to-blue-500" : "bg-gradient-to-r from-red-500 to-pink-500"}`}
                  style={{ width: "60%" }}
                ></div>
              </div>
              <p
                className={`text-xs mt-3 ${isDark ? "text-blue-300/70" : "text-gray-600"}`}
              >
                🎯 Building your wealth
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3
                  className={`text-4xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                >
                  AI-Powered Tools
                </h3>
              </div>
              <div className="h-1 flex-grow ml-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: "💰",
                  title: "Expenses",
                  desc: "Track your spending",
                  path: "/expenses",
                  delay: "0s",
                },
                {
                  icon: "💵",
                  title: "Income",
                  desc: "Track your earnings",
                  path: "/income",
                  delay: "0.05s",
                },
                {
                  icon: "📈",
                  title: "Investments",
                  desc: "Manage your portfolio",
                  path: "/investments",
                  delay: "0.1s",
                },
                {
                  icon: "🤖",
                  title: "AI Advisor",
                  desc: "Get financial advice",
                  path: "/ai-advisor",
                  delay: "0.15s",
                },
                {
                  icon: "📊",
                  title: "Analytics",
                  desc: "View charts & insights",
                  path: "/analytics",
                  delay: "0.2s",
                },
                {
                  icon: "🎯",
                  title: "Goals",
                  desc: "Track savings goals",
                  path: "/goals",
                  delay: "0.25s",
                },
                {
                  icon: "🔔",
                  title: "Bills",
                  desc: "Bill reminders",
                  path: "/bills",
                  delay: "0.3s",
                },
                {
                  icon: "💳",
                  title: "EMI Calculator",
                  desc: "Calculate loan EMI",
                  path: "/emi-calculator",
                  delay: "0.35s",
                },
                {
                  icon: "🏆",
                  title: "Achievements",
                  desc: "View badges & streaks",
                  path: "/gamification",
                  delay: "0.4s",
                },
                {
                  icon: "🎤",
                  title: "Voice Entry",
                  desc: "Add expenses by voice",
                  path: "/voice-expense",
                  delay: "0.45s",
                },
                {
                  icon: "💰",
                  title: "Tax Calculator",
                  desc: "Calculate income tax",
                  path: "/tax-calculator",
                  delay: "0.5s",
                },
                {
                  icon: "📊",
                  title: "Credit Score",
                  desc: "Simulate credit score",
                  path: "/credit-score-simulator",
                  delay: "0.55s",
                },
                {
                  icon: "💳",
                  title: "Debt Payoff",
                  desc: "Plan debt repayment",
                  path: "/debt-payoff",
                  delay: "0.6s",
                },
                {
                  icon: "📄",
                  title: "Export Reports",
                  desc: "Download PDF/CSV",
                  path: "/export-reports",
                  delay: "0.65s",
                },
                {
                  icon: "🔮",
                  title: "Predictive Analysis",
                  desc: "AI spending predictions",
                  path: "/predictive-analysis",
                  delay: "0.7s",
                },
                {
                  icon: "🔔",
                  title: "Notifications",
                  desc: "Smart alerts & reminders",
                  path: "/notifications",
                  delay: "0.75s",
                },
                {
                  icon: "📊",
                  title: "Budgets",
                  desc: "Manage monthly budgets",
                  path: "/budgets",
                  delay: "0.8s",
                },
                {
                  icon: "📁",
                  title: "Categories",
                  desc: "Customize categories",
                  path: "/categories",
                  delay: "0.85s",
                },
                {
                  icon: "📸",
                  title: "Receipt Scanner",
                  desc: "AI-powered OCR",
                  path: "/receipt-scanner",
                  delay: "0.9s",
                },
                {
                  icon: "👥",
                  title: "Peer Comparison",
                  desc: "Anonymous benchmarking",
                  path: "/social-comparisons",
                  delay: "0.95s",
                },
                {
                  icon: "💡",
                  title: "AI Tips",
                  desc: "Personalized advice",
                  path: "/personalized-tips",
                  delay: "1s",
                },
                {
                  icon: "🤖",
                  title: "Auto-Adjust Budget",
                  desc: "AI budget optimization",
                  path: "/ai-budget-adjuster",
                  delay: "1.05s",
                },
                {
                  icon: "🛡️",
                  title: "Insurance Tracker",
                  desc: "Track your insurance",
                  path: "/insurance-tracker",
                  delay: "1.1s",
                },
                {
                  icon: "👴",
                  title: "Retirement Calculator",
                  desc: "Calculate your retirement",
                  path: "/retirement-calculator",
                  delay: "1.15s",
                },
                {
                  icon: "📺",
                  title: "Subscriptions",
                  desc: "Manage subscriptions",
                  path: "/subscriptions",
                  delay: "1.2s",
                },
              ].map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigate(item.path)}
                  className={`${isDark ? "dark-action-card" : "light-action-card"} animate-action-card rounded-2xl shadow-xl p-8 text-left relative overflow-hidden group`}
                  style={{ animationDelay: item.delay }}
                >
                  <div className="relative z-10">
                    <div className="icon-wrapper text-5xl mb-4 filter drop-shadow-lg">
                      {item.icon}
                    </div>
                    <h4
                      className={`font-bold text-lg mb-2 flex items-center space-x-2 ${isDark ? "text-white" : "text-gray-800"}`}
                    >
                      <span>{item.title}</span>
                      <svg
                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </h4>
                    <p
                      className={`text-sm ${isDark ? "text-blue-200/80" : "text-gray-600"}`}
                    >
                      {item.desc}
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
