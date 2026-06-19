import { useState } from "react";
import { db } from "../firebaseClient";
import { collection, addDoc } from "firebase/firestore";
import { useDarkMode } from "../DarkModeContext";
import { useGuest } from "../GuestContext";

const CATEGORIES = [
  { label: "General", icon: "💬" },
  { label: "UI/UX", icon: "🎨" },
  { label: "AI Advisor", icon: "🤖" },
  { label: "Performance", icon: "⚡" },
  { label: "Features", icon: "✨" },
  { label: "Bug Report", icon: "🐛" },
];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
const RATING_COLORS = [
  "",
  "text-red-500",
  "text-orange-500",
  "text-yellow-500",
  "text-blue-500",
  "text-green-500",
];
const RATING_BG = [
  "",
  "border-red-400 bg-red-400/10",
  "border-orange-400 bg-orange-400/10",
  "border-yellow-400 bg-yellow-400/10",
  "border-blue-400 bg-blue-400/10",
  "border-green-400 bg-green-400/10",
];

export default function Feedback() {
  const { isDark } = useDarkMode();
  const { user } = useGuest();

  const [form, setForm] = useState({
    category: "General",
    rating: 0,
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) {
      setError("Please select a rating before submitting.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await addDoc(collection(db, "feedback"), {
        user_id: user?.uid || null,
        category: form.category,
        rating: form.rating,
        title: form.title.trim(),
        message: form.message.trim(),
        created_at: new Date().toISOString(),
        status: "unread",
      });

      setSuccess("Thank you! Your feedback helps us improve Finance.ai 🎉");
      setForm({ category: "General", rating: 0, title: "", message: "" });
      setHoveredStar(0);
    } catch (err) {
      console.error("Feedback error:", err);
      setError("Failed to submit feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeStar = hoveredStar || form.rating;
  const inputBase = `w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 text-sm font-medium`;
  const inputTheme = isDark
    ? "bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-slate-950" : "bg-gradient-to-br from-slate-50 via-purple-50/20 to-blue-50/30"}`}
    >
      <div className="h-1 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400" />

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6 ${isDark ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-purple-50 text-purple-600 border border-purple-100"}`}
          >
            ✦ Share your thoughts
          </div>
          <h1
            className={`text-5xl font-black tracking-tight mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            Your feedback{" "}
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              shapes us
            </span>
          </h1>
          <p
            className={`text-base max-w-md mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-gray-500"}`}
          >
            Every piece of feedback — big or small — helps us build a better
            Finance.ai for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left panel */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Why feedback matters */}
            <div
              className={`rounded-2xl p-6 border ${isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-white border-gray-200 shadow-sm"}`}
            >
              <h2
                className={`text-xs font-bold uppercase tracking-widest mb-5 ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                Why it matters
              </h2>
              <div className="space-y-4">
                {[
                  {
                    icon: "🚀",
                    title: "Shape Features",
                    desc: "Your ideas directly influence our roadmap.",
                  },
                  {
                    icon: "🐛",
                    title: "Fix Bugs Fast",
                    desc: "Bug reports help us keep the app rock-solid.",
                  },
                  {
                    icon: "💡",
                    title: "Inspire Design",
                    desc: "UX feedback guides every interface decision.",
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-semibold mb-0.5 ${isDark ? "text-slate-200" : "text-gray-800"}`}
                      >
                        {item.title}
                      </p>
                      <p
                        className={`text-xs leading-relaxed ${isDark ? "text-slate-500" : "text-gray-400"}`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient CTA card */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <p className="text-2xl mb-2">🎯</p>
              <h3 className="font-bold text-base mb-1">Be specific</h3>
              <p className="text-sm opacity-85 leading-relaxed">
                The more detail you share, the faster we can act on it.
                Screenshots, steps to reproduce, and use cases are gold.
              </p>
            </div>

            {/* Stats card */}
            <div
              className={`rounded-2xl p-5 border ${isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-white border-gray-200 shadow-sm"}`}
            >
              <p
                className={`text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? "text-slate-500" : "text-gray-400"}`}
              >
                Our commitment
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "24h", label: "Review time" },
                  { value: "100%", label: "Read by team" },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-xl p-3 text-center ${isDark ? "bg-slate-700/50" : "bg-slate-50"}`}
                  >
                    <p
                      className={`text-xl font-black ${isDark ? "text-white" : "text-gray-900"}`}
                    >
                      {s.value}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-3">
            <div
              className={`rounded-2xl p-8 border ${isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-white border-gray-200 shadow-sm"}`}
            >
              {error && (
                <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <span className="text-lg">⚠️</span>
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <span className="text-lg">✅</span>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    {success}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wide mb-3 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                  >
                    Overall Rating
                  </label>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setForm({ ...form, rating: r })}
                        onMouseEnter={() => setHoveredStar(r)}
                        onMouseLeave={() => setHoveredStar(0)}
                        className={`flex-1 py-3.5 rounded-xl border-2 text-2xl transition-all duration-150 hover:scale-105 active:scale-95 ${
                          activeStar >= r
                            ? RATING_BG[form.rating || hoveredStar] ||
                              "border-yellow-400 bg-yellow-400/10"
                            : isDark
                              ? "border-slate-700 hover:border-slate-500"
                              : "border-gray-200 hover:border-gray-300"
                        }`}
                        title={RATING_LABELS[r]}
                      >
                        {activeStar >= r ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                  <div className="text-center h-5">
                    {activeStar > 0 && (
                      <span
                        className={`text-sm font-semibold ${RATING_COLORS[activeStar]}`}
                      >
                        {RATING_LABELS[activeStar]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Category pills */}
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wide mb-3 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                  >
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(({ label, icon }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setForm({ ...form, category: label })}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border-2 transition-all duration-150 flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 ${
                          form.category === label
                            ? "border-purple-500 bg-purple-500/10 text-purple-500 dark:text-purple-400"
                            : isDark
                              ? "border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    className={`${inputBase} ${inputTheme}`}
                    placeholder="Brief summary of your feedback"
                    maxLength={120}
                    required
                  />
                  <p
                    className={`text-xs mt-1 text-right ${isDark ? "text-slate-600" : "text-gray-400"}`}
                  >
                    {form.title.length} / 120
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                  >
                    Detailed Feedback
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    className={`${inputBase} ${inputTheme} resize-none`}
                    placeholder="Tell us what you love, what can be improved, or steps to reproduce a bug…"
                    maxLength={1000}
                    required
                  />
                  <p
                    className={`text-xs mt-1 text-right ${isDark ? "text-slate-600" : "text-gray-400"}`}
                  >
                    {form.message.length} / 1000
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-purple-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit Feedback
                      <span>💬</span>
                    </>
                  )}
                </button>

                <p
                  className={`text-center text-xs ${isDark ? "text-slate-600" : "text-gray-400"}`}
                >
                  Feedback is anonymous unless you're logged in. We read every
                  submission.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
