// Header.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGuest } from "../GuestContext";
import { useDarkMode } from "../DarkModeContext";

export default function Header() {
  const { user, profile, isGuest, logout } = useGuest();
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinks = [
    { label: "Dashboard", to: "/" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Feedback", to: "/feedback" },
  ];

  return (
    <>
      <style>{`
        .header-glass-dark {
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .header-glass-light {
          background: rgba(255, 255, 255, 0.97);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(102,126,234,0.15);
          box-shadow: 0 2px 20px rgba(102,126,234,0.08);
        }
        .logo-gradient {
          background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nav-link {
          position: relative;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #667eea, #f093fb);
          transition: width 0.3s ease;
          border-radius: 2px;
        }
        .nav-link:hover::after { width: 100%; }

        /* ── Sticky header always visible ── */
        .header-wrap {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
        }
      `}</style>

      <header
        className={`header-wrap ${isDark ? "header-glass-dark" : "header-glass-light"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">₹</span>
              </div>
              <span className="text-xl font-black logo-gradient tracking-tight">
                Finance.ai
              </span>
              {isGuest && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                  Guest
                </span>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link text-sm font-medium ${isDark ? "text-slate-300 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${isDark ? "bg-slate-700/50 text-yellow-400 hover:bg-slate-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {isDark ? "☀️" : "🌙"}
              </button>

              {user ? (
                <div className="flex items-center space-x-3">
                  
                </div>
              ) : isGuest ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-sm px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all hover:scale-105"
                  >
                    Login
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className={`text-sm px-4 py-2 rounded-lg font-medium border-2 transition-all hover:scale-105 ${isDark ? "border-slate-600 text-slate-300 hover:border-blue-500 hover:text-blue-400" : "border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-600"}`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm px-4 py-2 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition-all hover:scale-105"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`md:hidden p-2 rounded-lg ${isDark ? "text-white" : "text-gray-800"}`}
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className={`md:hidden px-4 pb-4 pt-2 space-y-2 ${isDark ? "bg-slate-900/95" : "bg-white/95"}`}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${isDark ? "text-slate-300 hover:bg-slate-700" : "text-gray-700 hover:bg-gray-100"}`}
              >
                {link.label}
              </Link>
            ))}
            {!user && !isGuest && (
              <div className="flex space-x-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className={`flex-1 text-center py-2 rounded-lg text-sm font-medium border-2 ${isDark ? "border-slate-600 text-slate-300" : "border-gray-300 text-gray-700"}`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
