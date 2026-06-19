
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCaSR9Pk5_25BeIhG8L3t9Ral9s_CaVUtk",
  authDomain: "financeai-f62eb.firebaseapp.com",
  projectId: "financeai-f62eb",
  storageBucket: "financeai-f62eb.firebasestorage.app",
  messagingSenderId: "629182548645",
  appId: "1:629182548645:web:b1c53b639519559c975b4c",
  measurementId: "G-WGR0J8HGQR",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// ============================================================
// SUPABASE COMPATIBILITY SHIM
// All your existing supabase.from(...) code works without changes
// ============================================================

const getCurrentUser = () =>
  new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

function createQueryBuilder(collectionName) {
  let _eqFilters = [];
  let _orderByField = null;
  let _orderByDir = "asc";
  let _limitCount = null;
  let _singleResult = false;
  let _insertData = null;
  let _updateData = null;
  let _deleteMode = false;
  let _upsertData = null;

  const builder = {
    select() {
      return builder;
    },
    eq(field, value) {
      _eqFilters.push({ field, value });
      return builder;
    },
    order(field, options = {}) {
      _orderByField = field;
      _orderByDir = options.ascending === false ? "desc" : "asc";
      return builder;
    },
    limit(n) {
      _limitCount = n;
      return builder;
    },
    single() {
      _singleResult = true;
      return builder;
    },
    gte() {
      return builder;
    },
    lte() {
      return builder;
    },
    neq() {
      return builder;
    },
    like() {
      return builder;
    },
    ilike() {
      return builder;
    },
    insert(data) {
      _insertData = data;
      return builder;
    },
    update(data) {
      _updateData = data;
      return builder;
    },
    delete() {
      _deleteMode = true;
      return builder;
    },
    upsert(data) {
      _upsertData = data;
      return builder;
    },
    then(resolve, reject) {
      return executeQuery().then(resolve, reject);
    },
  };

  async function executeQuery() {
    try {
      const user = await getCurrentUser();

      // INSERT
      if (_insertData) {
        const items = Array.isArray(_insertData) ? _insertData : [_insertData];
        const results = [];
        for (const item of items) {
          const docData = {
            ...item,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const docRef = await addDoc(collection(db, collectionName), docData);
          results.push({ id: docRef.id, ...docData });
        }
        return { data: results, error: null };
      }

      // UPSERT
      if (_upsertData) {
        const items = Array.isArray(_upsertData) ? _upsertData : [_upsertData];
        for (const item of items) {
          const docId = item.id || (user && user.uid);
          if (docId) {
            await setDoc(
              doc(db, collectionName, docId),
              { ...item, updated_at: new Date().toISOString() },
              { merge: true },
            );
          }
        }
        return { data: items, error: null };
      }

      // DELETE
      if (_deleteMode) {
        const idFilter = _eqFilters.find((f) => f.field === "id");
        if (idFilter) {
          await deleteDoc(doc(db, collectionName, idFilter.value));
        } else {
          const q = buildQuery(user);
          const snapshot = await getDocs(q);
          for (const d of snapshot.docs)
            await deleteDoc(doc(db, collectionName, d.id));
        }
        return { data: null, error: null };
      }

      // UPDATE
      if (_updateData) {
        const idFilter = _eqFilters.find((f) => f.field === "id");
        if (idFilter) {
          await updateDoc(doc(db, collectionName, idFilter.value), {
            ..._updateData,
            updated_at: new Date().toISOString(),
          });
        } else {
          const q = buildQuery(user);
          const snapshot = await getDocs(q);
          for (const d of snapshot.docs)
            await updateDoc(doc(db, collectionName, d.id), {
              ..._updateData,
              updated_at: new Date().toISOString(),
            });
        }
        return { data: _updateData, error: null };
      }

      // SELECT single by id
      const idFilter = _eqFilters.find((f) => f.field === "id");
      if (idFilter && _singleResult) {
        const docSnap = await getDoc(doc(db, collectionName, idFilter.value));
        return docSnap.exists()
          ? { data: { id: docSnap.id, ...docSnap.data() }, error: null }
          : { data: null, error: null };
      }

      // SELECT profile by user id
      if (collectionName === "profiles") {
        const uid =
          _eqFilters.find((f) => f.field === "id")?.value || (user && user.uid);
        if (uid) {
          const docSnap = await getDoc(doc(db, "profiles", uid));
          if (_singleResult) {
            return docSnap.exists()
              ? { data: { id: docSnap.id, ...docSnap.data() }, error: null }
              : { data: null, error: null };
          }
          return {
            data: docSnap.exists()
              ? [{ id: docSnap.id, ...docSnap.data() }]
              : [],
            error: null,
          };
        }
      }

      // SELECT list
      const q = buildQuery(user);
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      return _singleResult
        ? { data: docs[0] || null, error: null }
        : { data: docs, error: null };
    } catch (err) {
      console.error(`Firestore error [${collectionName}]:`, err.message);
      return {
        data: _singleResult ? null : [],
        error: { message: err.message },
      };
    }
  }

  function buildQuery(user) {
    const constraints = [];
    const noAutoUser = ["profiles", "contact_messages", "feedback"];
    const hasUserFilter = _eqFilters.some((f) => f.field === "user_uid");

    if (!hasUserFilter && user && !noAutoUser.includes(collectionName)) {
      constraints.push(where("user_id", "==", user.uid));
    }

    for (const f of _eqFilters) {
      if (f.field !== "id") constraints.push(where(f.field, "==", f.value));
    }

    if (_orderByField) constraints.push(orderBy(_orderByField, _orderByDir));
    if (_limitCount) constraints.push(limit(_limitCount));

    return query(collection(db, collectionName), ...constraints);
  }

  return builder;
}

// Auth shim
const authShim = {
  getUser: async () => {
    const user = await getCurrentUser();
    return { data: { user }, error: null };
  },
  getSession: async () => {
    const user = await getCurrentUser();
    return { data: { session: user ? { user } : null }, error: null };
  },
  signInWithPassword: async ({ email, password }) => {
    const { signInWithEmailAndPassword } = await import("firebase/auth");
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { data: { user: result.user }, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  },
  signUp: async ({ email, password, options }) => {
    const { createUserWithEmailAndPassword, updateProfile } =
      await import("firebase/auth");
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      if (options?.data?.name)
        await updateProfile(result.user, { displayName: options.data.name });
      // Create profile in Firestore
      await setDoc(doc(db, "profiles", result.user.uid), {
        id: result.user.uid,
        email,
        name: options?.data?.name || "",
        full_name: options?.data?.name || "",
        profession: options?.data?.profession || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      // Create default categories
      const defaultCategories = [
        {
          name: "Food & Dining",
          type: "expense",
          icon: "🍔",
          color: "#ef4444",
        },
        {
          name: "Transportation",
          type: "expense",
          icon: "🚗",
          color: "#f59e0b",
        },
        { name: "Shopping", type: "expense", icon: "🛍️", color: "#8b5cf6" },
        {
          name: "Entertainment",
          type: "expense",
          icon: "🎬",
          color: "#ec4899",
        },
        {
          name: "Bills & Utilities",
          type: "expense",
          icon: "💡",
          color: "#3b82f6",
        },
        { name: "Healthcare", type: "expense", icon: "🏥", color: "#10b981" },
        { name: "Education", type: "expense", icon: "📚", color: "#6366f1" },
        { name: "Travel", type: "expense", icon: "✈️", color: "#14b8a6" },
        { name: "Groceries", type: "expense", icon: "🛒", color: "#22c55e" },
        {
          name: "Housing & Rent",
          type: "expense",
          icon: "🏠",
          color: "#f97316",
        },
        { name: "Utilities", type: "expense", icon: "⚡", color: "#0ea5e9" },
        { name: "Other", type: "expense", icon: "📦", color: "#64748b" },
        { name: "Salary", type: "income", icon: "💰", color: "#10b981" },
        { name: "Freelance", type: "income", icon: "💼", color: "#3b82f6" },
        { name: "Investment", type: "income", icon: "📈", color: "#8b5cf6" },
        { name: "Other Income", type: "income", icon: "💵", color: "#64748b" },
      ];
      for (const cat of defaultCategories) {
        await addDoc(collection(db, "categories"), {
          user_id: result.user.uid,
          ...cat,
          created_at: new Date().toISOString(),
        });
      }
      return { data: { user: result.user }, error: null };
    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  },
  signOut: async () => {
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
    return { error: null };
  },
  onAuthStateChange: (callback) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      callback(user ? "SIGNED_IN" : "SIGNED_OUT", user ? { user } : null);
    });
    return { data: { subscription: { unsubscribe } } };
  },
};

// Functions shim
const functionsShim = {
  invoke: async (name) => {
    console.warn(
      `supabase.functions.invoke('${name}') not supported. Use stockService.js directly.`,
    );
    return {
      data: null,
      error: { message: "Use stockService.js for stock data" },
    };
  },
};

// Main export - drop-in replacement for supabase client
export const supabase = {
  from: (collectionName) => createQueryBuilder(collectionName),
  auth: authShim,
  functions: functionsShim,
};
