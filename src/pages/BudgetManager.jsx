import { useState, useEffect } from "react";
import { supabase } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function BudgetManager() {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [spending, setSpending] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
    period: "monthly",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const defaultCategories = [
    { name: "Food & Dining", icon: "🍽️", color: "orange" },
    { name: "Transportation", icon: "🚗", color: "blue" },
    { name: "Shopping", icon: "🛍️", color: "pink" },
    { name: "Entertainment", icon: "🎬", color: "purple" },
    { name: "Bills & Utilities", icon: "📄", color: "yellow" },
    { name: "Healthcare", icon: "🏥", color: "red" },
    { name: "Education", icon: "📚", color: "green" },
    { name: "Travel", icon: "✈️", color: "cyan" },
    { name: "Personal Care", icon: "💅", color: "rose" },
    { name: "Others", icon: "📦", color: "gray" },
  ];

  useEffect(() => {
    fetchBudgetsAndSpending();
  }, []);

  const fetchBudgetsAndSpending = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // For demo purposes, we'll store budgets in localStorage
      // In production, create a 'budgets' table in Supabase
      const storedBudgets = localStorage.getItem(`budgets_${user.uid}`);
      const userBudgets = storedBudgets ? JSON.parse(storedBudgets) : [];

      // Fetch current month spending
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", firstDayOfMonth.toISOString().split("T")[0]);

      // Calculate spending by category
      const categorySpending = {};
      expenses?.forEach((exp) => {
        const cat = exp.category || "Others";
        categorySpending[cat] =
          (categorySpending[cat] || 0) + parseFloat(exp.amount || 0);
      });

      setBudgets(userBudgets);
      setSpending(categorySpending);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      setLoading(false);
    }
  };

  const createBudget = async () => {
    if (!newBudget.category || !newBudget.amount) {
      alert("Please fill in all fields");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const budget = {
        id: Date.now(),
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        period: newBudget.period,
        createdAt: new Date().toISOString(),
      };

      const updatedBudgets = [...budgets, budget];
      setBudgets(updatedBudgets);
      localStorage.setItem(
        `budgets_${user.uid}`,
        JSON.stringify(updatedBudgets),
      );

      setShowCreateModal(false);
      setNewBudget({ category: "", amount: "", period: "monthly" });
      setSaving(false);
    } catch (error) {
      console.error("Error creating budget:", error);
      alert("Failed to create budget");
      setSaving(false);
    }
  };

  const deleteBudget = async (budgetId) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const updatedBudgets = budgets.filter((b) => b.id !== budgetId);
      setBudgets(updatedBudgets);
      localStorage.setItem(
        `budgets_${user.uid}`,
        JSON.stringify(updatedBudgets),
      );
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStatusBadge = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) {
      return { text: "Over Budget", color: "bg-red-500 text-white" };
    } else if (percentage >= 80) {
      return { text: "Near Limit", color: "bg-orange-500 text-white" };
    } else {
      return { text: "On Track", color: "bg-green-500 text-white" };
    }
  };

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = Object.values(spending).reduce((sum, s) => sum + s, 0);
  const remainingBudget = totalBudget - totalSpent;

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
              📊 Budget Manager
            </h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            + Create Budget
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total Budget
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ₹{totalBudget.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This month
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total Spent
            </h3>
            <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              ₹{totalSpent.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {totalBudget > 0
                ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% used`
                : "No budget set"}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Remaining
            </h3>
            <p
              className={`text-3xl font-bold ${
                remainingBudget >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              ₹{Math.abs(remainingBudget).toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {remainingBudget >= 0 ? "Available" : "Over budget"}
            </p>
          </div>
        </div>

        {/* Budgets List */}
        {budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => {
              const spent = spending[budget.category] || 0;
              const percentage = (spent / budget.amount) * 100;
              const remaining = budget.amount - spent;
              const status = getStatusBadge(spent, budget.amount);
              const categoryInfo = defaultCategories.find(
                (c) => c.name === budget.category,
              );

              return (
                <div
                  key={budget.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">
                        {categoryInfo?.icon || "📦"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">
                          {budget.category}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${status.color}`}
                        >
                          {status.text}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteBudget(budget.id)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Spent
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{spent.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Budget
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹{budget.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Remaining
                      </span>
                      <span
                        className={`font-semibold ${
                          remaining >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        ₹{Math.abs(remaining).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>{percentage.toFixed(1)}%</span>
                        <span>{budget.period}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${getProgressColor(
                            percentage,
                          )}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              No Budgets Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first budget to start tracking your spending
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Create Budget
            </button>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 Budget Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
            <li>Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
            <li>
              Review and adjust your budgets monthly based on actual spending
            </li>
            <li>
              Set realistic budgets - too restrictive budgets are hard to
              maintain
            </li>
            <li>Track every expense to stay within your budget limits</li>
          </ul>
        </div>
      </div>

      {/* Create Budget Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Create New Budget
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={newBudget.category}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, category: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select category</option>
                  {defaultCategories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Amount (₹)
                </label>
                <input
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, amount: e.target.value })
                  }
                  placeholder="10000"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Period
                </label>
                <select
                  value={newBudget.period}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, period: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createBudget}
                  disabled={saving}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {saving ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
