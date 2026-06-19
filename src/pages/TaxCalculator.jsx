import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function TaxCalculator() {
  const [income, setIncome] = useState("");
  const [regime, setRegime] = useState("new");
  const [age, setAge] = useState("below60");
  const [deductions, setDeductions] = useState({
    section80C: "",
    section80D: "",
    homeLoanInterest: "",
    nps: "",
    otherDeductions: "",
  });
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  // Old Tax Regime Slabs
  const oldRegimeSlabs = [
    { limit: 250000, rate: 0 },
    { limit: 500000, rate: 5 },
    { limit: 1000000, rate: 20 },
    { limit: Infinity, rate: 30 },
  ];

  // New Tax Regime Slabs (FY 2023-24)
  const newRegimeSlabs = [
    { limit: 300000, rate: 0 },
    { limit: 600000, rate: 5 },
    { limit: 900000, rate: 10 },
    { limit: 1200000, rate: 15 },
    { limit: 1500000, rate: 20 },
    { limit: Infinity, rate: 30 },
  ];

  const calculateTax = () => {
    const annualIncome = parseFloat(income) || 0;
    if (annualIncome <= 0) {
      alert("Please enter a valid income amount");
      return;
    }

    let taxableIncome = annualIncome;
    let totalDeductions = 0;

    // Calculate deductions (only for old regime)
    if (regime === "old") {
      totalDeductions = Object.values(deductions).reduce(
        (sum, val) => sum + (parseFloat(val) || 0),
        0
      );
      // Cap 80C at 1.5L
      const section80C = Math.min(
        parseFloat(deductions.section80C) || 0,
        150000
      );
      const otherDed =
        totalDeductions - (parseFloat(deductions.section80C) || 0);
      totalDeductions = section80C + otherDed;

      taxableIncome = Math.max(0, annualIncome - totalDeductions);
    }

    // Choose tax slabs based on regime
    const slabs = regime === "new" ? newRegimeSlabs : oldRegimeSlabs;

    // Calculate tax
    let tax = 0;
    let previousLimit = 0;

    for (const slab of slabs) {
      if (taxableIncome > previousLimit) {
        const taxableAmount =
          Math.min(taxableIncome, slab.limit) - previousLimit;
        tax += (taxableAmount * slab.rate) / 100;
        previousLimit = slab.limit;
      }
    }

    // Add 4% cess
    const cess = tax * 0.04;
    const totalTax = tax + cess;

    // Rebate u/s 87A (if applicable)
    let rebate = 0;
    if (regime === "new" && taxableIncome <= 700000) {
      rebate = Math.min(totalTax, 25000);
    } else if (regime === "old" && taxableIncome <= 500000) {
      rebate = Math.min(totalTax, 12500);
    }

    const finalTax = Math.max(0, totalTax - rebate);
    const monthlyTax = finalTax / 12;
    const takeHome = annualIncome - finalTax;
    const monthlyTakeHome = takeHome / 12;
    const effectiveRate = (finalTax / annualIncome) * 100;

    setResult({
      grossIncome: annualIncome,
      totalDeductions,
      taxableIncome,
      taxBeforeCess: tax,
      cess,
      totalTax,
      rebate,
      finalTax,
      monthlyTax,
      takeHome,
      monthlyTakeHome,
      effectiveRate,
    });
  };

  const resetCalculator = () => {
    setIncome("");
    setDeductions({
      section80C: "",
      section80D: "",
      homeLoanInterest: "",
      nps: "",
      otherDeductions: "",
    });
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Premium Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-950 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white transition-all duration-200 hover:scale-110 shadow-lg"
              title="Back to Dashboard"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Income Tax Calculator
              </h1>
              <p className="text-blue-100 text-sm mt-1">
                Calculate your tax liability with precision
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            {/* Basic Details Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center space-x-3 mb-8">
                <span className="text-2xl">💼</span>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Income Details
                </h2>
              </div>

              <div className="space-y-6">
                {/* Annual Income */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                    Annual Income (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    placeholder="e.g., 1200000"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                {/* Tax Regime */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                    Tax Regime
                  </label>
                  <select
                    value={regime}
                    onChange={(e) => setRegime(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="new">📊 New Tax Regime (FY 2023-24)</option>
                    <option value="old">🏛️ Old Tax Regime</option>
                  </select>
                </div>

                {/* Age Group */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                    Age Group
                  </label>
                  <select
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="below60">Below 60 years</option>
                    <option value="60to80">
                      60 - 80 years (Senior Citizen)
                    </option>
                    <option value="above80">
                      Above 80 years (Super Senior)
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Deductions Card (Only for Old Regime) */}
            {regime === "old" && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center space-x-3 mb-8">
                  <span className="text-2xl">🎯</span>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                    Tax Deductions
                  </h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                      Section 80C (PPF, ELSS, LIC) - Max ₹1.5L
                    </label>
                    <input
                      type="number"
                      value={deductions.section80C}
                      onChange={(e) =>
                        setDeductions({
                          ...deductions,
                          section80C: e.target.value,
                        })
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                      Section 80D (Medical Insurance)
                    </label>
                    <input
                      type="number"
                      value={deductions.section80D}
                      onChange={(e) =>
                        setDeductions({
                          ...deductions,
                          section80D: e.target.value,
                        })
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                      Home Loan Interest
                    </label>
                    <input
                      type="number"
                      value={deductions.homeLoanInterest}
                      onChange={(e) =>
                        setDeductions({
                          ...deductions,
                          homeLoanInterest: e.target.value,
                        })
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                      NPS (80CCD(1B)) - Max ₹50K
                    </label>
                    <input
                      type="number"
                      value={deductions.nps}
                      onChange={(e) =>
                        setDeductions({ ...deductions, nps: e.target.value })
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                      Other Deductions
                    </label>
                    <input
                      type="number"
                      value={deductions.otherDeductions}
                      onChange={(e) =>
                        setDeductions({
                          ...deductions,
                          otherDeductions: e.target.value,
                        })
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={calculateTax}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg hover:scale-105"
              >
                🧮 Calculate Tax
              </button>
              <button
                onClick={resetCalculator}
                className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200"
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow duration-300">
                    <p className="text-green-100 text-sm font-semibold uppercase tracking-wide">
                      Annual Take Home
                    </p>
                    <p className="text-3xl font-bold mt-3">
                      ₹{(result.takeHome / 100000).toFixed(1)}L
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-shadow duration-300">
                    <p className="text-red-100 text-sm font-semibold uppercase tracking-wide">
                      Total Tax
                    </p>
                    <p className="text-3xl font-bold mt-3">
                      ₹{(result.finalTax / 100000).toFixed(1)}L
                    </p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center space-x-2">
                    <span>📋</span>
                    <span>Tax Breakdown</span>
                  </h3>

                  <div className="space-y-5">
                    <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        Gross Income
                      </span>
                      <span className="text-lg font-semibold text-slate-800 dark:text-white">
                        ₹{result.grossIncome.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {regime === "old" && result.totalDeductions > 0 && (
                      <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700 text-green-600 dark:text-green-400">
                        <span className="font-medium">
                          (-) Total Deductions
                        </span>
                        <span className="font-semibold">
                          ₹{result.totalDeductions.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        Taxable Income
                      </span>
                      <span className="text-lg font-semibold text-slate-800 dark:text-white">
                        ₹{result.taxableIncome.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Tax (Before Cess)
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">
                        ₹
                        {result.taxBeforeCess.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Health & Education Cess (4%)
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">
                        ₹
                        {result.cess.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>

                    {result.rebate > 0 && (
                      <div className="flex justify-between items-center py-2 text-sm text-green-600 dark:text-green-400">
                        <span>(-) Rebate u/s 87A</span>
                        <span>
                          ₹
                          {result.rebate.toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    )}

                    <div className="border-t-2 border-slate-300 dark:border-slate-600 my-4"></div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Final Tax Payable
                      </span>
                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                        ₹
                        {result.finalTax.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Monthly Tax
                      </span>
                      <span className="text-slate-800 dark:text-slate-200">
                        ₹
                        {result.monthlyTax.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        Effective Tax Rate
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {result.effectiveRate.toFixed(2)}%
                      </span>
                    </div>

                    <div className="border-t-2 border-slate-300 dark:border-slate-600 my-4"></div>

                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Monthly Take Home
                      </span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ₹
                        {result.monthlyTakeHome.toLocaleString("en-IN", {
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tax Saving Tip */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-900 dark:text-blue-300 font-medium flex items-start space-x-3">
                    <span className="text-xl">💡</span>
                    <span>
                      {regime === "new"
                        ? "New regime offers lower rates but no deductions. Compare with old regime to find the best option."
                        : "Maximize deductions under Section 80C, 80D, and NPS to reduce your tax liability significantly."}
                    </span>
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-16 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center h-96">
                <svg
                  className="w-20 h-20 text-slate-300 dark:text-slate-600 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-slate-500 dark:text-slate-400 text-center text-lg font-medium">
                  Enter your income and details to calculate tax
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6">
          <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-4 flex items-center space-x-2 text-lg">
            <span>📌</span>
            <span>Important Notes</span>
          </h3>
          <ul className="text-sm text-amber-800 dark:text-amber-400 space-y-2 list-disc list-inside">
            <li>This calculator is for FY 2023-24 (AY 2024-25)</li>
            <li>
              New regime has lower rates but doesn't allow most deductions
            </li>
            <li>Section 80C limit is ₹1.5 lakh per year</li>
            <li>
              Rebate u/s 87A available for income up to ₹5L (old) / ₹7L (new)
            </li>
            <li>
              This is an estimate. Consult a tax professional for accurate
              filing
            </li>
          </ul>
        </div>
      </div>

      <style>{`
        [data-theme="dark"] {
          color-scheme: dark;
        }

        [data-theme="light"] {
          color-scheme: light;
        }
      `}</style>
    </div>
  );
}
