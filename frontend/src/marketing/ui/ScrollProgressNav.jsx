import React, { useState, useEffect } from 'react';

const sections = [
  { id: 'hero', name: 'Home' },
  { id: 'sitemap', name: 'Sitemap' },
  { id: 'features', name: 'Features' },
  { id: 'amenities', name: 'Amenities' },
  { id: 'notices', name: 'Notices' },
  { id: 'events', name: 'Events' },
  { id: 'guidelines', name: 'Guidelines' },
  { id: 'emergency', name: 'SOS' },
];

export default function ScrollProgressNav() {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const lenis = window.__lenis;
      if (lenis) {
        setScrollProgress(lenis.progress * 100);

        const scrollPosition = lenis.scroll + window.innerHeight * 0.35;
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i].id);
          if (el) {
            const top = el.offsetTop;
            if (scrollPosition >= top) {
              setActiveSection(sections[i].id);
              break;
            }
          }
        }
      } else {
        // Fallback for native window scroll
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const currentProgress = (window.scrollY / totalHeight) * 100;
          setScrollProgress(currentProgress);
        }

        const scrollPosition = window.scrollY + window.innerHeight * 0.35;
        for (let i = sections.length - 1; i >= 0; i--) {
          const el = document.getElementById(sections[i].id);
          if (el) {
            const top = el.offsetTop;
            if (scrollPosition >= top) {
              setActiveSection(sections[i].id);
              break;
            }
          }
        }
      }
    };

    const bindLenis = () => {
      const lenis = window.__lenis;
      if (lenis) {
        lenis.on('scroll', handleScroll);
        return true;
      }
      return false;
    };

    let bound = bindLenis();
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    let checkInterval;
    if (!bound) {
      checkInterval = setInterval(() => {
        if (bindLenis()) {
          clearInterval(checkInterval);
        }
      }, 100);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      window.removeEventListener('scroll', handleScroll);
      window.__lenis?.off('scroll', handleScroll);
    };
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      if (window.__lenis) {
        window.__lenis.scrollTo(el);
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* 1. Ultra-Thin Top Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] bg-white/5 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(52,211,153,0.8)]"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Floating Right-Side Architectural Section Navigator (Desktop) */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-end gap-3.5 pointer-events-auto">
        <div className="bg-[#090b0e]/80 backdrop-blur-xl border border-white/10 p-2.5 rounded-full flex flex-col gap-2.5 shadow-2xl">
          {sections.map((sec) => {
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className="group relative flex items-center justify-center cursor-pointer p-1"
                aria-label={`Jump to ${sec.name}`}
              >
                {/* Floating Tooltip Label on Hover / Active */}
                <span
                  className={`absolute right-7 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase transition-all duration-300 whitespace-nowrap pointer-events-none ${isActive
                      ? 'bg-white text-black opacity-100 translate-x-0 shadow-md font-semibold'
                      : 'bg-black/80 border border-white/15 text-white/70 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
                    }`}
                >
                  {sec.name}
                </span>

                {/* Navigator Dot */}
                <div
                  className={`rounded-full transition-all duration-400 ${isActive
                      ? 'w-2.5 h-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]'
                      : 'w-2 h-2 bg-white/25 group-hover:bg-white/60 group-hover:scale-125'
                    }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
