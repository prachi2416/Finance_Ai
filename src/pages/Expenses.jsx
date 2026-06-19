import { useState, useEffect } from "react";
import { auth, db } from "../firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function Expenses() {
  const [user, setUser] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category_id: "",
    date: new Date().toISOString().split("T")[0],
  });
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }
      setUser(firebaseUser);
      fetchCategories(firebaseUser.uid);
      fetchExpenses(firebaseUser.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchCategories = async (uid) => {
    try {
      const q = query(
        collection(db, "categories"),
        where("user_id", "==", uid),
        where("type", "==", "expense"),
        orderBy("name"),
      );
      const snapshot = await getDocs(q);
      setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("fetchCategories error:", err);
    }
  };

  const fetchExpenses = async (uid) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "expenses"),
        where("user_id", "==", uid),
        orderBy("date", "desc"),
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Attach category info
      const catSnap = await getDocs(
        query(collection(db, "categories"), where("user_id", "==", uid)),
      );
      const catMap = {};
      catSnap.docs.forEach((d) => {
        catMap[d.id] = d.data();
      });

      setExpenses(
        data.map((exp) => ({
          ...exp,
          categories: catMap[exp.category_id] || null,
        })),
      );
    } catch (err) {
      console.error("fetchExpenses error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "expenses"), {
        user_id: user.uid, // ✅ Fixed: uid not id
        amount: parseFloat(formData.amount),
        description: formData.description || null,
        category_id: formData.category_id || null,
        date: formData.date,
        created_at: new Date().toISOString(),
      });
      setShowModal(false);
      setFormData({
        amount: "",
        description: "",
        category_id: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchExpenses(user.uid);
    } catch (err) {
      alert("Error adding expense: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteDoc(doc(db, "expenses", id));
        fetchExpenses(user.uid);
      } catch (err) {
        alert("Error deleting: " + err.message);
      }
    }
  };

  const totalExpenses = expenses.reduce(
    (sum, exp) => sum + parseFloat(exp.amount || 0),
    0,
  );

  const getMonthExpenses = () => {
    const now = new Date();
    return expenses
      .filter((exp) => {
        const d = new Date(exp.date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
  };

  const getTopCategories = () => {
    const totals = {};
    expenses.forEach((exp) => {
      const n = exp.categories?.name || "Other";
      totals[n] = (totals[n] || 0) + parseFloat(exp.amount || 0);
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  const filteredExpenses =
    filterCategory === "all"
      ? expenses
      : expenses.filter((exp) => exp.category_id === filterCategory);
  const sortedExpenses = [...filteredExpenses].sort((a, b) =>
    sortBy === "amount"
      ? parseFloat(b.amount) - parseFloat(a.amount)
      : new Date(b.date) - new Date(a.date),
  );

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"}`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${isDark ? "bg-slate-900/80 border-b border-slate-700/50" : "bg-white/80 border-b border-slate-200/50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${isDark ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"}`}
              >
                ← Back
              </button>
              <div>
                <h1
                  className={`text-3xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
                >
                  💸 Expenses
                </h1>
                <p
                  className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  Track and manage your spending
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/voice-expense")}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2.5 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
              >
                <span>🎤</span>
                <span>Voice Entry</span>
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105 flex items-center space-x-2"
              >
                <span>+</span>
                <span>Add Expense</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            {
              label: "Total Expenses",
              value: `₹${totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
              icon: "💰",
              gradient: "from-red-500 to-red-600",
            },
            {
              label: "This Month",
              value: `₹${getMonthExpenses().toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
              icon: "📅",
              gradient: "from-blue-500 to-blue-600",
            },
            {
              label: "Average Per Transaction",
              value: `₹${(expenses.length > 0 ? totalExpenses / expenses.length : 0).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`,
              icon: "📊",
              gradient: "from-purple-500 to-purple-600",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-xl ${isDark ? "bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50" : "bg-white/50 border border-slate-200/50 hover:border-slate-300/50"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <p
                  className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-600"}`}
                >
                  {stat.label}
                </p>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <p
                className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Top Categories */}
        {getTopCategories().length > 0 && (
          <div
            className={`rounded-2xl p-6 backdrop-blur-xl mb-8 ${isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/50 border border-slate-200/50"}`}
          >
            <h3
              className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}
            >
              Top Spending Categories
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {getTopCategories().map((cat, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg ${isDark ? "bg-slate-700/30 hover:bg-slate-700/50" : "bg-slate-100/50 hover:bg-slate-100"}`}
                >
                  <p
                    className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  >
                    {cat[0]}
                  </p>
                  <p className="text-xl font-bold mt-1 text-red-500">
                    ₹
                    {cat[1].toLocaleString("en-IN", {
                      minimumFractionDigits: 0,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-white border border-slate-300 text-slate-900"}`}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-slate-800 border border-slate-700 text-white" : "bg-white border border-slate-300 text-slate-900"}`}
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>
        </div>

        {/* Expenses List */}
        <div
          className={`rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl ${isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-white/50 border border-slate-200/50"}`}
        >
          {loading ? (
            <div
              className={`p-12 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              <div className="w-12 h-12 rounded-full border-4 border-slate-300 border-t-blue-500 animate-spin mx-auto mb-4"></div>
              <p className="font-medium">Loading your expenses...</p>
            </div>
          ) : sortedExpenses.length === 0 ? (
            <div
              className={`p-12 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              <p className="text-lg font-medium mb-2">📭 No expenses found</p>
              <p className="text-sm">
                Start tracking your spending by clicking "Add Expense"
              </p>
            </div>
          ) : (
            <div
              className={`divide-y ${isDark ? "divide-slate-700/50" : "divide-slate-200/50"}`}
            >
              {sortedExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`p-5 transition-all duration-300 ${isDark ? "hover:bg-slate-700/30" : "hover:bg-slate-100/50"}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-md hover:scale-110 transition-transform duration-300"
                        style={{
                          backgroundColor:
                            (expense.categories?.color || "#64748b") + "30",
                          border: `2px solid ${expense.categories?.color || "#64748b"}30`,
                        }}
                      >
                        {expense.categories?.icon || "💸"}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}
                        >
                          {expense.description ||
                            expense.categories?.name ||
                            "Expense"}
                        </p>
                        <p
                          className={`text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}
                        >
                          {new Date(expense.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                          -₹
                          {parseFloat(expense.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p
                          className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}
                        >
                          {expense.categories?.name}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${isDark ? "hover:bg-red-500/20 text-red-400" : "hover:bg-red-100 text-red-500"}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-2xl shadow-2xl p-8 w-full max-w-md ${isDark ? "bg-slate-800 border border-slate-700/50" : "bg-white border border-slate-200/50"}`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}
              >
                Add Expense
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-lg ${isDark ? "hover:bg-slate-700 text-slate-400 hover:text-white" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"}`}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-slate-700 border border-slate-600 text-white placeholder-slate-400" : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500"}`}
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Category *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-slate-700 border border-slate-600 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"}`}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-slate-700 border border-slate-600 text-white placeholder-slate-400" : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500"}`}
                  placeholder="e.g., Lunch at restaurant"
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-semibold mb-2 ${isDark ? "text-slate-300" : "text-slate-700"}`}
                >
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`w-full px-4 py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? "bg-slate-700 border border-slate-600 text-white" : "bg-slate-50 border border-slate-300 text-slate-900"}`}
                  required
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold ${isDark ? "bg-slate-700 text-slate-200 hover:bg-slate-600 border border-slate-600" : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 hover:shadow-lg hover:scale-105 transition-all"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
