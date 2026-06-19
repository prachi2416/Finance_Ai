import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function EMICalculator() {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(5);
  const [tenureType, setTenureType] = useState("years");
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();

  const calculateEMI = () => {
    const principal = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 12 / 100; // Monthly interest rate
    const months =
      tenureType === "years"
        ? parseFloat(loanTenure) * 12
        : parseFloat(loanTenure);

    if (rate === 0) {
      return principal / months;
    }

    const emi =
      (principal * rate * Math.pow(1 + rate, months)) /
      (Math.pow(1 + rate, months) - 1);
    return emi;
  };

  const emi = calculateEMI();
  const totalAmount =
    emi * (tenureType === "years" ? loanTenure * 12 : loanTenure);
  const totalInterest = totalAmount - loanAmount;
  const principalPercentage = (loanAmount / totalAmount) * 100;
  const interestPercentage = (totalInterest / totalAmount) * 100;

  // Generate amortization schedule (first 12 months)
  const generateSchedule = () => {
    const schedule = [];
    let balance = parseFloat(loanAmount);
    const rate = parseFloat(interestRate) / 12 / 100;
    const months = Math.min(
      12,
      tenureType === "years" ? loanTenure * 12 : loanTenure
    );

    for (let i = 1; i <= months; i++) {
      const interest = balance * rate;
      const principal = emi - interest;
      balance -= principal;

      schedule.push({
        month: i,
        emi: emi,
        principal: principal,
        interest: interest,
        balance: Math.max(0, balance),
      });
    }

    return schedule;
  };

  const schedule = generateSchedule();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
              >
                ← Back
              </button>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                EMI Calculator
              </h1>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {isDark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator Inputs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
              Loan Details
            </h2>

            <div className="space-y-6">
              {/* Loan Amount */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loan Amount
                  </label>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    ₹{loanAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>₹10K</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              {/* Interest Rate */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Interest Rate (p.a.)
                  </label>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {interestRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1%</span>
                  <span>20%</span>
                </div>
              </div>

              {/* Loan Tenure */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loan Tenure
                  </label>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {loanTenure} {tenureType}
                  </span>
                </div>
                <input
                  type="range"
                  min={tenureType === "years" ? 1 : 12}
                  max={tenureType === "years" ? 30 : 360}
                  step="1"
                  value={loanTenure}
                  onChange={(e) => setLoanTenure(e.target.value)}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 flex-1">
                    <span>{tenureType === "years" ? "1 Yr" : "12 Mo"}</span>
                    <span>{tenureType === "years" ? "30 Yrs" : "360 Mo"}</span>
                  </div>
                  <select
                    value={tenureType}
                    onChange={(e) => {
                      setTenureType(e.target.value);
                      setLoanTenure(e.target.value === "years" ? 5 : 60);
                    }}
                    className="ml-4 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* EMI Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <p className="text-sm opacity-90">Monthly EMI</p>
              <p className="text-4xl font-bold mt-2">
                ₹{emi.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm opacity-75 mt-2">
                {tenureType === "years" ? loanTenure * 12 : loanTenure} monthly
                payments
              </p>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Principal Amount
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-white mt-1">
                  ₹{loanAmount.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Total Interest
                </p>
                <p className="text-xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  ₹
                  {totalInterest.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 col-span-2">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Total Payment
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                  ₹
                  {totalAmount.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>

            {/* Principal vs Interest Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
                Payment Breakdown
              </h3>
              <div className="flex h-8 rounded-lg overflow-hidden">
                <div
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${principalPercentage}%` }}
                >
                  {principalPercentage > 20 &&
                    `${principalPercentage.toFixed(1)}%`}
                </div>
                <div
                  className="bg-orange-500 flex items-center justify-center text-white text-xs font-medium"
                  style={{ width: `${interestPercentage}%` }}
                >
                  {interestPercentage > 20 &&
                    `${interestPercentage.toFixed(1)}%`}
                </div>
              </div>
              <div className="flex justify-between mt-3 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Principal
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Interest
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amortization Schedule */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Amortization Schedule (First 12 Months)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    EMI
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Principal
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Interest
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {schedule.map((row) => (
                  <tr
                    key={row.month}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-white">
                      {row.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-800 dark:text-white">
                      ₹
                      {row.emi.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400">
                      ₹
                      {row.principal.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-orange-600 dark:text-orange-400">
                      ₹
                      {row.interest.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                      ₹
                      {row.balance.toLocaleString("en-IN", {
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
