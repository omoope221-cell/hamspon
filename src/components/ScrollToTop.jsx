import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Mounted once near the root, inside the Router. Scrolls the window back
// to the top whenever the pathname changes, so navigating between pages
// (public site links, sidebar links, etc.) never leaves the scroll
// position stuck partway down the previous page.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window.HTMLElement.prototype ? 'instant' : 'auto' });
  }, [pathname]);

  return null;
}
