
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { auth, db } from "./firebaseClient";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const GuestContext = createContext(null);

export const GUEST_FEATURES = {
  EXPENSES: "expenses",
  INCOME: "income",
  INVESTMENTS: "investments",
  GOALS: "goals",
  BILLS: "bills",
  SUBSCRIPTIONS: "subscriptions",
  AI_ADVISOR: "ai_advisor",
  ANALYTICS: "analytics",
};

const GUEST_LIMIT = 5;

export function GuestProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [limitReachedFeature, setLimitReachedFeature] = useState(null);
  const [guestUsage, setGuestUsage] = useState({
    expenses: 0,
    income: 0,
    investments: 0,
    goals: 0,
    bills: 0,
    subscriptions: 0,
    ai_advisor: 0,
    analytics: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuest(false);
        await loadProfile(firebaseUser.uid);
      } else {
        setUser(null);
        setProfile(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      const docRef = doc(db, "profiles", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) setProfile(docSnap.data());
    } catch (error) {
      console.log("Profile load failed:", error.message);
    }
  };

  const enterGuestMode = () => {
    setIsGuest(true);
    setUser(null);
    setProfile(null);
    setAuthLoading(false);
    setGuestUsage({
      expenses: 0,
      income: 0,
      investments: 0,
      goals: 0,
      bills: 0,
      subscriptions: 0,
      ai_advisor: 0,
      analytics: 0,
    });
  };

  const exitGuestMode = () => setIsGuest(false);

  const checkGuestLimit = useCallback(
    (featureKey) => {
      if (user) return true;
      if (!isGuest) {
        setShowLoginModal(true);
        return false;
      }
      const currentCount = guestUsage[featureKey] ?? 0;
      if (currentCount >= GUEST_LIMIT) {
        setLimitReachedFeature(featureKey);
        setShowLoginModal(true);
        return false;
      }
      setGuestUsage((prev) => ({
        ...prev,
        [featureKey]: prev[featureKey] + 1,
      }));
      return true;
    },
    [user, isGuest, guestUsage],
  );

  const getRemainingUses = useCallback(
    (featureKey) => {
      if (user) return Infinity;
      return Math.max(0, GUEST_LIMIT - (guestUsage[featureKey] ?? 0));
    },
    [user, guestUsage],
  );

  const requireAuth = (callback) => {
    if (!user && !isGuest) {
      setShowLoginModal(true);
      return;
    }
    if (isGuest) {
      setShowLoginModal(true);
      return;
    }
    callback();
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setIsGuest(false);
  };

  return (
    <GuestContext.Provider
      value={{
        user,
        profile,
        isGuest,
        authLoading,
        showLoginModal,
        setShowLoginModal,
        limitReachedFeature,
        setLimitReachedFeature,
        guestUsage,
        checkGuestLimit,
        getRemainingUses,
        GUEST_LIMIT,
        enterGuestMode,
        exitGuestMode,
        requireAuth,
        logout,
        loadProfile,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const context = useContext(GuestContext);
  if (!context) throw new Error("useGuest must be used within GuestProvider");
  return context;
}
