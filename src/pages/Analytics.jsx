import { useState, useEffect } from "react";
import { auth, db } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    fetchData();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) navigate("/login");
  };

const fetchData = async () => {
  const { auth, db } = await import("../firebaseClient");
  const { onAuthStateChanged } = await import("firebase/auth");
  const { collection, getDocs, query, where, orderBy } =
    await import("firebase/firestore");

  onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;

    // Fetch categories first to build a lookup map
    const catSnap = await getDocs(
      query(collection(db, "categories"), where("user_id", "==", uid)),
    );
    const catMap = {};
    catSnap.docs.forEach((d) => {
      catMap[d.id] = d.data();
    });

    // Fetch expenses and attach category info
    const expSnap = await getDocs(
      query(
        collection(db, "expenses"),
        where("user_id", "==", uid),
        orderBy("date", "asc"),
      ),
    );
    const expensesData = expSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      categories: catMap[d.data().category_id] || null,
    }));

    // Fetch income
    const incSnap = await getDocs(
      query(
        collection(db, "income"),
        where("user_id", "==", uid),
        orderBy("date", "asc"),
      ),
    );
    const incomeData = incSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    setExpenses(expensesData);
    setIncome(incomeData);
    setLoading(false);
  });
};

  const getCategoryData = () => {
    const categoryMap = {};

    expenses.forEach((expense) => {
      const categoryName = expense.categories?.name || "Other";
      const amount = parseFloat(expense.amount);

      if (categoryMap[categoryName]) {
        categoryMap[categoryName].value += amount;
      } else {
        categoryMap[categoryName] = {
          name: categoryName,
          value: amount,
          color: expense.categories?.color || "#64748b",
        };
      }
    });

    return Object.values(categoryMap).sort((a, b) => b.value - a.value);
  };

  const getMonthlyTrends = () => {
    const monthlyData = {};

    expenses.forEach((expense) => {
      const month = new Date(expense.date).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, expenses: 0, income: 0 };
      }
      monthlyData[month].expenses += parseFloat(expense.amount);
    });

    income.forEach((inc) => {
      const month = new Date(inc.date).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyData[month]) {
        monthlyData[month] = { month, expenses: 0, income: 0 };
      }
      monthlyData[month].income += parseFloat(inc.amount);
    });

    return Object.values(monthlyData).slice(-6);
  };

  const getTopCategories = () => {
    return getCategoryData().slice(0, 5);
  };

  const categoryData = getCategoryData();
  const monthlyTrends = getMonthlyTrends();
  const topCategories = getTopCategories();

  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount),
    0,
  );
  const totalIncome = income.reduce(
    (sum, inc) => sum + parseFloat(inc.amount),
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

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
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

        .chart-container {
          animation: scaleIn 0.8s ease-out;
        }

        .stat-card {
          animation: scaleIn 0.6s ease-out;
        }

        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
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
                    <span>📊</span>
                    <span>Analytics Dashboard</span>
                  </h1>
                  <p
                    className={`text-sm mt-1 ${isDark ? "text-blue-300" : "text-purple-700"}`}
                  >
                    AI-Powered Financial Insights & Trends
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`p-2.5 rounded-lg ${isDark ? "bg-blue-500/20 hover:bg-blue-500/30" : "bg-white/80 hover:bg-white"} transition-all duration-200 hover:scale-110 shadow-lg`}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div
              className={`stat-card ${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-blue-300" : "text-gray-600"}`}
                  >
                    Total Expenses
                  </p>
                  <p
                    className={`text-3xl font-bold mt-3 ${isDark ? "text-red-400" : "text-red-600"}`}
                  >
                    ₹
                    {totalExpenses.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-full group-hover:scale-110 transition-transform duration-300 ${isDark ? "bg-red-500/20" : "bg-red-100"}`}
                >
                  <span className="text-3xl">💸</span>
                </div>
              </div>
              <p
                className={`text-xs ${isDark ? "text-blue-300/70" : "text-gray-600"}`}
              >
                Money spent
              </p>
            </div>

            <div
              className={`stat-card ${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-blue-300" : "text-gray-600"}`}
                  >
                    Total Income
                  </p>
                  <p
                    className={`text-3xl font-bold mt-3 ${isDark ? "text-green-400" : "text-green-600"}`}
                  >
                    ₹
                    {totalIncome.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
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
                Money earned
              </p>
            </div>

            <div
              className={`stat-card ${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className={`text-sm font-semibold uppercase tracking-wide ${isDark ? "text-blue-300" : "text-gray-600"}`}
                  >
                    Net Savings
                  </p>
                  <p
                    className={`text-3xl font-bold mt-3 ${
                      totalIncome - totalExpenses >= 0
                        ? isDark
                          ? "text-cyan-400"
                          : "text-blue-600"
                        : isDark
                          ? "text-red-400"
                          : "text-red-600"
                    }`}
                  >
                    ₹
                    {(totalIncome - totalExpenses).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div
                  className={`p-4 rounded-full group-hover:scale-110 transition-transform duration-300 ${
                    totalIncome - totalExpenses >= 0
                      ? isDark
                        ? "bg-cyan-500/20"
                        : "bg-blue-100"
                      : isDark
                        ? "bg-red-500/20"
                        : "bg-red-100"
                  }`}
                >
                  <span className="text-3xl">
                    {totalIncome - totalExpenses >= 0 ? "📈" : "📉"}
                  </span>
                </div>
              </div>
              <p
                className={`text-xs ${isDark ? "text-blue-300/70" : "text-gray-600"}`}
              >
                {totalIncome - totalExpenses >= 0 ? "Surplus" : "Deficit"}
              </p>
            </div>
          </div>

          {expenses.length === 0 ? (
            <div
              className={`${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-12 text-center animate-fadeIn`}
            >
              <div className="text-6xl mb-4">📊</div>
              <p
                className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
              >
                No data to display
              </p>
              <p
                className={`text-sm mt-2 ${isDark ? "text-blue-300" : "text-gray-600"}`}
              >
                Start adding expenses and income to see beautiful analytics and
                insights
              </p>
            </div>
          ) : (
            <>
              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Pie Chart */}
                <div
                  className={`chart-container ${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300`}
                >
                  <h2
                    className={`text-xl font-bold mb-6 flex items-center space-x-2 ${isDark ? "text-white" : "text-gray-800"}`}
                  >
                    <span>🥧</span>
                    <span>Spending by Category</span>
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) =>
                          `₹${value.toLocaleString("en-IN")}`
                        }
                        contentStyle={{
                          backgroundColor: isDark ? "#1e293b" : "#ffffff",
                          border: isDark
                            ? "1px solid #334155"
                            : "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        }}
                        labelStyle={{ color: isDark ? "#f1f5f9" : "#1e293b" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Bar Chart */}
                <div
                  className={`chart-container ${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300`}
                >
                  <h2
                    className={`text-xl font-bold mb-6 flex items-center space-x-2 ${isDark ? "text-white" : "text-gray-800"}`}
                  >
                    <span>📊</span>
                    <span>Top 5 Spending Categories</span>
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCategories}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#334155" : "#e2e8f0"}
                      />
                      <XAxis
                        dataKey="name"
                        stroke={isDark ? "#94a3b8" : "#64748b"}
                        style={{ fontSize: "12px" }}
                      />
                      <YAxis
                        stroke={isDark ? "#94a3b8" : "#64748b"}
                        style={{ fontSize: "12px" }}
                      />
                      <Tooltip
                        formatter={(value) =>
                          `₹${value.toLocaleString("en-IN")}`
                        }
                        contentStyle={{
                          backgroundColor: isDark ? "#1e293b" : "#ffffff",
                          border: isDark
                            ? "1px solid #334155"
                            : "1px solid #e2e8f0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        }}
                        labelStyle={{ color: isDark ? "#f1f5f9" : "#1e293b" }}
                      />
                      <Bar
                        dataKey="value"
                        fill="#3b82f6"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Line Chart */}
              <div
                className={`chart-container ${isDark ? "dark-glass" : "light-glass"} glass-card rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300`}
              >
                <h2
                  className={`text-xl font-bold mb-6 flex items-center space-x-2 ${isDark ? "text-white" : "text-gray-800"}`}
                >
                  <span>📈</span>
                  <span>Monthly Income vs Expenses Trends</span>
                </h2>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "#334155" : "#e2e8f0"}
                    />
                    <XAxis
                      dataKey="month"
                      stroke={isDark ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke={isDark ? "#94a3b8" : "#64748b"}
                      style={{ fontSize: "12px" }}
                    />
                    <Tooltip
                      formatter={(value) => `₹${value.toLocaleString("en-IN")}`}
                      contentStyle={{
                        backgroundColor: isDark ? "#1e293b" : "#ffffff",
                        border: isDark
                          ? "1px solid #334155"
                          : "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                      }}
                      labelStyle={{ color: isDark ? "#f1f5f9" : "#1e293b" }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expenses"
                      stroke="#ef4444"
                      strokeWidth={3}
                      name="Expenses"
                      dot={{ fill: "#ef4444", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="income"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="Income"
                      dot={{ fill: "#10b981", r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
