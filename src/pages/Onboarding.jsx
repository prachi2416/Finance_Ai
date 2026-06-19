import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseClient";
import { doc, setDoc } from "firebase/firestore";
import { useDarkMode } from "../DarkModeContext";

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: "",
    age: "",
    monthlyIncome: "",
    savingsGoal: "",
    riskTolerance: "moderate",
    financialGoals: [],
    preferredCategories: [],
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const steps = [
    {
      id: "welcome",
      title: "Welcome to Finance.AI! 🎉",
      subtitle: "Your AI-powered financial companion",
      icon: "🚀",
    },
    {
      id: "personal",
      title: "Let's get to know you",
      subtitle: "Tell us a bit about yourself",
      icon: "👤",
    },
    {
      id: "financial",
      title: "Financial Information",
      subtitle: "Help us personalise your experience",
      icon: "💰",
    },
    {
      id: "goals",
      title: "What are your goals?",
      subtitle: "We'll help you achieve them",
      icon: "🎯",
    },
    {
      id: "categories",
      title: "Spending Categories",
      subtitle: "Choose categories you use most",
      icon: "📊",
    },
    {
      id: "complete",
      title: "You're all set! 🎊",
      subtitle: "Let's start your financial journey",
      icon: "✅",
    },
  ];

  const financialGoalsOptions = [
    { id: "emergency", label: "Emergency Fund", icon: "🛡️" },
    { id: "retirement", label: "Retirement Planning", icon: "👴" },
    { id: "home", label: "Buy a Home", icon: "🏠" },
    { id: "car", label: "Buy a Car", icon: "🚗" },
    { id: "vacation", label: "Dream Vacation", icon: "✈️" },
    { id: "education", label: "Education", icon: "🎓" },
    { id: "investment", label: "Build Investments", icon: "📈" },
    { id: "debt", label: "Pay Off Debt", icon: "💳" },
  ];

  const categoryOptions = [
    { id: "food", label: "Food & Dining", icon: "🍽️" },
    { id: "transport", label: "Transportation", icon: "🚗" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "entertainment", label: "Entertainment", icon: "🎬" },
    { id: "bills", label: "Bills & Utils", icon: "📄" },
    { id: "healthcare", label: "Healthcare", icon: "🏥" },
    { id: "education", label: "Education", icon: "📚" },
    { id: "travel", label: "Travel", icon: "✈️" },
    { id: "fitness", label: "Fitness", icon: "💪" },
    { id: "personal", label: "Personal Care", icon: "💅" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const toggleGoal = (goalId) => {
    setUserData((prev) => ({
      ...prev,
      financialGoals: prev.financialGoals.includes(goalId)
        ? prev.financialGoals.filter((id) => id !== goalId)
        : [...prev.financialGoals, goalId],
    }));
  };

  const toggleCategory = (categoryId) => {
    setUserData((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(categoryId)
        ? prev.preferredCategories.filter((id) => id !== categoryId)
        : [...prev.preferredCategories, categoryId],
    }));
  };

  const completeOnboarding = async () => {
    setSaving(true);
    setSaveError("");

    // Step 1: verify auth
    const user = auth.currentUser;
    console.log("🔐 auth.currentUser:", user);

    if (!user) {
      console.error("❌ No authenticated user — redirecting to login");
      navigate("/login");
      return;
    }

    // Step 2: verify db
    console.log("🗄️  db object:", db);
    if (!db) {
      setSaveError(
        "Firestore db is undefined. Check your firebaseClient.js exports.",
      );
      setSaving(false);
      return;
    }

    // Step 3: build payload
    const payload = {
      uid: user.uid,
      email: user.email || null,
      name: userData.name.trim(),
      age: parseInt(userData.age) || null,
      monthly_income: parseFloat(userData.monthlyIncome) || 0,
      savings_goal: parseFloat(userData.savingsGoal) || 0,
      risk_tolerance: userData.riskTolerance,
      financial_goals: userData.financialGoals,
      preferred_categories: userData.preferredCategories,
      onboarding_complete: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log("📦 Payload:", payload);

    // Step 4: write to Firestore
    try {
      const docRef = doc(db, "users", user.uid);
      console.log("📝 Writing to: users/" + user.uid);
      await setDoc(docRef, payload, { merge: true });
      console.log("✅ Firestore write SUCCESS");
      localStorage.setItem(`onboarding_complete_${user.uid}`, "true");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (firestoreError) {
      console.error(
        "❌ Firestore write FAILED:",
        firestoreError.code,
        firestoreError.message,
        firestoreError,
      );

      let msg = "Failed to save. Please try again.";
      if (firestoreError.code === "permission-denied") {
        msg =
          "Permission denied ⛔ — Go to Firebase Console → Firestore Database → Rules and change to: allow read, write: if request.auth != null;";
      } else if (firestoreError.code === "not-found") {
        msg =
          "Firestore database not found — create one in Firebase Console first.";
      } else if (firestoreError.code === "unavailable") {
        msg = "Firestore unreachable — check your internet connection.";
      } else {
        msg = `Error (${firestoreError.code}): ${firestoreError.message}`;
      }

      setSaveError(msg);
      setSaving(false);
    }
  };

  const isStepValid = () => {
    switch (steps[currentStep].id) {
      case "personal":
        return userData.name.trim() !== "" && userData.age !== "";
      case "financial":
        return userData.monthlyIncome !== "" && userData.savingsGoal !== "";
      case "goals":
        return userData.financialGoals.length > 0;
      case "categories":
        return userData.preferredCategories.length >= 3;
      default:
        return true;
    }
  };

  // ── Input & shared style helpers ───────────────────────────────────────
  const inputCls = `w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 text-base font-medium
    ${
      isDark
        ? "bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    }`;

  const labelCls = `block text-xs font-bold uppercase tracking-wide mb-2
    ${isDark ? "text-slate-400" : "text-gray-500"}`;

  // ── Step renderers ─────────────────────────────────────────────────────
  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case "welcome":
        return (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="text-8xl animate-bounce">
              {steps[currentStep].icon}
            </div>
            <div>
              <h1
                className={`text-4xl font-black tracking-tight mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {steps[currentStep].title}
              </h1>
              <p
                className={`text-lg ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                {steps[currentStep].subtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {[
                {
                  icon: "📊",
                  color: "blue",
                  title: "Track Everything",
                  desc: "Monitor expenses, income, and investments in one place",
                },
                {
                  icon: "🤖",
                  color: "green",
                  title: "AI Insights",
                  desc: "Get personalised tips and predictions powered by AI",
                },
                {
                  icon: "🎯",
                  color: "purple",
                  title: "Reach Goals",
                  desc: "Set and achieve your financial goals faster",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`p-6 rounded-2xl border ${
                    isDark
                      ? `bg-${card.color}-900/20 border-${card.color}-800/40`
                      : `bg-${card.color}-50 border-${card.color}-100`
                  }`}
                >
                  <div className="text-4xl mb-3">{card.icon}</div>
                  <h3
                    className={`font-bold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-gray-500"}`}
                  >
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "personal":
        return (
          <div className="max-w-md mx-auto space-y-5 animate-slide-in">
            <StepHeader step={steps[currentStep]} isDark={isDark} />
            <div>
              <label className={labelCls}>What's your name?</label>
              <input
                type="text"
                value={userData.name}
                onChange={(e) =>
                  setUserData({ ...userData, name: e.target.value })
                }
                placeholder="Rahul Sharma"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>How old are you?</label>
              <input
                type="number"
                value={userData.age}
                onChange={(e) =>
                  setUserData({ ...userData, age: e.target.value })
                }
                placeholder="25"
                min="13"
                max="100"
                className={inputCls}
              />
            </div>
          </div>
        );

      case "financial":
        return (
          <div className="max-w-md mx-auto space-y-5 animate-slide-in">
            <StepHeader step={steps[currentStep]} isDark={isDark} />
            <div>
              <label className={labelCls}>Monthly Income (₹)</label>
              <input
                type="number"
                value={userData.monthlyIncome}
                onChange={(e) =>
                  setUserData({ ...userData, monthlyIncome: e.target.value })
                }
                placeholder="50,000"
                min="0"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Monthly Savings Goal (₹)</label>
              <input
                type="number"
                value={userData.savingsGoal}
                onChange={(e) =>
                  setUserData({ ...userData, savingsGoal: e.target.value })
                }
                placeholder="10,000"
                min="0"
                className={inputCls}
              />
              {userData.monthlyIncome && userData.savingsGoal && (
                <p
                  className={`text-xs mt-1.5 ${
                    parseFloat(userData.savingsGoal) /
                      parseFloat(userData.monthlyIncome) >=
                    0.2
                      ? "text-green-500"
                      : "text-orange-500"
                  }`}
                >
                  That's{" "}
                  {(
                    (parseFloat(userData.savingsGoal) /
                      parseFloat(userData.monthlyIncome)) *
                    100
                  ).toFixed(0)}
                  % of income
                  {parseFloat(userData.savingsGoal) /
                    parseFloat(userData.monthlyIncome) >=
                  0.2
                    ? " — great target! 🎉"
                    : " — experts recommend 20%+"}
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>Investment Risk Tolerance</label>
              <select
                value={userData.riskTolerance}
                onChange={(e) =>
                  setUserData({ ...userData, riskTolerance: e.target.value })
                }
                className={inputCls}
              >
                <option value="conservative">🛡️ Conservative (Low Risk)</option>
                <option value="moderate">⚖️ Moderate (Medium Risk)</option>
                <option value="aggressive">🚀 Aggressive (High Risk)</option>
              </select>
            </div>
          </div>
        );

      case "goals":
        return (
          <div className="max-w-3xl mx-auto space-y-5 animate-slide-in">
            <StepHeader
              step={steps[currentStep]}
              isDark={isDark}
              subtitle="Select all that apply"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {financialGoalsOptions.map((goal) => {
                const selected = userData.financialGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-150 hover:scale-[1.03] active:scale-95 text-center ${
                      selected
                        ? "border-blue-500 bg-blue-500/10"
                        : isDark
                          ? "border-slate-700 hover:border-slate-600 bg-slate-800/40"
                          : "border-gray-200 hover:border-blue-300 bg-white"
                    }`}
                  >
                    <div className="text-3xl mb-2">{goal.icon}</div>
                    <div
                      className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
                    >
                      {goal.label}
                    </div>
                    {selected && (
                      <div className="text-blue-500 text-xs mt-1 font-bold">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {userData.financialGoals.length > 0 && (
              <p className="text-center text-sm text-blue-500 font-medium">
                ✓ {userData.financialGoals.length} goal
                {userData.financialGoals.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        );

      case "categories":
        return (
          <div className="max-w-3xl mx-auto space-y-5 animate-slide-in">
            <StepHeader
              step={steps[currentStep]}
              isDark={isDark}
              subtitle="Select at least 3 categories"
            />
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {categoryOptions.map((cat) => {
                const selected = userData.preferredCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`p-4 rounded-2xl border-2 transition-all duration-150 hover:scale-[1.03] active:scale-95 text-center ${
                      selected
                        ? "border-purple-500 bg-purple-500/10"
                        : isDark
                          ? "border-slate-700 hover:border-slate-600 bg-slate-800/40"
                          : "border-gray-200 hover:border-purple-300 bg-white"
                    }`}
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <div
                      className={`text-xs font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
                    >
                      {cat.label}
                    </div>
                    {selected && (
                      <div className="text-purple-500 text-xs mt-1 font-bold">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {userData.preferredCategories.length > 0 && (
              <p className="text-center text-sm text-purple-500 font-medium">
                ✓ {userData.preferredCategories.length} categor
                {userData.preferredCategories.length === 1 ? "y" : "ies"}{" "}
                selected
                {userData.preferredCategories.length < 3 && (
                  <span className="text-orange-500">
                    {" "}
                    — pick {3 - userData.preferredCategories.length} more
                  </span>
                )}
              </p>
            )}
          </div>
        );

      case "complete":
        return (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="text-8xl animate-bounce">
              {steps[currentStep].icon}
            </div>
            <div>
              <h1
                className={`text-4xl font-black tracking-tight mb-3 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                {steps[currentStep].title}
              </h1>
              <p
                className={`text-lg ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                {steps[currentStep].subtitle}
              </p>
            </div>

            {/* Profile summary card */}
            <div
              className={`max-w-sm mx-auto rounded-2xl p-6 border text-left ${isDark ? "bg-slate-800/50 border-slate-700" : "bg-white border-gray-200 shadow-sm"}`}
            >
              <h3
                className={`font-bold text-sm uppercase tracking-widest mb-4 ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                Profile Summary
              </h3>
              <div className="space-y-2.5">
                {[
                  { label: "Name", value: userData.name },
                  {
                    label: "Age",
                    value: userData.age ? `${userData.age} years` : "—",
                  },
                  {
                    label: "Monthly Income",
                    value: userData.monthlyIncome
                      ? `₹${parseFloat(userData.monthlyIncome).toLocaleString("en-IN")}`
                      : "—",
                  },
                  {
                    label: "Savings Goal",
                    value: userData.savingsGoal
                      ? `₹${parseFloat(userData.savingsGoal).toLocaleString("en-IN")}`
                      : "—",
                  },
                  {
                    label: "Risk Profile",
                    value: {
                      conservative: "🛡️ Conservative",
                      moderate: "⚖️ Moderate",
                      aggressive: "🚀 Aggressive",
                    }[userData.riskTolerance],
                  },
                  {
                    label: "Goals",
                    value: `${userData.financialGoals.length} selected`,
                  },
                  {
                    label: "Categories",
                    value: `${userData.preferredCategories.length} selected`,
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex justify-between items-center"
                  >
                    <span
                      className={`text-xs font-medium ${isDark ? "text-slate-500" : "text-gray-500"}`}
                    >
                      {label}
                    </span>
                    <span
                      className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {saveError && (
              <div className="max-w-sm mx-auto p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-500 font-medium">
                  ⚠️ {saveError}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-blue-50 via-purple-50/40 to-pink-50"
      }`}
    >
      <style>{`
        @keyframes fade-in  { from { opacity:0; transform:translateY(20px);  } to { opacity:1; transform:translateY(0);  } }
        @keyframes slide-in { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
        .animate-fade-in  { animation: fade-in  0.5s ease-out; }
        .animate-slide-in { animation: slide-in 0.5s ease-out; }
      `}</style>

      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col max-w-5xl">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-2">
            <span
              className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-500" : "text-gray-400"}`}
            >
              Step {currentStep + 1} of {steps.length}
            </span>
            <span
              className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-gray-600"}`}
            >
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div
            className={`w-full rounded-full h-2 ${isDark ? "bg-slate-800" : "bg-gray-200"}`}
          >
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          {/* Step labels */}
          <div className="hidden md:flex justify-between mt-2">
            {steps.map((step, idx) => (
              <span
                key={step.id}
                className={`text-xs font-medium transition-colors ${
                  idx === currentStep
                    ? "text-blue-500"
                    : idx < currentStep
                      ? isDark
                        ? "text-slate-500"
                        : "text-gray-400"
                      : isDark
                        ? "text-slate-700"
                        : "text-gray-300"
                }`}
              >
                {step.icon}
              </span>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full">{renderStepContent()}</div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200/30 dark:border-slate-700/40">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-0 disabled:pointer-events-none ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            ← Back
          </button>

          {/* Dot indicators */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "bg-blue-500 w-6 h-2"
                    : index < currentStep
                      ? "bg-blue-300 w-2 h-2"
                      : isDark
                        ? "bg-slate-700 w-2 h-2"
                        : "bg-gray-300 w-2 h-2"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!isStepValid() || saving}
            className="px-8 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-sm hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </>
            ) : currentStep === steps.length - 1 ? (
              "Get Started 🚀"
            ) : (
              "Continue →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StepHeader({ step, isDark, subtitle }) {
  return (
    <div className="text-center mb-6">
      <div className="text-6xl mb-3">{step.icon}</div>
      <h2
        className={`text-3xl font-black tracking-tight mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {step.title}
      </h2>
      <p className={`text-sm ${isDark ? "text-slate-400" : "text-gray-500"}`}>
        {subtitle || step.subtitle}
      </p>
    </div>
  );
}
