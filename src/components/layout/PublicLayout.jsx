import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../public/Navbar';
import Footer from '../public/Footer';

export default function PublicLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* key={pathname} forces a remount on route change, replaying the
          .page-fade-enter animation each time (disabled under
          prefers-reduced-motion, see index.css). */}
      <main className="flex-1 page-fade-enter" key={location.pathname}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
