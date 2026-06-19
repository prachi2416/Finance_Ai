import { useState, useRef } from "react";
import { supabase } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function ReceiptScanner() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [recentScans, setRecentScans] = useState([]);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  const categories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Personal Care",
    "Others",
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanReceipt = async () => {
    if (!selectedImage) return;

    setScanning(true);

    // Simulate AI OCR processing
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Simulated OCR extraction
    // In production, you would use an actual OCR API like Google Vision, Tesseract, etc.
    const mockExtractedData = extractMockData();

    setScannedData(mockExtractedData);
    setScanning(false);
  };

  const extractMockData = () => {
    // Simulate extracted data from receipt
    const merchants = [
      "Starbucks",
      "McDonald's",
      "Uber",
      "Amazon",
      "Walmart",
      "Target",
      "Cafe Coffee Day",
    ];
    const randomMerchant =
      merchants[Math.floor(Math.random() * merchants.length)];
    const randomAmount = (Math.random() * 500 + 50).toFixed(2);
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 7));

    // Map merchant to category
    const merchantCategoryMap = {
      Starbucks: "Food & Dining",
      "McDonald's": "Food & Dining",
      "Cafe Coffee Day": "Food & Dining",
      Uber: "Transportation",
      Amazon: "Shopping",
      Walmart: "Shopping",
      Target: "Shopping",
    };

    return {
      merchant: randomMerchant,
      amount: parseFloat(randomAmount),
      date: randomDate.toISOString().split("T")[0],
      category: merchantCategoryMap[randomMerchant] || "Others",
      items: [
        { name: "Item 1", price: (randomAmount * 0.4).toFixed(2) },
        { name: "Item 2", price: (randomAmount * 0.3).toFixed(2) },
        { name: "Tax", price: (randomAmount * 0.1).toFixed(2) },
        { name: "Service", price: (randomAmount * 0.2).toFixed(2) },
      ],
      confidence: Math.floor(Math.random() * 20 + 80),
    };
  };

  const handleFieldChange = (field, value) => {
    setScannedData({ ...scannedData, [field]: value });
  };

  const saveExpense = async () => {
    if (!scannedData || !scannedData.amount) {
      alert("Please scan a receipt first");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const { error } = await supabase.from("expenses").insert([
        {
          user_id: user.uid,
          amount: scannedData.amount,
          category: scannedData.category,
          description: `Receipt from ${scannedData.merchant}`,
          date: scannedData.date,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Add to recent scans
      setRecentScans([
        {
          id: Date.now(),
          merchant: scannedData.merchant,
          amount: scannedData.amount,
          date: scannedData.date,
        },
        ...recentScans.slice(0, 4),
      ]);

      alert("✅ Expense saved successfully!");
      resetScanner();
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Failed to save expense. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setScannedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
              📸 Receipt Scanner
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                Upload Receipt
              </h2>

              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition"
                >
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Click to upload receipt
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Supports JPG, PNG (max 5MB)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Receipt preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={resetScanner}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                    >
                      ✕
                    </button>
                  </div>

                  <button
                    onClick={scanReceipt}
                    disabled={scanning}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition disabled:opacity-50"
                  >
                    {scanning ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Scanning Receipt...
                      </span>
                    ) : (
                      "🔍 Scan Receipt"
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Camera Option */}
            <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                📱 Pro Tip
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-400">
                For best results, take photos in good lighting with the entire
                receipt visible. Avoid shadows and ensure text is clear and
                readable.
              </p>
            </div>
          </div>

          {/* Scanned Data Section */}
          <div className="space-y-6">
            {scannedData ? (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      Extracted Data
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        scannedData.confidence >= 90
                          ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                          : scannedData.confidence >= 70
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {scannedData.confidence}% Confidence
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Merchant
                      </label>
                      <input
                        type="text"
                        value={scannedData.merchant}
                        onChange={(e) =>
                          handleFieldChange("merchant", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={scannedData.amount}
                        onChange={(e) =>
                          handleFieldChange(
                            "amount",
                            parseFloat(e.target.value),
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={scannedData.date}
                        onChange={(e) =>
                          handleFieldChange("date", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={scannedData.category}
                        onChange={(e) =>
                          handleFieldChange("category", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Items Breakdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Items
                      </label>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                        {scannedData.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-700 dark:text-gray-300">
                              {item.name}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ₹{item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={saveExpense}
                        disabled={saving}
                        className="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
                      >
                        {saving ? "Saving..." : "Save Expense"}
                      </button>
                      <button
                        onClick={resetScanner}
                        className="px-6 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center justify-center h-full min-h-[400px] text-gray-400 dark:text-gray-500">
                <svg
                  className="w-24 h-24 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg font-medium">Upload and scan a receipt</p>
                <p className="text-sm mt-2">Extracted data will appear here</p>
              </div>
            )}

            {/* Recent Scans */}
            {recentScans.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                  Recent Scans
                </h3>
                <div className="space-y-2">
                  {recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {scan.merchant}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(scan.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-gray-800 dark:text-white">
                        ₹{scan.amount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 bg-purple-50 dark:bg-purple-900 dark:bg-opacity-20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-purple-900 dark:text-purple-300">
            <strong>🤖 AI-Powered:</strong> Our receipt scanner uses AI OCR
            technology to automatically extract merchant name, amount, date, and
            line items from your receipts. Review and edit the extracted data
            before saving. In demo mode, data is simulated for demonstration
            purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
