import { useState, useEffect, useRef } from "react";

// DEMO DATA & FINANCE BRAIN (preserved exactly)
const DEMO_DATA = {
  totalIncome: 85000,
  totalExpenses: 52000,
  netSavings: 33000,
  totalInvested: 120000,
  currentInvestmentValue: 138000,
  investmentGain: 18000,
  monthlyIncome: 85000,
  monthlyExpenses: 52000,
  monthlySavings: 33000,
  categoryBreakdown: {
    "Food & Dining": 12000,
    Transportation: 8000,
    Shopping: 15000,
    Entertainment: 5000,
    "Bills & Utilities": 7000,
  },
  incomeSourceBreakdown: { Salary: 70000, Freelance: 15000 },
  investmentBreakdown: {
    "Reliance Industries": {
      symbol: "RELIANCE",
      quantity: 10,
      buyPrice: 2400,
      currentPrice: 2650,
      invested: 24000,
      currentValue: 26500,
      gainPercent: 10.4,
    },
    TCS: {
      symbol: "TCS",
      quantity: 5,
      buyPrice: 3500,
      currentPrice: 3820,
      invested: 17500,
      currentValue: 19100,
      gainPercent: 9.1,
    },
  },
  goals: [
    { name: "Emergency Fund", target_amount: 300000, current_amount: 120000 },
    { name: "Vacation Fund", target_amount: 80000, current_amount: 35000 },
  ],
  subscriptions: [
    { name: "Netflix", amount: 649 },
    { name: "Spotify", amount: 119 },
    { name: "Amazon Prime", amount: 1499 },
  ],
  name: "Arjun",
  profession: "Software Engineer",
};

class FinanceBrain {
  constructor(data) {
    this.d = data || {};
    this.income = data?.totalIncome || 0;
    this.expenses = data?.totalExpenses || 0;
    this.savings = data?.netSavings || 0;
    this.invested = data?.totalInvested || 0;
    this.investVal = data?.currentInvestmentValue || 0;
    this.investGain = data?.investmentGain || 0;
    this.monthlyIncome = data?.monthlyIncome || data?.totalIncome || 0;
    this.monthlyExpenses = data?.monthlyExpenses || data?.totalExpenses || 0;
    this.monthlySavings = data?.monthlySavings || data?.netSavings || 0;
    this.savingsRate = this.income > 0 ? (this.savings / this.income) * 100 : 0;
    this.fmt = (n) => (n || 0).toLocaleString("en-IN");
    this.fmtL = (n) => {
      n = n || 0;
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} cr`;
      if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
      return `₹${n.toLocaleString("en-IN")}`;
    };
  }
  detect(q) {
    q = q.toLowerCase();
    const has = (...w) => w.some((x) => q.includes(x));
    if (
      has(
        "overview",
        "summary",
        "how am i",
        "financial health",
        "report",
        "snapshot",
        "doing",
      )
    )
      return "overview";
    if (
      has(
        "tax",
        "80c",
        "80d",
        "itr",
        "income tax",
        "deduction",
        "tds",
        "ltcg",
        "stcg",
        "hra",
        "old regime",
        "new regime",
      )
    )
      return "tax";
    if (
      has(
        "sip",
        "mutual fund",
        "mf",
        "elss",
        "index fund",
        "flexi",
        "large cap",
        "mid cap",
        "small cap",
        "lump sum",
        "nav",
      )
    )
      return "mutualfund";
    if (
      has(
        "stock",
        "share",
        "nse",
        "bse",
        "nifty",
        "sensex",
        "reliance",
        "tcs",
        "hdfc",
        "infosys",
        "itc",
        "p/e",
        "portfolio",
        "invest in stock",
      )
    )
      return "stocks";
    if (has("car", "vehicle", "bike", "two wheeler", "four wheeler"))
      return "car";
    if (
      has(
        "home loan",
        "house",
        "property",
        "flat",
        "apartment",
        "real estate",
        "reit",
        "rental",
        "mortgage",
      )
    )
      return "realestate";
    if (
      has("loan", "emi", "personal loan", "borrow", "debt", "repay", "prepay")
    )
      return "loan";
    if (
      has(
        "insurance",
        "term",
        "life insurance",
        "health insurance",
        "ulip",
        "premium",
        "policy",
      )
    )
      return "insurance";
    if (
      has("retire", "retirement", "fire", "financial independence", "pension")
    )
      return "retirement";
    if (
      has(
        "ppf",
        "epf",
        "fd",
        "fixed deposit",
        "recurring",
        "nsc",
        "gold bond",
        "sgb",
        "sovereign",
      )
    )
      return "savings_inst";
    if (has("credit score", "cibil", "credit card", "credit utilization"))
      return "credit";
    if (has("crypto", "bitcoin", "ethereum", "web3", "nft", "blockchain"))
      return "crypto";
    if (
      has(
        "budget",
        "50 30 20",
        "overspend",
        "cut expense",
        "save more",
        "reduce",
      )
    )
      return "budgeting";
    if (has("goal", "target", "dream", "emergency fund")) return "goals";
    if (
      has(
        "invest",
        "where to invest",
        "how to invest",
        "should i invest",
        "beginner",
      )
    )
      return "invest_general";
    if (
      has(
        "salary",
        "income",
        "raise",
        "freelance",
        "side income",
        "passive income",
      )
    )
      return "income_growth";
    if (has("subscription", "netflix", "prime", "spotify", "ott", "streaming"))
      return "subscriptions";
    if (
      has(
        "inflation",
        "recession",
        "market crash",
        "rbi",
        "repo rate",
        "economy",
        "macro",
      )
    )
      return "economy";
    if (
      has(
        "hello",
        "hi",
        "hey",
        "who are you",
        "what can you",
        "help",
        "what do you",
      )
    )
      return "greeting";
    if (
      has(
        "iphone",
        "samsung",
        "phone",
        "mobile",
        "laptop",
        "macbook",
        "tv",
        "gadget",
        "purchase",
        "afford",
        "buy",
        "can i get",
        "should i buy",
      )
    )
      return "purchase";
    return "general";
  }
  answer(q) {
    const intent = this.detect(q);
    const map = {
      overview: () => this.overview(),
      tax: () => this.tax(),
      mutualfund: () => this.mutualfund(),
      stocks: () => this.stocks(q),
      purchase: () => this.purchase(q),
      car: () => this.car(q),
      realestate: () => this.realestate(),
      loan: () => this.loan(q),
      insurance: () => this.insurance(),
      retirement: () => this.retirement(),
      savings_inst: () => this.savings_inst(),
      credit: () => this.credit(),
      crypto: () => this.crypto(),
      budgeting: () => this.budgeting(),
      goals: () => this.goals(),
      invest_general: () => this.investGeneral(),
      income_growth: () => this.income_growth(),
      subscriptions: () => this.subscriptions(),
      economy: () => this.economy(),
      greeting: () => this.greeting(),
    };
    return map[intent] ? map[intent]() : this.general(q);
  }
  overview() {
    const grade =
      this.savingsRate > 35
        ? "A+"
        : this.savingsRate > 25
          ? "A"
          : this.savingsRate > 18
            ? "B"
            : this.savingsRate > 10
              ? "C"
              : "D";
    const ge = { "A+": "🌟", A: "✅", B: "👍", C: "⚠️", D: "🚨" }[grade];
    const emerTarget = this.expenses * 6;
    const emerOk = this.savings >= emerTarget;
    const topExp = Object.entries(this.d.categoryBreakdown || {}).sort(
      (a, b) => b[1] - a[1],
    )[0];
    const retirn =
      this.invested > 0
        ? ((this.investGain / this.invested) * 100).toFixed(1)
        : 0;
    let r = `## 📊 Financial Health Report — Grade: ${grade} ${ge}\n\n**💰 Monthly Cash Flow**\n`;
    r += `• Income: ${this.fmtL(this.monthlyIncome)} | Expenses: ${this.fmtL(this.monthlyExpenses)} | Savings: ${this.fmtL(this.monthlySavings)}\n`;
    r += `• Savings rate: **${this.savingsRate.toFixed(1)}%** ${this.savingsRate > 25 ? "(Excellent ✅)" : this.savingsRate > 18 ? "(Good 👍)" : this.savingsRate > 10 ? "(Needs work ⚠️)" : "(Critical 🚨)"}\n\n`;
    r += `**📈 Investment Portfolio**\n• Invested: ${this.fmtL(this.invested)} → Current: ${this.fmtL(this.investVal)}\n• Return: ${this.investGain >= 0 ? "+" : ""}${this.fmtL(this.investGain)} (${retirn}%)\n`;
    if (this.d.investmentBreakdown)
      Object.entries(this.d.investmentBreakdown).forEach(([n, inv]) => {
        r += `  • ${n}: ${this.fmtL(inv.currentValue)} | ${inv.gainPercent >= 0 ? "+" : ""}${inv.gainPercent.toFixed(1)}%\n`;
      });
    r += `\n**🏥 Health Checks**\n• Emergency fund: ${emerOk ? "✅ Adequate" : `❌ Short by ${this.fmtL(emerTarget - this.savings)}`}\n`;
    if (topExp)
      r += `• Top expense: ${topExp[0]} — ${this.fmtL(Math.round(topExp[1] / 12))}/month\n`;
    r += `\n**✅ Strengths:**\n`;
    if (this.savingsRate > 20)
      r += `• Strong savings — top ${this.savingsRate > 35 ? "5%" : "20%"} of Indians\n`;
    if (this.investGain > 0)
      r += `• Portfolio profitable — wealth is growing\n`;
    r += `\n**🔧 Priority Actions:**\n`;
    if (!emerOk)
      r += `• Build emergency fund — save ${this.fmtL(Math.round((emerTarget - this.savings) / 6))}/month\n`;
    if (this.savingsRate < 20)
      r += `• Raise savings rate to 20%+ from ${this.savingsRate.toFixed(1)}%\n`;
    r += `\n**➡️ Do this today:** ${!emerOk ? `Auto-transfer ${this.fmtL(Math.round((emerTarget - this.savings) / 6))}/month to a liquid fund` : `Increase SIP to ${this.fmtL(Math.round(this.monthlySavings * 0.5))}/month`}`;
    return r;
  }
  tax() {
    const inc = this.income;
    const taxable = Math.max(0, inc - 75000);
    let tax = 0;
    if (taxable > 300000) tax += Math.min(taxable - 300000, 400000) * 0.05;
    if (taxable > 700000) tax += Math.min(taxable - 700000, 300000) * 0.1;
    if (taxable > 1000000) tax += Math.min(taxable - 1000000, 200000) * 0.15;
    if (taxable > 1200000) tax += Math.min(taxable - 1200000, 300000) * 0.2;
    if (taxable > 1500000) tax += (taxable - 1500000) * 0.3;
    const rebate = taxable <= 700000 ? Math.min(tax, 25000) : 0;
    const newTax = Math.round(Math.max(0, tax - rebate) * 1.04);
    const deductions = Math.min(150000, inc * 0.15) + 50000 + 25000;
    const oldTaxable = Math.max(0, inc - deductions - 50000);
    let oldTax = 0;
    if (oldTaxable > 250000)
      oldTax += Math.min(oldTaxable - 250000, 250000) * 0.05;
    if (oldTaxable > 500000)
      oldTax += Math.min(oldTaxable - 500000, 500000) * 0.2;
    if (oldTaxable > 1000000) oldTax += (oldTaxable - 1000000) * 0.3;
    const oldFinal = Math.round(
      Math.max(
        0,
        oldTax - (oldTaxable <= 500000 ? Math.min(oldTax, 12500) : 0),
      ) * 1.04,
    );
    const better = newTax <= oldFinal ? "New Regime" : "Old Regime";
    const taxSaving = Math.abs(newTax - oldFinal);
    return `## 🧾 Tax Analysis — FY 2025-26\n\n**Annual Income: ${this.fmtL(inc)}**\n\n**New Tax Regime:** Tax Payable: **${this.fmtL(newTax)}** ${taxable <= 700000 ? "→ ₹0 after 87A rebate ✅" : ""}\n**Old Tax Regime:** Tax Payable: **${this.fmtL(oldFinal)}**\n\n**✅ Use ${better}** — saves you ${this.fmtL(taxSaving)}/year\n\n---\n\n**💡 Key Deductions:**\n• **80C (₹1.5L):** ELSS MF, PPF, EPF, NSC\n• **80D:** Health insurance up to ₹25,000 (self) + ₹25,000 (parents)\n• **80CCD(1B):** NPS extra ₹50,000\n• **LTCG:** Hold equity >1yr → first ₹1.25L profit = zero tax\n• **STCG:** Sell within 1yr → 20% tax\n\n**➡️ Action:** ${inc <= 775000 ? "You're in the ZERO tax bracket under New Regime! File ITR by July 31" : `Invest ₹1.5L in ELSS before March 31 → saves ${this.fmtL(Math.round(150000 * (inc > 1000000 ? 0.3 : 0.2)))} immediately`}`;
  }
  mutualfund() {
    const sip = Math.max(500, Math.round(this.monthlySavings * 0.4));
    const v10 = Math.round(sip * ((Math.pow(1.01, 120) - 1) / 0.01));
    const v20 = Math.round(sip * ((Math.pow(1.01, 240) - 1) / 0.01));
    return `## 🏦 Mutual Fund Guide\n\n**Your SIP Capacity: ${this.fmtL(sip)}/month**\n\n**Growth at 12% CAGR:**\n• 5 years: ${this.fmtL(Math.round(sip * ((Math.pow(1.01, 60) - 1) / 0.01)))}\n• 10 years: **${this.fmtL(v10)}**\n• 20 years: **${this.fmtL(v20)}**\n\n---\n\n**🎯 Recommended Portfolio:**\n• **Core (60%)** — Nifty 50 Index Fund: ${this.fmtL(Math.round(sip * 0.6))}/month\n  Best: Mirae Nifty 50, UTI Nifty 50\n• **Growth (25%)** — Flexi-Cap Fund: ${this.fmtL(Math.round(sip * 0.25))}/month\n  Best: Parag Parikh Flexi Cap, HDFC Flexi Cap\n• **High Growth (15%)** — Mid Cap: ${this.fmtL(Math.round(sip * 0.15))}/month\n  Best: Mirae Midcap, Nippon India Mid Cap\n\n**For Tax Saving:** ELSS (3yr lock-in, 80C benefit)\nBest: Quant ELSS, Mirae Tax Saver\n\n**❌ Avoid:** Regular plans, NFOs, ULIPs, chasing last year's top fund\n\n**➡️ Action:** Open Groww → start ${this.fmtL(sip)}/month SIP in Nifty 50 Index Fund`;
  }
  stocks(q) {
    const hasPort =
      this.d.investmentBreakdown &&
      Object.keys(this.d.investmentBreakdown).length > 0;
    const monthly = Math.round(this.monthlySavings * 0.3);
    let r = `## 📈 Stock Market Guidance\n\n`;
    if (hasPort) {
      r += `**Your Portfolio:**\n`;
      Object.entries(this.d.investmentBreakdown).forEach(([name, inv]) => {
        r += `• **${name}**: ${this.fmtL(inv.currentValue)} | ${inv.gainPercent >= 0 ? "+" : ""}${inv.gainPercent.toFixed(1)}% ${inv.gainPercent > 15 ? "🔥" : inv.gainPercent > 0 ? "✅" : "⚠️"}\n`;
      });
      r += `• **Total:** ${this.fmtL(this.investVal)} (${this.investGain >= 0 ? "+" : ""}${this.fmtL(this.investGain)})\n\n`;
    }
    r += `**Monthly Budget: ${this.fmtL(monthly)}**\n\n**📊 Bluechip Picks:**\n• **Reliance Industries** — diversified, Jio + Retail\n• **TCS / Infosys** — IT leaders, dollar revenues\n• **HDFC Bank** — best private bank, 20yr track record\n• **ITC** — FMCG, high dividend yield ~3%\n• **L&T** — infra play, capex beneficiary\n\n**📊 Growth Picks:**\n• Tata Motors (EV story), Dixon Tech (PLI), Zomato (profitable now)\n\n**✅ Buy When:** P/E below sector avg, D/E < 1, ROE > 15% for 5yrs\n**❌ Avoid:** Penny stocks, F&O without experience, Telegram tips\n\n**➡️ Action:** ${hasPort ? `Diversify beyond ${Object.keys(this.d.investmentBreakdown).slice(0, 2).join(" & ")} — add HDFC Bank` : `Open Zerodha demat → start with Nifty 50 ETF (BeES)`}`;
    return r;
  }
  purchase(q) {
    const ql = q.toLowerCase();
    let price = 80000;
    const pm = q.match(/[₹]?\s*(\d[\d,]*)/);
    if (pm) price = parseInt(pm[1].replace(/,/g, ""));
    let item = "this purchase";
    if (ql.includes("iphone")) {
      item = "iPhone";
      if (ql.includes("17")) price = Math.max(price, 130000);
      else price = Math.max(price, 90000);
    } else if (ql.includes("macbook")) {
      item = "MacBook";
      price = Math.max(price, 120000);
    } else if (ql.includes("laptop")) item = "Laptop";
    else if (ql.includes("samsung")) item = "Samsung Phone";
    else if (ql.includes("tv")) {
      item = "TV";
      price = Math.max(price, 35000);
    }
    const pctOfSavings = this.savings > 0 ? (price / this.savings) * 100 : 999;
    const monthsToSave =
      this.monthlySavings > 0 ? Math.ceil(price / this.monthlySavings) : 99;
    const emerOk = this.savings >= this.expenses * 6;
    const canAfford = pctOfSavings < 40 && this.monthlySavings > price / 8;
    const emi6 = Math.round(price / 6);
    const emi12 = Math.round((price * 1.012) / 12);
    return `## 🛍️ Purchase Analysis: ${item} — ${this.fmtL(price)}\n\n**Verdict: ${canAfford && emerOk ? "✅ Yes, you can afford it" : canAfford && !emerOk ? "🤔 Possible but risky" : "⚠️ Better to wait"}**\n\n---\n\n**Affordability Numbers:**\n• Monthly savings: ${this.fmtL(this.monthlySavings)}\n• This purchase = **${pctOfSavings.toFixed(0)}% of your savings**\n• Time to save: ${monthsToSave} months at current pace\n• Emergency fund: ${emerOk ? "✅ Covered" : `❌ Need ${this.fmtL(this.expenses * 6 - this.savings)} more first`}\n\n**💡 Smartest Ways to Buy:**\n• No-cost EMI: 6 months = ${this.fmtL(emi6)}/month | 12 months = ${this.fmtL(emi12)}/month\n• Wait for sales: ₹8,000–20,000 off on Amazon/Flipkart\n• Consider last year's model — 25-30% cheaper\n\n**❌ Never:** Personal loan for gadgets (10-24% interest)\n\n**➡️ Recommendation:** ${canAfford && emerOk ? `Go ahead with no-cost EMI — ${this.fmtL(emi6)}/month for 6 months` : `Build emergency fund first, then buy guilt-free`}`;
  }
  car(q) {
    let carPrice = 800000;
    const pm = q.match(/(\d+[\d.]*)\s*(lakh|l\b|lac)/i);
    if (pm) carPrice = parseFloat(pm[1]) * 100000;
    const dp = Math.round(carPrice * 0.25);
    const loan = carPrice - dp;
    const r8 = 0.087 / 12;
    const n = 60;
    const emi = Math.round(
      (loan * r8 * Math.pow(1 + r8, n)) / (Math.pow(1 + r8, n) - 1),
    );
    const totalInt = emi * n - loan;
    const safeEmi = Math.round(this.monthlyIncome * 0.2);
    return `## 🚗 Car Purchase — ${this.fmtL(carPrice)}\n\n**Safe EMI limit (20% rule): ${this.fmtL(safeEmi)}/month**\n\n**Loan Breakdown (25% down, 5yr @ 8.7%):**\n• Down Payment: ${this.fmtL(dp)}\n• Monthly EMI: **${this.fmtL(emi)}** (${((emi / this.monthlyIncome) * 100).toFixed(0)}% of income)\n• Total interest: ${this.fmtL(Math.round(totalInt))}\n\n**Verdict: ${emi <= safeEmi ? "✅ Within safe limit" : "⚠️ Exceeds 20% income rule"}**\n\n**Real Monthly Cost:**\n• EMI + Fuel + Insurance + Maintenance ≈ ${this.fmtL(emi + 8000)}+/month\n\n**Best Rates:** SBI 8.5% | HDFC 8.7% | ICICI 8.75%\n\n**Down Payment:** ${dp <= this.savings ? `✅ You have ${this.fmtL(this.savings)} — sufficient` : `❌ Need ${this.fmtL(dp - this.savings)} more`}\n\n**➡️ Action:** ${dp > this.savings ? `Save ${this.fmtL(Math.round((dp - this.savings) / 6))}/month for 6 months` : `Get SBI pre-approved car loan — better dealership negotiation`}`;
  }
  insurance() {
    const termCover = Math.round(this.income * 20);
    return `## 🛡️ Insurance Planning\n\n**1. 🔴 Term Life (HIGHEST PRIORITY)**\n• Cover: **${this.fmtL(termCover)}** (20x annual income)\n• Annual Premium: ~₹${Math.round((termCover / 10000000) * 9000).toLocaleString("en-IN")} for non-smoker\n• Best: HDFC Click2Protect, ICICI iProtect, LIC Tech Term\n• **Buy ONLINE** — 20-30% cheaper than agent\n• ❌ NEVER buy ULIP — terrible as investment\n\n**2. 🔵 Health Insurance**\n• Min ₹5L individual, ₹10-15L for family\n• Add Super Top-Up (₹20-25L cover @ ₹4-6k/year)\n• Best: Niva Bupa Reassure, Star Health Optima Restore\n\n**3. Motor Insurance**\n• Add "Zero Depreciation" for cars < 5 years\n\n**Tax Benefits:** 80D saves ${this.fmtL(Math.round(50000 * (this.income > 1000000 ? 0.3 : 0.2)))}/year\n\n**➡️ Action:** Get term quote on PolicyBazaar right now — 10 minutes, most critical protection you can have`;
  }
  retirement() {
    const yrs = 32;
    const inflExp = this.monthlyExpenses * Math.pow(1.06, yrs);
    const corpus = inflExp * 12 * 25;
    const sipNeeded = Math.round(
      corpus / ((Math.pow(1.01, yrs * 12) - 1) / 0.01),
    );
    return `## 🌅 Retirement Planning\n\n**Your FIRE Number: ${this.fmtL(Math.round(corpus))}**\n*(Current expenses inflated at 6% for ${yrs} years × 25)*\n\nRequired SIP (12% CAGR): **${this.fmtL(sipNeeded)}/month**\nYour current savings: ${this.fmtL(this.monthlySavings)}/month\n**Status:** ${sipNeeded <= this.monthlySavings ? "✅ On track!" : `Gap: ${this.fmtL(sipNeeded - this.monthlySavings)}/month`}\n\n---\n\n**Best Retirement Vehicles:**\n• **EPF** — 8.25% p.a., never break early\n• **PPF** — 7.1%, tax-free maturity, invest ₹12,500/month\n• **NPS** — 10-12% returns + extra ₹50k tax deduction\n• **Equity SIP** — 12-15% CAGR, best long-term wealth creator\n\n**Asset Allocation:**\n• Age 20-35: 80% equity + 20% debt\n• Age 35-50: 60% equity + 40% debt\n\n**➡️ Action:** Start NPS at eNPS.nsdl.com — extra ₹50k deduction + professional management`;
  }
  savings_inst() {
    const ppfMonthly = Math.round(Math.min(150000, this.income * 0.1) / 12);
    const ppf15 = Math.round(
      ppfMonthly * 12 * ((Math.pow(1.071, 15) - 1) / 0.071) * 1.071,
    );
    return `## 🏦 Savings Instruments\n\n**1. PPF — Best Safe Return**\n• Rate: 7.1% p.a. (tax-free, govt guaranteed)\n• ${this.fmtL(ppfMonthly)}/month for 15 years → **${this.fmtL(ppf15)} tax-free!**\n\n**2. EPF** — 8.25% p.a., highest guaranteed rate\n\n**3. Fixed Deposits**\n• SBI/HDFC: 6.8-7% | Small Finance Banks: 8-9%\n• Use for emergency fund + short-term goals\n\n**4. Sovereign Gold Bond (SGB)**\n• 2.5% interest + gold appreciation\n• Tax-FREE if held 8 years\n• Better than physical gold or Gold ETF long-term\n\n**5. NPS** — 10-12% returns + extra ₹50k tax deduction\n\n**Optimal allocation of ${this.fmtL(this.monthlySavings)}/month:**\n• Emergency (liquid MF): ${this.fmtL(Math.round(this.monthlySavings * 0.25))}/month\n• PPF: ${this.fmtL(ppfMonthly)}/month\n• Equity SIP: ${this.fmtL(Math.round(this.monthlySavings * 0.45))}/month\n\n**➡️ Action:** Open PPF at SBI online — start with ₹500/month`;
  }
  credit() {
    return `## 💳 CIBIL Score Guide\n\n**Score Ranges:**\n• 750-900: ✅ Excellent — best rates\n• 700-749: 👍 Good — most loans approved\n• 650-699: ⚠️ Fair — higher rates\n• Below 650: ❌ Poor — most rejected\n\n**What Affects It:**\n• Payment history (35%) — single biggest factor\n• Credit utilization (30%) — keep below 30%\n• Credit age (15%) — don't close old cards\n• New inquiries (10%) — space out applications\n\n**🔼 How to Improve:**\n• Pay ALL bills on time — set auto-pay\n• Keep card usage < 30% of limit\n• Never close your oldest card\n• Check CIBIL report every 6 months\n\n**Credit Card Rules:**\n• ✅ Always pay FULL outstanding (not minimum)\n• ❌ Minimum due = 36-42% annual interest\n• ❌ Never withdraw cash (3% fee + instant interest)\n\n**➡️ Action:** Check free score on Bajaj Finserv / Paytm — 2 minutes`;
  }
  crypto() {
    return `## ₿ Crypto in India — Honest View\n\n**🚨 Tax Reality:**\n• 30% flat tax on ALL profits\n• 1% TDS on every sell above ₹10,000\n• Cannot offset crypto losses against stock gains\n\n**Example:** Invest ₹1L → grows to ₹2L → Tax = ₹31,200\nYou need 31%+ gains just to beat an FD!\n\n**If You Invest:**\n• Max 2-5% of portfolio — only money you can lose entirely\n• For your savings: max exposure = ${this.fmtL(Math.round(this.savings * 0.04))}\n• Use only CoinDCX, CoinSwitch, WazirX\n• Stick to BTC and ETH only\n\n**Better Alternatives:**\n• Small-cap MF: 15-20% CAGR, only 12.5% LTCG\n• Mid-cap stocks: High growth, proper framework\n\n**Verdict:** Build equity MF portfolio first. Indian tax makes crypto unfavorable — need 45%+ gross returns to beat a good equity fund post-tax.\n\n**➡️ If curious:** Max ${this.fmtL(Math.round(this.savings * 0.02))} as learning experience`;
  }
  realestate() {
    const eligibility = Math.round(this.monthlyIncome * 60);
    return `## 🏠 Real Estate Guide\n\n**Home Loan Eligibility: ~${this.fmtL(eligibility)}**\n\n**Rent vs Buy — The Truth:**\n• Rental yield in major cities: 2-3% (terrible)\n• Home loan cost: 8.5% + taxes + maintenance ≈ 11-12% effective\n• **Renting is smarter** in expensive cities if you invest the difference\n\n**When Buying Makes Sense:**\n• Staying same city for 10+ years\n• EMI ≤ 40% of income\n• 20-25% down payment ready\n\n**Best Investment Options:**\n• **REITs** — Embassy, Mindspace, Brookfield\n  Buy from ₹300 on Zerodha, 7-8% yield, liquid\n• **Direct Property** — 8-10% appreciation, 2-3% rental yield\n\n**Best Locations Now:** Hyderabad, Pune, Bengaluru outskirts, Navi Mumbai\n**Overvalued:** Central Mumbai, South Delhi, Gurgaon prime\n\n**Tax Benefits (Old Regime):** Principal (80C) + Interest (Sec 24) saves ${this.fmtL(Math.round(350000 * (this.income > 1000000 ? 0.3 : 0.2)))}/year\n\n**➡️ Action:** Start with Embassy REIT on Zerodha — ₹10,000 buys ~20 units with 7%+ rental income`;
  }
  loan(q) {
    const safeTotal = Math.round(this.monthlyIncome * 0.4);
    return `## 💳 Loan & EMI Guide\n\n**Safe Total EMI Limit: ${this.fmtL(safeTotal)}/month** (40% of income)\n\n**Current Rates (2025-26):**\n• Home Loan: SBI 8.5%, HDFC 8.7%\n• Car Loan: 8.5-9.5%\n• Personal Loan: 10-24% ⚠️\n• Gold Loan: 7-9% (underrated!)\n\n**Home Loan — Smart Strategy:**\n• Eligibility: ~${this.fmtL(Math.round(this.monthlyIncome * 60))}\n• Put 20%+ down for best rates\n• Prepay in years 1-5 — max interest savings\n\n**Prepayment Magic:** On ₹50L @ 8.5%, paying ₹5k extra/month saves ~₹18L and cuts 6 years!\n\n**❌ Never:**\n• Personal loan for gadgets (wealth destruction)\n• Car EMI > 20% of income\n• Total EMIs > 40% of income\n\n**Your Loan Eligibility:**\n• Home: ~${this.fmtL(Math.round(this.monthlyIncome * 60))}\n• Car: ~${this.fmtL(Math.round(this.monthlyIncome * 36))}\n• Personal: ~${this.fmtL(Math.round(this.monthlyIncome * 24))}\n\n**➡️ Golden Rule:** You have ${this.fmtL(this.savings)} saved. A "self-loan" at 0% always beats 15% personal loan.`;
  }
  budgeting() {
    const needs = Math.round(this.monthlyIncome * 0.5);
    const wants = Math.round(this.monthlyIncome * 0.3);
    const savTarget = Math.round(this.monthlyIncome * 0.2);
    const topExps = Object.entries(this.d.categoryBreakdown || {})
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const subTotal =
      this.d.subscriptions?.reduce(
        (s, x) => s + parseFloat(x.amount || 0),
        0,
      ) || 0;
    return `## 💰 Budget Optimization\n\n**50-30-20 Rule for ${this.fmtL(this.monthlyIncome)}/month:**\n• Needs (50%): ${this.fmtL(needs)}/month\n• Wants (30%): ${this.fmtL(wants)}/month\n• Savings (20%): ${this.fmtL(savTarget)}/month\n\n**Your actual: ${this.fmtL(this.monthlySavings)}/month (${this.savingsRate.toFixed(1)}%)**\n${this.savingsRate >= 20 ? "✅ Above 20% — great!" : `⚠️ Below target — increase by ${this.fmtL(savTarget - this.monthlySavings)}/month`}\n\n**Top Expenses to Cut:**\n${topExps.map(([cat, amt]) => `• **${cat}**: ${this.fmtL(Math.round(amt / 12))}/month → Cut 15% = save ${this.fmtL(Math.round((amt / 12) * 0.15))}/month`).join("\n")}\n\n**Subscriptions: ₹${subTotal.toLocaleString("en-IN")}/month = ₹${(subTotal * 12).toLocaleString("en-IN")}/year**\n${this.d.subscriptions?.map((s) => `• ${s.name}: ₹${s.amount}/month`).join("\n") || ""}\n\n**High-Impact Habits:**\n• Pay yourself first: auto-transfer ${this.fmtL(savTarget)} on salary day\n• 48-hour rule for non-essential purchases > ₹2,000\n• Meal prep Sunday → saves ₹3-5k/month on Swiggy\n\n**➡️ Action:** Cancel one unused subscription this week → move to SIP`;
  }
  goals() {
    const goals = this.d.goals || [];
    if (!goals.length)
      return `## 🎯 Set Financial Goals!\n\n**Priority 1 — Emergency Fund**\n• Target: ${this.fmtL(this.expenses * 6)}\n• Status: ${this.savings >= this.expenses * 6 ? "✅ Achieved!" : `Need ${this.fmtL(this.expenses * 6 - this.savings)} more`}\n\n**Priority 2 — Tax Saving**\n• Invest ₹1.5L in ELSS by March 31\n\n**Priority 3 — Retirement**\n• Target: ${this.fmtL(Math.round(this.monthlyExpenses * 12 * 25))}\n• Start SIP: ${this.fmtL(Math.round(this.monthlySavings * 0.4))}/month\n\n**➡️ Add goals in the Goals section to track progress!**`;
    let r = `## 🎯 Goals Progress\n\n`;
    goals.forEach((g) => {
      const pct =
        g.target_amount > 0
          ? ((g.current_amount || 0) / g.target_amount) * 100
          : 0;
      const rem = (g.target_amount || 0) - (g.current_amount || 0);
      const months =
        this.monthlySavings > 0
          ? Math.ceil(rem / (this.monthlySavings * 0.3))
          : "∞";
      const filled = Math.floor(pct / 10);
      r += `**${g.name}**\n• ${"█".repeat(filled)}${"░".repeat(10 - filled)} ${pct.toFixed(0)}%\n• ${this.fmtL(g.current_amount)} / ${this.fmtL(g.target_amount)} — ${months} months to go\n\n`;
    });
    r += `**Tip:** Automate goal contributions on salary day. Separate account per goal prevents accidental spending.`;
    return r;
  }
  investGeneral() {
    const amount = Math.max(500, Math.round(this.monthlySavings * 0.5));
    return `## 🚀 Investment Roadmap\n\n**Monthly investable: ${this.fmtL(amount)}**\n\n**Step 1 — Foundation:**\n• Emergency fund: ${this.savings >= this.expenses * 6 ? "✅ Done" : `❌ Need ${this.fmtL(this.expenses * 6 - this.savings)} more`}\n• Term insurance: ${this.fmtL(this.income * 20)} cover\n• Health insurance: Min ₹5L\n\n**Step 2 — Tax Optimization:**\n• ELSS SIP ₹12,500/month → saves ${this.fmtL(Math.round(150000 * (this.income > 1000000 ? 0.3 : 0.2)))}/year\n• NPS: Extra ₹50k deduction\n\n**Step 3 — Wealth Building (${this.fmtL(amount)}/month):**\n• Nifty 50 Index (40%): ${this.fmtL(Math.round(amount * 0.4))}/month\n• Flexi-Cap (30%): ${this.fmtL(Math.round(amount * 0.3))}/month\n• Mid-Cap (20%): ${this.fmtL(Math.round(amount * 0.2))}/month\n• International (10%): ${this.fmtL(Math.round(amount * 0.1))}/month\n\n**Projections at 12% CAGR:**\n• 5 years: ${this.fmtL(Math.round(amount * ((Math.pow(1.01, 60) - 1) / 0.01)))}\n• 10 years: **${this.fmtL(Math.round(amount * ((Math.pow(1.01, 120) - 1) / 0.01)))}**\n• 20 years: **${this.fmtL(Math.round(amount * ((Math.pow(1.01, 240) - 1) / 0.01)))}**\n\n**Best Platforms:** Groww (best UI), Zerodha Coin (MF+stocks), Kuvera (advanced)\n\n**➡️ Start today:** Groww → ${this.fmtL(Math.round(amount * 0.4))}/month SIP in Nifty 50 — done in 10 minutes`;
  }
  income_growth() {
    return `## 💼 Income Growth Strategies\n\n**Current: ${this.fmtL(this.monthlyIncome)}/month**\nEach ₹10k increase = **${this.fmtL(Math.round((10000 * this.savingsRate) / 100))}/month** more in savings\n\n**🥇 Negotiate Your Salary (Highest Impact)**\n• Job switch typically gets 25-40% hike\n• Script: "Based on market research, this role pays ₹X. Given [2-3 wins], I'd like to discuss moving to that range."\n• Best time: After a visible win or during appraisal\n\n**🥈 Freelance (₹5k-1L/month)**\n• Platforms: Upwork, Toptal, LinkedIn\n• High demand: React/Node, Data Science, UI/UX, Content\n\n**🥉 Passive Income**\n• Dividend stocks: ITC (3%), Coal India (8%), NTPC (3%)\n• P2P Lending: LenDenClub — 12-14% returns\n\n**Skill Investment (Best ROI):**\n• AWS Certification: ₹20k course → ₹1.5L+ salary bump\n• Data Analytics (Python): ₹15k → ₹80k+ bump\n\n**➡️ Quickest win:** Request appraisal meeting this week. 15% hike = ${this.fmtL(Math.round(this.monthlyIncome * 0.15 * 12))}/year extra.`;
  }
  subscriptions() {
    const subs = this.d.subscriptions || [];
    const total = subs.reduce((s, x) => s + parseFloat(x.amount || 0), 0);
    const invested = Math.round(total * 0.5);
    const in10yr = Math.round(invested * ((Math.pow(1.01, 120) - 1) / 0.01));
    return `## 📺 Subscription Audit\n\n**Total: ₹${total.toLocaleString("en-IN")}/month = ₹${(total * 12).toLocaleString("en-IN")}/year**\n\n${subs.map((s) => `• **${s.name}**: ₹${s.amount}/month — used weekly?`).join("\n")}\n\n**Optimization:**\n• Netflix: Share family plan → ₹160/person\n• Prime: Share with family member → split ₹1,499\n• Rotate: Subscribe 1 month, binge, cancel, repeat\n• Annual plans: 15-20% cheaper than monthly\n\n**Opportunity Cost:**\nIf you invest ₹${invested.toLocaleString("en-IN")}/month (half subscriptions) in SIP:\n**In 10 years → ${this.fmtL(in10yr)}**\n\n**Quick Audit:**\n1. Used in last 30 days? (No → cancel)\n2. Can I share it? (Yes → split cost)\n3. Free alternative? (YouTube for some)\n\n**➡️ Action:** Open UPI app, check auto-debits, cancel one unused service now`;
  }
  economy() {
    return `## 🌐 Indian Economy Context (2026)\n\n**RBI Policy:**\n• Repo Rate: 6.25-6.5% (easing cycle beginning)\n• 2-3 rate cuts of 25bps expected in 2026\n• Home loan rates likely to fall 0.5-0.75%\n• FD rates will fall — lock long-term FDs now\n\n**Inflation:** CPI ~4-5% — within target\nSavings account (3.5%) = NEGATIVE real return after inflation\n\n**Stock Market:**\n• Nifty P/E: ~22-24x — fair value\n• Midcap/Smallcap: 30-40x — be careful\n• Good sectors: Defence, Renewables, Healthcare\n• FII selling = buying opportunity, don't panic\n\n**Budget 2025-26:**\n• New regime better for most salaried\n• LTCG 12.5% equity, 20% debt/property\n• Infrastructure ₹11L cr capex — good for L&T, RITES\n\n**USD/INR:** ₹84-86 → Weak rupee good for IT (TCS, Infosys)\n\n**➡️ Don't time the market:** SIP regardless of headlines. Time IN the market beats timing the market.`;
  }
  greeting() {
    return `## 👋 Hey ${this.d.name || "there"}! I'm Finance.ai\n\nYour personal financial advisor — all knowledge built-in, no internet needed.\n\n**Your Snapshot:**\n• Income: ${this.fmtL(this.monthlyIncome)}/month | Savings: ${this.fmtL(this.monthlySavings)}/month (${this.savingsRate.toFixed(0)}%)\n• Portfolio: ${this.fmtL(this.investVal)} | Return: ${this.investGain >= 0 ? "+" : ""}${this.fmtL(this.investGain)}\n\n**I can help with:**\n• 📊 Financial health grade & overview\n• 📱 Purchase decisions (phone, laptop, car)\n• 📈 Stocks & mutual fund recommendations\n• 🧾 Tax planning — exactly how much & how to save\n• 🏠 Home loans, real estate, REITs\n• 💳 Loans, EMI, CIBIL score\n• 🛡️ Term life & health insurance sizing\n• 🌅 Retirement & FIRE number\n• 💰 Budget & subscription audit\n\nJust ask naturally — "should I buy iPhone 17?", "how much tax do I pay?", "best stocks now". What's on your mind?`;
  }
  general(q) {
    return `## 💡 Finance.ai\n\nI understand you're asking: **"${q}"**\n\nTry asking me more specifically:\n• **"Can I buy [item] for [amount]?"** — affordability check\n• **"How much tax do I pay?"** — exact calculation\n• **"Where should I invest [amount]?"** — specific recommendations\n• **"Show my financial overview"** — complete health report\n• **"How to save more money?"** — budget optimization\n\nI'm fully offline and know all Indian financial laws, markets, and products!`;
  }
}

// MESSAGE RENDERER
function MessageContent({ content }) {
  const renderInline = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
    return parts.map((p, j) => {
      if (p.startsWith("**") && p.endsWith("**") && p.length > 4)
        return (
          <strong key={j} style={{ color: "var(--accent)", fontWeight: 700 }}>
            {p.slice(2, -2)}
          </strong>
        );
      if (p.startsWith("*") && p.endsWith("*") && p.length > 2)
        return <em key={j}>{p.slice(1, -1)}</em>;
      if (p.startsWith("`") && p.endsWith("`"))
        return (
          <code
            key={j}
            style={{
              background: "var(--code-bg)",
              color: "var(--accent)",
              padding: "1px 6px",
              borderRadius: 4,
              fontSize: "0.82em",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {p.slice(1, -1)}
          </code>
        );
      return p;
    });
  };

  const lines = content.split("\n");
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      elements.push(<div key={i} style={{ height: 6 }} />);
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            margin: "4px 0 12px",
          }}
        >
          <div
            style={{
              width: 3,
              height: 20,
              background: "var(--accent)",
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          <h2
            style={{
              margin: 0,
              fontSize: "0.98rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              fontFamily: "var(--font-display)",
            }}
          >
            {line.slice(3)}
          </h2>
        </div>,
      );
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          style={{
            margin: "10px 0 4px",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {line.slice(4)}
        </h3>,
      );
      i++;
      continue;
    }
    if (line.trim() === "---") {
      elements.push(
        <div
          key={i}
          style={{ height: 1, background: "var(--divider)", margin: "10px 0" }}
        />,
      );
      i++;
      continue;
    }
    if (line.startsWith("• ") || line.startsWith("- ")) {
      elements.push(
        <div
          key={i}
          style={{
            display: "flex",
            gap: 10,
            padding: "3px 0",
            alignItems: "flex-start",
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "var(--accent)",
              flexShrink: 0,
              marginTop: 7,
            }}
          />
          <span
            style={{
              fontSize: "0.88rem",
              lineHeight: 1.6,
              color: "var(--text-secondary)",
            }}
          >
            {renderInline(line.slice(2))}
          </span>
        </div>,
      );
      i++;
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      const m = line.match(/^(\d+)\.\s(.+)/);
      if (m) {
        elements.push(
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              padding: "3px 0",
              alignItems: "flex-start",
            }}
          >
            <span
              style={{
                minWidth: 20,
                height: 20,
                borderRadius: 6,
                background: "var(--accent-soft)",
                color: "var(--accent)",
                fontSize: "0.72rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {m[1]}
            </span>
            <span
              style={{
                fontSize: "0.88rem",
                lineHeight: 1.6,
                color: "var(--text-secondary)",
              }}
            >
              {renderInline(m[2])}
            </span>
          </div>,
        );
        i++;
        continue;
      }
    }
    elements.push(
      <p
        key={i}
        style={{
          margin: "3px 0",
          fontSize: "0.88rem",
          lineHeight: 1.65,
          color: "var(--text-secondary)",
        }}
      >
        {renderInline(line)}
      </p>,
    );
    i++;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>{elements}</div>
  );
}
// QUICK QUESTIONS
const QUICK = [
  { icon: "📊", label: "Financial overview", q: "Show my financial overview" },
  { icon: "📱", label: "iPhone 16 afford?", q: "Can I afford an iPhone 16?" },
  { icon: "🚗", label: "Car ₹8 lakh?", q: "Should I buy a car for 8 lakh?" },
  { icon: "📈", label: "Best stocks now", q: "Which stocks should I buy now?" },
  {
    icon: "🧾",
    label: "My tax this year",
    q: "How much tax do I pay this year?",
  },
  { icon: "💡", label: "Save more money", q: "How can I save more money?" },
  {
    icon: "🏦",
    label: "Invest my savings",
    q: "Where should I invest my savings?",
  },
  { icon: "🌅", label: "Retirement plan", q: "Am I on track for retirement?" },
];

// STAT CARD
function StatCard({ label, value, sub, icon, positive }) {
  return (
    <div
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: "1.1rem" }}>{icon}</div>
      <div
        style={{
          fontSize: "0.72rem",
          color: "var(--text-muted)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1rem",
          fontWeight: 800,
          color: "var(--text-primary)",
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: "0.72rem",
            color: positive ? "#4ade80" : "var(--text-muted)",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

// TYPING DOTS
function TypingDots() {
  return (
    <div
      style={{
        display: "flex",
        gap: 5,
        alignItems: "center",
        padding: "6px 2px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--accent)",
            opacity: 0.5,
            animation: `pulse 1.2s ease-in-out ${i * 0.18}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// MAIN COMPONENT
export default function AIAdvisor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [financialData] = useState(DEMO_DATA);
  const [showQuick, setShowQuick] = useState(true);
  const [typing, setTyping] = useState(false);
  const [dark, setDark] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const brain = new FinanceBrain(financialData);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: brain.greeting(),
        ts: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || typing) return;
    setInput("");
    setShowQuick(false);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: msg, ts: new Date() },
    ]);
    setTyping(true);
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
    const reply = new FinanceBrain(financialData).answer(msg);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: reply, ts: new Date() },
    ]);
    setTyping(false);
    inputRef.current?.focus();
  };

  const fmt = brain.fmtL;
  const sr = brain.savingsRate.toFixed(0);

  const theme = dark
    ? {
        "--bg": "#0a0f1e",
        "--surface": "#0f1629",
        "--card-bg": "rgba(255,255,255,0.04)",
        "--border": "rgba(255,255,255,0.08)",
        "--divider": "rgba(255,255,255,0.06)",
        "--accent": "#60a5fa",
        "--accent-soft": "rgba(96,165,250,0.12)",
        "--accent2": "#a78bfa",
        "--text-primary": "#f1f5f9",
        "--text-secondary": "#94a3b8",
        "--text-muted": "#475569",
        "--code-bg": "rgba(96,165,250,0.1)",
        "--user-bg": "linear-gradient(135deg,#1d4ed8,#7c3aed)",
        "--bot-bg": "rgba(255,255,255,0.04)",
        "--bot-border": "rgba(255,255,255,0.08)",
        "--input-bg": "rgba(255,255,255,0.05)",
        "--sidebar-bg": "rgba(255,255,255,0.02)",
        "--font-display": "'DM Sans', sans-serif",
        "--shadow": "0 4px 24px rgba(0,0,0,0.4)",
      }
    : {
        "--bg": "#f4f6fb",
        "--surface": "#ffffff",
        "--card-bg": "#f8fafc",
        "--border": "rgba(0,0,0,0.07)",
        "--divider": "rgba(0,0,0,0.06)",
        "--accent": "#2563eb",
        "--accent-soft": "rgba(37,99,235,0.08)",
        "--accent2": "#7c3aed",
        "--text-primary": "#0f172a",
        "--text-secondary": "#334155",
        "--text-muted": "#94a3b8",
        "--code-bg": "rgba(37,99,235,0.06)",
        "--user-bg": "linear-gradient(135deg,#1d4ed8,#7c3aed)",
        "--bot-bg": "#ffffff",
        "--bot-border": "rgba(0,0,0,0.07)",
        "--input-bg": "#f1f5f9",
        "--sidebar-bg": "#f8fafc",
        "--font-display": "'DM Sans', sans-serif",
        "--shadow": "0 2px 16px rgba(0,0,0,0.08)",
      };

  return (
    <div
      style={{
        ...theme,
        background: "var(--bg)",
        minHeight: "100vh",
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 8px; }
        textarea { font-family: 'DM Sans', sans-serif; }
        @keyframes pulse { 0%,100%{transform:scale(0.8);opacity:0.4} 50%{transform:scale(1.2);opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .msg-appear { animation: fadeUp 0.25s ease-out both; }
        .quick-btn { transition: all 0.15s ease; cursor: pointer; }
        .quick-btn:hover { transform: translateY(-2px); }
        .send-btn { transition: all 0.15s ease; cursor: pointer; }
        .send-btn:hover:not(:disabled) { transform: scale(1.06); }
        .theme-btn { transition: all 0.2s ease; cursor: pointer; }
        .theme-btn:hover { transform: rotate(20deg); }
        .stat-toggle { transition: all 0.2s ease; cursor: pointer; }
        .stat-toggle:hover { opacity: 0.8; }
      `}</style>

      {/* HEADER */}
      <div
        style={{
          flexShrink: 0,
          background: dark ? "rgba(10,15,30,0.95)" : "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          padding: "0 20px",
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 62,
          }}
        >
          {/* Avatar + Name */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flex: 1,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                flexShrink: 0,
                boxShadow: "0 2px 12px rgba(37,99,235,0.35)",
              }}
            >
              🤖
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-display)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Finance.ai
                </span>
                
              </div>
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  marginTop: 1,
                }}
              >
                {financialData.name} · {fmt(brain.monthlyIncome)}/mo · {sr}%
                savings
              </div>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className="stat-toggle"
              onClick={() => setShowStats((s) => !s)}
              style={{
                padding: "6px 12px",
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: showStats ? "var(--accent-soft)" : "transparent",
                color: showStats ? "var(--accent)" : "var(--text-muted)",
                fontSize: "0.76rem",
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              📊 Stats
            </button>
            
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
              paddingBottom: 14,
              animation: "fadeIn 0.2s ease",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 2,
              }}
            >
              <StatCard
                icon="💰"
                label="Monthly Income"
                value={fmt(brain.monthlyIncome)}
                sub={`${sr}% savings rate`}
                positive
              />
              <StatCard
                icon="📉"
                label="Expenses"
                value={fmt(brain.monthlyExpenses)}
                sub="monthly"
              />
              <StatCard
                icon="💎"
                label="Savings"
                value={fmt(brain.monthlySavings)}
                sub="per month"
                positive
              />
              <StatCard
                icon="📈"
                label="Portfolio"
                value={fmt(brain.investVal)}
                sub={`+${fmt(brain.investGain)} gain`}
                positive
              />
            </div>
          </div>
        )}
      </div>

      {/* MESSAGES AREA */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 8px" }}>
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className="msg-appear"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                gap: 6,
              }}
            >
              {/* Label row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: msg.role === "user" ? 0 : 4,
                }}
              >
                {msg.role === "assistant" && (
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      flexShrink: 0,
                    }}
                  >
                    🤖
                  </div>
                )}
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  {msg.role === "assistant" ? "Finance.ai" : financialData.name}
                </span>
                <span
                  style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}
                >
                  {msg.ts?.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Bubble */}
              <div
                style={{
                  maxWidth: "82%",
                  borderRadius:
                    msg.role === "user"
                      ? "18px 18px 4px 18px"
                      : "4px 18px 18px 18px",
                  padding: msg.role === "user" ? "11px 16px" : "16px 18px",
                  background:
                    msg.role === "user" ? "var(--user-bg)" : "var(--bot-bg)",
                  border:
                    msg.role === "user"
                      ? "none"
                      : "1px solid var(--bot-border)",
                  boxShadow: "var(--shadow)",
                }}
              >
                {msg.role === "user" ? (
                  <p
                    style={{
                      margin: 0,
                      color: "#fff",
                      fontSize: "0.9rem",
                      lineHeight: 1.55,
                      fontWeight: 500,
                    }}
                  >
                    {msg.content}
                  </p>
                ) : (
                  <MessageContent content={msg.content} />
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div
              className="msg-appear"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingLeft: 4,
                }}
              >
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "linear-gradient(135deg,#2563eb,#7c3aed)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                  }}
                >
                  🤖
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    fontWeight: 600,
                  }}
                >
                  Finance.ai
                </span>
              </div>
              <div
                style={{
                  background: "var(--bot-bg)",
                  border: "1px solid var(--bot-border)",
                  borderRadius: "4px 18px 18px 18px",
                  padding: "14px 18px",
                  boxShadow: "var(--shadow)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <TypingDots />
                <span
                  style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}
                >
                  Crunching your numbers...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* QUICK QUESTIONS */}
      {showQuick && messages.length <= 1 && (
        <div style={{ flexShrink: 0, padding: "0 20px 10px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <p
              style={{
                fontSize: "0.73rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                marginBottom: 10,
              }}
            >
              Quick questions
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {QUICK.map((q, i) => (
                <button
                  key={i}
                  className="quick-btn"
                  onClick={() => sendMessage(q.q)}
                  style={{
                    padding: "7px 13px",
                    borderRadius: 22,
                    border: "1px solid var(--border)",
                    background: "var(--card-bg)",
                    color: "var(--text-secondary)",
                    fontSize: "0.8rem",
                    fontFamily: "inherit",
                    fontWeight: 500,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "0.9rem" }}>{q.icon}</span>
                  {q.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INPUT BAR */}
      <div style={{ flexShrink: 0, padding: "0 20px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div
            style={{
              background: dark ? "rgba(15,22,41,0.95)" : "#ffffff",
              border: "1px solid var(--border)",
              borderRadius: 20,
              padding: "8px 8px 8px 16px",
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
              boxShadow: dark
                ? "0 -1px 0 rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.3)"
                : "0 2px 20px rgba(0,0,0,0.08)",
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask about stocks, tax, loans, investments, budgeting..."
              rows={1}
              disabled={typing}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                resize: "none",
                fontSize: "0.9rem",
                color: "var(--text-primary)",
                lineHeight: 1.55,
                minHeight: 40,
                maxHeight: 120,
                paddingTop: 9,
                paddingBottom: 9,
              }}
            />
            {/* Send button */}
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                border: "none",
                flexShrink: 0,
                background:
                  !input.trim() || typing
                    ? dark
                      ? "rgba(255,255,255,0.06)"
                      : "#e2e8f0"
                    : "linear-gradient(135deg,#2563eb,#7c3aed)",
                color: !input.trim() || typing ? "var(--text-muted)" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  !input.trim() || typing
                    ? "none"
                    : "0 2px 12px rgba(37,99,235,0.4)",
              }}
            >
              {typing ? (
                <div
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid currentColor",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>

          {/* Footer hint */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
              paddingLeft: 4,
            }}
          >
            <span style={{ fontSize: "0.71rem", color: "var(--text-muted)" }}>
              ⏎ send · ⇧⏎ new line
            </span>
            <span style={{ fontSize: "0.71rem", color: "var(--text-muted)" }}>
              ⚡ 100% offline · India-specific advice
            </span>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
