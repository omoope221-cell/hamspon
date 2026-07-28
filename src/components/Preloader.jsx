import { useEffect, useState } from 'react';

// Shown once, on the very first load of the site, before anything else
// (including the Homepage) is visible. Fades out automatically once the
// page is ready — never blocks route changes after the first load.
export default function Preloader({ onDone, logo, schoolName }) {
  const [fadingOut, setFadingOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const minDisplay = setTimeout(() => setFadingOut(true), 1200);
    return () => clearTimeout(minDisplay);
  }, []);

  useEffect(() => {
    if (!fadingOut) return;
    const removeTimer = setTimeout(() => {
      setHidden(true);
      onDone?.();
    }, 500); // matches the CSS fade-out duration below
    return () => clearTimeout(removeTimer);
  }, [fadingOut, onDone]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ease-out ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${schoolName || 'Hampsons Group of Schools'}`}
    >
      <div className="flex flex-col items-center gap-6 px-6 text-center animate-[preloaderFadeIn_0.6s_ease_both]">
        <div className="relative flex items-center justify-center">
          <span className="absolute h-24 w-24 rounded-full border-4 border-blue-100" />
          <span className="absolute h-24 w-24 rounded-full border-4 border-t-pink-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <img
            src={logo || '/logo-removebg-preview.png'}
            alt="Hampsons Group of Schools logo"
            className="h-14 w-14 object-contain relative z-10"
          />
        </div>

        <div>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-blue-600">
            WELCOME TO HAMPSONS
          </p>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-pink-500 -mt-1">
            GROUP OF SCHOOLS
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]" />
          <span className="h-2 w-2 rounded-full bg-pink-500 animate-bounce [animation-delay:-0.15s]" />
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce" />
        </div>
      </div>

      <style>{`
        @keyframes preloaderFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
