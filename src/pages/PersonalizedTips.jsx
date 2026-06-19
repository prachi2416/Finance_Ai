import { useState, useEffect } from "react";
import { supabase } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function PersonalizedTips() {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [tips, setTips] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const categories = [
    { id: "all", name: "All Tips", icon: "📚" },
    { id: "savings", name: "Savings", icon: "💰" },
    { id: "spending", name: "Spending", icon: "💳" },
    { id: "investments", name: "Investments", icon: "📈" },
    { id: "debt", name: "Debt Management", icon: "🏦" },
    { id: "goals", name: "Goals", icon: "🎯" },
    { id: "budgeting", name: "Budgeting", icon: "📊" },
  ];

  useEffect(() => {
    analyzeUserProfile();
  }, []);

  const analyzeUserProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch user's financial data
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", threeMonthsAgo.toISOString().split("T")[0]);

      const { data: income } = await supabase
        .from("income")
        .select("*")
        .gte("date", threeMonthsAgo.toISOString().split("T")[0]);

      const { data: goals } = await supabase.from("goals").select("*");
      const { data: investments } = await supabase
        .from("investments")
        .select("*");

      // Calculate profile metrics
      const totalExpenses =
        expenses?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;
      const totalIncome =
        income?.reduce((sum, i) => sum + parseFloat(i.amount || 0), 0) || 0;
      const savingsRate =
        totalIncome > 0
          ? ((totalIncome - totalExpenses) / totalIncome) * 100
          : 0;

      // Category breakdown
      const categorySpending = {};
      expenses?.forEach((exp) => {
        const cat = exp.category || "Others";
        categorySpending[cat] =
          (categorySpending[cat] || 0) + parseFloat(exp.amount || 0);
      });

      const topCategory = Object.entries(categorySpending).sort(
        (a, b) => b[1] - a[1],
      )[0];

      setUserProfile({
        totalExpenses,
        totalIncome,
        savingsRate,
        avgMonthlyExpense: totalExpenses / 3,
        avgMonthlyIncome: totalIncome / 3,
        categorySpending,
        topCategory: topCategory?.[0] || "N/A",
        topCategoryAmount: topCategory?.[1] || 0,
        goalsCount: goals?.length || 0,
        activeGoals:
          goals?.filter(
            (g) => parseFloat(g.current_amount) < parseFloat(g.target_amount),
          ).length || 0,
        investmentCount: investments?.length || 0,
        hasData: expenses && expenses.length > 0,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error analyzing profile:", error);
      setLoading(false);
    }
  };

  const generatePersonalizedTips = async () => {
    if (!userProfile || !userProfile.hasData) {
      alert("Need at least some financial data to generate personalized tips!");
      return;
    }

    setGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const generatedTips = [];

    // Savings Tips
    if (userProfile.savingsRate < 20) {
      generatedTips.push({
        id: 1,
        category: "savings",
        priority: "high",
        title: "Boost Your Savings Rate",
        description: `Your current savings rate is ${userProfile.savingsRate.toFixed(
          1,
        )}%. Aim for at least 20% by cutting non-essential expenses.`,
        action:
          "Review your top spending categories and identify areas to reduce by 10%.",
        impact:
          "Could save ₹" +
          (userProfile.avgMonthlyExpense * 0.1).toFixed(0) +
          "/month",
        icon: "💰",
      });
    } else {
      generatedTips.push({
        id: 1,
        category: "savings",
        priority: "low",
        title: "Excellent Savings Rate!",
        description: `You're saving ${userProfile.savingsRate.toFixed(
          1,
        )}% of your income. Keep it up!`,
        action: "Consider investing your savings for better returns.",
        impact: "Maintain current habits",
        icon: "✅",
      });
    }

    // Spending Tips
    if (userProfile.topCategoryAmount > userProfile.avgMonthlyExpense * 0.3) {
      generatedTips.push({
        id: 2,
        category: "spending",
        priority: "high",
        title: `Reduce ${userProfile.topCategory} Spending`,
        description: `You're spending ₹${userProfile.topCategoryAmount.toFixed(
          0,
        )} on ${userProfile.topCategory}, which is ${(
          (userProfile.topCategoryAmount / userProfile.totalExpenses) *
          100
        ).toFixed(1)}% of your expenses.`,
        action: `Set a monthly limit of ₹${(
          userProfile.topCategoryAmount * 0.8
        ).toFixed(0)} for ${userProfile.topCategory}.`,
        impact:
          "Save ₹" +
          ((userProfile.topCategoryAmount * 0.2) / 3).toFixed(0) +
          "/month",
        icon: "💳",
      });
    }

    // Budget Tips
    generatedTips.push({
      id: 3,
      category: "budgeting",
      priority: "medium",
      title: "Follow the 50/30/20 Rule",
      description:
        "Allocate 50% for needs, 30% for wants, and 20% for savings.",
      action: `Based on your income of ₹${userProfile.avgMonthlyIncome.toFixed(
        0,
      )}, budget ₹${(userProfile.avgMonthlyIncome * 0.5).toFixed(
        0,
      )} for needs, ₹${(userProfile.avgMonthlyIncome * 0.3).toFixed(
        0,
      )} for wants, and ₹${(userProfile.avgMonthlyIncome * 0.2).toFixed(
        0,
      )} for savings.`,
      impact: "Better financial balance",
      icon: "📊",
    });

    // Investment Tips
    if (userProfile.investmentCount === 0) {
      generatedTips.push({
        id: 4,
        category: "investments",
        priority: "medium",
        title: "Start Investing Today",
        description:
          "You haven't started investing yet. Begin with mutual funds or index funds.",
        action:
          "Start a SIP with ₹" +
          Math.min(5000, userProfile.avgMonthlyIncome * 0.1).toFixed(0) +
          " per month.",
        impact: "Build wealth over time",
        icon: "📈",
      });
    } else {
      generatedTips.push({
        id: 4,
        category: "investments",
        priority: "low",
        title: "Diversify Your Portfolio",
        description: `You have ${userProfile.investmentCount} investments. Consider diversifying across asset classes.`,
        action: "Add bonds or gold to balance your portfolio risk.",
        impact: "Reduce portfolio volatility",
        icon: "📈",
      });
    }

    // Goals Tips
    if (userProfile.activeGoals > 0) {
      generatedTips.push({
        id: 5,
        category: "goals",
        priority: "high",
        title: "Stay on Track with Goals",
        description: `You have ${userProfile.activeGoals} active goal(s). Regular contributions are key!`,
        action: "Set up automatic monthly transfers to your goal accounts.",
        impact: "Achieve goals faster",
        icon: "🎯",
      });
    } else {
      generatedTips.push({
        id: 5,
        category: "goals",
        priority: "medium",
        title: "Set Financial Goals",
        description: "Define clear financial goals to stay motivated.",
        action:
          "Create goals for emergency fund, vacation, or home down payment.",
        impact: "Clarity and motivation",
        icon: "🎯",
      });
    }

    // Emergency Fund
    const emergencyFundTarget = userProfile.avgMonthlyExpense * 6;
    generatedTips.push({
      id: 6,
      category: "savings",
      priority: "high",
      title: "Build an Emergency Fund",
      description:
        "Financial experts recommend 6 months of expenses in emergency fund.",
      action: `Target: ₹${emergencyFundTarget.toFixed(0)}. Save ₹${(
        emergencyFundTarget / 12
      ).toFixed(0)}/month to reach it in 1 year.`,
      impact: "Financial security",
      icon: "🛡️",
    });

    // Spending Awareness
    generatedTips.push({
      id: 7,
      category: "spending",
      priority: "medium",
      title: "Track Small Purchases",
      description: "Small daily purchases add up quickly.",
      action:
        "Use the app to log every expense, even small ones like coffee or snacks.",
      impact: "Better spending awareness",
      icon: "🔍",
    });

    // Debt Tips
    generatedTips.push({
      id: 8,
      category: "debt",
      priority: "medium",
      title: "Pay Off High-Interest Debt First",
      description:
        "Focus on credit cards and personal loans with high interest rates.",
      action: "Use the Debt Payoff Calculator to create a repayment plan.",
      impact: "Save on interest payments",
      icon: "🏦",
    });

    // Automation
    generatedTips.push({
      id: 9,
      category: "savings",
      priority: "low",
      title: "Automate Your Savings",
      description: "Set up automatic transfers on salary day.",
      action: "Move 20% of salary to savings account automatically.",
      impact: "Consistent saving habit",
      icon: "🤖",
    });

    // Review
    generatedTips.push({
      id: 10,
      category: "budgeting",
      priority: "low",
      title: "Monthly Financial Review",
      description: "Review your finances at the end of each month.",
      action:
        "Spend 30 minutes analyzing expenses, adjusting budget, and planning ahead.",
      impact: "Better financial control",
      icon: "📅",
    });

    setTips(generatedTips);
    setGenerating(false);
  };

  const filteredTips =
    selectedCategory === "all"
      ? tips
      : tips.filter((tip) => tip.category === selectedCategory);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-50 dark:bg-red-900 dark:bg-opacity-20";
      case "medium":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20";
      case "low":
        return "border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20";
      default:
        return "border-gray-300 bg-gray-50 dark:bg-gray-700";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
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
              💡 AI Personalized Tips
            </h1>
          </div>
          <button
            onClick={generatePersonalizedTips}
            disabled={generating || !userProfile?.hasData}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
          >
            {generating ? "Generating..." : "Generate Tips"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Summary */}
        {userProfile && userProfile.hasData && (
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white mb-6">
            <h2 className="text-xl font-bold mb-4">Your Financial Profile</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm opacity-90">Savings Rate</p>
                <p className="text-2xl font-bold">
                  {userProfile.savingsRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">Avg Monthly Expense</p>
                <p className="text-2xl font-bold">
                  ₹{userProfile.avgMonthlyExpense.toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">Active Goals</p>
                <p className="text-2xl font-bold">{userProfile.activeGoals}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Top Category</p>
                <p className="text-2xl font-bold">{userProfile.topCategory}</p>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        {tips.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedCategory === cat.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tips Display */}
        {tips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTips.map((tip) => (
              <div
                key={tip.id}
                className={`rounded-lg shadow-lg p-6 border-l-4 ${getPriorityColor(
                  tip.priority,
                )}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{tip.icon}</span>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {tip.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(
                          tip.priority,
                        )}`}
                      >
                        {tip.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {tip.description}
                </p>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Action Plan:
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {tip.action}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Impact:
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {tip.impact}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : userProfile?.hasData ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">💡</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Get Personalized Tips
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Click "Generate Tips" to receive AI-powered financial advice
              tailored to your spending patterns
            </p>
            <button
              onClick={generatePersonalizedTips}
              disabled={generating}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
            >
              {generating ? "Generating..." : "Generate My Tips"}
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              No Data Available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start tracking your expenses and income to get personalized
              financial tips!
            </p>
            <button
              onClick={() => navigate("/expenses")}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Add Expenses
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong>🤖 How it works:</strong> Our AI analyzes your spending
            patterns, income, savings rate, and financial goals to generate
            personalized tips. Tips are prioritized based on potential impact
            and are updated based on your latest financial data.
          </p>
        </div>
      </div>
    </div>
  );
}
