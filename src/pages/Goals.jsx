import { useState, useEffect } from "react";
import { supabase } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    target_amount: "",
    current_amount: "",
    target_date: "",
    category: "savings",
  });
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    checkUser();
    fetchGoals();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) navigate("/login");
  };

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .order("target_date", { ascending: true });

    if (!error) {
      setGoals(data);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("goals").insert([
      {
        user_id: user.uid,
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        target_date: formData.target_date || null,
        category: formData.category,
      },
    ]);

    if (!error) {
      setShowModal(false);
      setFormData({
        name: "",
        target_amount: "",
        current_amount: "",
        target_date: "",
        category: "savings",
      });
      fetchGoals();
    }
  };

  const handleUpdateProgress = async (goalId, currentAmount) => {
    const newAmount = prompt("Enter new amount saved:", currentAmount);
    if (newAmount !== null && !isNaN(newAmount)) {
      const { error } = await supabase
        .from("goals")
        .update({ current_amount: parseFloat(newAmount) })
        .eq("id", goalId);

      if (!error) fetchGoals();
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this goal?")) {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (!error) fetchGoals();
    }
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateMonthsRemaining = (targetDate) => {
    if (!targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const months = Math.round((target - now) / (1000 * 60 * 60 * 24 * 30));
    return Math.max(0, months);
  };

  const calculateMonthlySavingsNeeded = (current, target, targetDate) => {
    const remaining = target - current;
    const months = calculateMonthsRemaining(targetDate);
    if (!months || months === 0) return 0;
    return remaining / months;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      savings: "💰",
      vacation: "✈️",
      car: "🚗",
      home: "🏠",
      education: "🎓",
      wedding: "💍",
      emergency: "🚨",
      other: "🎯",
    };
    return icons[category] || "🎯";
  };

  const totalTarget = goals.reduce(
    (sum, goal) => sum + parseFloat(goal.target_amount || 0),
    0,
  );
  const totalSaved = goals.reduce(
    (sum, goal) => sum + parseFloat(goal.current_amount || 0),
    0,
  );

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${isDark ? "bg-slate-950" : "bg-white"}`}
      >
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
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-20px, 20px); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes progressBar {
          from { width: 0%; }
        }

        .light-gradient-bg {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        .dark-gradient-bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 25%, #312e81 50%, #1e3a8a 75%, #0c4a6e 100%);
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        .light-orb, .dark-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: floatSlow 25s ease-in-out infinite;
        }

        .light-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(102, 126, 234, 0.6), transparent);
          top: -15%;
          left: -10%;
          opacity: 0.3;
        }

        .light-orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(240, 147, 251, 0.5), transparent);
          bottom: -10%;
          right: -10%;
          opacity: 0.3;
          animation-delay: 7s;
        }

        .dark-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.5), transparent);
          top: -15%;
          left: -10%;
          opacity: 0.4;
        }

        .dark-orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent);
          bottom: -10%;
          right: -10%;
          opacity: 0.4;
          animation-delay: 7s;
        }

        .glass-card {
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }

        .light-glass {
          background: rgba(255, 255, 255, 0.85);
          border: 2px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 8px 32px rgba(102, 126, 234, 0.15);
        }

        .dark-glass {
          background: rgba(30, 41, 59, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }

        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.5s ease-out; }

        .progress-bar-animated {
          animation: progressBar 1.5s ease-out;
        }

        .goal-card {
          animation: scaleIn 0.5s ease-out;
        }

        .goal-card:nth-child(1) { animation-delay: 0.1s; }
        .goal-card:nth-child(2) { animation-delay: 0.2s; }
        .goal-card:nth-child(3) { animation-delay: 0.3s; }
        .goal-card:nth-child(4) { animation-delay: 0.4s; }
      `}</style>

      {/* Animated Background */}
      <div
        className={`fixed inset-0 ${isDark ? "dark-gradient-bg" : "light-gradient-bg"}`}
      >
        {isDark ? (
          <>
            <div className="dark-orb dark-orb-1"></div>
            <div className="dark-orb dark-orb-2"></div>
          </>
        ) : (
          <>
            <div className="light-orb light-orb-1"></div>
            <div className="light-orb light-orb-2"></div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div
          className={`${isDark ? "dark-glass" : "light-glass"} glass-card shadow-xl animate-fadeIn`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate("/dashboard")}
                  className={`p-2.5 rounded-lg ${isDark ? "bg-blue-500/20 hover:bg-blue-500/30" : "bg-white/80 hover:bg-white"} transition-all duration-200 hover:scale-110 shadow-lg`}
                  title="Back to Dashboard"
                >
                  <span className="text-xl">←</span>
                </button>
                <div>
                  <h1
                    className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-800"} flex items-center space-x-2`}
                  >
                    <span>🎯</span>
                    <span>Savings Goals</span>
                  </h1>
                  <p
                    className={`text-sm mt-1 ${isDark ? "text-blue-300" : "text-purple-700"}`}
                  >
                    Track your financial goals with AI-powered insights
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleDarkMode}
                  className={`p-2.5 rounded-lg ${isDark ? "bg-blue-500/20 hover:bg-blue-500/30" : "bg-white/80 hover:bg-white"} transition-all duration-200 hover:scale-110 shadow-lg`}
                  title={
                    isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                  }
                >
                  <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                >
                  + Add Goal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className={`${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group animate-scaleIn`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-blue-300" : "text-gray-600"}`}
                  >
                    Total Goals
                  </p>
                  <p
                    className={`text-3xl font-bold mt-3 ${isDark ? "text-blue-400" : "text-blue-600"}`}
                  >
                    {goals.length}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-full group-hover:scale-110 transition-transform duration-300 ${isDark ? "bg-blue-500/20" : "bg-blue-100"}`}
                >
                  <span className="text-3xl">🎯</span>
                </div>
              </div>
              <p
                className={`text-xs ${isDark ? "text-blue-300/70" : "text-gray-600"}`}
              >
                Active goals
              </p>
            </div>

            <div
              className={`${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group animate-scaleIn`}
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-blue-300" : "text-gray-600"}`}
                  >
                    Total Target
                  </p>
                  <p
                    className={`text-3xl font-bold mt-3 ${isDark ? "text-purple-400" : "text-purple-600"}`}
                  >
                    ₹
                    {totalTarget.toLocaleString("en-IN", {
                      minimumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-full group-hover:scale-110 transition-transform duration-300 ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`}
                >
                  <span className="text-3xl">💎</span>
                </div>
              </div>
              <p
                className={`text-xs ${isDark ? "text-blue-300/70" : "text-gray-600"}`}
              >
                Amount to achieve
              </p>
            </div>

            <div
              className={`${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group animate-scaleIn`}
              style={{ animationDelay: "0.2s" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-blue-300" : "text-gray-600"}`}
                  >
                    Total Saved
                  </p>
                  <p
                    className={`text-3xl font-bold mt-3 ${isDark ? "text-green-400" : "text-green-600"}`}
                  >
                    ₹
                    {totalSaved.toLocaleString("en-IN", {
                      minimumFractionDigits: 0,
                    })}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-full group-hover:scale-110 transition-transform duration-300 ${isDark ? "bg-green-500/20" : "bg-green-100"}`}
                >
                  <span className="text-3xl">💰</span>
                </div>
              </div>
              <p
                className={`text-xs ${isDark ? "text-blue-300/70" : "text-gray-600"}`}
              >
                Amount saved so far
              </p>
            </div>
          </div>

          {/* Goals List */}
          {goals.length === 0 ? (
            <div
              className={`${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-12 text-center animate-fadeIn`}
            >
              <div className="text-6xl mb-4">🎯</div>
              <p
                className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"} mb-2`}
              >
                No goals yet
              </p>
              <p
                className={`text-sm ${isDark ? "text-blue-300" : "text-gray-600"} mb-6`}
              >
                Set your first savings goal and start achieving your dreams!
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map((goal, index) => {
                const progress = calculateProgress(
                  goal.current_amount,
                  goal.target_amount,
                );
                const monthsRemaining = calculateMonthsRemaining(
                  goal.target_date,
                );
                const monthlySavings = calculateMonthlySavingsNeeded(
                  goal.current_amount,
                  goal.target_amount,
                  goal.target_date,
                );
                const isComplete = progress >= 100;

                return (
                  <div
                    key={goal.id}
                    className={`goal-card ${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 ${
                      isComplete ? "ring-2 ring-green-500" : ""
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-3xl">
                          {getCategoryIcon(goal.category)}
                        </span>
                        <div>
                          <h3
                            className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
                          >
                            {goal.name}
                          </h3>
                          <p
                            className={`text-xs capitalize ${isDark ? "text-blue-300" : "text-gray-600"}`}
                          >
                            {goal.category}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className={`${isDark ? "text-red-400 hover:text-red-300" : "text-red-500 hover:text-red-700"} transition-colors`}
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div
                        className={`flex justify-between text-sm mb-2 ${isDark ? "text-blue-300" : "text-gray-600"}`}
                      >
                        <span>
                          ₹{goal.current_amount.toLocaleString("en-IN")}
                        </span>
                        <span>
                          ₹{goal.target_amount.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div
                        className={`w-full rounded-full h-3 ${isDark ? "bg-slate-700" : "bg-gray-200"}`}
                      >
                        <div
                          className={`progress-bar-animated h-3 rounded-full transition-all ${
                            isComplete
                              ? "bg-gradient-to-r from-green-500 to-emerald-500"
                              : "bg-gradient-to-r from-blue-500 to-purple-600"
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p
                        className={`text-center text-sm font-semibold mt-2 ${isDark ? "text-white" : "text-gray-800"}`}
                      >
                        {progress.toFixed(1)}% Complete
                        {isComplete && " 🎉"}
                      </p>
                    </div>

                    {/* Goal Details */}
                    <div
                      className={`space-y-2 text-sm ${isDark ? "text-blue-300" : "text-gray-600"}`}
                    >
                      {goal.target_date && (
                        <div className="flex justify-between">
                          <span>Target Date:</span>
                          <span
                            className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                          >
                            {new Date(goal.target_date).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                      )}

                      {monthsRemaining !== null && monthsRemaining > 0 && (
                        <div className="flex justify-between">
                          <span>Time Remaining:</span>
                          <span
                            className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                          >
                            {monthsRemaining} months
                          </span>
                        </div>
                      )}

                      {monthlySavings > 0 && !isComplete && (
                        <div className="flex justify-between">
                          <span>Save per month:</span>
                          <span
                            className={`font-medium ${isDark ? "text-green-400" : "text-green-600"}`}
                          >
                            ₹
                            {monthlySavings.toLocaleString("en-IN", {
                              maximumFractionDigits: 0,
                            })}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>Remaining:</span>
                        <span
                          className={`font-medium ${isDark ? "text-white" : "text-gray-800"}`}
                        >
                          ₹
                          {Math.max(
                            0,
                            goal.target_amount - goal.current_amount,
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Update Button */}
                    {!isComplete && (
                      <button
                        onClick={() =>
                          handleUpdateProgress(goal.id, goal.current_amount)
                        }
                        className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl"
                      >
                        Update Progress
                      </button>
                    )}

                    {isComplete && (
                      <div
                        className={`mt-4 p-3 rounded-lg text-center font-medium ${
                          isDark
                            ? "bg-green-500/20 text-green-300"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        🎉 Goal Achieved! Congratulations!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div
            className={`${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl shadow-2xl p-8 w-full max-w-md animate-scaleIn`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
              >
                Create Savings Goal
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`text-3xl ${isDark ? "text-blue-300 hover:text-white" : "text-gray-400 hover:text-gray-600"} transition duration-200 hover:scale-110`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? "text-blue-300" : "text-gray-700"}`}
                >
                  Goal Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                    isDark
                      ? "bg-slate-800/50 text-white border-slate-600 focus:border-blue-500"
                      : "bg-white text-gray-800 border-gray-300 focus:border-blue-500"
                  } focus:ring-2 focus:ring-blue-500/50 focus:outline-none`}
                  placeholder="e.g., Buy a car, Vacation to Goa"
                  required
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? "text-blue-300" : "text-gray-700"}`}
                >
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                    isDark
                      ? "bg-slate-800/50 text-white border-slate-600 focus:border-blue-500"
                      : "bg-white text-gray-800 border-gray-300 focus:border-blue-500"
                  } focus:ring-2 focus:ring-blue-500/50 focus:outline-none`}
                >
                  <option value="savings">💰 General Savings</option>
                  <option value="vacation">✈️ Vacation</option>
                  <option value="car">🚗 Car</option>
                  <option value="home">🏠 Home</option>
                  <option value="education">🎓 Education</option>
                  <option value="wedding">💍 Wedding</option>
                  <option value="emergency">🚨 Emergency Fund</option>
                  <option value="other">🎯 Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${isDark ? "text-blue-300" : "text-gray-700"}`}
                  >
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.target_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target_amount: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      isDark
                        ? "bg-slate-800/50 text-white border-slate-600 focus:border-blue-500"
                        : "bg-white text-gray-800 border-gray-300 focus:border-blue-500"
                    } focus:ring-2 focus:ring-blue-500/50 focus:outline-none`}
                    placeholder="50000"
                    required
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${isDark ? "text-blue-300" : "text-gray-700"}`}
                  >
                    Current Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formData.current_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        current_amount: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                      isDark
                        ? "bg-slate-800/50 text-white border-slate-600 focus:border-blue-500"
                        : "bg-white text-gray-800 border-gray-300 focus:border-blue-500"
                    } focus:ring-2 focus:ring-blue-500/50 focus:outline-none`}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? "text-blue-300" : "text-gray-700"}`}
                >
                  Target Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) =>
                    setFormData({ ...formData, target_date: e.target.value })
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl transition-all ${
                    isDark
                      ? "bg-slate-800/50 text-white border-slate-600 focus:border-blue-500"
                      : "bg-white text-gray-800 border-gray-300 focus:border-blue-500"
                  } focus:ring-2 focus:ring-blue-500/50 focus:outline-none`}
                />
              </div>

              <div
                className={`flex space-x-3 pt-6 border-t-2 ${isDark ? "border-slate-700" : "border-gray-200"}`}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                    isDark
                      ? "border-slate-600 text-blue-300 hover:bg-slate-700"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
