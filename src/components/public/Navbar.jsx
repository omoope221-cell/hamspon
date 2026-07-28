// Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  Info,
  Crown,
  Image as ImageIcon,
  Phone,
  User,
  ChevronDown,
  Menu,
  X,
  Newspaper,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { dashboardHomeFor } from "../../utils/roles";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/about", label: "About", icon: Info },
  { to: "/leadership", label: "Leadership", icon: Crown },
  { to: "/contact", label: "Contact", icon: Phone },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [newsOpen, setNewsOpen] = useState(false);
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const portalRef = useRef(null);
  const newsRef = useRef(null);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    function handleClickOutside(e) {
      if (portalRef.current && !portalRef.current.contains(e.target)) setPortalOpen(false);
      if (newsRef.current && !newsRef.current.contains(e.target)) setNewsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand — sourced from Website Settings */}
          <NavLink to="/" className="flex items-center space-x-2 min-w-0">
            <img
              src={settings.logo}
              alt={`${settings.schoolName} logo`}
              className="h-10 w-10 object-contain shrink-0"
            />
            <span className="text-xl font-bold text-blue-600 truncate">
              {settings.schoolName}
            </span>
          </NavLink>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.slice(0, 1).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="relative" ref={newsRef}>
              <button
                onClick={() => setNewsOpen((o) => !o)}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
                aria-expanded={newsOpen}
              >
                <Newspaper className="h-4 w-4" />
                <span>News & Events</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${newsOpen ? "rotate-180" : ""}`} />
              </button>
              {newsOpen && (
                <div className="absolute left-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                  <button
                    onClick={() => { setNewsOpen(false); navigate("/news"); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 flex items-center gap-2"
                  >
                    <Newspaper className="h-3.5 w-3.5" /> News
                  </button>
                  <button
                    onClick={() => { setNewsOpen(false); navigate("/events"); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 flex items-center gap-2"
                  >
                    <CalendarDays className="h-3.5 w-3.5" /> Events
                  </button>
                </div>
              )}
            </div>

            {navItems.slice(1).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            {user ? (
              <NavLink
                to={dashboardHomeFor(user)}
                className="ml-2 flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              >
                <User className="h-4 w-4" />
                <span>My Dashboard</span>
              </NavLink>
            ) : (
              <div className="relative" ref={portalRef}>
                <button
                  onClick={() => setPortalOpen((o) => !o)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
                  aria-expanded={portalOpen}
                >
                  <User className="h-4 w-4" />
                  <span>Portal</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${portalOpen ? "rotate-180" : ""}`} />
                </button>
                {portalOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <button
                      onClick={() => { setPortalOpen(false); navigate("/student/login"); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                    >
                      Student Login
                    </button>
                    <button
                      onClick={() => { setPortalOpen(false); navigate("/parent/login"); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                    >
                      Parent Login
                    </button>
                    <button
                      onClick={() => { setPortalOpen(false); navigate("/staff/login"); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500"
                    >
                      Staff Login
                    </button>
                  </div>
                )}
              </div>
            )}

            <NavLink
              to="/admissions/apply"
              className="btn-animated ml-2 inline-flex items-center px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-semibold hover:bg-pink-600 shadow-md"
            >
              Apply Now
            </NavLink>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={toggleMenu}
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu with smooth slide-down */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-4 space-y-2 bg-white/95 backdrop-blur-md shadow-inner">
          {navItems.slice(0, 1).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                  isActive ? "text-blue-600 font-bold bg-blue-50" : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <NavLink
            to="/news"
            onClick={closeMenu}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive ? "text-blue-600 font-bold bg-blue-50" : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              }`
            }
          >
            <Newspaper className="h-5 w-5" />
            <span>News</span>
          </NavLink>
          <NavLink
            to="/events"
            onClick={closeMenu}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                isActive ? "text-blue-600 font-bold bg-blue-50" : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              }`
            }
          >
            <CalendarDays className="h-5 w-5" />
            <span>Events</span>
          </NavLink>

          {navItems.slice(1).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                  isActive ? "text-blue-600 font-bold bg-blue-50" : "text-gray-700 hover:text-pink-500 hover:bg-pink-50"
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {user ? (
            <NavLink
              to={dashboardHomeFor(user)}
              onClick={closeMenu}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium bg-blue-600 text-white"
            >
              <User className="h-5 w-5" />
              <span>My Dashboard</span>
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/student/login"
                onClick={closeMenu}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              >
                <User className="h-5 w-5" />
                <span>Student Login</span>
              </NavLink>
              <NavLink
                to="/parent/login"
                onClick={closeMenu}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              >
                <User className="h-5 w-5" />
                <span>Parent Login</span>
              </NavLink>
              <NavLink
                to="/staff/login"
                onClick={closeMenu}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-pink-500 hover:bg-pink-50"
              >
                <User className="h-5 w-5" />
                <span>Staff Login</span>
              </NavLink>
            </>
          )}

          <NavLink
            to="/admissions/apply"
            onClick={closeMenu}
            className="flex items-center justify-center px-4 py-3 rounded-full text-base font-semibold bg-pink-500 text-white hover:bg-pink-600"
          >
            Apply Now
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
