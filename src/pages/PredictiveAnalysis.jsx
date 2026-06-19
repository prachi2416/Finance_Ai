import { useState, useEffect } from "react";
import { auth, db } from "../firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function PredictiveAnalysis() {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [categoryMap, setCategoryMap] = useState({});
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  // Default category definitions (matching CategoryManager IDs)
  const defaultCategoryDefs = [
    { id: "food", name: "Food & Dining", icon: "🍽️" },
    { id: "transport", name: "Transportation", icon: "🚗" },
    { id: "shopping", name: "Shopping", icon: "🛍️" },
    { id: "entertainment", name: "Entertainment", icon: "🎬" },
    { id: "bills", name: "Bills & Utilities", icon: "📄" },
    { id: "healthcare", name: "Healthcare", icon: "🏥" },
    { id: "education", name: "Education", icon: "📚" },
    { id: "travel", name: "Travel", icon: "✈️" },
    { id: "personal", name: "Personal Care", icon: "💅" },
    { id: "others", name: "Others", icon: "📦" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }
      setUser(firebaseUser);
      fetchHistoricalData(firebaseUser.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchHistoricalData = async (uid) => {
    try {
      setLoading(true);

      // ── 1. Build category map (defaults + Firestore custom) ──
      const builtMap = {};
      defaultCategoryDefs.forEach((c) => {
        builtMap[c.id] = c;
      });

      const catSnap = await getDocs(
        query(collection(db, "categories"), where("user_id", "==", uid)),
      );
      catSnap.docs.forEach((d) => {
        builtMap[d.id] = { id: d.id, ...d.data() };
      });
      setCategoryMap(builtMap);

      // ── 2. Fetch last 6 months of expenses ──
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const cutoff = sixMonthsAgo.toISOString().split("T")[0];

      const expSnap = await getDocs(
        query(
          collection(db, "expenses"),
          where("user_id", "==", uid),
          where("date", ">=", cutoff),
          orderBy("date", "asc"),
        ),
      );
      const expenses = expSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // ── 3. Fetch last 6 months of income ──
      const incSnap = await getDocs(
        query(
          collection(db, "income"),
          where("user_id", "==", uid),
          where("date", ">=", cutoff),
          orderBy("date", "asc"),
        ),
      );
      const income = incSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // ── 4. Aggregate by month using category_id ──
      const monthlyData = {};

      expenses.forEach((exp) => {
        const monthKey = new Date(exp.date).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { expenses: 0, income: 0, categories: {} };
        }
        monthlyData[monthKey].expenses += parseFloat(exp.amount || 0);

        // Use category_id for lookup; fallback to "others"
        const catId = exp.category_id || "others";
        monthlyData[monthKey].categories[catId] =
          (monthlyData[monthKey].categories[catId] || 0) +
          parseFloat(exp.amount || 0);
      });

      income.forEach((inc) => {
        const monthKey = new Date(inc.date).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { expenses: 0, income: 0, categories: {} };
        }
        monthlyData[monthKey].income += parseFloat(inc.amount || 0);
      });

      setHistoricalData({
        monthly: monthlyData,
        expenses,
        income,
        categoryMap: builtMap,
      });
    } catch (error) {
      console.error("Error fetching historical data:", error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeAndPredict = async () => {
    if (!historicalData) return;

    setAnalyzing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const monthlyEntries = Object.entries(historicalData.monthly);

    if (monthlyEntries.length < 1) {
      alert("No expense data found. Please add some expenses first.");
      setAnalyzing(false);
      return;
    }

    // ── Averages ──────────────────────────────────────────────────────────
    const avgExpenses =
      monthlyEntries.reduce((sum, [, d]) => sum + d.expenses, 0) /
      monthlyEntries.length;
    const avgIncome =
      monthlyEntries.reduce((sum, [, d]) => sum + d.income, 0) /
      monthlyEntries.length;

    // ── Trend: compare recent 3 months vs older months ───────────────────
    const recentMonths = monthlyEntries.slice(-3);
    const olderMonths = monthlyEntries.slice(
      0,
      Math.max(1, monthlyEntries.length - 3),
    );

    const recentAvg =
      recentMonths.reduce((s, [, d]) => s + d.expenses, 0) /
      recentMonths.length;
    const olderAvg =
      olderMonths.reduce((s, [, d]) => s + d.expenses, 0) / olderMonths.length;

    const expenseGrowthRate =
      olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;

    // ── Predictions ───────────────────────────────────────────────────────
    const predictedExpenses = avgExpenses * (1 + expenseGrowthRate);
    const predictedIncome = avgIncome > 0 ? avgIncome : 0;
    const predictedSavings = predictedIncome - predictedExpenses;
    const savingsRate =
      predictedIncome > 0
        ? ((predictedIncome - predictedExpenses) / predictedIncome) * 100
        : 0;

    // ── Category predictions (by category_id) ────────────────────────────
    const categoryTotals = {};
    monthlyEntries.forEach(([, data]) => {
      Object.entries(data.categories).forEach(([catId, amount]) => {
        categoryTotals[catId] = (categoryTotals[catId] || 0) + amount;
      });
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([catId, total]) => {
        const avgAmt = total / monthlyEntries.length;
        const predicted = avgAmt * (1 + expenseGrowthRate);
        const cat = categoryMap[catId] || historicalData.categoryMap?.[catId];
        return {
          id: catId,
          name: cat?.name || catId,
          icon: cat?.icon || "📦",
          predicted: Math.round(predicted),
          avg: Math.round(avgAmt),
        };
      })
      .filter((c) => c.predicted > 0)
      .sort((a, b) => b.predicted - a.predicted)
      .slice(0, 5);

    // ── Highest spending day of week ──────────────────────────────────────
    const daySpending = {};
    historicalData.expenses.forEach((exp) => {
      const day = new Date(exp.date).toLocaleDateString("en-US", {
        weekday: "long",
      });
      daySpending[day] = (daySpending[day] || 0) + parseFloat(exp.amount || 0);
    });
    const topDay = Object.entries(daySpending).sort((a, b) => b[1] - a[1])[0];

    // ── Month-over-month chart data ───────────────────────────────────────
    const chartData = monthlyEntries.map(([month, data]) => ({
      month,
      expenses: Math.round(data.expenses),
      income: Math.round(data.income),
      savings: Math.round(data.income - data.expenses),
    }));

    // ── Anomaly detection ─────────────────────────────────────────────────
    const anomalies = [];
    monthlyEntries.forEach(([month, data]) => {
      if (data.expenses > avgExpenses * 1.5) {
        anomalies.push({
          type: "high_spending",
          month,
          amount: data.expenses,
          pct: (((data.expenses - avgExpenses) / avgExpenses) * 100).toFixed(0),
          message: `Unusually high spending in ${month}`,
        });
      } else if (data.expenses < avgExpenses * 0.5 && data.expenses > 0) {
        anomalies.push({
          type: "low_spending",
          month,
          amount: data.expenses,
          pct: (((avgExpenses - data.expenses) / avgExpenses) * 100).toFixed(0),
          message: `Unusually low spending in ${month}`,
        });
      }
    });

    // ── Insights ──────────────────────────────────────────────────────────
    const insights = [];

    if (expenseGrowthRate > 0.1) {
      insights.push({
        icon: "⚠️",
        type: "warning",
        title: "Rising Expenses",
        description: `Expenses growing at ${(expenseGrowthRate * 100).toFixed(1)}% per month. Consider reviewing discretionary spending.`,
      });
    } else if (expenseGrowthRate < -0.1) {
      insights.push({
        icon: "✅",
        type: "success",
        title: "Expenses Declining",
        description: `Expenses declining at ${Math.abs(expenseGrowthRate * 100).toFixed(1)}% per month. Keep it up!`,
      });
    } else {
      insights.push({
        icon: "📊",
        type: "info",
        title: "Stable Spending",
        description: `Expense growth is ${(expenseGrowthRate * 100).toFixed(1)}% — your spending is relatively stable.`,
      });
    }

    if (predictedIncome > 0 && predictedExpenses > predictedIncome) {
      insights.push({
        icon: "🚨",
        type: "danger",
        title: "Budget Deficit Predicted",
        description: `Next month expenses may exceed income by ₹${Math.abs(Math.round(predictedSavings)).toLocaleString("en-IN")}. Plan accordingly.`,
      });
    } else if (predictedIncome === 0) {
      insights.push({
        icon: "💡",
        type: "info",
        title: "No Income Data",
        description:
          "Add income records to get savings rate predictions and budget deficit warnings.",
      });
    }

    if (predictedIncome > 0) {
      if (savingsRate < 10) {
        insights.push({
          icon: "🚨",
          type: "danger",
          title: "Very Low Savings Rate",
          description: `Predicted savings rate: ${savingsRate.toFixed(1)}%. Aim for at least 20%.`,
        });
      } else if (savingsRate < 20) {
        insights.push({
          icon: "💡",
          type: "info",
          title: "Low Savings Rate",
          description: `Predicted savings rate: ${savingsRate.toFixed(1)}%. Financial experts recommend 20–30%.`,
        });
      } else {
        insights.push({
          icon: "🎯",
          type: "success",
          title: "Healthy Savings Rate",
          description: `Predicted savings rate: ${savingsRate.toFixed(1)}%. You're on track!`,
        });
      }
    }

    if (topCategories.length > 0) {
      insights.push({
        icon: "📦",
        type: "info",
        title: `Top Spend: ${topCategories[0].icon} ${topCategories[0].name}`,
        description: `Your biggest predicted expense next month is ${topCategories[0].name} at ₹${topCategories[0].predicted.toLocaleString("en-IN")}.`,
      });
    }

    setPredictions({
      nextMonth: {
        expenses: Math.round(predictedExpenses),
        income: Math.round(predictedIncome),
        savings: Math.round(predictedSavings),
        savingsRate,
      },
      trends: {
        avgExpenses: Math.round(avgExpenses),
        avgIncome: Math.round(avgIncome),
        expenseGrowthRate,
      },
      categories: topCategories,
      patterns: {
        highestSpendingDay: topDay?.[0] || "N/A",
        highestSpendingAmount: Math.round(topDay?.[1] || 0),
        daySpending,
      },
      chartData,
      anomalies,
      insights,
    });

    setAnalyzing(false);
  };

  // ── Mini bar chart helper ──────────────────────────────────────────────
  const MiniBarChart = ({ data }) => {
    if (!data || data.length === 0) return null;
    const maxVal = Math.max(
      ...data.map((d) => Math.max(d.expenses, d.income, 1)),
    );
    return (
      <div className="mt-4">
        <div className="flex items-end gap-1 h-24">
          {data.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              {/* Income bar */}
              <div
                className="w-full bg-green-400 dark:bg-green-500 rounded-t opacity-80"
                style={{ height: `${(d.income / maxVal) * 80}px` }}
                title={`Income: ₹${d.income.toLocaleString("en-IN")}`}
              />
              {/* Expense bar */}
              <div
                className="w-full bg-red-400 dark:bg-red-500 rounded-t"
                style={{ height: `${(d.expenses / maxVal) * 80}px` }}
                title={`Expenses: ₹${d.expenses.toLocaleString("en-IN")}`}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1 mt-1">
          {data.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-xs text-gray-400 dark:text-gray-500 truncate block">
                {d.month.split(" ")[0]}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-3 h-3 rounded bg-green-400 inline-block" />{" "}
            Income
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <span className="w-3 h-3 rounded bg-red-400 inline-block" />{" "}
            Expenses
          </span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-purple-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Loading your data…
          </p>
        </div>
      </div>
    );
  }

  const hasData =
    historicalData &&
    (historicalData.expenses.length > 0 || historicalData.income.length > 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              🔮 AI Predictive Analysis
            </h1>
          </div>
          <button
            onClick={analyzeAndPredict}
            disabled={analyzing || !hasData}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-600 transition disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                Analysing…
              </>
            ) : (
              "Run AI Analysis"
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* No data warning */}
        {!hasData && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 text-yellow-800 dark:text-yellow-300 text-sm">
            ⚠️ No expense or income data found for the last 6 months. Add
            transactions first to use predictive analysis.
          </div>
        )}

        {/* Historical Overview */}
        {historicalData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              Historical Data (Last 6 Months)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Months Tracked
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                  {Object.keys(historicalData.monthly).length}
                </p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expense Records
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  {historicalData.expenses.length}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Income Records
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {historicalData.income.length}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Data Points
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {historicalData.expenses.length +
                    historicalData.income.length}
                </p>
              </div>
            </div>

            {/* Mini bar chart of monthly trend */}
            {Object.keys(historicalData.monthly).length > 0 && (
              <MiniBarChart
                data={Object.entries(historicalData.monthly).map(
                  ([month, d]) => ({
                    month,
                    expenses: Math.round(d.expenses),
                    income: Math.round(d.income),
                  }),
                )}
              />
            )}
          </div>
        )}

        {predictions ? (
          <>
            {/* Prediction Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
                <p className="text-sm font-medium opacity-80 mb-1">
                  Predicted Expenses
                </p>
                <div className="text-4xl font-bold mb-1">
                  ₹{predictions.nextMonth.expenses.toLocaleString("en-IN")}
                </div>
                <p className="text-sm opacity-75">Next month forecast</p>
                <div className="mt-3 pt-3 border-t border-white/20 text-sm opacity-80">
                  Avg last 6 mo: ₹
                  {predictions.trends.avgExpenses.toLocaleString("en-IN")}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
                <p className="text-sm font-medium opacity-80 mb-1">
                  Predicted Income
                </p>
                <div className="text-4xl font-bold mb-1">
                  {predictions.nextMonth.income > 0
                    ? `₹${predictions.nextMonth.income.toLocaleString("en-IN")}`
                    : "No data"}
                </div>
                <p className="text-sm opacity-75">Expected earnings</p>
                <div className="mt-3 pt-3 border-t border-white/20 text-sm opacity-80">
                  Avg last 6 mo: ₹
                  {predictions.trends.avgIncome.toLocaleString("en-IN")}
                </div>
              </div>

              <div
                className={`rounded-xl shadow-lg p-6 text-white ${
                  predictions.nextMonth.income === 0
                    ? "bg-gradient-to-br from-gray-500 to-gray-600"
                    : predictions.nextMonth.savings >= 0
                      ? "bg-gradient-to-br from-blue-500 to-purple-600"
                      : "bg-gradient-to-br from-orange-500 to-red-600"
                }`}
              >
                <p className="text-sm font-medium opacity-80 mb-1">
                  Predicted Savings
                </p>
                <div className="text-4xl font-bold mb-1">
                  {predictions.nextMonth.income === 0
                    ? "N/A"
                    : `${predictions.nextMonth.savings < 0 ? "-" : ""}₹${Math.abs(predictions.nextMonth.savings).toLocaleString("en-IN")}`}
                </div>
                <p className="text-sm opacity-75">
                  {predictions.nextMonth.income === 0
                    ? "Add income to calculate"
                    : `${predictions.nextMonth.savingsRate.toFixed(1)}% savings rate`}
                </p>
                {predictions.nextMonth.income > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full"
                        style={{
                          width: `${Math.min(Math.max(predictions.nextMonth.savingsRate, 0), 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1 opacity-75">Target: 20%</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                🤖 AI Insights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {predictions.insights.map((insight, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      insight.type === "warning"
                        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500"
                        : insight.type === "danger"
                          ? "bg-red-50 dark:bg-red-900/20 border-red-500"
                          : insight.type === "success"
                            ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                            : "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl leading-none">
                        {insight.icon}
                      </span>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                          {insight.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Predictions + Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  📊 Top Spending Categories (Predicted)
                </h2>
                {predictions.categories.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No category data available.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {predictions.categories.map((cat, idx) => {
                      const maxAmt = predictions.categories[0].predicted;
                      return (
                        <div key={idx}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {idx + 1}
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {cat.icon} {cat.name}
                              </span>
                            </div>
                            <span className="text-sm font-bold text-gray-800 dark:text-white">
                              ₹{cat.predicted.toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="bg-purple-500 h-1.5 rounded-full"
                              style={{
                                width: `${(cat.predicted / maxAmt) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Spending Patterns */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  🗓️ Spending Patterns
                </h2>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Highest Spending Day
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {predictions.patterns.highestSpendingDay}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      ₹
                      {predictions.patterns.highestSpendingAmount.toLocaleString(
                        "en-IN",
                      )}{" "}
                      total across all {predictions.patterns.highestSpendingDay}
                      s
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Month-over-Month Expense Trend
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        predictions.trends.expenseGrowthRate > 0
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {predictions.trends.expenseGrowthRate > 0 ? "+" : ""}
                      {(predictions.trends.expenseGrowthRate * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {predictions.trends.expenseGrowthRate > 0
                        ? "Expenses are rising — review discretionary spending"
                        : predictions.trends.expenseGrowthRate < 0
                          ? "Expenses are falling — great work!"
                          : "Expenses are stable"}
                    </p>
                  </div>

                  {/* Day-of-week mini breakdown */}
                  {Object.keys(predictions.patterns.daySpending).length > 0 && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Spending by Day of Week
                      </p>
                      <div className="flex items-end gap-1 h-12">
                        {[
                          "Sunday",
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                        ].map((day) => {
                          const amt =
                            predictions.patterns.daySpending[day] || 0;
                          const maxAmt = Math.max(
                            ...Object.values(predictions.patterns.daySpending),
                            1,
                          );
                          return (
                            <div
                              key={day}
                              className="flex-1 flex flex-col items-center gap-0.5"
                              title={`${day}: ₹${Math.round(amt).toLocaleString("en-IN")}`}
                            >
                              <div
                                className={`w-full rounded-t transition-all ${amt === Math.max(...Object.values(predictions.patterns.daySpending)) ? "bg-purple-500" : "bg-purple-300 dark:bg-purple-700"}`}
                                style={{ height: `${(amt / maxAmt) * 40}px` }}
                              />
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {day[0]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Anomalies */}
            {predictions.anomalies.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  ⚡ Anomalies Detected
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {predictions.anomalies.map((anomaly, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        anomaly.type === "high_spending"
                          ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700"
                          : "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span>
                          {anomaly.type === "high_spending" ? "📈" : "📉"}
                        </span>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {anomaly.message}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ₹{Math.round(anomaly.amount).toLocaleString("en-IN")} —{" "}
                        {anomaly.pct}%{" "}
                        {anomaly.type === "high_spending" ? "above" : "below"}{" "}
                        average
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
            <div className="text-6xl mb-4">🔮</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              AI-Powered Predictions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Click "Run AI Analysis" to get personalised financial predictions
              and insights based on your last 6 months of data.
            </p>
            <button
              onClick={analyzeAndPredict}
              disabled={analyzing || !hasData}
              className="bg-purple-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-600 transition disabled:opacity-50"
            >
              {analyzing ? "Analysing…" : "Start Analysis"}
            </button>
          </div>
        )}

        {/* Info footer */}
        <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-purple-900 dark:text-purple-300">
            <strong>🤖 How it works:</strong> The AI analyses spending by
            category ID, income trends, day-of-week patterns, and
            month-over-month growth from the last 6 months to forecast next
            month's figures and surface anomalies and insights.
          </p>
        </div>
      </div>
    </div>
  );
}
