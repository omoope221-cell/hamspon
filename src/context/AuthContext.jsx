import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { authApi } from '../api/auth';
import { setAccessToken, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

// Sign the user out after this long with no interaction, regardless of
// whether their access/refresh tokens are still technically valid.
const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(async (skipServerCall) => {
    if (!skipServerCall) {
      try {
        await authApi.logout();
      } catch (_) {
        /* best-effort */
      }
    }
    setAccessToken(null);
    setUser(null);
  }, []);

  // If the silent refresh (triggered by any 401) ultimately fails, the API
  // client calls this to force the user back to the login screen.
  useEffect(() => {
    setUnauthorizedHandler(() => logout(true));
  }, [logout]);

  // On first load, try to silently refresh using the httpOnly cookie so a
  // page reload doesn't force a re-login.
  useEffect(() => {
    (async () => {
      try {
        const data = await authApi.refresh();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch (_) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  const idleTimerRef = useRef(null);

  // Auto-logout after IDLE_LIMIT_MS of no mouse/keyboard/touch/scroll
  // activity, regardless of whether the access/refresh tokens are still
  // technically valid — satisfies "automatic logout after prolonged
  // inactivity" independent of token expiry.
  useEffect(() => {
    if (!user) return undefined;

    function resetIdleTimer() {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(() => {
        logout(false);
      }, IDLE_LIMIT_MS);
    }

    resetIdleTimer();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetIdleTimer));

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetIdleTimer));
    };
  }, [user, logout]);

  const login = useCallback(async (accountType, identifier, password) => {
    const data = await authApi.login(accountType, identifier, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }, []);

  const refreshMe = useCallback(async () => {
    const data = await authApi.me();
    setUser((prev) => ({ ...prev, ...data.data }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, initializing, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
