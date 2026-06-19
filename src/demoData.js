
export const DEMO_DATA = {
  totalIncome: 85000,
  totalExpenses: 54200,
  netSavings: 30800,
  totalInvested: 120000,
  currentInvestmentValue: 138500,
  investmentGain: 18500,
  categoryBreakdown: {
    "Food & Dining": 12000,
    "Housing & Rent": 18000,
    Transportation: 5500,
    Entertainment: 4200,
    Shopping: 6800,
    Utilities: 3200,
    Healthcare: 2500,
    Education: 2000,
  },
  incomeSourceBreakdown: {
    Salary: 70000,
    Freelance: 10000,
    Investments: 5000,
  },
  expenses: [
    {
      id: 1,
      amount: 18000,
      date: "2026-02-01",
      categories: { name: "Housing & Rent" },
    },
    {
      id: 2,
      amount: 12000,
      date: "2026-02-05",
      categories: { name: "Food & Dining" },
    },
    {
      id: 3,
      amount: 5500,
      date: "2026-02-10",
      categories: { name: "Transportation" },
    },
  ],
  income: [
    { id: 1, amount: 70000, date: "2026-02-01", source: "Salary" },
    { id: 2, amount: 10000, date: "2026-02-15", source: "Freelance" },
  ],
  investments: [
    {
      id: 1,
      name: "Reliance Industries",
      symbol: "RELIANCE",
      type: "stock",
      quantity: 10,
      buy_price: 2400,
      current_price: 2850,
    },
  ],
  goals: [
    {
      id: 1,
      name: "Emergency Fund",
      target_amount: 300000,
      current_amount: 120000,
      category: "savings",
    },
  ],
  subscriptions: [
    { id: 1, name: "Netflix", amount: 649, billing_cycle: "monthly" },
  ],
  isGuest: true,
  profession: "Demo User",
};
