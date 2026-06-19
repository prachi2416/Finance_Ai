import { useState, useEffect } from "react";
import { auth, db } from "../firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function CategoryManager() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "📦",
    color: "blue",
    type: "expense",
  });
  const [saving, setSaving] = useState(false);
  const [categoryUsage, setCategoryUsage] = useState({});
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const defaultCategories = [
    {
      id: "food",
      name: "Food & Dining",
      icon: "🍽️",
      color: "orange",
      type: "expense",
      isDefault: true,
    },
    {
      id: "transport",
      name: "Transportation",
      icon: "🚗",
      color: "blue",
      type: "expense",
      isDefault: true,
    },
    {
      id: "shopping",
      name: "Shopping",
      icon: "🛍️",
      color: "pink",
      type: "expense",
      isDefault: true,
    },
    {
      id: "entertainment",
      name: "Entertainment",
      icon: "🎬",
      color: "purple",
      type: "expense",
      isDefault: true,
    },
    {
      id: "bills",
      name: "Bills & Utilities",
      icon: "📄",
      color: "yellow",
      type: "expense",
      isDefault: true,
    },
    {
      id: "healthcare",
      name: "Healthcare",
      icon: "🏥",
      color: "red",
      type: "expense",
      isDefault: true,
    },
    {
      id: "education",
      name: "Education",
      icon: "📚",
      color: "green",
      type: "expense",
      isDefault: true,
    },
    {
      id: "travel",
      name: "Travel",
      icon: "✈️",
      color: "cyan",
      type: "expense",
      isDefault: true,
    },
    {
      id: "personal",
      name: "Personal Care",
      icon: "💅",
      color: "rose",
      type: "expense",
      isDefault: true,
    },
    {
      id: "others",
      name: "Others",
      icon: "📦",
      color: "gray",
      type: "expense",
      isDefault: true,
    },
  ];

  const iconOptions = [
    "🍽️",
    "🚗",
    "🛍️",
    "🎬",
    "📄",
    "🏥",
    "📚",
    "✈️",
    "💅",
    "📦",
    "💰",
    "💳",
    "🏠",
    "⚡",
    "📱",
    "💼",
    "🎯",
    "🎮",
    "🏋️",
    "🎨",
    "🎵",
    "📷",
    "🐕",
    "🌱",
    "☕",
    "🍕",
    "🎂",
    "🚲",
    "🏖️",
    "🎁",
  ];

  const colorOptions = [
    { name: "Red", value: "red", class: "bg-red-500" },
    { name: "Orange", value: "orange", class: "bg-orange-500" },
    { name: "Yellow", value: "yellow", class: "bg-yellow-500" },
    { name: "Green", value: "green", class: "bg-green-500" },
    { name: "Blue", value: "blue", class: "bg-blue-500" },
    { name: "Purple", value: "purple", class: "bg-purple-500" },
    { name: "Pink", value: "pink", class: "bg-pink-500" },
    { name: "Cyan", value: "cyan", class: "bg-cyan-500" },
    { name: "Gray", value: "gray", class: "bg-gray-500" },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }
      setUser(firebaseUser);
      fetchCategories(firebaseUser.uid);
      fetchCategoryUsage(firebaseUser.uid);
    });
    return () => unsubscribe();
  }, []);

  const fetchCategories = async (uid) => {
    try {
      // Fetch custom categories from Firestore
      const q = query(
        collection(db, "categories"),
        where("user_id", "==", uid),
        orderBy("name"),
      );
      const snapshot = await getDocs(q);
      const customCategories = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        isDefault: false,
      }));

      // Merge default + custom
      setCategories([...defaultCategories, ...customCategories]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([...defaultCategories]);
      setLoading(false);
    }
  };

  const fetchCategoryUsage = async (uid) => {
    try {
      const q = query(collection(db, "expenses"), where("user_id", "==", uid));
      const snapshot = await getDocs(q);
      const usage = {};
      snapshot.docs.forEach((d) => {
        const cat = d.data().category || "Others";
        usage[cat] = (usage[cat] || 0) + 1;
      });
      setCategoryUsage(usage);
    } catch (error) {
      console.error("Error fetching usage:", error);
    }
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      alert("Please enter a category name");
      return;
    }
    if (!user) return;
    setSaving(true);

    try {
      // Save to Firestore so Expenses.jsx can fetch it
      await addDoc(collection(db, "categories"), {
        user_id: user.uid,
        name: newCategory.name.trim(),
        icon: newCategory.icon,
        color: newCategory.color,
        type: newCategory.type,
        created_at: new Date().toISOString(),
      });

      setShowCreateModal(false);
      setNewCategory({ name: "", icon: "📦", color: "blue", type: "expense" });
      fetchCategories(user.uid);
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Failed to create category");
    } finally {
      setSaving(false);
    }
  };

  const editCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      alert("Please enter a category name");
      return;
    }
    setSaving(true);

    try {
      // Update the Firestore document
      await updateDoc(doc(db, "categories", editingCategory.id), {
        name: editingCategory.name.trim(),
        icon: editingCategory.icon,
        color: editingCategory.color,
        type: editingCategory.type,
      });

      setShowEditModal(false);
      setEditingCategory(null);
      fetchCategories(user.uid);
    } catch (error) {
      console.error("Error editing category:", error);
      alert("Failed to edit category");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (category?.isDefault) {
      alert("Cannot delete default categories");
      return;
    }
    if (!confirm(`Delete "${category?.name}"? This cannot be undone.`)) return;

    try {
      await deleteDoc(doc(db, "categories", categoryId));
      fetchCategories(user.uid);
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  };

  const getColorClass = (color) => {
    const colorMap = {
      red: "bg-red-500",
      orange: "bg-orange-500",
      yellow: "bg-yellow-500",
      green: "bg-green-500",
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      cyan: "bg-cyan-500",
      gray: "bg-gray-500",
    };
    return colorMap[color] || "bg-blue-500";
  };

  const totalCategories = categories.length;
  const customCategoriesCount = categories.filter((c) => !c.isDefault).length;
  const mostUsedCategory = Object.entries(categoryUsage).sort(
    (a, b) => b[1] - a[1],
  )[0];

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
              📁 Category Manager
            </h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            + Add Category
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Total Categories
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {totalCategories}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {customCategoriesCount} custom
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Most Used
            </h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {mostUsedCategory?.[0] || "None"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {mostUsedCategory?.[1] || 0} transactions
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Default Categories
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {defaultCategories.length}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Built-in
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
            All Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-12 h-12 ${getColorClass(category.color)} rounded-lg flex items-center justify-center text-2xl`}
                  >
                    {category.icon}
                  </div>
                  {!category.isDefault && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setShowEditModal(true);
                        }}
                        className="text-blue-500 hover:text-blue-600 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="text-red-500 hover:text-red-600 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                  {category.name}
                </h3>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {categoryUsage[category.name] || 0} uses
                  </span>
                  {category.isDefault && (
                    <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                      Default
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            💡 Tips
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-disc list-inside">
            <li>Create custom categories for your unique spending patterns</li>
            <li>
              Default categories cannot be deleted to maintain consistency
            </li>
            <li>Choose meaningful icons and colors for easy identification</li>
            <li>
              Review unused categories periodically and remove if not needed
            </li>
          </ul>
        </div>
      </div>

      {/* Create Category Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Create Category
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
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="e.g., Gym Membership"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                      className={`text-2xl p-2 rounded-lg border-2 transition ${newCategory.icon === icon ? "border-blue-500 bg-blue-50 dark:bg-blue-900" : "border-gray-200 dark:border-gray-700"}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-9 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setNewCategory({ ...newCategory, color: color.value })
                      }
                      className={`w-10 h-10 rounded-lg ${color.class} ${newCategory.color === color.value ? "ring-4 ring-offset-2 ring-blue-500" : ""}`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={createCategory}
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

      {/* Edit Category Modal */}
      {showEditModal && editingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Edit Category
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCategory(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() =>
                        setEditingCategory({ ...editingCategory, icon })
                      }
                      className={`text-2xl p-2 rounded-lg border-2 transition ${editingCategory.icon === icon ? "border-blue-500 bg-blue-50 dark:bg-blue-900" : "border-gray-200 dark:border-gray-700"}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-9 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      onClick={() =>
                        setEditingCategory({
                          ...editingCategory,
                          color: color.value,
                        })
                      }
                      className={`w-10 h-10 rounded-lg ${color.class} ${editingCategory.color === color.value ? "ring-4 ring-offset-2 ring-blue-500" : ""}`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCategory(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={editCategory}
                  disabled={saving}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
