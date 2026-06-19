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

export default function Income() {
  const [user, setUser] = useState(null);
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    source: "",
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
      fetchIncomes(firebaseUser.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchCategories = async (uid) => {
    try {
      const q = query(
        collection(db, "categories"),
        where("user_id", "==", uid),
        where("type", "==", "income"),
        orderBy("name"),
      );
      const snapshot = await getDocs(q);
      setCategories(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchIncomes = async (uid) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "income"),
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
      const enriched = data.map((inc) => ({
        ...inc,
        categories: catMap[inc.category_id] || null,
      }));
      setIncomes(enriched);
    } catch (err) {
      console.error("Error fetching income:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      await addDoc(collection(db, "income"), {
        user_id: user.uid, // ✅ Fixed: uid not id
        amount: parseFloat(formData.amount),
        source: formData.source,
        category_id: formData.category_id || null,
        date: formData.date,
        created_at: new Date().toISOString(),
      });
      setShowModal(false);
      setFormData({
        amount: "",
        source: "",
        category_id: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchIncomes(user.uid);
    } catch (err) {
      alert("Error adding income: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this income?")) {
      try {
        await deleteDoc(doc(db, "income", id));
        fetchIncomes(user.uid);
      } catch (err) {
        alert("Error deleting: " + err.message);
      }
    }
  };

  const totalIncome = incomes.reduce(
    (sum, inc) => sum + parseFloat(inc.amount || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* ✅ Fixed: removed jsx attribute */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
        .animate-slide-up { animation: slide-up 0.4s ease-out; }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-950 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-white transition-all duration-200 hover:scale-110"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Income</h1>
                <p className="text-blue-100 text-sm mt-1">
                  Track and manage your income
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-105 flex items-center space-x-2"
              >
                <span className="text-xl">+</span>
                <span>Add Income</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Total Card */}
        <div className="bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-lg p-8 mb-8 border border-blue-100 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Total Income
              </p>
              <p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mt-3">
                ₹
                {totalIncome.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                {incomes.length} transactions recorded
              </p>
            </div>
            <div className="text-6xl opacity-20">💰</div>
          </div>
        </div>

        {/* Income List */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          {loading ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-4">
                Loading your income...
              </p>
            </div>
          ) : incomes.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                No income recorded yet
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
                Click "Add Income" to get started
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {incomes.map((income) => (
                <div
                  key={income.id}
                  className="p-6 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-5 flex-1">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold shadow-md group-hover:scale-110 transition-transform duration-200"
                        style={{
                          backgroundColor:
                            (income.categories?.color || "#3B82F6") + "30",
                        }}
                      >
                        {income.categories?.icon || "💵"}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800 dark:text-white text-base">
                          {income.source}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {new Date(income.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        {income.categories && (
                          <p className="text-xs text-blue-500 mt-1">
                            {income.categories.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <p className="text-xl font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                        +₹
                        {parseFloat(income.amount).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <button
                        onClick={() => handleDelete(income.id)}
                        className="p-2.5 text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
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

      {/* Add Income Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Add Income
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Record a new income transaction
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                  Category
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
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
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                  Source
                </label>
                <input
                  type="text"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Monthly salary, Freelance project"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg font-medium hover:scale-105 transition-all"
                >
                  Add Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
