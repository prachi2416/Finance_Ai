import { useState, useEffect } from "react";
import { supabase } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function ExportReports() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [reportType, setReportType] = useState("summary");
  const [includeCharts, setIncludeCharts] = useState(true);
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")
      .gte("date", dateRange.startDate)
      .lte("date", dateRange.endDate)
      .order("date", { ascending: false });

    const { data: income } = await supabase
      .from("income")
      .select("*")
      .gte("date", dateRange.startDate)
      .lte("date", dateRange.endDate)
      .order("date", { ascending: false });

    const { data: investments } = await supabase
      .from("investments")
      .select("*");

    const { data: goals } = await supabase.from("goals").select("*");

    setData({
      expenses: expenses || [],
      income: income || [],
      investments: investments || [],
      goals: goals || [],
    });
  };

  const generatePDF = async () => {
    if (!data) return;

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Calculate totals
      const totalExpenses = data.expenses.reduce(
        (sum, e) => sum + parseFloat(e.amount),
        0,
      );
      const totalIncome = data.income.reduce(
        (sum, i) => sum + parseFloat(i.amount),
        0,
      );
      const netSavings = totalIncome - totalExpenses;

      // Category breakdown
      const categoryTotals = {};
      data.expenses.forEach((e) => {
        categoryTotals[e.category] =
          (categoryTotals[e.category] || 0) + parseFloat(e.amount);
      });

      // Generate HTML for PDF
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #2563eb;
              margin: 0;
              font-size: 32px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .summary {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .summary-card {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              border: 2px solid #e9ecef;
            }
            .summary-card h3 {
              margin: 0 0 10px 0;
              font-size: 14px;
              color: #666;
              text-transform: uppercase;
            }
            .summary-card .amount {
              font-size: 28px;
              font-weight: bold;
              margin: 0;
            }
            .summary-card.income .amount { color: #10b981; }
            .summary-card.expense .amount { color: #ef4444; }
            .summary-card.savings .amount { color: #2563eb; }
            .section {
              margin-bottom: 30px;
            }
            .section h2 {
              color: #2563eb;
              border-bottom: 2px solid #2563eb;
              padding-bottom: 10px;
              margin-bottom: 15px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th {
              background: #2563eb;
              color: white;
              padding: 12px;
              text-align: left;
              font-weight: 600;
            }
            td {
              padding: 10px 12px;
              border-bottom: 1px solid #e9ecef;
            }
            tr:nth-child(even) {
              background: #f8f9fa;
            }
            .category-breakdown {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-top: 15px;
            }
            .category-item {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 6px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-left: 4px solid #2563eb;
            }
            .category-name {
              font-weight: 600;
              color: #333;
            }
            .category-amount {
              font-weight: bold;
              color: #ef4444;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 2px solid #e9ecef;
              padding-top: 20px;
            }
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>💰 Finance.AI Report</h1>
            <p>Financial Summary Report</p>
            <p><strong>Period:</strong> ${new Date(
              dateRange.startDate,
            ).toLocaleDateString()} - ${new Date(
              dateRange.endDate,
            ).toLocaleDateString()}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            <p><strong>User:</strong> ${user.email}</p>
          </div>

          <div class="summary">
            <div class="summary-card income">
              <h3>Total Income</h3>
              <p class="amount">₹${totalIncome.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}</p>
            </div>
            <div class="summary-card expense">
              <h3>Total Expenses</h3>
              <p class="amount">₹${totalExpenses.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}</p>
            </div>
            <div class="summary-card savings">
              <h3>Net Savings</h3>
              <p class="amount">₹${netSavings.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}</p>
            </div>
          </div>

          ${
            reportType === "detailed" || reportType === "summary"
              ? `
          <div class="section">
            <h2>📊 Expense Breakdown by Category</h2>
            <div class="category-breakdown">
              ${Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(
                  ([category, amount]) => `
                  <div class="category-item">
                    <span class="category-name">${category}</span>
                    <span class="category-amount">₹${amount.toLocaleString(
                      "en-IN",
                      { minimumFractionDigits: 2 },
                    )}</span>
                  </div>
                `,
                )
                .join("")}
            </div>
          </div>
          `
              : ""
          }

          ${
            reportType === "detailed"
              ? `
          <div class="section">
            <h2>💸 Expense Transactions</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${data.expenses
                  .map(
                    (e) => `
                  <tr>
                    <td>${new Date(e.date).toLocaleDateString()}</td>
                    <td>${e.description}</td>
                    <td>${e.category}</td>
                    <td style="text-align: right; color: #ef4444; font-weight: 600;">₹${parseFloat(
                      e.amount,
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="section page-break">
            <h2>💵 Income Transactions</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${data.income
                  .map(
                    (i) => `
                  <tr>
                    <td>${new Date(i.date).toLocaleDateString()}</td>
                    <td>${i.source}</td>
                    <td>${i.description || "-"}</td>
                    <td style="text-align: right; color: #10b981; font-weight: 600;">₹${parseFloat(
                      i.amount,
                    ).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }

          ${
            reportType === "detailed" || reportType === "summary"
              ? `
          <div class="section">
            <h2>🎯 Goals Progress</h2>
            <table>
              <thead>
                <tr>
                  <th>Goal Name</th>
                  <th style="text-align: right;">Target</th>
                  <th style="text-align: right;">Current</th>
                  <th style="text-align: right;">Progress</th>
                </tr>
              </thead>
              <tbody>
                ${data.goals
                  .map((g) => {
                    const progress = (
                      (parseFloat(g.current_amount) /
                        parseFloat(g.target_amount)) *
                      100
                    ).toFixed(1);
                    return `
                    <tr>
                      <td>${g.goal_name}</td>
                      <td style="text-align: right;">₹${parseFloat(
                        g.target_amount,
                      ).toLocaleString("en-IN")}</td>
                      <td style="text-align: right;">₹${parseFloat(
                        g.current_amount,
                      ).toLocaleString("en-IN")}</td>
                      <td style="text-align: right; font-weight: 600;">${progress}%</td>
                    </tr>
                  `;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
          `
              : ""
          }

          <div class="footer">
            <p>Generated by Finance.AI - Your Personal Finance Management System</p>
            <p>This is a computer-generated report. For queries, contact support.</p>
          </div>
        </body>
        </html>
      `;

      // Create a blob and download
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      // Open in new window to print as PDF
      const printWindow = window.open(url, "_blank");
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          URL.revokeObjectURL(url);
        }, 250);
      };

      setLoading(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!data) return;

    let csv = "Type,Date,Description,Category/Source,Amount\n";

    data.expenses.forEach((e) => {
      csv += `Expense,${e.date},"${e.description}",${e.category},${e.amount}\n`;
    });

    data.income.forEach((i) => {
      csv += `Income,${i.date},"${i.description || "-"}",${i.source},${
        i.amount
      }\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              📄 Export Reports
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Report Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="summary">Summary Report</option>
              <option value="detailed">Detailed Report</option>
              <option value="minimal">Minimal Report</option>
            </select>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="includeCharts"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label
              htmlFor="includeCharts"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              Include charts and visualizations
            </label>
          </div>
        </div>

        {/* Preview Stats */}
        {data && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Report Preview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Expenses
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {data.expenses.length}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Income
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {data.income.length}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Goals
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {data.goals.length}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Investments
                </p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  {data.investments.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Export Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Export Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={generatePDF}
              disabled={loading || !data}
              className="flex items-center justify-center space-x-2 bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
            >
              <span>📄</span>
              <span>{loading ? "Generating..." : "Export as PDF"}</span>
            </button>
            <button
              onClick={exportCSV}
              disabled={!data}
              className="flex items-center justify-center space-x-2 bg-green-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
            >
              <span>📊</span>
              <span>Export as CSV</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
            PDF will open in a new window. Use browser's print dialog to save as
            PDF.
          </p>
        </div>
      </div>
    </div>
  );
}
