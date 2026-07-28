import { useEffect, useRef, useState } from 'react';

// Wraps any content in a fade + slide-up entrance that fires once, the
// first time it scrolls into the viewport. Pure CSS transform/opacity
// (GPU-friendly, no layout thrash) and fully inert when the user has
// `prefers-reduced-motion` set (see the .reveal rules in index.css).
//
// Usage: <Reveal><Card /></Reveal>  or  <Reveal delay={150} as="li">...</Reveal>
export default function Reveal({ children, delay = 0, className = '', as: Tag = 'div', once = true }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}
