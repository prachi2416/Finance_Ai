import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function CreditScoreSimulator() {
  const [currentScore, setCurrentScore] = useState(750);
  const [factors, setFactors] = useState({
    paymentHistory: 100,
    creditUtilization: 30,
    creditAge: 5,
    totalAccounts: 5,
    hardInquiries: 2,
    publicRecords: 0,
  });
  const [simulatedScore, setSimulatedScore] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const calculateScore = () => {
    // Credit score calculation weights (approximate FICO model)
    const weights = {
      paymentHistory: 0.35,
      creditUtilization: 0.3,
      creditAge: 0.15,
      accountMix: 0.1,
      inquiries: 0.1,
    };

    // Payment History Score (35%)
    let paymentScore = 0;
    if (factors.paymentHistory >= 100) paymentScore = 35;
    else if (factors.paymentHistory >= 95) paymentScore = 32;
    else if (factors.paymentHistory >= 90) paymentScore = 28;
    else if (factors.paymentHistory >= 80) paymentScore = 22;
    else paymentScore = 15;

    // Credit Utilization Score (30%)
    let utilizationScore = 0;
    if (factors.creditUtilization <= 10) utilizationScore = 30;
    else if (factors.creditUtilization <= 30) utilizationScore = 25;
    else if (factors.creditUtilization <= 50) utilizationScore = 18;
    else if (factors.creditUtilization <= 75) utilizationScore = 10;
    else utilizationScore = 5;

    // Credit Age Score (15%)
    let ageScore = 0;
    if (factors.creditAge >= 10) ageScore = 15;
    else if (factors.creditAge >= 7) ageScore = 12;
    else if (factors.creditAge >= 5) ageScore = 10;
    else if (factors.creditAge >= 3) ageScore = 7;
    else if (factors.creditAge >= 1) ageScore = 5;
    else ageScore = 2;

    // Account Mix Score (10%)
    let accountScore = 0;
    if (factors.totalAccounts >= 10) accountScore = 10;
    else if (factors.totalAccounts >= 7) accountScore = 8;
    else if (factors.totalAccounts >= 5) accountScore = 6;
    else if (factors.totalAccounts >= 3) accountScore = 4;
    else accountScore = 2;

    // Hard Inquiries Score (10%)
    let inquiryScore = 0;
    if (factors.hardInquiries === 0) inquiryScore = 10;
    else if (factors.hardInquiries <= 2) inquiryScore = 8;
    else if (factors.hardInquiries <= 4) inquiryScore = 5;
    else inquiryScore = 2;

    // Public Records Penalty
    const recordsPenalty = factors.publicRecords * 50;

    // Calculate total score (300-850 range)
    const rawScore =
      paymentScore + utilizationScore + ageScore + accountScore + inquiryScore;
    let finalScore = Math.round((rawScore / 100) * 550 + 300);
    finalScore = Math.max(300, Math.min(850, finalScore - recordsPenalty));

    setSimulatedScore(finalScore);

    // Generate recommendations
    const recs = [];
    if (factors.paymentHistory < 100) {
      recs.push({
        icon: "⏰",
        title: "Improve Payment History",
        description:
          "Pay all bills on time. Set up automatic payments to never miss a due date.",
        impact: "High",
        color: "red",
      });
    }
    if (factors.creditUtilization > 30) {
      recs.push({
        icon: "💳",
        title: "Reduce Credit Utilization",
        description: `Lower your utilization to below 30%. Current: ${factors.creditUtilization}%`,
        impact: "High",
        color: "orange",
      });
    }
    if (factors.creditAge < 5) {
      recs.push({
        icon: "📅",
        title: "Build Credit History",
        description: "Keep old accounts open to increase average account age.",
        impact: "Medium",
        color: "yellow",
      });
    }
    if (factors.totalAccounts < 5) {
      recs.push({
        icon: "🏦",
        title: "Diversify Credit Mix",
        description:
          "Consider adding different types of credit (credit card, loan, etc.)",
        impact: "Low",
        color: "blue",
      });
    }
    if (factors.hardInquiries > 2) {
      recs.push({
        icon: "🔍",
        title: "Limit Credit Applications",
        description:
          "Avoid applying for new credit frequently. Wait 6+ months between applications.",
        impact: "Medium",
        color: "purple",
      });
    }
    if (factors.publicRecords > 0) {
      recs.push({
        icon: "⚠️",
        title: "Address Public Records",
        description:
          "Resolve any bankruptcies, liens, or collections immediately.",
        impact: "Critical",
        color: "red",
      });
    }

    if (recs.length === 0) {
      recs.push({
        icon: "🎉",
        title: "Excellent Credit!",
        description:
          "Maintain your current habits to keep your excellent credit score.",
        impact: "Maintain",
        color: "green",
      });
    }

    setRecommendations(recs);
  };

  const getScoreColor = (score) => {
    if (score >= 750) return "text-green-600 dark:text-green-400";
    if (score >= 700) return "text-blue-600 dark:text-blue-400";
    if (score >= 650) return "text-yellow-600 dark:text-yellow-400";
    if (score >= 600) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreRating = (score) => {
    if (score >= 800) return "Exceptional";
    if (score >= 740) return "Very Good";
    if (score >= 670) return "Good";
    if (score >= 580) return "Fair";
    return "Poor";
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case "Critical":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      case "High":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      case "Medium":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "Low":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "Maintain":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

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
              📊 Credit Score Simulator
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6">
                Credit Factors
              </h2>

              <div className="space-y-6">
                {/* Payment History */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Payment History (35% weight)
                    </label>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {factors.paymentHistory}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={factors.paymentHistory}
                    onChange={(e) =>
                      setFactors({
                        ...factors,
                        paymentHistory: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    % of on-time payments
                  </p>
                </div>

                {/* Credit Utilization */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Credit Utilization (30% weight)
                    </label>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {factors.creditUtilization}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={factors.creditUtilization}
                    onChange={(e) =>
                      setFactors({
                        ...factors,
                        creditUtilization: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    % of credit limit used
                  </p>
                </div>

                {/* Credit Age */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Credit History Length (15% weight)
                    </label>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {factors.creditAge} years
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={factors.creditAge}
                    onChange={(e) =>
                      setFactors({
                        ...factors,
                        creditAge: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Average age of accounts
                  </p>
                </div>

                {/* Total Accounts */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Credit Accounts (10% weight)
                    </label>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {factors.totalAccounts}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={factors.totalAccounts}
                    onChange={(e) =>
                      setFactors({
                        ...factors,
                        totalAccounts: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Number of credit accounts
                  </p>
                </div>

                {/* Hard Inquiries */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Hard Inquiries (10% weight)
                    </label>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {factors.hardInquiries}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={factors.hardInquiries}
                    onChange={(e) =>
                      setFactors({
                        ...factors,
                        hardInquiries: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Credit checks in last 2 years
                  </p>
                </div>

                {/* Public Records */}
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Public Records (Negative)
                    </label>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {factors.publicRecords}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={factors.publicRecords}
                    onChange={(e) =>
                      setFactors({
                        ...factors,
                        publicRecords: parseInt(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Bankruptcies, liens, collections
                  </p>
                </div>
              </div>

              <button
                onClick={calculateScore}
                className="w-full mt-6 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Calculate Credit Score
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Score Display */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
              <h2 className="text-xl font-bold mb-2">Simulated Credit Score</h2>
              {simulatedScore ? (
                <>
                  <div className={`text-7xl font-bold mb-2`}>
                    {simulatedScore}
                  </div>
                  <div className="text-2xl font-semibold mb-4">
                    {getScoreRating(simulatedScore)}
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>300</span>
                      <span>850</span>
                    </div>
                    <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                      <div
                        className="bg-white h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${((simulatedScore - 300) / 550) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8">
                  <div className="text-6xl mb-4">🎯</div>
                  <p className="text-lg">Adjust factors and calculate</p>
                </div>
              )}
            </div>

            {/* Score Ranges */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                Credit Score Ranges
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 dark:bg-opacity-20 rounded">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    800-850: Exceptional
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Best rates
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    740-799: Very Good
                  </span>
                  <span className="text-xs text-blue-600 dark:text-blue-400">
                    Good rates
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    670-739: Good
                  </span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    Average rates
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20 rounded">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    580-669: Fair
                  </span>
                  <span className="text-xs text-orange-600 dark:text-orange-400">
                    Higher rates
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded">
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    300-579: Poor
                  </span>
                  <span className="text-xs text-red-600 dark:text-red-400">
                    Difficult approval
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 border-l-4 bg-gray-50 dark:bg-gray-700 rounded"
                      style={{ borderColor: rec.color }}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{rec.icon}</span>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {rec.title}
                            </h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getImpactColor(
                                rec.impact
                              )}`}
                            >
                              {rec.impact}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {rec.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-900 dark:text-blue-300">
            <strong>ℹ️ Note:</strong> This is a simulation based on standard
            credit scoring models. Actual credit scores may vary based on
            individual credit history and bureau calculations. Check your real
            credit score through official channels like CIBIL, Experian, or
            Equifax.
          </p>
        </div>
      </div>
    </div>
  );
}
