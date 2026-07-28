import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Bell, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { navFor } from '../../utils/nav';
import { roleDisplayName } from '../../utils/roles';
import { notificationsApi } from '../../api/resources';
import Crest from '../ui/Crest';

// Admin-only layout. Wrapped in `.brand-theme` (see index.css) which remaps
// the shared Card/Button/Badge/Input CSS variables to the public website's
// blue/pink, white-card, sans-serif branding — so every existing admin page
// (Overview, Students, Staff, ...) automatically matches the public site
// without per-page edits. Staff/Parent/Student keep the original layout.
export default function AdminDashboardLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  const items = navFor(user);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;
    notificationsApi
      .getAll({ limit: 1 })
      .then((res) => mounted && setUnread(res.unreadCount || 0))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/admin/login', { replace: true });
  }

  return (
    <div className="brand-theme min-h-screen flex bg-[var(--paper-100)]">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-[var(--paper-200)] flex flex-col transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-5 py-5 bg-blue-600">
          <Crest size={36} className="drop-shadow" />
          <div>
            <p className="text-sm font-bold leading-tight text-white">{settings.schoolName}</p>
            <p className="text-[10px] uppercase tracking-widest text-white/80">
              {roleDisplayName(user)}
            </p>
          </div>
          <button className="ml-auto lg:hidden text-white" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto thin-scroll px-3 py-4 space-y-1">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm'
                    : 'text-gray-700 hover:text-pink-500 hover:bg-pink-50'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-[var(--paper-200)]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-500 transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-[var(--paper-200)] bg-white/80 backdrop-blur-md shadow-sm">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>
          <div className="ml-auto flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-pink-500" aria-label="Notifications">
              <Bell size={19} />
              {unread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {user?.fullName?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{roleDisplayName(user)}</p>
              </div>
            </div>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
