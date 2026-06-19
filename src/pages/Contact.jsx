import { useState } from "react";
import { db } from "../firebaseClient";
import { collection, addDoc } from "firebase/firestore";
import { useDarkMode } from "../DarkModeContext";

const CONTACT_INFO = [
  { icon: "📧", label: "Email", value: "support@financeapp.com" },
  { icon: "⏱️", label: "Response Time", value: "Within 24 hours" },
  { icon: "🌍", label: "Support Hours", value: "Mon–Fri, 9am–6pm IST" },
];

const SUBJECTS = [
  "General Inquiry",
  "Bug Report",
  "Feature Request",
  "Billing & Subscription",
  "Account Issue",
  "Other",
];

export default function Contact() {
  const { isDark } = useDarkMode();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await addDoc(collection(db, "contact_messages"), {
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
        created_at: new Date().toISOString(),
        status: "unread",
      });

      setSuccess("Message sent! We'll get back to you within 24 hours. 🎉");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = `w-full px-4 py-3 rounded-xl border-2 outline-none transition-all duration-200 text-sm font-medium`;
  const inputTheme = isDark
    ? "bg-slate-900/60 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:bg-slate-900"
    : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:shadow-sm focus:shadow-blue-100";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-slate-950" : "bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40"}`}
    >
      {/* Decorative top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-6 ${isDark ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-blue-50 text-blue-600 border border-blue-100"}`}
          >
            ✦ Get in touch
          </div>
          <h1
            className={`text-5xl font-black tracking-tight mb-4 ${isDark ? "text-white" : "text-gray-900"}`}
          >
            We'd love to{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              hear from you
            </span>
          </h1>
          <p
            className={`text-base max-w-md mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-gray-500"}`}
          >
            Have a question, found a bug, or want to suggest something? Drop us
            a message and we'll be right with you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left — Info panel */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Contact info cards */}
            <div
              className={`rounded-2xl p-6 border ${isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-white border-gray-200 shadow-sm"}`}
            >
              <h2
                className={`text-sm font-bold uppercase tracking-widest mb-5 ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                Contact Info
              </h2>
              <div className="space-y-5">
                {CONTACT_INFO.map((item) => (
                  <div key={item.label} className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${isDark ? "bg-slate-700" : "bg-slate-100"}`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${isDark ? "text-slate-500" : "text-gray-400"}`}
                      >
                        {item.label}
                      </p>
                      <p
                        className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-gray-800"}`}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Note card */}
            <div className="rounded-2xl p-5 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <p className="text-2xl mb-2">💬</p>
              <h3 className="font-bold text-base mb-1">Quick tip</h3>
              <p className="text-sm opacity-85 leading-relaxed">
                For faster support, include your account email and a clear
                description of the issue. Screenshots help too!
              </p>
            </div>

            {/* FAQ nudge */}
            <div
              className={`rounded-2xl p-5 border ${isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-white border-gray-200 shadow-sm"}`}
            >
              <p
                className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-gray-900"}`}
              >
                🔍 Check our FAQ first
              </p>
              <p
                className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                Many common questions about budgets, categories, and data sync
                are already answered in our help centre.
              </p>
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

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name + Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused("")}
                      className={`${inputBase} ${inputTheme} ${focused === "name" ? "ring-2 ring-blue-500/20" : ""}`}
                      placeholder="Rahul Sharma"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused("")}
                      className={`${inputBase} ${inputTheme} ${focused === "email" ? "ring-2 ring-blue-500/20" : ""}`}
                      placeholder="rahul@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Subject dropdown */}
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                  >
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) =>
                      setForm({ ...form, subject: e.target.value })
                    }
                    className={`${inputBase} ${inputTheme} cursor-pointer`}
                    required
                  >
                    <option value="" disabled>
                      Select a topic…
                    </option>
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    className={`block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                  >
                    Message
                  </label>
                  <textarea
                    rows={6}
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused("")}
                    className={`${inputBase} ${inputTheme} resize-none ${focused === "message" ? "ring-2 ring-blue-500/20" : ""}`}
                    placeholder="Describe your issue or question in detail…"
                    required
                  />
                  <p
                    className={`text-xs mt-1.5 text-right ${isDark ? "text-slate-600" : "text-gray-400"}`}
                  >
                    {form.message.length} / 1000
                  </p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm tracking-wide hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send Message
                      <span>📬</span>
                    </>
                  )}
                </button>

                <p
                  className={`text-center text-xs ${isDark ? "text-slate-600" : "text-gray-400"}`}
                >
                  By submitting you agree to our privacy policy. We never share
                  your data.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
