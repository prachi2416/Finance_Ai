// stockService.js - Fixed: removed Supabase, uses Yahoo Finance API directly

const YAHOO_PROXY = "https://query1.finance.yahoo.com/v8/finance/chart/";
const YAHOO_SEARCH = "https://query1.finance.yahoo.com/v1/finance/search";

export const fetchStockPrice = async (symbol) => {
  try {
    const symbolVariations = [
      symbol.includes(".") ? symbol : `${symbol}.NS`,
      `${symbol}.BO`,
      symbol,
    ];

    for (const symbolVar of symbolVariations) {
      try {
        const res = await fetch(
          `https://corsproxy.io/?${encodeURIComponent(
            `${YAHOO_PROXY}${symbolVar}?interval=1d&range=1d`,
          )}`,
        );
        if (!res.ok) continue;
        const data = await res.json();
        const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
        if (price && !isNaN(price) && price > 0) {
          return parseFloat(price);
        }
      } catch {
        continue;
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching live price for", symbol, ":", error);
    return null;
  }
};

export const searchStocks = async (query) => {
  try {
    const res = await fetch(
      `https://corsproxy.io/?${encodeURIComponent(
        `${YAHOO_SEARCH}?q=${encodeURIComponent(query)}&quotesCount=20&newsCount=0`,
      )}`,
    );
    if (!res.ok) return [];
    const data = await res.json();

    if (data.quotes && data.quotes.length > 0) {
      const indianStocks = data.quotes
        .filter(
          (stock) =>
            (stock.exchDisp === "NSE" ||
              stock.exchDisp === "BSE" ||
              stock.exchange === "NSI" ||
              stock.exchange === "BOM" ||
              stock.symbol?.includes(".NS") ||
              stock.symbol?.includes(".BO")) &&
            stock.quoteType === "EQUITY",
        )
        .slice(0, 10)
        .map((stock) => ({
          symbol: stock.symbol.replace(".NS", "").replace(".BO", ""),
          name: stock.shortname || stock.longname || stock.symbol,
          fullSymbol: stock.symbol,
          exchange:
            stock.exchDisp || (stock.symbol?.includes(".NS") ? "NSE" : "BSE"),
          type: "Equity",
          region: "India",
          currency: "INR",
        }));

      if (indianStocks.length > 0) return indianStocks;
    }
    return [];
  } catch (error) {
    console.error("Error searching stocks:", error);
    return [];
  }
};

export const fetchStockInfo = async (symbol) => {
  try {
    const res = await fetch(
      `https://corsproxy.io/?${encodeURIComponent(
        `${YAHOO_PROXY}${symbol}?interval=1d&range=5d`,
      )}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const closes = result.indicators?.quote?.[0]?.close || [];
    let change = 0;
    let changePercent = 0;

    if (closes.length >= 2) {
      const prev = closes[closes.length - 2];
      const curr = meta.regularMarketPrice;
      if (prev && curr) {
        change = curr - prev;
        changePercent = (change / prev) * 100;
      }
    }

    return {
      name: meta.longName || meta.shortName || symbol,
      change,
      changePercent,
    };
  } catch (error) {
    console.error("Error fetching stock info:", error);
    return null;
  }
};

export const fetchChartData = async (symbol) => {
  try {
    const symbolVar = symbol.includes(".") ? symbol : `${symbol}.NS`;
    const res = await fetch(
      `https://corsproxy.io/?${encodeURIComponent(
        `${YAHOO_PROXY}${symbolVar}?interval=5m&range=1d`,
      )}`,
    );
    if (!res.ok) return [];
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return [];

    const timestamps = result.timestamp || [];
    const prices = result.indicators?.quote?.[0]?.close || [];

    return timestamps
      .map((timestamp, index) => ({
        time: new Date(timestamp * 1000).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: prices[index] || 0,
      }))
      .filter((point) => point.price > 0);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return [];
  }
};
