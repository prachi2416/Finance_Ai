
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { useEffect } from "react";
import { auth } from "./firebaseClient";
import { onAuthStateChanged } from "firebase/auth";

// Providers
import { GuestProvider, useGuest } from "./GuestContext";
import { DarkModeProvider } from "./DarkModeContext";

// Layout components
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import LoginModal from "./pages/LoginModal";
import GuestLimitModal from "./pages/GuestLimitModal";

// PAGE IMPORTS
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Income from "./pages/Income";
import Investments from "./pages/Investments";
import Profile from "./pages/Profile";
import Analytics from "./pages/Analytics";
import AIAdvisor from "./pages/AIAdvisor";
import Goals from "./pages/Goals";
import Bills from "./pages/Bills";
import EMICalculator from "./pages/EMICalculator";
import Subscriptions from "./pages/Subscriptions";
import RetirementCalculator from "./pages/RetirementCalculator";
import InsuranceTracker from "./pages/InsuranceTracker";
import Gamification from "./pages/Gamification";
import VoiceExpense from "./pages/VoiceExpense";
import ExportReports from "./pages/ExportReports";
import TaxCalculator from "./pages/TaxCalculator";
import CreditScoreSimulator from "./pages/CreditScoreSimulator";
import DebtPayoff from "./pages/DebtPayoff";
import PredictiveAnalysis from "./pages/PredictiveAnalysis";
import PersonalizedTips from "./pages/PersonalizedTips";
import AIBudgetAdjuster from "./pages/AIBudgetAdjuster";
import SmartNotifications from "./pages/SmartNotifications";
import ReceiptScanner from "./pages/ReceiptScanner";
import SocialComparisons from "./pages/SocialComparisons";
import Onboarding from "./pages/Onboarding";
import BudgetManager from "./pages/BudgetManager";
import CategoryManager from "./pages/CategoryManager";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Feedback from "./pages/Feedback";

function AppRoute({ element, requiresAuth = false, guestAllowed = false }) {
  const { user, isGuest, authLoading } = useGuest();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading Finance.ai...</p>
        </div>
      </div>
    );
  }

  if (requiresAuth && !user) return <Navigate to="/login" replace />;
  if (guestAllowed && !user && !isGuest)
    return <Navigate to="/login" replace />;
  return element;
}

function AppContent() {
  const navigate = useNavigate();
  const { user } = useGuest();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const completed = localStorage.getItem(
          `onboarding_complete_${firebaseUser.uid}`,
        );
        if (!completed && window.location.pathname === "/dashboard") {
          navigate("/onboarding");
        }
      }
    });
    return () => unsubscribe();
  }, [navigate, user]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LoginModal />
      <GuestLimitModal />

      {/* pt-16 = 64px top padding so no page content ever hides behind
          the header position (even though header is hidden by default,
          this prevents content sitting flush at the very top edge) */}
      <main className="flex-1 ">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route
            path="/dashboard"
            element={<AppRoute element={<Dashboard />} />}
          />
          <Route
            path="/onboarding"
            element={<AppRoute element={<Onboarding />} requiresAuth />}
          />
          <Route
            path="/expenses"
            element={<AppRoute element={<Expenses />} guestAllowed />}
          />
          <Route
            path="/income"
            element={<AppRoute element={<Income />} guestAllowed />}
          />
          <Route
            path="/investments"
            element={<AppRoute element={<Investments />} guestAllowed />}
          />
          <Route
            path="/analytics"
            element={<AppRoute element={<Analytics />} guestAllowed />}
          />
          <Route
            path="/goals"
            element={<AppRoute element={<Goals />} guestAllowed />}
          />
          <Route
            path="/subscriptions"
            element={<AppRoute element={<Subscriptions />} guestAllowed />}
          />
          <Route
            path="/bills"
            element={<AppRoute element={<Bills />} guestAllowed />}
          />
          <Route
            path="/ai-advisor"
            element={<AppRoute element={<AIAdvisor />} guestAllowed />}
          />
          <Route
            path="/predictive-analysis"
            element={<AppRoute element={<PredictiveAnalysis />} guestAllowed />}
          />
          <Route
            path="/personalized-tips"
            element={<AppRoute element={<PersonalizedTips />} guestAllowed />}
          />
          <Route
            path="/ai-budget-adjuster"
            element={<AppRoute element={<AIBudgetAdjuster />} guestAllowed />}
          />
          <Route
            path="/budgets"
            element={<AppRoute element={<BudgetManager />} guestAllowed />}
          />
          <Route
            path="/categories"
            element={<AppRoute element={<CategoryManager />} guestAllowed />}
          />
          <Route path="/emi-calculator" element={<EMICalculator />} />
          <Route path="/tax-calculator" element={<TaxCalculator />} />
          <Route
            path="/retirement-calculator"
            element={<RetirementCalculator />}
          />
          <Route
            path="/credit-score-simulator"
            element={<CreditScoreSimulator />}
          />
          <Route path="/debt-payoff" element={<DebtPayoff />} />
          <Route path="/voice-expense" element={<VoiceExpense />} />
          <Route path="/receipt-scanner" element={<ReceiptScanner />} />
          <Route path="/export-reports" element={<ExportReports />} />
          <Route path="/insurance-tracker" element={<InsuranceTracker />} />
          <Route path="/gamification" element={<Gamification />} />
          <Route path="/notifications" element={<SmartNotifications />} />
          <Route path="/social-comparisons" element={<SocialComparisons />} />
          <Route
            path="/profile"
            element={<AppRoute element={<Profile />} requiresAuth />}
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <DarkModeProvider>
      <GuestProvider>
        <Router>
          <AppContent />
        </Router>
      </GuestProvider>
    </DarkModeProvider>
  );
}
