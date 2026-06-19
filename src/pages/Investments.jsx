import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";
import {
  fetchStockPrice,
  searchStocks as searchStocksAPI,
  fetchStockInfo,
} from "../stockService";

const INVESTMENT_TYPES = [
  { value: "stock", label: "Stock", icon: "📈" },
  { value: "mutual_fund", label: "Mutual Fund", icon: "📊" },
  { value: "fd", label: "Fixed Deposit", icon: "🏦" },
  { value: "gold", label: "Gold", icon: "🪙" },
  { value: "real_estate", label: "Real Estate", icon: "🏠" },
  { value: "other", label: "Other", icon: "💼" },
];

// ── Custom dropdown — works perfectly in every theme ──────────────────────
function TypeDropdown({
  value,
  onChange,
  isDark,
  textPrimary,
  textSecondary,
  border,
  inputBg,
  inputBorder,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected =
    INVESTMENT_TYPES.find((t) => t.value === value) || INVESTMENT_TYPES[0];

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "9px 13px",
          borderRadius: 10,
          border: `1px solid ${open ? "#3b82f6" : inputBorder}`,
          background: inputBg,
          color: textPrimary,
          fontSize: "0.88rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          fontFamily: "inherit",
          fontWeight: 600,
          boxShadow: open ? "0 0 0 3px rgba(59,130,246,0.15)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "1rem" }}>{selected.icon}</span>
          <span>{selected.label}</span>
        </span>
        <span
          style={{
            fontSize: "0.65rem",
            color: textSecondary,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown list */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 999,
            background: isDark ? "#0d1224" : "#ffffff",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: isDark
              ? "0 12px 40px rgba(0,0,0,0.6)"
              : "0 8px 32px rgba(0,0,0,0.14)",
            animation: "dropIn 0.12s ease both",
          }}
        >
          {INVESTMENT_TYPES.map((type, i) => (
            <button
              key={type.value}
              type="button"
              onClick={() => {
                onChange(type.value);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                background:
                  value === type.value
                    ? isDark
                      ? "rgba(59,130,246,0.18)"
                      : "rgba(59,130,246,0.08)"
                    : i % 2 === 0
                      ? isDark
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(0,0,0,0.01)"
                      : "transparent",
                border: "none",
                borderBottom:
                  i < INVESTMENT_TYPES.length - 1
                    ? `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
                    : "none",
                color:
                  value === type.value
                    ? isDark
                      ? "#93c5fd"
                      : "#2563eb"
                    : isDark
                      ? "#f1f5f9"
                      : "#0f172a",
                fontSize: "0.88rem",
                fontWeight: value === type.value ? 700 : 500,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 10,
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => {
                if (value !== type.value)
                  e.currentTarget.style.background = isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(59,130,246,0.05)";
              }}
              onMouseLeave={(e) => {
                if (value !== type.value)
                  e.currentTarget.style.background =
                    i % 2 === 0
                      ? isDark
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(0,0,0,0.01)"
                      : "transparent";
              }}
            >
              <span
                style={{ fontSize: "1.1rem", width: 22, textAlign: "center" }}
              >
                {type.icon}
              </span>
              <span>{type.label}</span>
              {value === type.value && (
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "0.75rem",
                    color: isDark ? "#93c5fd" : "#2563eb",
                  }}
                >
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Investments() {
  const [currentUser, setCurrentUser] = useState(null);
  const [investments, setInvestments] = useState([]);
  const investmentsRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showChartModal, setShowChartModal] = useState(false);
  const [selectedStockForChart, setSelectedStockForChart] = useState(null);
  const [stockSearch, setStockSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [livePrice, setLivePrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [allStocks, setAllStocks] = useState([]);
  const [loadingAllStocks, setLoadingAllStocks] = useState(false);
  const [chartInterval, setChartInterval] = useState("1d");
  const tradingViewContainerRef = useRef(null);
  const [formData, setFormData] = useState({
    type: "stock",
    name: "",
    symbol: "",
    quantity: "",
    buy_price: "",
    current_price: "",
    buy_date: new Date().toISOString().split("T")[0],
    notes: "",
  });
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const d = isDark;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate("/login");
      else setCurrentUser(u);
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;
    fetchInvestments();
    loadTopStocks();
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(async () => {
      await updatePricesInBackground();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showChartModal && selectedStockForChart && window.TradingView)
      loadTradingViewChart();
  }, [showChartModal, selectedStockForChart, chartInterval, isDark]);

  const fetchInvestments = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const snap = await getDocs(
        query(
          collection(db, "investments"),
          where("user_id", "==", currentUser.uid),
          orderBy("buy_date", "desc"),
        ),
      );
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setInvestments(data);
      investmentsRef.current = data;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updatePricesInBackground = async () => {
    const list = investmentsRef.current;
    if (!list?.length) return;
    const stockItems = list.filter((inv) => inv.type === "stock" && inv.symbol);
    const updated = [...list];
    for (const stock of stockItems) {
      try {
        const symbol = stock.symbol.includes(".")
          ? stock.symbol
          : `${stock.symbol}.NS`;
        const price = await fetchStockPrice(symbol);
        if (price) {
          await updateDoc(doc(db, "investments", stock.id), {
            current_price: price,
          });
          const idx = updated.findIndex((i) => i.id === stock.id);
          if (idx !== -1)
            updated[idx] = { ...updated[idx], current_price: price };
        }
      } catch (err) {
        console.error(err);
      }
    }
    setInvestments([...updated]);
    investmentsRef.current = updated;
  };

  const loadTopStocks = async () => {
    setLoadingAllStocks(true);
    const top = [
      "RELIANCE.NS",
      "TCS.NS",
      "HDFCBANK.NS",
      "INFY.NS",
      "HINDUNILVR.NS",
      "ICICIBANK.NS",
      "KOTAKBANK.NS",
      "SBIN.NS",
      "BHARTIARTL.NS",
      "ITC.NS",
      "ASIANPAINT.NS",
      "LT.NS",
      "AXISBANK.NS",
      "MARUTI.NS",
      "WIPRO.NS",
      "HCLTECH.NS",
      "TITAN.NS",
      "ULTRACEMCO.NS",
      "BAJFINANCE.NS",
      "NESTLEIND.NS",
    ];
    try {
      const results = await Promise.allSettled(
        top.map(async (symbol) => {
          const [price, info] = await Promise.all([
            fetchStockPrice(symbol),
            fetchStockInfo(symbol),
          ]);
          if (price && info)
            return {
              symbol: symbol.replace(".NS", "").replace(".BO", ""),
              fullSymbol: symbol,
              name: info.name,
              price,
              change: info.change || 0,
              changePercent: info.changePercent || 0,
            };
          return null;
        }),
      );
      setAllStocks(
        results
          .filter((r) => r.status === "fulfilled" && r.value !== null)
          .map((r) => r.value),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAllStocks(false);
    }
  };

  const searchStocks = async (q) => {
    if (!q || q.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      setSearchResults(await searchStocksAPI(q));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const loadTradingViewChart = () => {
    const container = tradingViewContainerRef.current;
    if (!container || !window.TradingView || !selectedStockForChart) return;
    container.innerHTML = "";
    const imap = {
      1: "1",
      5: "5",
      15: "15",
      30: "30",
      60: "60",
      "1d": "D",
      "1w": "W",
      "1m": "M",
    };
    const symbol =
      selectedStockForChart.fullSymbol ||
      (selectedStockForChart.symbol.includes(".")
        ? selectedStockForChart.symbol
        : `${selectedStockForChart.symbol}.NS`);
    new window.TradingView.widget({
      autosize: true,
      symbol: symbol.replace(".NS", "").replace(".BO", ""),
      exchange: "NSE",
      interval: imap[chartInterval] || "D",
      timezone: "Asia/Kolkata",
      theme: d ? "dark" : "light",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: true,
      container_id: "tradingview_widget",
      studies: ["Volume@tv-basicstudies"],
      width: "100%",
      height: "550",
    });
  };

  const selectStock = async (stock) => {
    setFormData({ ...formData, name: stock.name, symbol: stock.symbol });
    setPriceLoading(true);
    const price = await fetchStockPrice(stock.fullSymbol);
    setPriceLoading(false);
    if (price) {
      setLivePrice({
        price,
        symbol: stock.symbol,
        timestamp: new Date().toLocaleTimeString(),
      });
      setFormData((prev) => ({
        ...prev,
        current_price: price,
        buy_price: prev.buy_price || price,
      }));
    } else {
      alert("Unable to fetch live price. Please enter manually.");
    }
    setStockSearch("");
    setSearchResults([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await addDoc(collection(db, "investments"), {
        user_id: currentUser.uid,
        type: formData.type,
        name: formData.name,
        symbol: formData.symbol || null,
        quantity: parseFloat(formData.quantity) || 1,
        buy_price: parseFloat(formData.buy_price),
        current_price:
          parseFloat(formData.current_price) || parseFloat(formData.buy_price),
        buy_date: formData.buy_date,
        notes: formData.notes || null,
        created_at: new Date().toISOString(),
      });
      setShowModal(false);
      setFormData({
        type: "stock",
        name: "",
        symbol: "",
        quantity: "",
        buy_price: "",
        current_price: "",
        buy_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setLivePrice(null);
      await fetchInvestments();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this investment?")) {
      try {
        await deleteDoc(doc(db, "investments", id));
        await fetchInvestments();
      } catch (err) {
        alert("Error: " + err.message);
      }
    }
  };

  const calcStats = () => {
    let invested = 0,
      current = 0;
    investments.forEach((inv) => {
      invested += parseFloat(inv.buy_price) * (parseFloat(inv.quantity) || 1);
      current +=
        parseFloat(inv.current_price || inv.buy_price) *
        (parseFloat(inv.quantity) || 1);
    });
    const gain = current - invested;
    return {
      invested,
      current,
      gain,
      pct: invested > 0 ? (gain / invested) * 100 : 0,
    };
  };

  const stats = calcStats();
  const typeIcon = (t) =>
    ({
      stock: "📈",
      mutual_fund: "📊",
      fd: "🏦",
      gold: "🪙",
      real_estate: "🏠",
      other: "💼",
    })[t] || "💼";
  const typeColor = (t) =>
    ({
      stock: "#3b82f6",
      mutual_fund: "#8b5cf6",
      fd: "#10b981",
      gold: "#f59e0b",
      real_estate: "#06b6d4",
      other: "#64748b",
    })[t] || "#64748b";

  const surface = d ? "rgba(255,255,255,0.04)" : "#ffffff";
  const border = d ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const textPrimary = d ? "#f1f5f9" : "#0f172a";
  const textSecondary = d ? "#94a3b8" : "#64748b";
  const textMuted = d ? "#64748b" : "#94a3b8";
  const inputBg = d ? "rgba(255,255,255,0.05)" : "#f8fafc";
  const inputBorder = d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800;9..40,900&display=swap');
    *, *::before, *::after { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}; border-radius: 4px; }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes modalIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes dropIn  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
    .fade-up  { animation: fadeUp 0.35s ease both; }
    .spin     { animation: spin 0.75s linear infinite; }
    .modal-box{ animation: modalIn 0.22s ease both; }
    .btn-hov  { transition: all 0.15s ease; }
    .btn-hov:hover { transform: translateY(-1px); filter: brightness(1.08); }
    .row-hov  { transition: background 0.13s ease; }
    .row-hov:hover { background: ${d ? "rgba(255,255,255,0.03)" : "rgba(59,130,246,0.03)"} !important; }
    .card-hov { transition: transform 0.18s ease; }
    .card-hov:hover { transform: translateY(-3px); }
    .stock-card { transition: transform 0.15s ease; cursor: pointer; }
    .stock-card:hover { transform: translateY(-2px); }

    /* ── Native select: force correct colors for both themes ── */
    select {
      color-scheme: ${d ? "dark" : "light"};
      background-color: ${d ? "#0d1224" : "#f8fafc"} !important;
      color: ${d ? "#f1f5f9" : "#0f172a"} !important;
    }
    select option {
      background-color: ${d ? "#0d1224" : "#ffffff"} !important;
      color: ${d ? "#f1f5f9" : "#0f172a"} !important;
    }
    select option:checked,
    select option:hover {
      background-color: ${d ? "#1e3a8a" : "#dbeafe"} !important;
      color: ${d ? "#93c5fd" : "#1d4ed8"} !important;
    }

    input, select, textarea { outline: none; transition: border-color 0.15s, box-shadow 0.15s; font-family: inherit; }
    input:focus, select:focus, textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15) !important; }
    input[type=date]::-webkit-calendar-picker-indicator { filter: ${d ? "invert(1) opacity(0.4)" : "opacity(0.4)"}; }
    .stat-grid   { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
    .market-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(150px,1fr)); gap: 10px; }
    .form-grid2  { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    #tradingview_widget { width: 100%; height: 550px; }
    @media(max-width:680px) {
      .stat-grid   { grid-template-columns: repeat(2,1fr) !important; }
      .market-grid { grid-template-columns: repeat(2,1fr) !important; }
      .form-grid2  { grid-template-columns: 1fr !important; }
    }
  `;

  const inputStyle = {
    width: "100%",
    padding: "9px 13px",
    borderRadius: 10,
    border: `1px solid ${inputBorder}`,
    background: inputBg,
    color: textPrimary,
    fontSize: "0.88rem",
  };
  const labelStyle = {
    display: "block",
    fontSize: "0.74rem",
    fontWeight: 700,
    color: textSecondary,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: d
          ? "linear-gradient(160deg,#070b18 0%,#0d1224 50%,#070b18 100%)"
          : "linear-gradient(160deg,#f0f4ff,#fff,#f0f4ff)",
        fontFamily: "'DM Sans',sans-serif",
      }}
    >
      <style>{css}</style>

      {/* ── Header ── */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: d ? "rgba(7,11,24,0.92)" : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <div
          style={{
            width: "100%",
            padding: "0 20px",
            height: 58,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            className="btn-hov"
            onClick={() => navigate("/dashboard")}
            style={{
              padding: "5px 12px",
              borderRadius: 8,
              border: `1px solid ${border}`,
              background: "transparent",
              color: textSecondary,
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            ← Back
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.95rem",
              }}
            >
              📈
            </div>
            <div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "0.98rem",
                  color: textPrimary,
                  letterSpacing: "-0.01em",
                }}
              >
                Investment Portfolio
              </span>
              <div style={{ fontSize: "0.7rem", color: textMuted }}>
                Live NSE/BSE · updates every 30s
              </div>
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              className="btn-hov"
              onClick={updatePricesInBackground}
              title="Refresh prices"
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                cursor: "pointer",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🔄
            </button>
            <button
              className="btn-hov"
              onClick={() => setShowModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.83rem",
                cursor: "pointer",
                fontFamily: "inherit",
                boxShadow: "0 2px 12px rgba(59,130,246,0.3)",
              }}
            >
              + Add
            </button>
          </div>
        </div>
      </div>

      <div style={{ width: "100%", padding: "18px 20px 48px" }}>
        {/* ── Stats ── */}
        <div className="stat-grid fade-up" style={{ marginBottom: 14 }}>
          {[
            {
              icon: "💰",
              label: "Total Invested",
              value: `₹${(stats.invested / 100000).toFixed(1)}L`,
              color: "#3b82f6",
            },
            {
              icon: "📈",
              label: "Current Value",
              value: `₹${(stats.current / 100000).toFixed(1)}L`,
              color: "#8b5cf6",
            },
            {
              icon: stats.gain >= 0 ? "✨" : "⚠️",
              label: "Gain / Loss",
              value: `${stats.gain >= 0 ? "+" : ""}₹${(Math.abs(stats.gain) / 100000).toFixed(1)}L`,
              color: stats.gain >= 0 ? "#22c55e" : "#ef4444",
            },
            {
              icon: "📊",
              label: "Return %",
              value: `${stats.pct >= 0 ? "+" : ""}${stats.pct.toFixed(2)}%`,
              color: stats.pct >= 0 ? "#22c55e" : "#ef4444",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="card-hov"
              style={{
                padding: "16px 18px",
                borderRadius: 16,
                background: surface,
                border: `1px solid ${border}`,
                boxShadow: d ? "none" : "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ fontSize: "1.2rem", marginBottom: 7 }}>
                {s.icon}
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 5,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 900,
                  color: s.color,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* ── Live Market ── */}
        <div
          className="fade-up"
          style={{
            borderRadius: 18,
            background: surface,
            border: `1px solid ${border}`,
            overflow: "hidden",
            marginBottom: 14,
            boxShadow: d ? "none" : "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              padding: "13px 18px",
              borderBottom: `1px solid ${border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#22c55e",
                    display: "inline-block",
                    boxShadow: "0 0 6px #22c55e",
                  }}
                />
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    color: textPrimary,
                  }}
                >
                  Live Market — Top NSE Stocks
                </span>
              </div>
              <div
                style={{ fontSize: "0.7rem", color: textMuted, marginTop: 2 }}
              >
                Click any stock to view chart
              </div>
            </div>
            <button
              className="btn-hov"
              onClick={loadTopStocks}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                border: `1px solid ${border}`,
                background: "transparent",
                color: textSecondary,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.85rem",
              }}
            >
              🔄
            </button>
          </div>
          {loadingAllStocks ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "36px 0",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: `3px solid ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  borderTopColor: "#22c55e",
                }}
                className="spin"
              />
              <p style={{ color: textSecondary, fontSize: "0.84rem" }}>
                Loading market data…
              </p>
            </div>
          ) : (
            <div style={{ padding: "14px" }}>
              <div className="market-grid">
                {allStocks.map((stock, i) => (
                  <button
                    key={i}
                    className="stock-card"
                    onClick={() => {
                      setSelectedStockForChart(stock);
                      setShowChartModal(true);
                    }}
                    style={{
                      padding: "12px",
                      borderRadius: 12,
                      background: d ? "rgba(255,255,255,0.04)" : "#f8fafc",
                      border: `1px solid ${border}`,
                      textAlign: "left",
                      width: "100%",
                      fontFamily: "inherit",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 5,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 800,
                          color: textPrimary,
                        }}
                      >
                        {stock.symbol}
                      </div>
                      <span
                        style={{
                          fontSize: "0.62rem",
                          padding: "1px 6px",
                          borderRadius: 20,
                          background: "rgba(59,130,246,0.12)",
                          color: d ? "#93c5fd" : "#2563eb",
                          fontWeight: 700,
                        }}
                      >
                        NSE
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: textMuted,
                        marginBottom: 6,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {stock.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.92rem",
                        fontWeight: 900,
                        color: textPrimary,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      ₹{stock.price.toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: stock.changePercent >= 0 ? "#22c55e" : "#ef4444",
                        marginTop: 2,
                      }}
                    >
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Portfolio ── */}
        <div
          className="fade-up"
          style={{
            borderRadius: 18,
            background: surface,
            border: `1px solid ${border}`,
            overflow: "hidden",
            boxShadow: d ? "none" : "0 4px 20px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              padding: "13px 18px",
              borderBottom: `1px solid ${border}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  color: textPrimary,
                }}
              >
                My Portfolio
              </span>
              <div
                style={{ fontSize: "0.7rem", color: textMuted, marginTop: 1 }}
              >
                {investments.length} investment
                {investments.length !== 1 ? "s" : ""}
              </div>
            </div>
            {investments.length > 0 && (
              <span
                style={{
                  fontSize: "0.68rem",
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: "rgba(34,197,94,0.1)",
                  color: "#22c55e",
                  fontWeight: 700,
                  border: "1px solid rgba(34,197,94,0.2)",
                }}
              >
                ● LIVE
              </span>
            )}
          </div>
          {loading ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "48px 0",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  border: `3px solid ${d ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                  borderTopColor: "#3b82f6",
                }}
                className="spin"
              />
              <p style={{ color: textSecondary, fontSize: "0.88rem" }}>
                Loading portfolio…
              </p>
            </div>
          ) : investments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "52px 24px" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
              <p
                style={{
                  color: textSecondary,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                No investments yet
              </p>
              <p
                style={{
                  color: textMuted,
                  fontSize: "0.8rem",
                  marginTop: 4,
                  marginBottom: 18,
                }}
              >
                Start building your portfolio
              </p>
              <button
                className="btn-hov"
                onClick={() => setShowModal(true)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                + Add First Investment
              </button>
            </div>
          ) : (
            investments.map((inv, i) => {
              const invested =
                parseFloat(inv.buy_price) * (parseFloat(inv.quantity) || 1);
              const current =
                parseFloat(inv.current_price || inv.buy_price) *
                (parseFloat(inv.quantity) || 1);
              const gain = current - invested;
              const gainPct = invested > 0 ? (gain / invested) * 100 : 0;
              const tc = typeColor(inv.type);
              return (
                <div
                  key={inv.id}
                  className="row-hov"
                  style={{
                    padding: "14px 18px",
                    borderBottom:
                      i < investments.length - 1
                        ? `1px solid ${border}`
                        : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      background: tc + "18",
                      border: `1px solid ${tc}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}
                  >
                    {typeIcon(inv.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 7,
                        flexWrap: "wrap",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          color: textPrimary,
                        }}
                      >
                        {inv.name}
                      </span>
                      {inv.symbol && (
                        <>
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              padding: "1px 7px",
                              borderRadius: 20,
                              background: "rgba(59,130,246,0.12)",
                              color: d ? "#93c5fd" : "#2563eb",
                              border: "1px solid rgba(59,130,246,0.2)",
                            }}
                          >
                            {inv.symbol}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedStockForChart({
                                symbol: inv.symbol,
                                fullSymbol: inv.symbol.includes(".")
                                  ? inv.symbol
                                  : `${inv.symbol}.NS`,
                                name: inv.name,
                              });
                              setShowChartModal(true);
                            }}
                            style={{
                              fontSize: "0.68rem",
                              padding: "1px 7px",
                              borderRadius: 20,
                              background: "rgba(34,197,94,0.1)",
                              color: "#22c55e",
                              border: "1px solid rgba(34,197,94,0.2)",
                              cursor: "pointer",
                              fontWeight: 700,
                              fontFamily: "inherit",
                            }}
                          >
                            📈 Chart
                          </button>
                        </>
                      )}
                      {inv.type === "stock" && (
                        <span
                          style={{
                            fontSize: "0.65rem",
                            padding: "1px 6px",
                            borderRadius: 20,
                            background: "rgba(34,197,94,0.1)",
                            color: "#22c55e",
                            fontWeight: 700,
                          }}
                        >
                          ● LIVE
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "3px 14px",
                        fontSize: "0.74rem",
                        color: textMuted,
                      }}
                    >
                      <span>
                        Qty:{" "}
                        <strong style={{ color: textSecondary }}>
                          {parseFloat(inv.quantity || 1).toLocaleString(
                            "en-IN",
                          )}
                        </strong>
                      </span>
                      <span>
                        Buy:{" "}
                        <strong style={{ color: textSecondary }}>
                          ₹{parseFloat(inv.buy_price).toLocaleString("en-IN")}
                        </strong>
                      </span>
                      <span>
                        Current:{" "}
                        <strong style={{ color: "#3b82f6" }}>
                          ₹
                          {parseFloat(
                            inv.current_price || inv.buy_price,
                          ).toLocaleString("en-IN")}
                        </strong>
                      </span>
                      <span>
                        {new Date(inv.buy_date).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexShrink: 0,
                    }}
                  >
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: "0.92rem",
                          color: gain >= 0 ? "#22c55e" : "#ef4444",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {gain >= 0 ? "+" : ""}₹
                        {gain.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                      <div
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: gain >= 0 ? "#22c55e" : "#ef4444",
                        }}
                      >
                        ({gainPct >= 0 ? "+" : ""}
                        {gainPct.toFixed(2)}%)
                      </div>
                      <div style={{ fontSize: "0.7rem", color: textMuted }}>
                        ₹
                        {current.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: `1px solid ${border}`,
                        background: "transparent",
                        color: "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.8rem",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Chart Modal ── */}
      {showChartModal && selectedStockForChart && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            className="modal-box"
            style={{
              background: d ? "#0d1224" : "#fff",
              border: `1px solid ${border}`,
              borderRadius: 22,
              padding: "20px",
              width: "100%",
              maxWidth: 900,
              maxHeight: "95vh",
              overflow: "auto",
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 800,
                    fontSize: "1rem",
                    color: textPrimary,
                  }}
                >
                  📈 {selectedStockForChart.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: textMuted }}>
                  {selectedStockForChart.symbol} · Live Chart
                </div>
              </div>
              <button
                onClick={() => {
                  setShowChartModal(false);
                  setSelectedStockForChart(null);
                }}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: `1px solid ${border}`,
                  background: "transparent",
                  color: textSecondary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 14,
              }}
            >
              {[
                { l: "1m", v: "1" },
                { l: "5m", v: "5" },
                { l: "15m", v: "15" },
                { l: "30m", v: "30" },
                { l: "1H", v: "60" },
                { l: "1D", v: "1d" },
                { l: "1W", v: "1w" },
                { l: "1M", v: "1m" },
              ].map((iv) => (
                <button
                  key={iv.v}
                  onClick={() => setChartInterval(iv.v)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 8,
                    border: `1px solid ${chartInterval === iv.v ? "rgba(59,130,246,0.5)" : border}`,
                    background:
                      chartInterval === iv.v
                        ? "linear-gradient(135deg,#3b82f6,#8b5cf6)"
                        : "transparent",
                    color: chartInterval === iv.v ? "#fff" : textSecondary,
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {iv.l}
                </button>
              ))}
            </div>
            <div style={{ borderRadius: 12, overflow: "hidden" }}>
              <div ref={tradingViewContainerRef} id="tradingview_widget" />
            </div>
          </div>
        </div>
      )}

      {/* ── Add Investment Modal ── */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 50,
            overflowY: "auto",
          }}
        >
          <div
            className="modal-box"
            style={{
              background: d ? "#0d1224" : "#fff",
              border: `1px solid ${border}`,
              borderRadius: 22,
              padding: "24px",
              width: "100%",
              maxWidth: 520,
              maxHeight: "92vh",
              overflowY: "auto",
              boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              margin: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1rem",
                  }}
                >
                  📈
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "1rem",
                    color: textPrimary,
                  }}
                >
                  Add Investment
                </span>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setLivePrice(null);
                  setStockSearch("");
                  setSearchResults([]);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  border: `1px solid ${border}`,
                  background: "transparent",
                  color: textSecondary,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 13 }}
            >
              {/* ── Investment Type — custom dropdown replaces native select ── */}
              <div>
                <label style={labelStyle}>Investment Type *</label>
                <TypeDropdown
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val })}
                  isDark={d}
                  textPrimary={textPrimary}
                  textSecondary={textSecondary}
                  border={border}
                  inputBg={inputBg}
                  inputBorder={inputBorder}
                />
              </div>

              {formData.type === "stock" && (
                <div>
                  <label style={labelStyle}>
                    Search Indian Stock (NSE/BSE)
                  </label>
                  <input
                    type="text"
                    value={stockSearch}
                    onChange={(e) => {
                      setStockSearch(e.target.value);
                      searchStocks(e.target.value);
                    }}
                    style={inputStyle}
                    placeholder="Type: Reliance, TCS, HDFC…"
                    autoComplete="off"
                  />
                  {searching && (
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: textMuted,
                        marginTop: 4,
                      }}
                    >
                      Searching…
                    </p>
                  )}
                  {searchResults.length > 0 && (
                    <div
                      style={{
                        marginTop: 6,
                        borderRadius: 10,
                        border: `1px solid ${inputBorder}`,
                        overflow: "hidden",
                        maxHeight: 200,
                        overflowY: "auto",
                        background: d ? "#0d1224" : "#fff",
                      }}
                    >
                      {searchResults.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => selectStock(s)}
                          style={{
                            width: "100%",
                            padding: "9px 13px",
                            textAlign: "left",
                            background:
                              i % 2 === 0
                                ? d
                                  ? "rgba(255,255,255,0.03)"
                                  : "#f8fafc"
                                : "transparent",
                            border: "none",
                            borderBottom: `1px solid ${inputBorder}`,
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontFamily: "inherit",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "0.85rem",
                                color: textPrimary,
                              }}
                            >
                              {s.symbol}
                            </div>
                            <div
                              style={{
                                fontSize: "0.74rem",
                                color: textSecondary,
                              }}
                            >
                              {s.name}
                            </div>
                          </div>
                          <span
                            style={{ color: "#3b82f6", fontSize: "0.85rem" }}
                          >
                            →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {livePrice && (
                <div
                  style={{
                    padding: "9px 13px",
                    borderRadius: 10,
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.25)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#22c55e",
                    }}
                  >
                    🟢 Live: {livePrice.symbol} · ₹
                    {livePrice.price.toLocaleString("en-IN")}
                  </span>
                </div>
              )}

              <div>
                <label style={labelStyle}>Investment Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  style={inputStyle}
                  placeholder="e.g., Reliance Industries"
                  required
                />
              </div>

              <div className="form-grid2">
                <div>
                  <label style={labelStyle}>Symbol</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        symbol: e.target.value.toUpperCase(),
                      })
                    }
                    style={inputStyle}
                    placeholder="RELIANCE"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Quantity *</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    style={inputStyle}
                    placeholder="10"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Purchase Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.buy_price}
                    onChange={(e) =>
                      setFormData({ ...formData, buy_price: e.target.value })
                    }
                    style={inputStyle}
                    placeholder="2500"
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Purchase Date *</label>
                  <input
                    type="date"
                    value={formData.buy_date}
                    onChange={(e) =>
                      setFormData({ ...formData, buy_date: e.target.value })
                    }
                    style={inputStyle}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Current Price{" "}
                  <span style={{ fontWeight: 400, textTransform: "none" }}>
                    (auto-filled)
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.current_price}
                  readOnly
                  style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }}
                  placeholder="Auto from live data"
                />
              </div>

              <div>
                <label style={labelStyle}>
                  Notes{" "}
                  <span style={{ fontWeight: 400, textTransform: "none" }}>
                    (optional)
                  </span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  style={{ ...inputStyle, resize: "none", minHeight: 68 }}
                  placeholder="Add notes…"
                  rows={3}
                />
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setLivePrice(null);
                    setStockSearch("");
                    setSearchResults([]);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: "transparent",
                    color: textSecondary,
                    fontWeight: 600,
                    fontSize: "0.86rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-hov"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.86rem",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 4px 14px rgba(59,130,246,0.35)",
                  }}
                >
                  ✓ Add Investment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
