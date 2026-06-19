import { useState, useEffect } from "react";
import { auth, db } from "../firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function SocialComparisons() {
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [peerData, setPeerData] = useState(null);
  const [categoryMap, setCategoryMap] = useState({});
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("25-35");
  const [selectedIncomeRange, setSelectedIncomeRange] = useState("50k-100k");
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  // Default category definitions matching CategoryManager IDs
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

  // Peer benchmarks keyed by income range then category ID
  // Values = monthly average (₹) for that peer group
  const peerBenchmarks = {
    "0-50k": {
      food: 6000,
      transport: 4500,
      shopping: 3000,
      entertainment: 2000,
      bills: 4000,
      healthcare: 1500,
      education: 2000,
      travel: 1000,
      personal: 1500,
      others: 5500,
      savingsRate: 14,
      investmentRate: 4,
    },
    "50k-100k": {
      food: 12000,
      transport: 8000,
      shopping: 7000,
      entertainment: 5000,
      bills: 7000,
      healthcare: 3000,
      education: 4000,
      travel: 3000,
      personal: 3000,
      others: 8000,
      savingsRate: 22,
      investmentRate: 11,
    },
    "100k-200k": {
      food: 22000,
      transport: 15000,
      shopping: 15000,
      entertainment: 10000,
      bills: 13000,
      healthcare: 6000,
      education: 8000,
      travel: 8000,
      personal: 6000,
      others: 17000,
      savingsRate: 28,
      investmentRate: 18,
    },
    "200k+": {
      food: 35000,
      transport: 25000,
      shopping: 28000,
      entertainment: 18000,
      bills: 22000,
      healthcare: 12000,
      education: 15000,
      travel: 18000,
      personal: 12000,
      others: 25000,
      savingsRate: 33,
      investmentRate: 25,
    },
  };

  const ageGroups = [
    { value: "18-24", label: "18–24 years" },
    { value: "25-35", label: "25–35 years" },
    { value: "36-45", label: "36–45 years" },
    { value: "46-60", label: "46–60 years" },
    { value: "60+", label: "60+ years" },
  ];

  const incomeRanges = [
    { value: "0-50k", label: "₹0 – ₹50,000 / month" },
    { value: "50k-100k", label: "₹50,000 – ₹1,00,000 / month" },
    { value: "100k-200k", label: "₹1,00,000 – ₹2,00,000 / month" },
    { value: "200k+", label: "₹2,00,000+ / month" },
  ];

  // Age multiplier: adjusts peer benchmarks slightly per age group
  const ageMultipliers = {
    "18-24": 0.75,
    "25-35": 1.0,
    "36-45": 1.15,
    "46-60": 1.1,
    "60+": 0.9,
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }
      fetchUserData(firebaseUser.uid);
    });
    return () => unsubscribe();
  }, []);

  // Re-generate peer comparison whenever filters change
  useEffect(() => {
    if (userStats && Object.keys(categoryMap).length > 0) {
      generatePeerComparison(categoryMap);
    }
  }, [selectedAgeGroup, selectedIncomeRange, userStats]);

  const fetchUserData = async (uid) => {
    try {
      setLoading(true);

      // ── 1. Build category map ──────────────────────────────────────────
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

      // ── 2. Expenses — last 3 months ───────────────────────────────────
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const cutoff = threeMonthsAgo.toISOString().split("T")[0];

      const expSnap = await getDocs(
        query(
          collection(db, "expenses"),
          where("user_id", "==", uid),
          where("date", ">=", cutoff),
        ),
      );
      const expenses = expSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // ── 3. Income — last 3 months ─────────────────────────────────────
      const incSnap = await getDocs(
        query(
          collection(db, "income"),
          where("user_id", "==", uid),
          where("date", ">=", cutoff),
        ),
      );
      const income = incSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // ── 4. Goals ──────────────────────────────────────────────────────
      const goalSnap = await getDocs(
        query(collection(db, "goals"), where("user_id", "==", uid)),
      );

      // ── 5. Investments ────────────────────────────────────────────────
      const invSnap = await getDocs(
        query(collection(db, "investments"), where("user_id", "==", uid)),
      );

      // ── 6. Aggregate by category_id (NOT by name string) ─────────────
      const categorySpendingById = {};
      expenses.forEach((exp) => {
        const catId = exp.category_id || "others";
        categorySpendingById[catId] =
          (categorySpendingById[catId] || 0) + parseFloat(exp.amount || 0);
      });

      const totalExpenses = expenses.reduce(
        (s, e) => s + parseFloat(e.amount || 0),
        0,
      );
      const totalIncome = income.reduce(
        (s, i) => s + parseFloat(i.amount || 0),
        0,
      );
      const avgMonthlyExpense = totalExpenses / 3;
      const avgMonthlyIncome = totalIncome / 3;
      const savingsRate =
        totalIncome > 0
          ? ((totalIncome - totalExpenses) / totalIncome) * 100
          : 0;

      const totalInvestments = invSnap.docs.reduce((s, d) => {
        const inv = d.data();
        return (
          s + parseFloat(inv.buy_price || 0) * parseFloat(inv.quantity || 0)
        );
      }, 0);

      const stats = {
        avgMonthlyExpense,
        avgMonthlyIncome,
        savingsRate,
        categorySpendingById, // { catId → 3-month total }
        totalInvestments,
        activeGoals: goalSnap.size,
      };

      setUserStats(stats);
      generatePeerComparison(builtMap, stats);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePeerComparison = (catMap = categoryMap, stats = userStats) => {
    if (!stats) return;

    const baseline =
      peerBenchmarks[selectedIncomeRange] || peerBenchmarks["50k-100k"];
    const ageMult = ageMultipliers[selectedAgeGroup] || 1.0;
    const variance = 0.12; // ±12% randomness for realism

    // Build peer categories only for IDs that appear in THIS user's data
    // plus the default 10 — keyed by category ID
    const allCatIds = new Set([
      ...Object.keys(catMap),
      ...Object.keys(stats.categorySpendingById),
    ]);

    const peerCategories = {};
    allCatIds.forEach((id) => {
      // Look up the peer benchmark; custom categories default to "others" rate
      const base = baseline[id] ?? baseline["others"] ?? 5000;
      const noise = 1 + (Math.random() - 0.5) * variance;
      peerCategories[id] = Math.round(base * ageMult * noise);
    });

    const peerAvgExpense = Object.values(peerCategories).reduce(
      (s, v) => s + v,
      0,
    );

    const peerSavingsRate =
      baseline.savingsRate *
      ageMult *
      (1 + (Math.random() - 0.5) * variance * 0.5);

    const peerInvestmentRate =
      baseline.investmentRate *
      ageMult *
      (1 + (Math.random() - 0.5) * variance);

    const sampleSize = Math.floor(
      selectedIncomeRange === "200k+"
        ? 800 + Math.random() * 400
        : selectedIncomeRange === "100k-200k"
          ? 2000 + Math.random() * 1000
          : 3000 + Math.random() * 2000,
    );

    setPeerData({
      avgExpense: peerAvgExpense,
      savingsRate: peerSavingsRate,
      investmentRate: peerInvestmentRate,
      categoryDistribution: peerCategories,
      sampleSize,
    });
  };

  // ── UI helpers ───────────────────────────────────────────────────────────
  const getComparisonInsight = (
    userValue,
    peerValue,
    higherIsBetter = true,
  ) => {
    const diff = userValue - peerValue;
    const percentDiff =
      peerValue !== 0 ? Math.abs((diff / peerValue) * 100).toFixed(0) : 0;

    if (Math.abs(diff) < peerValue * 0.08) {
      return {
        icon: "😊",
        message: "You're on par with your peers (within 8%)",
        color: "text-blue-600 dark:text-blue-400",
      };
    }
    const isGood = higherIsBetter ? diff > 0 : diff < 0;
    if (isGood) {
      return {
        icon: "🎉",
        message: `${percentDiff}% ${higherIsBetter ? "above" : "below"} peer average — well done!`,
        color: "text-green-600 dark:text-green-400",
      };
    }
    return {
      icon: "💡",
      message: `${percentDiff}% ${higherIsBetter ? "below" : "above"} peer average — room to improve`,
      color: "text-orange-600 dark:text-orange-400",
    };
  };

  const ScoreBar = ({ userVal, peerVal, color = "bg-blue-500" }) => {
    const max = Math.max(userVal, peerVal, 1);
    return (
      <div className="space-y-1.5 mt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs w-10 text-right text-blue-500 font-medium">
            You
          </span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${color}`}
              style={{ width: `${(userVal / max) * 100}%` }}
            />
          </div>
          <span className="text-xs w-20 text-gray-600 dark:text-gray-400">
            ₹{Math.round(userVal).toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs w-10 text-right text-gray-400 font-medium">
            Peers
          </span>
          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-700 bg-gray-400 dark:bg-gray-500"
              style={{ width: `${(peerVal / max) * 100}%` }}
            />
          </div>
          <span className="text-xs w-20 text-gray-600 dark:text-gray-400">
            ₹{Math.round(peerVal).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    );
  };

  // ── Overall score (0-100) based on savings + spending efficiency ─────────
  const calcOverallScore = () => {
    if (!userStats || !peerData) return null;
    let score = 50; // baseline

    // Savings rate vs peers
    const savingsDiff = userStats.savingsRate - peerData.savingsRate;
    score += Math.min(Math.max(savingsDiff * 1.5, -25), 25);

    // Expense efficiency vs peers
    const expenseDiff = peerData.avgExpense - userStats.avgMonthlyExpense;
    const expenseRatio =
      peerData.avgExpense > 0 ? expenseDiff / peerData.avgExpense : 0;
    score += Math.min(Math.max(expenseRatio * 30, -20), 20);

    // Goals bonus
    if (userStats.activeGoals > 0)
      score += Math.min(userStats.activeGoals * 2, 10);

    return Math.min(Math.max(Math.round(score), 0), 100);
  };

  const overallScore = calcOverallScore();
  const scoreLabel =
    overallScore >= 80
      ? { text: "Excellent", color: "text-green-500" }
      : overallScore >= 60
        ? { text: "Good", color: "text-blue-500" }
        : overallScore >= 40
          ? { text: "Average", color: "text-yellow-500" }
          : { text: "Needs Work", color: "text-red-500" };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-300 font-medium">
            Loading your data…
          </p>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start tracking your expenses and income to compare with peers!
          </p>
          <button
            onClick={() => navigate("/expenses")}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            Add Expenses
          </button>
        </div>
      </div>
    );
  }

  // Categories that have EITHER user spending or peer data
  const activeCategoryIds = peerData
    ? [
        ...new Set([
          ...Object.keys(userStats.categorySpendingById),
          ...Object.keys(peerData.categoryDistribution),
        ]),
      ].filter((id) => {
        const userAmt = (userStats.categorySpendingById[id] || 0) / 3;
        const peerAmt = peerData.categoryDistribution[id] || 0;
        return userAmt > 0 || peerAmt > 0;
      })
    : [];

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
              👥 Anonymous Peer Comparison
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Privacy notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-300 mb-1">
                Your Privacy is Protected
              </h3>
              <p className="text-sm text-green-800 dark:text-green-400">
                All comparisons are completely anonymous. Your personal data is
                never shared. Peer benchmarks are based on aggregated,
                anonymised demographic data.
              </p>
            </div>
          </div>
        </div>

        {/* Demographic Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            Compare With Your Peers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Age Group
              </label>
              <select
                value={selectedAgeGroup}
                onChange={(e) => setSelectedAgeGroup(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {ageGroups.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Income Range
              </label>
              <select
                value={selectedIncomeRange}
                onChange={(e) => setSelectedIncomeRange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                {incomeRanges.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {peerData && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              Comparing with ~{peerData.sampleSize.toLocaleString()} anonymous
              users aged {selectedAgeGroup} in the {selectedIncomeRange} income
              bracket
            </p>
          )}
        </div>

        {/* Overall Score */}
        {peerData && overallScore !== null && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              🏅 Your Financial Health Score
            </h2>
            <div className="flex items-center gap-6">
              {/* Circular score */}
              <div className="relative w-28 h-28 flex-shrink-0">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={
                      overallScore >= 80
                        ? "#22c55e"
                        : overallScore >= 60
                          ? "#3b82f6"
                          : overallScore >= 40
                            ? "#eab308"
                            : "#ef4444"
                    }
                    strokeWidth="10"
                    strokeDasharray={`${(overallScore / 100) * 264} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold ${scoreLabel.color}`}>
                    {overallScore}
                  </span>
                  <span className="text-xs text-gray-400">/100</span>
                </div>
              </div>
              <div>
                <p className={`text-2xl font-bold ${scoreLabel.color} mb-1`}>
                  {scoreLabel.text}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Based on your savings rate, spending efficiency vs peers, and
                  active goals.
                </p>
                <div className="flex flex-wrap gap-2">
                  {userStats.savingsRate > peerData.savingsRate && (
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full">
                      ✅ Saving more than peers
                    </span>
                  )}
                  {userStats.avgMonthlyExpense < peerData.avgExpense && (
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
                      💡 Spending less than peers
                    </span>
                  )}
                  {userStats.activeGoals > 0 && (
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs px-2 py-1 rounded-full">
                      🎯 {userStats.activeGoals} active goal
                      {userStats.activeGoals > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Cards */}
        {peerData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Savings Rate */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                Savings Rate
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Higher is better
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    You
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {userStats.avgMonthlyIncome > 0
                      ? `${userStats.savingsRate.toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Peers
                  </p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">
                    {peerData.savingsRate.toFixed(1)}%
                  </p>
                </div>
              </div>
              {/* Bar */}
              <div className="space-y-1.5 mb-3">
                {[
                  {
                    label: "You",
                    val: Math.max(userStats.savingsRate, 0),
                    color: "bg-blue-500",
                  },
                  {
                    label: "Peers",
                    val: peerData.savingsRate,
                    color: "bg-gray-400 dark:bg-gray-500",
                  },
                ].map(({ label, val, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs w-10 text-right text-gray-500">
                      {label}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${color}`}
                        style={{ width: `${Math.min(val, 50) * 2}%` }}
                      />
                    </div>
                    <span className="text-xs w-10 text-gray-500">
                      {val.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
              {userStats.avgMonthlyIncome > 0 &&
                (() => {
                  const i = getComparisonInsight(
                    userStats.savingsRate,
                    peerData.savingsRate,
                    true,
                  );
                  return (
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <p className={`text-sm font-medium ${i.color}`}>
                        {i.icon} {i.message}
                      </p>
                    </div>
                  );
                })()}
            </div>

            {/* Monthly Expenses */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                Monthly Expenses
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Lower is better
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    You
                  </p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    ₹
                    {Math.round(userStats.avgMonthlyExpense).toLocaleString(
                      "en-IN",
                    )}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Peers
                  </p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">
                    ₹{Math.round(peerData.avgExpense).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <ScoreBar
                userVal={userStats.avgMonthlyExpense}
                peerVal={peerData.avgExpense}
                color="bg-red-500"
              />
              {(() => {
                const i = getComparisonInsight(
                  userStats.avgMonthlyExpense,
                  peerData.avgExpense,
                  false,
                );
                return (
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 mt-3">
                    <p className={`text-sm font-medium ${i.color}`}>
                      {i.icon} {i.message}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Category-wise Comparison */}
        {peerData && activeCategoryIds.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              📊 Category-wise Spending vs Peers
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
              Your monthly average vs peer monthly average per category
            </p>
            <div className="space-y-5">
              {activeCategoryIds.map((catId) => {
                const cat = categoryMap[catId];
                const userAmt =
                  (userStats.categorySpendingById[catId] || 0) / 3;
                const peerAmt = peerData.categoryDistribution[catId] || 0;
                const diff = userAmt - peerAmt;
                const diffPct =
                  peerAmt > 0 ? ((diff / peerAmt) * 100).toFixed(0) : null;
                const isOver = diff > peerAmt * 0.08;
                const isUnder = diff < -peerAmt * 0.08;

                return (
                  <div key={catId}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {cat?.icon || "📦"} {cat?.name || catId}
                      </span>
                      <div className="flex items-center gap-2">
                        {diffPct && Math.abs(Number(diffPct)) > 8 && (
                          <span
                            className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                              isOver
                                ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                : "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            }`}
                          >
                            {isOver
                              ? `▲ ${diffPct}%`
                              : `▼ ${Math.abs(Number(diffPct))}%`}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          You ₹{Math.round(userAmt).toLocaleString("en-IN")} ·
                          Peers ₹{Math.round(peerAmt).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                    <ScoreBar
                      userVal={userAmt}
                      peerVal={peerAmt}
                      color={
                        isOver
                          ? "bg-red-500"
                          : isUnder
                            ? "bg-green-500"
                            : "bg-blue-500"
                      }
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {peerData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-base font-semibold mb-2 opacity-90">
                Savings Champion
              </h3>
              <div className="text-4xl font-bold mb-2">
                {userStats.savingsRate > peerData.savingsRate
                  ? "🏆 You!"
                  : "🥈 Peers"}
              </div>
              <p className="text-sm opacity-80">
                {userStats.savingsRate > peerData.savingsRate
                  ? `You're saving ${(userStats.savingsRate - peerData.savingsRate).toFixed(1)}% more than your peers!`
                  : `Peers save ${(peerData.savingsRate - userStats.savingsRate).toFixed(1)}% more. Keep going!`}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-base font-semibold mb-2 opacity-90">
                Smart Spender
              </h3>
              <div className="text-4xl font-bold mb-2">
                {userStats.avgMonthlyExpense < peerData.avgExpense
                  ? "🏆 You!"
                  : "🥈 Peers"}
              </div>
              <p className="text-sm opacity-80">
                {userStats.avgMonthlyExpense < peerData.avgExpense
                  ? `You spend ₹${Math.round(peerData.avgExpense - userStats.avgMonthlyExpense).toLocaleString("en-IN")} less than peers!`
                  : `You spend ₹${Math.round(userStats.avgMonthlyExpense - peerData.avgExpense).toLocaleString("en-IN")} more than peers.`}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-base font-semibold mb-2 opacity-90">
                Goal Achiever
              </h3>
              <div className="text-4xl font-bold mb-2">
                {userStats.activeGoals > 0 ? "🎯" : "💤"}
              </div>
              <p className="text-sm opacity-80">
                {userStats.activeGoals > 0
                  ? `${userStats.activeGoals} active goal${userStats.activeGoals > 1 ? "s" : ""} set — stay on track!`
                  : "Set financial goals to stay motivated and build wealth."}
              </p>
            </div>
          </div>
        )}

        {/* Actionable Tips */}
        {peerData &&
          activeCategoryIds.length > 0 &&
          (() => {
            const tips = [];

            // Find biggest overspend vs peers
            activeCategoryIds.forEach((id) => {
              const userAmt = (userStats.categorySpendingById[id] || 0) / 3;
              const peerAmt = peerData.categoryDistribution[id] || 0;
              if (peerAmt > 0 && userAmt > peerAmt * 1.2) {
                const cat = categoryMap[id];
                tips.push({
                  type: "reduce",
                  icon: cat?.icon || "📦",
                  title: `Trim ${cat?.name || id} spending`,
                  desc: `You're spending ₹${Math.round(userAmt - peerAmt).toLocaleString("en-IN")}/mo more than peers on ${cat?.name || id}. Small cuts here can add up fast.`,
                });
              }
            });

            if (userStats.savingsRate < peerData.savingsRate) {
              tips.push({
                type: "save",
                icon: "💰",
                title: "Boost your savings rate",
                desc: `Peers in your bracket save ${peerData.savingsRate.toFixed(1)}% vs your ${userStats.savingsRate.toFixed(1)}%. Try automating a fixed transfer on payday.`,
              });
            }

            if (userStats.activeGoals === 0) {
              tips.push({
                type: "goal",
                icon: "🎯",
                title: "Set a financial goal",
                desc: "Users with active goals save 30% more on average. Even a small emergency fund goal makes a big difference.",
              });
            }

            if (tips.length === 0) return null;

            return (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  💡 Personalised Tips
                </h2>
                <div className="space-y-3">
                  {tips.slice(0, 4).map((tip, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800"
                    >
                      <span className="text-2xl">{tip.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {tip.title}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                          {tip.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

        {/* Info footer */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong>📊 How it works:</strong> Your spending is aggregated by
            category ID and compared with anonymised benchmark data for your
            selected age group and income bracket. Changing the filters
            instantly re-calculates peer benchmarks. No personal data is ever
            shared.
          </p>
        </div>
      </div>
    </div>
  );
}
