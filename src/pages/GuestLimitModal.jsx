// GuestLimitModal.jsx - shown when guest hits 5-use limit on a feature

import { useNavigate } from "react-router-dom";
import { useGuest } from "../GuestContext";
import { useDarkMode } from "../DarkModeContext";

const FEATURE_LABELS = {
  expenses: "Expenses",
  income: "Income",
  investments: "Investments",
  goals: "Goals",
  bills: "Bills",
  subscriptions: "Subscriptions",
  ai_advisor: "AI Advisor",
  analytics: "Analytics",
};

export default function GuestLimitModal() {
  const {
    showLoginModal,
    setShowLoginModal,
    limitReachedFeature,
    setLimitReachedFeature,
    isGuest,
    GUEST_LIMIT,
  } = useGuest();
  const { isDark } = useDarkMode();
  const navigate = useNavigate();

  // Only show this version of the modal for guests who hit the limit
  if (!showLoginModal || !isGuest) return null;

  const featureLabel = limitReachedFeature
    ? FEATURE_LABELS[limitReachedFeature]
    : null;

  const handleLogin = () => {
    setShowLoginModal(false);
    setLimitReachedFeature(null);
    navigate("/login");
  };

  const handleSignup = () => {
    setShowLoginModal(false);
    setLimitReachedFeature(null);
    navigate("/signup");
  };

  const handleClose = () => {
    setShowLoginModal(false);
    setLimitReachedFeature(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-md rounded-2xl p-8 shadow-2xl z-10 ${
          isDark
            ? "bg-slate-800 border border-slate-700"
            : "bg-white border border-gray-200"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
            isDark
              ? "text-slate-400 hover:bg-slate-700 hover:text-white"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          }`}
        >
          ✕
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-3xl">🔒</span>
          </div>
        </div>

        {/* Title */}
        <h2
          className={`text-xl font-bold text-center mb-2 ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {featureLabel
            ? `${featureLabel} Limit Reached`
            : "Guest Limit Reached"}
        </h2>

        {/* Description */}
        <p
          className={`text-center text-sm mb-2 ${
            isDark ? "text-slate-400" : "text-gray-500"
          }`}
        >
          You've used your{" "}
          <span className="font-semibold text-amber-500">
            {GUEST_LIMIT} free guest actions
          </span>
          {featureLabel ? ` for ${featureLabel}` : ""}.
        </p>
        <p
          className={`text-center text-sm mb-6 ${
            isDark ? "text-slate-400" : "text-gray-500"
          }`}
        >
          Create a free account to unlock unlimited access to all features.
        </p>

        {/* Benefits list */}
        <div
          className={`rounded-xl p-4 mb-6 ${
            isDark ? "bg-slate-900/50" : "bg-gray-50"
          }`}
        >
          {[
            "✅ Unlimited transactions & tracking",
            "✅ AI-powered financial insights",
            "✅ Goals, budgets & bill reminders",
            "✅ Export reports & analytics",
            "✅ 100% free to sign up",
          ].map((benefit) => (
            <p
              key={benefit}
              className={`text-sm py-1 ${
                isDark ? "text-slate-300" : "text-gray-600"
              }`}
            >
              {benefit}
            </p>
          ))}
        </div>

        {/* Buttons */}
        <button
          onClick={handleSignup}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-[1.02] mb-3"
        >
          🚀 Sign Up Free
        </button>
        <button
          onClick={handleLogin}
          className={`w-full py-3 rounded-xl border-2 font-semibold transition-all hover:scale-[1.02] ${
            isDark
              ? "border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-400"
              : "border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          Already have an account? Log In
        </button>
      </div>
    </div>
  );
}
