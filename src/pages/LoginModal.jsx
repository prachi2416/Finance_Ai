// LoginModal.jsx - Shows when guest tries to save data
import { Link } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";
import { useGuest } from "../GuestContext";

export default function LoginModal() {
  const { showLoginModal, setShowLoginModal } = useGuest();
  const { isDark } = useDarkMode();

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowLoginModal(false)}
      />
      <div
        className={`relative z-10 w-full max-w-md rounded-2xl p-8 shadow-2xl ${isDark ? "bg-slate-800 border border-slate-700" : "bg-white border border-gray-200"}`}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🔐</span>
          </div>
          <h2
            className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
          >
            Login Required
          </h2>
          <p
            className={`text-sm mt-2 ${isDark ? "text-slate-400" : "text-gray-600"}`}
          >
            You're in guest mode. Create an account or login to save your
            financial data.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/signup"
            onClick={() => setShowLoginModal(false)}
            className="block w-full text-center py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
          >
            Create Free Account
          </Link>
          <Link
            to="/login"
            onClick={() => setShowLoginModal(false)}
            className={`block w-full text-center py-3 px-6 rounded-xl border-2 font-semibold transition-all hover:scale-105 ${isDark ? "border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-400" : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"}`}
          >
            Login to Existing Account
          </Link>
          <button
            onClick={() => setShowLoginModal(false)}
            className={`block w-full text-center py-2 text-sm ${isDark ? "text-slate-500 hover:text-slate-300" : "text-gray-400 hover:text-gray-600"} transition-colors`}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}
