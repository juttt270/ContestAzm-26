import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const navItems = [
  { id: 'hero', name: 'Home', href: '#hero' },
  { id: 'features', name: 'Features', href: '#features' },
  { id: 'sitemap', name: 'Sitemap', href: '#sitemap' },
  { id: 'amenities', name: 'Amenities', href: '#amenities' },
  { id: 'notices', name: 'Notices & Polls', href: '#notices' },
  { id: 'events', name: 'Events', href: '#events' },
  { id: 'guidelines', name: 'Guidelines', href: '#guidelines' },
  { id: 'emergency', name: 'Emergency SOS', href: '#emergency' },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [activeSection, setActiveSection] = useState('hero');

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      for (let i = navItems.length - 1; i >= 0; i--) {
        const el = document.getElementById(navItems[i].id);
        if (el && scrollPosition >= el.offsetTop) {
          setActiveSection(navItems[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full h-20 sm:h-24 z-50 bg-black/85 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-4 sm:px-6 lg:px-12 transition-all">
      {/* Brand Logo */}
      <a href="#hero" className="flex items-center no-underline group shrink-0">
        <img
          src="/logo.png"
          alt="SmartSociety"
          className="h-12 sm:h-14 md:h-16 w-auto max-w-[180px] sm:max-w-[230px] object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
        />
      </a>

      {/* Center Clean Links with Smooth Hover Animation Pill (No Outer Box/Outline) */}
      <nav
        onMouseLeave={() => setHoveredIdx(null)}
        className="hidden md:flex items-center gap-1.5 lg:gap-2 relative"
      >
        {navItems.map((item, idx) => {
          const isActive = activeSection === item.id;
          const isHovered = hoveredIdx === idx;

          return (
            <a
              key={item.id}
              href={item.href}
              onMouseEnter={() => setHoveredIdx(idx)}
              className={`relative px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-medium transition-colors no-underline cursor-pointer z-10 ${
                item.id === 'emergency'
                  ? 'text-red-400 font-semibold hover:text-red-300'
                  : isActive
                  ? 'text-white font-semibold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {/* Clean Sliding Hover/Active Background Pill */}
              {(isHovered || (isActive && hoveredIdx === null)) && (
                <motion.div
                  layoutId="nav-hover-pill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className={`absolute inset-0 rounded-full z-[-1] ${
                    item.id === 'emergency'
                      ? 'bg-red-500/15 border border-red-500/25'
                      : 'bg-white/10'
                  }`}
                />
              )}

              <span>{item.name}</span>
            </a>
          );
        })}
      </nav>

      {/* Right Prominent Login Button (Desktop) */}
      <div className="hidden md:flex items-center">
        <Link
          to="/login"
          className="bg-white text-black text-xs sm:text-sm font-semibold px-5 py-2 sm:px-6 sm:py-2.5 rounded-full hover:bg-white/90 transition-all cursor-pointer no-underline flex items-center gap-1.5 shadow-md group"
        >
          <span>Log in</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Mobile Hamburger Toggle Button */}
      <div className="flex md:hidden items-center gap-2">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Slide-down Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 sm:top-24 left-0 w-full bg-[#0d0f14]/95 backdrop-blur-2xl border-b border-white/10 p-6 flex flex-col gap-2 md:hidden shadow-2xl z-50"
          >
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium py-2 px-3 rounded-xl no-underline transition-colors flex items-center justify-between ${
                  item.id === 'emergency'
                    ? 'text-red-400 font-semibold'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.name}</span>
                <ArrowRight className="w-4 h-4 text-white/30" />
              </a>
            ))}

            <div className="pt-3 border-t border-white/10 mt-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-full bg-white text-black font-semibold text-center text-sm no-underline flex items-center justify-center gap-1.5"
              >
                <span>Log in</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
