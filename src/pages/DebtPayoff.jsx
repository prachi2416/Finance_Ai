import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function DebtPayoffCalculator() {
  const [debts, setDebts] = useState([
    { id: 1, name: "Credit Card", balance: 50000, rate: 18, minPayment: 2000 },
  ]);
  const [extraPayment, setExtraPayment] = useState(5000);
  const [strategy, setStrategy] = useState("avalanche");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const addDebt = () => {
    setDebts([
      ...debts,
      {
        id: Date.now(),
        name: `Debt ${debts.length + 1}`,
        balance: 0,
        rate: 10,
        minPayment: 0,
      },
    ]);
  };

  const removeDebt = (id) => {
    if (debts.length > 1) {
      setDebts(debts.filter((d) => d.id !== id));
    }
  };

  const updateDebt = (id, field, value) => {
    setDebts(debts.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  const calculatePayoff = () => {
    if (debts.some((d) => d.balance <= 0 || d.rate < 0 || d.minPayment <= 0)) {
      alert("Please enter valid values for all debts");
      return;
    }

    // Copy debts for calculation
    let debtsCopy = debts.map((d) => ({
      ...d,
      balance: parseFloat(d.balance),
      rate: parseFloat(d.rate),
      minPayment: parseFloat(d.minPayment),
      totalPaid: 0,
      monthsPaid: 0,
    }));

    // Sort based on strategy
    if (strategy === "avalanche") {
      debtsCopy.sort((a, b) => b.rate - a.rate);
    } else {
      debtsCopy.sort((a, b) => a.balance - b.balance);
    }

    let month = 0;
    let totalInterest = 0;
    const payoffSchedule = [];
    const debtPayoffOrder = [];

    while (debtsCopy.some((d) => d.balance > 0)) {
      month++;
      let remainingExtra = parseFloat(extraPayment);

      // Calculate interest and make minimum payments
      debtsCopy.forEach((debt) => {
        if (debt.balance > 0) {
          const monthlyRate = debt.rate / 100 / 12;
          const interest = debt.balance * monthlyRate;
          totalInterest += interest;

          let payment = Math.min(debt.minPayment, debt.balance + interest);
          debt.balance = debt.balance + interest - payment;
          debt.totalPaid += payment;
        }
      });

      // Apply extra payment to highest priority debt with balance
      for (let debt of debtsCopy) {
        if (debt.balance > 0 && remainingExtra > 0) {
          const extraApplied = Math.min(remainingExtra, debt.balance);
          debt.balance -= extraApplied;
          debt.totalPaid += extraApplied;
          remainingExtra -= extraApplied;

          if (debt.balance <= 0) {
            debt.monthsPaid = month;
            debtPayoffOrder.push({
              name: debt.name,
              month: month,
              totalPaid: debt.totalPaid.toFixed(2),
            });
          }
        }
      }

      // Track monthly snapshot
      const monthSnapshot = {
        month,
        totalBalance: debtsCopy.reduce((sum, d) => sum + d.balance, 0),
        totalPaid: debtsCopy.reduce((sum, d) => sum + d.totalPaid, 0),
      };
      payoffSchedule.push(monthSnapshot);

      // Safety check
      if (month > 600) break; // Max 50 years
    }

    const totalPaid = debtsCopy.reduce((sum, d) => sum + d.totalPaid, 0);
    const totalPrincipal = debts.reduce(
      (sum, d) => sum + parseFloat(d.balance),
      0
    );

    setResult({
      months: month,
      years: (month / 12).toFixed(1),
      totalPaid: totalPaid.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      totalPrincipal: totalPrincipal.toFixed(2),
      payoffOrder: debtPayoffOrder,
      monthlyPayment: (
        debts.reduce((sum, d) => sum + parseFloat(d.minPayment), 0) +
        parseFloat(extraPayment)
      ).toFixed(2),
    });
  };

  const compareStrategies = () => {
    const avalancheResult = calculateWithStrategy("avalanche");
    const snowballResult = calculateWithStrategy("snowball");

    alert(
      `Strategy Comparison:\n\n` +
        `Avalanche (High Interest First):\n` +
        `- Payoff Time: ${avalancheResult.months} months\n` +
        `- Total Interest: ₹${avalancheResult.totalInterest}\n\n` +
        `Snowball (Low Balance First):\n` +
        `- Payoff Time: ${snowballResult.months} months\n` +
        `- Total Interest: ₹${snowballResult.totalInterest}\n\n` +
        `Avalanche saves you ₹${(
          snowballResult.totalInterest - avalancheResult.totalInterest
        ).toFixed(2)} in interest!`
    );
  };

  const calculateWithStrategy = (strat) => {
    let debtsCopy = debts.map((d) => ({
      balance: parseFloat(d.balance),
      rate: parseFloat(d.rate),
      minPayment: parseFloat(d.minPayment),
    }));

    if (strat === "avalanche") {
      debtsCopy.sort((a, b) => b.rate - a.rate);
    } else {
      debtsCopy.sort((a, b) => a.balance - b.balance);
    }

    let month = 0;
    let totalInterest = 0;

    while (debtsCopy.some((d) => d.balance > 0)) {
      month++;
      let remainingExtra = parseFloat(extraPayment);

      debtsCopy.forEach((debt) => {
        if (debt.balance > 0) {
          const monthlyRate = debt.rate / 100 / 12;
          const interest = debt.balance * monthlyRate;
          totalInterest += interest;
          let payment = Math.min(debt.minPayment, debt.balance + interest);
          debt.balance = debt.balance + interest - payment;
        }
      });

      for (let debt of debtsCopy) {
        if (debt.balance > 0 && remainingExtra > 0) {
          const extraApplied = Math.min(remainingExtra, debt.balance);
          debt.balance -= extraApplied;
          remainingExtra -= extraApplied;
        }
      }

      if (month > 600) break;
    }

    return { months: month, totalInterest: totalInterest.toFixed(2) };
  };

  const totalDebt = debts.reduce(
    (sum, d) => sum + parseFloat(d.balance || 0),
    0
  );
  const totalMinPayment = debts.reduce(
    (sum, d) => sum + parseFloat(d.minPayment || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              💳 Debt Payoff Calculator
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Debt
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                  ₹{totalDebt.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Min Payment
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                  ₹{totalMinPayment.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Payment
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  ₹
                  {(
                    totalMinPayment + parseFloat(extraPayment || 0)
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Debts List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Your Debts
                </h2>
                <button
                  onClick={addDebt}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  + Add Debt
                </button>
              </div>

              <div className="space-y-4">
                {debts.map((debt, index) => (
                  <div
                    key={debt.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Debt Name
                        </label>
                        <input
                          type="text"
                          value={debt.name}
                          onChange={(e) =>
                            updateDebt(debt.id, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Balance (₹)
                        </label>
                        <input
                          type="number"
                          value={debt.balance}
                          onChange={(e) =>
                            updateDebt(debt.id, "balance", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Interest Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={debt.rate}
                          onChange={(e) =>
                            updateDebt(debt.id, "rate", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Min Payment (₹)
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="number"
                            value={debt.minPayment}
                            onChange={(e) =>
                              updateDebt(debt.id, "minPayment", e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
                          />
                          {debts.length > 1 && (
                            <button
                              onClick={() => removeDebt(debt.id)}
                              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payoff Strategy */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Payoff Strategy
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Extra Monthly Payment (₹)
                  </label>
                  <input
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Repayment Strategy
                  </label>
                  <select
                    value={strategy}
                    onChange={(e) => setStrategy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="avalanche">
                      Avalanche (High Interest First)
                    </option>
                    <option value="snowball">
                      Snowball (Low Balance First)
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <button
                  onClick={calculatePayoff}
                  className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
                >
                  Calculate Payoff Plan
                </button>
                <button
                  onClick={compareStrategies}
                  className="px-6 bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition"
                >
                  Compare
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Main Result Card */}
                <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-4">Debt-Free In</h3>
                  <div className="text-5xl font-bold mb-2">{result.months}</div>
                  <div className="text-xl">months ({result.years} years)</div>
                </div>

                {/* Financial Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                    Financial Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Total Principal
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        ₹
                        {parseFloat(result.totalPrincipal).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded">
                      <span className="text-sm text-red-700 dark:text-red-300">
                        Total Interest
                      </span>
                      <span className="font-semibold text-red-800 dark:text-red-200">
                        ₹
                        {parseFloat(result.totalInterest).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded border-2 border-blue-200 dark:border-blue-800">
                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                        Total Amount Paid
                      </span>
                      <span className="font-bold text-blue-900 dark:text-blue-100">
                        ₹{parseFloat(result.totalPaid).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded">
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Monthly Payment
                      </span>
                      <span className="font-semibold text-green-800 dark:text-green-200">
                        ₹
                        {parseFloat(result.monthlyPayment).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payoff Order */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                    Payoff Order (
                    {strategy === "avalanche" ? "Avalanche" : "Snowball"})
                  </h3>
                  <div className="space-y-2">
                    {result.payoffOrder.map((debt, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {debt.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Month {debt.month} • ₹
                            {parseFloat(debt.totalPaid).toLocaleString("en-IN")}{" "}
                            paid
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center justify-center h-64 text-gray-400 dark:text-gray-500">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <p>Add your debts and calculate</p>
              </div>
            )}
          </div>
        </div>

        {/* Strategy Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <h4 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
              🔥 Avalanche Method
            </h4>
            <p className="text-sm text-purple-800 dark:text-purple-400">
              Pay off debts with highest interest rates first. Saves the most
              money on interest over time.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
              ⚡ Snowball Method
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              Pay off smallest debts first. Provides quick wins and
              psychological motivation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
