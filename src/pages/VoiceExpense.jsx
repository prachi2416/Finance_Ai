import { useState, useEffect, useRef } from "react";
import { supabase } from "../firebaseClient";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function VoiceExpense() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { isDark } = useDarkMode();

  useEffect(() => {
    checkBrowserSupport();
    checkUser();
    fetchCategories();
  }, []);

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) navigate("/login");
  };

  const checkBrowserSupport = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome or Edge.",
      );
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("type", "expense")
      .order("name");

    if (!error) {
      setCategories(data || []);
    }
  };

  const startListening = () => {
    setError("");
    setSuccess("");
    setTranscript("");
    setParsedData(null);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      parseExpense(text);
    };

    recognitionRef.current.onerror = (event) => {
      setIsListening(false);
      setError(`Error: ${event.error}`);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const parseExpense = (text) => {
    const lowerText = text.toLowerCase();

    // Extract amount - look for numbers
    const amountMatch = lowerText.match(/(\d+\.?\d*)/);
    let amount = amountMatch ? parseFloat(amountMatch[1]) : 0;

    if (isNaN(amount) || amount <= 0) {
      amount = 0;
    }

    // Extract category by matching with database categories
    let detectedCategoryId = null;

    if (categories.length > 0) {
      for (const cat of categories) {
        const categoryName = cat.name.toLowerCase();
        if (lowerText.includes(categoryName)) {
          detectedCategoryId = cat.id;
          break;
        }
      }

      // If no direct match, use keyword matching
      if (!detectedCategoryId) {
        const categoryKeywords = {
          "Food & Dining": [
            "food",
            "lunch",
            "dinner",
            "breakfast",
            "restaurant",
            "cafe",
            "coffee",
            "meal",
            "eating",
          ],
          Transportation: [
            "uber",
            "taxi",
            "gas",
            "fuel",
            "parking",
            "bus",
            "metro",
            "train",
            "travel",
            "ride",
          ],
          Shopping: [
            "shopping",
            "clothes",
            "amazon",
            "flipkart",
            "store",
            "purchase",
            "buy",
            "bought",
          ],
          Entertainment: [
            "movie",
            "netflix",
            "spotify",
            "game",
            "concert",
            "ticket",
            "show",
          ],
          "Bills & Utilities": [
            "electricity",
            "water",
            "internet",
            "phone",
            "bill",
            "rent",
            "mobile",
          ],
          Healthcare: [
            "doctor",
            "medicine",
            "pharmacy",
            "hospital",
            "medical",
            "health",
            "pill",
          ],
          Education: ["course", "book", "tuition", "school", "college", "exam"],
          Travel: ["flight", "hotel", "vacation", "trip", "booking"],
          "Personal Care": [
            "salon",
            "haircut",
            "spa",
            "gym",
            "massage",
            "care",
          ],
        };

        for (const [catName, keywords] of Object.entries(categoryKeywords)) {
          const foundCategory = categories.find((c) => c.name === catName);
          if (foundCategory) {
            if (keywords.some((keyword) => lowerText.includes(keyword))) {
              detectedCategoryId = foundCategory.id;
              break;
            }
          }
        }
      }
    }

    // Extract description (remove amount from text)
    let description = text.replace(/\d+\.?\d*/g, "").trim();
    if (description.length > 100) {
      description = description.substring(0, 100);
    }
    if (!description) {
      description = "Voice expense";
    }

    const parsed = {
      amount: amount,
      description: description,
      category_id: detectedCategoryId,
    };

    setParsedData(parsed);
  };

  const handleSaveExpense = async () => {
    if (!parsedData || !parsedData.amount || parsedData.amount <= 0) {
      setError("Please provide a valid amount greater than 0");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      const expenseData = {
        user_id: user.uid,
        amount: parsedData.amount,
        description: parsedData.description,
        category_id: parsedData.category_id,
        date: new Date().toISOString().split("T")[0],
      };

      const { error: insertError } = await supabase
        .from("expenses")
        .insert([expenseData]);

      if (insertError) throw insertError;

      setSuccess("✅ Expense saved successfully!");
      setTranscript("");
      setParsedData(null);

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setParsedData({ ...parsedData, [field]: value });
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      }`}
    >
      {/* Header */}
      <div
        className={`sticky top-0 z-40 backdrop-blur-md transition-colors duration-300 ${
          isDark
            ? "bg-slate-900/80 border-b border-slate-700/50"
            : "bg-white/80 border-b border-slate-200/50"
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/expenses")}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isDark
                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
              }`}
            >
              ← Back
            </button>
            <div>
              <h1
                className={`text-3xl font-bold transition-colors duration-300 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                🎤 Voice Expense Entry
              </h1>
              <p
                className={`text-sm transition-colors duration-300 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                Speak your expense and we'll save it
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Instructions */}
        <div
          className={`rounded-2xl p-6 mb-8 backdrop-blur-xl transition-all duration-300 ${
            isDark
              ? "bg-blue-900/20 border border-blue-800/50"
              : "bg-blue-50/50 border border-blue-200/50"
          }`}
        >
          <h3
            className={`font-semibold mb-3 transition-colors duration-300 ${
              isDark ? "text-blue-300" : "text-blue-900"
            }`}
          >
            📝 How to use:
          </h3>
          <ul
            className={`space-y-2 text-sm transition-colors duration-300 ${
              isDark ? "text-blue-400" : "text-blue-800"
            }`}
          >
            <li>✓ Click the microphone button and speak clearly</li>
            <li>✓ Example: "Spent 500 on food at restaurant"</li>
            <li>✓ Example: "2000 for uber ride"</li>
            <li>✓ Example: "100 rupees coffee"</li>
            <li>✓ Review and edit the parsed data before saving</li>
          </ul>
        </div>

        {/* Voice Input Section */}
        <div
          className={`rounded-2xl shadow-lg p-8 mb-8 backdrop-blur-xl transition-all duration-300 ${
            isDark
              ? "bg-slate-800/50 border border-slate-700/50"
              : "bg-white/50 border border-slate-200/50"
          }`}
        >
          <div className="flex flex-col items-center">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={saving}
              className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl transition-all transform hover:scale-110 font-bold shadow-xl ${
                isListening
                  ? "bg-gradient-to-r from-red-500 to-red-600 animate-pulse"
                  : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              }`}
            >
              {isListening ? "🔴" : "🎤"}
            </button>
            <p
              className={`mt-6 text-lg font-semibold transition-colors duration-300 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              {isListening ? "🔊 Listening..." : "Click to speak"}
            </p>
          </div>

          {transcript && (
            <div
              className={`mt-8 p-5 rounded-lg transition-all duration-300 ${
                isDark
                  ? "bg-slate-700/30 border border-slate-600/50"
                  : "bg-slate-100/50 border border-slate-200/50"
              }`}
            >
              <p
                className={`text-xs font-semibold mb-2 transition-colors duration-300 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                📢 You said:
              </p>
              <p
                className={`text-lg transition-colors duration-300 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                "{transcript}"
              </p>
            </div>
          )}

          {error && (
            <div
              className={`mt-6 p-4 rounded-lg border transition-all duration-300 ${
                isDark
                  ? "bg-red-900/20 border-red-800/50 text-red-300"
                  : "bg-red-50/50 border-red-200/50 text-red-700"
              }`}
            >
              <p className="font-semibold">{error}</p>
            </div>
          )}

          {success && (
            <div
              className={`mt-6 p-4 rounded-lg border transition-all duration-300 ${
                isDark
                  ? "bg-green-900/20 border-green-800/50 text-green-300"
                  : "bg-green-50/50 border-green-200/50 text-green-700"
              }`}
            >
              <p className="font-semibold">{success}</p>
            </div>
          )}
        </div>

        {/* Parsed Data Review */}
        {parsedData && (
          <div
            className={`rounded-2xl shadow-lg p-8 backdrop-blur-xl transition-all duration-300 ${
              isDark
                ? "bg-slate-800/50 border border-slate-700/50"
                : "bg-white/50 border border-slate-200/50"
            }`}
          >
            <h3
              className={`text-xl font-semibold mb-6 transition-colors duration-300 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              ✏️ Review & Edit
            </h3>

            <div className="space-y-5">
              {/* Amount */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Amount (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={parsedData.amount || ""}
                  onChange={(e) =>
                    handleFieldChange("amount", parseFloat(e.target.value) || 0)
                  }
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark
                      ? "bg-slate-700 border border-slate-600 text-white placeholder-slate-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500"
                  }`}
                  placeholder="0.00"
                />
              </div>

              {/* Category */}
              {categories.length > 0 && (
                <div>
                  <label
                    className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={parsedData.category_id || ""}
                    onChange={(e) =>
                      handleFieldChange("category_id", e.target.value || null)
                    }
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      isDark
                        ? "bg-slate-700 border border-slate-600 text-white"
                        : "bg-slate-50 border border-slate-300 text-slate-900"
                    }`}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label
                  className={`block text-sm font-semibold mb-3 transition-colors duration-300 ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={parsedData.description || ""}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isDark
                      ? "bg-slate-700 border border-slate-600 text-white placeholder-slate-400"
                      : "bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-500"
                  }`}
                  placeholder="e.g., Lunch at restaurant"
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveExpense}
                disabled={
                  saving || !parsedData.amount || parsedData.amount <= 0
                }
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                  saving || !parsedData.amount || parsedData.amount <= 0
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 hover:shadow-lg hover:scale-105"
                }`}
              >
                {saving ? "💾 Saving..." : "✅ Save Expense"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
