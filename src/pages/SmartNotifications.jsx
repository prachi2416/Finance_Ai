import { useState, useEffect } from "react";
import { supabase } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function SmartNotifications() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    billReminders: true,
    budgetAlerts: true,
    goalMilestones: true,
    unusualSpending: true,
    savingsInsights: true,
    investmentAlerts: false,
    weeklyReports: true,
    monthlyReports: true,
  });
  const [generatingNotifications, setGeneratingNotifications] = useState(false);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  useEffect(() => {
    generateSmartNotifications();
  }, []);

  const generateSmartNotifications = async () => {
    setGeneratingNotifications(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      // Fetch data
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

      const { data: income } = await supabase
        .from("income")
        .select("*")
        .gte("date", thirtyDaysAgo.toISOString().split("T")[0]);

      const { data: goals } = await supabase.from("goals").select("*");
      const { data: bills } = await supabase.from("bills").select("*");

      const generatedNotifications = [];

      // 1. Bill Reminders
      if (settings.billReminders && bills && bills.length > 0) {
        bills.forEach((bill) => {
          const dueDate = new Date(bill.due_date);
          const daysUntilDue = Math.ceil(
            (dueDate - today) / (1000 * 60 * 60 * 24),
          );

          if (daysUntilDue <= 3 && daysUntilDue >= 0) {
            generatedNotifications.push({
              id: `bill-${bill.id}`,
              type: "bill",
              priority: daysUntilDue <= 1 ? "high" : "medium",
              title: `Bill Due ${
                daysUntilDue === 0 ? "Today" : `in ${daysUntilDue} day(s)`
              }`,
              message: `${bill.bill_name}: ₹${parseFloat(
                bill.amount,
              ).toLocaleString("en-IN")}`,
              icon: "🔔",
              timestamp: new Date().toISOString(),
              actionLabel: "View Bills",
              actionPath: "/bills",
            });
          }
        });
      }

      // 2. Budget Alerts
      if (settings.budgetAlerts && expenses && expenses.length > 0) {
        const currentMonthExpenses = expenses.filter((exp) => {
          const expDate = new Date(exp.date);
          return (
            expDate.getMonth() === today.getMonth() &&
            expDate.getFullYear() === today.getFullYear()
          );
        });

        const totalMonthExpenses = currentMonthExpenses.reduce(
          (sum, exp) => sum + parseFloat(exp.amount || 0),
          0,
        );
        const monthlyIncome =
          income?.reduce((sum, inc) => sum + parseFloat(inc.amount || 0), 0) ||
          0;
        const avgMonthlyIncome = monthlyIncome / (income?.length || 1);

        if (totalMonthExpenses > avgMonthlyIncome * 0.8) {
          generatedNotifications.push({
            id: "budget-alert-1",
            type: "budget",
            priority: "high",
            title: "Budget Alert: High Spending",
            message: `You've spent ₹${totalMonthExpenses.toFixed(
              0,
            )} this month (${(
              (totalMonthExpenses / avgMonthlyIncome) *
              100
            ).toFixed(0)}% of income)`,
            icon: "⚠️",
            timestamp: new Date().toISOString(),
            actionLabel: "View Budget",
            actionPath: "/analytics",
          });
        }

        // Category overspending
        const categorySpending = {};
        currentMonthExpenses.forEach((exp) => {
          const cat = exp.category || "Others";
          categorySpending[cat] =
            (categorySpending[cat] || 0) + parseFloat(exp.amount || 0);
        });

        const topCategory = Object.entries(categorySpending).sort(
          (a, b) => b[1] - a[1],
        )[0];
        if (topCategory && topCategory[1] > totalMonthExpenses * 0.4) {
          generatedNotifications.push({
            id: "budget-alert-2",
            type: "budget",
            priority: "medium",
            title: `High ${topCategory[0]} Spending`,
            message: `₹${topCategory[1].toFixed(0)} spent on ${
              topCategory[0]
            } (${((topCategory[1] / totalMonthExpenses) * 100).toFixed(
              0,
            )}% of total)`,
            icon: "💳",
            timestamp: new Date().toISOString(),
            actionLabel: "View Details",
            actionPath: "/analytics",
          });
        }
      }

      // 3. Goal Milestones
      if (settings.goalMilestones && goals && goals.length > 0) {
        goals.forEach((goal) => {
          const progress =
            (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) *
            100;

          if (progress >= 50 && progress < 55) {
            generatedNotifications.push({
              id: `goal-${goal.id}-50`,
              type: "goal",
              priority: "low",
              title: "Goal Milestone: 50% Complete! 🎯",
              message: `${goal.goal_name}: ₹${parseFloat(
                goal.current_amount,
              ).toFixed(0)} / ₹${parseFloat(goal.target_amount).toFixed(0)}`,
              icon: "🎯",
              timestamp: new Date().toISOString(),
              actionLabel: "View Goals",
              actionPath: "/goals",
            });
          } else if (progress >= 75 && progress < 80) {
            generatedNotifications.push({
              id: `goal-${goal.id}-75`,
              type: "goal",
              priority: "low",
              title: "Goal Milestone: 75% Complete! 🚀",
              message: `${goal.goal_name}: Almost there! ₹${(
                parseFloat(goal.target_amount) - parseFloat(goal.current_amount)
              ).toFixed(0)} to go`,
              icon: "🚀",
              timestamp: new Date().toISOString(),
              actionLabel: "View Goals",
              actionPath: "/goals",
            });
          } else if (progress >= 95) {
            generatedNotifications.push({
              id: `goal-${goal.id}-95`,
              type: "goal",
              priority: "medium",
              title: "Goal Almost Achieved! 🏆",
              message: `${goal.goal_name}: Just ₹${(
                parseFloat(goal.target_amount) - parseFloat(goal.current_amount)
              ).toFixed(0)} away!`,
              icon: "🏆",
              timestamp: new Date().toISOString(),
              actionLabel: "View Goals",
              actionPath: "/goals",
            });
          }
        });
      }

      // 4. Unusual Spending
      if (settings.unusualSpending && expenses && expenses.length > 7) {
        const recentExpenses = expenses.filter(
          (exp) => new Date(exp.date) >= sevenDaysAgo,
        );
        const recentTotal = recentExpenses.reduce(
          (sum, exp) => sum + parseFloat(exp.amount || 0),
          0,
        );
        const avgDailySpending = recentTotal / 7;

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayExpenses = expenses.filter((exp) => {
          const expDate = new Date(exp.date);
          return expDate.toDateString() === yesterday.toDateString();
        });
        const yesterdayTotal = yesterdayExpenses.reduce(
          (sum, exp) => sum + parseFloat(exp.amount || 0),
          0,
        );

        if (yesterdayTotal > avgDailySpending * 2) {
          generatedNotifications.push({
            id: "unusual-spending-1",
            type: "alert",
            priority: "high",
            title: "Unusual Spending Detected",
            message: `Yesterday's spending (₹${yesterdayTotal.toFixed(
              0,
            )}) was ${((yesterdayTotal / avgDailySpending) * 100).toFixed(
              0,
            )}% above your daily average`,
            icon: "🚨",
            timestamp: new Date().toISOString(),
            actionLabel: "Review Expenses",
            actionPath: "/expenses",
          });
        }
      }

      // 5. Savings Insights
      if (
        settings.savingsInsights &&
        income &&
        income.length > 0 &&
        expenses &&
        expenses.length > 0
      ) {
        const totalIncome = income.reduce(
          (sum, inc) => sum + parseFloat(inc.amount || 0),
          0,
        );
        const totalExpenses = expenses.reduce(
          (sum, exp) => sum + parseFloat(exp.amount || 0),
          0,
        );
        const savingsRate =
          totalIncome > 0
            ? ((totalIncome - totalExpenses) / totalIncome) * 100
            : 0;

        if (savingsRate < 10) {
          generatedNotifications.push({
            id: "savings-insight-1",
            type: "insight",
            priority: "high",
            title: "Low Savings Rate Alert",
            message: `Your savings rate is ${savingsRate.toFixed(
              1,
            )}%. Aim for at least 20% for financial security.`,
            icon: "💡",
            timestamp: new Date().toISOString(),
            actionLabel: "Get Tips",
            actionPath: "/personalized-tips",
          });
        } else if (savingsRate >= 30) {
          generatedNotifications.push({
            id: "savings-insight-2",
            type: "insight",
            priority: "low",
            title: "Excellent Savings! 🌟",
            message: `Your savings rate of ${savingsRate.toFixed(
              1,
            )}% is excellent! Consider investing for better returns.`,
            icon: "🌟",
            timestamp: new Date().toISOString(),
            actionLabel: "View Investments",
            actionPath: "/investments",
          });
        }
      }

      // 6. Weekly Reports
      if (settings.weeklyReports && today.getDay() === 1) {
        // Monday
        const weekExpenses =
          expenses?.filter((exp) => new Date(exp.date) >= sevenDaysAgo) || [];
        const weekTotal = weekExpenses.reduce(
          (sum, exp) => sum + parseFloat(exp.amount || 0),
          0,
        );

        generatedNotifications.push({
          id: "weekly-report",
          type: "report",
          priority: "low",
          title: "Weekly Spending Report",
          message: `Last week: ₹${weekTotal.toFixed(0)} across ${
            weekExpenses.length
          } transactions`,
          icon: "📊",
          timestamp: new Date().toISOString(),
          actionLabel: "View Report",
          actionPath: "/analytics",
        });
      }

      // 7. Monthly Reports
      if (settings.monthlyReports && today.getDate() === 1) {
        generatedNotifications.push({
          id: "monthly-report",
          type: "report",
          priority: "medium",
          title: "Monthly Financial Summary Ready",
          message:
            "Your monthly financial report is ready. Review your performance!",
          icon: "📈",
          timestamp: new Date().toISOString(),
          actionLabel: "View Report",
          actionPath: "/export-reports",
        });
      }

      // Sort by priority and timestamp
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      generatedNotifications.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(b.timestamp) - new Date(a.timestamp);
      });

      setNotifications(generatedNotifications);
      setLoading(false);
      setGeneratingNotifications(false);
    } catch (error) {
      console.error("Error generating notifications:", error);
      setLoading(false);
      setGeneratingNotifications(false);
    }
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleAction = (path) => {
    navigate(path);
  };

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-red-500 bg-red-50 dark:bg-red-900 dark:bg-opacity-20";
      case "medium":
        return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20";
      case "low":
        return "border-blue-500 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20";
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
        return "bg-blue-500 text-white";
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
              🔔 Smart Notifications
            </h1>
          </div>
          <button
            onClick={generateSmartNotifications}
            disabled={generatingNotifications}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
          >
            {generatingNotifications ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Active Notifications ({notifications.length})
              </h2>

              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border-l-4 ${getPriorityColor(
                        notification.priority,
                      )}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <span className="text-2xl">{notification.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {notification.title}
                              </h3>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${getPriorityBadge(
                                  notification.priority,
                                )}`}
                              >
                                {notification.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() =>
                                  handleAction(notification.actionPath)
                                }
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {notification.actionLabel} →
                              </button>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(
                                  notification.timestamp,
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => dismissNotification(notification.id)}
                          className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <div className="text-6xl mb-4">🔕</div>
                  <p className="text-lg">No notifications right now</p>
                  <p className="text-sm mt-2">
                    We'll notify you when something needs attention
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Notification Settings
              </h2>
              <div className="space-y-3">
                {Object.entries(settings).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </span>
                    <button
                      onClick={() => toggleSetting(key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        value ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          value ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Notification Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Total Today</span>
                  <span className="text-2xl font-bold">
                    {notifications.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">High Priority</span>
                  <span className="text-xl font-bold">
                    {notifications.filter((n) => n.priority === "high").length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">Active Alerts</span>
                  <span className="text-xl font-bold">
                    {Object.values(settings).filter(Boolean).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong>🔔 Smart Notifications:</strong> Get intelligent alerts
            about bills, budgets, goals, unusual spending, and more. Customize
            your notification preferences to stay on top of your finances
            without feeling overwhelmed.
          </p>
        </div>
      </div>
    </div>
  );
}
