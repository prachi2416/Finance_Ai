// Footer.jsx
import { Link } from "react-router-dom";
import { useDarkMode } from "../DarkModeContext";

export default function Footer() {
  const { isDark } = useDarkMode();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-gray-200"} border-t mt-auto`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo + Copyright */}
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">₹</span>
            </div>
            <div>
              <span
                className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-800"}`}
              >
                Finance.ai
              </span>
              <p
                className={`text-xs ${isDark ? "text-slate-500" : "text-gray-400"}`}
              >
                © {currentYear} Finance.ai. All rights reserved.
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6">
            {[
              { label: "About", to: "/about" },
              { label: "Contact", to: "/contact" },
              { label: "Feedback", to: "/feedback" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors ${isDark ? "text-slate-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Built with */}
          <p
            className={`text-xs ${isDark ? "text-slate-600" : "text-gray-400"}`}
          >
            
          </p>
        </div>
      </div>
    </footer>
  );
}
