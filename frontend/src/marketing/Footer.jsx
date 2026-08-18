import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import FoldText from '@/marketing/ui/FoldText.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef(null);
  const ctaHeadingRef = useRef(null);
  const linksGridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. CTA Heading Reveal
      gsap.fromTo(
        ctaHeadingRef.current,
        { scale: 0.96, opacity: 0, y: 35 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 80%',
          },
        }
      );

      // 2. Links Grid Reveal
      if (linksGridRef.current) {
        gsap.fromTo(
          linksGridRef.current.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: linksGridRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      id="footer"
      ref={footerRef}
      className="relative z-30 w-full bg-[#000000] text-white overflow-hidden border-t border-white/10 pt-24 sm:pt-32 pb-12 px-4 sm:px-6 md:px-12 xl:px-16"
    >
      {/* Background Radial Glow Ambient */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10 flex flex-col justify-between">
        
        {/* CENTER STAGE: Massive Typographic CTA */}
        <div ref={ctaHeadingRef} className="text-center max-w-4xl mx-auto mb-16 sm:mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs tracking-widest uppercase mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-white/60" />
            <span>Next-Generation PropTech Ecosystem</span>
          </div>

          <h2 className="text-5xl sm:text-7xl md:text-8xl lg:text-[100px] font-medium tracking-tighter leading-[0.95] text-white mb-8">
            <FoldText text="Elevate Your" duration={0.8} /> <br />
            <span className="text-white/40">
              <FoldText text="Community." delay={0.15} duration={0.8} />
            </span>
          </h2>

          {/* Glowing CTA Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-sm hover:bg-[#f4f4f4] transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.25)] no-underline cursor-pointer group"
            >
              <span>Access Resident Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/15 text-white font-semibold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2 backdrop-blur-md no-underline cursor-pointer"
            >
              <span>Explore All Modules</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* EXECUTIVE ARCHITECTURAL GRID LAYOUT */}
        <div
          ref={linksGridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 border-t border-b border-white/10 py-12 sm:py-16"
        >
          {/* Col 1 (Span 4): Brand & Description */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="SmartSociety"
                className="h-16 sm:h-20 w-auto max-w-[260px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
              />
            </div>

            <p className="text-white/50 text-xs sm:text-sm leading-relaxed max-w-sm font-normal">
              The premier luxury housing society operating system. Built for seamless access, financial transparency, and elite community living.
            </p>
          </div>

          {/* Col 2 (Span 3): Platform Roles */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs uppercase tracking-widest text-white/40 font-semibold block mb-4">
              Operational Panels
            </span>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {[
                { name: 'Resident Management Panel', href: '#features' },
                { name: 'Security Guard Terminal', href: '#features' },
                { name: 'Maintenance Staff Workdesk', href: '#features' },
                { name: 'Executive Administration', href: '#features' },
                { name: 'Sitemap Navigation Flow', href: '#sitemap' },
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    className="text-white/70 hover:text-white transition-colors no-underline flex items-center gap-1.5 group"
                  >
                    <span>{item.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 (Span 3): Core Subsystems */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs uppercase tracking-widest text-white/40 font-semibold block mb-4">
              Core Subsystems
            </span>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {[
                { name: 'Visitor Pre-Approval & QR Passes', href: '#features' },
                { name: 'Automated Dues & Invoicing', href: '#features' },
                { name: 'Helpdesk SLA Complaint Routing', href: '#features' },
                { name: 'Shared Amenity Reservations', href: '#amenities' },
                { name: 'Digital Notice Board & Voting', href: '#notices' },
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    className="text-white/70 hover:text-white transition-colors no-underline flex items-center gap-1.5 group"
                  >
                    <span>{item.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 (Span 2): Society Resources */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs uppercase tracking-widest text-white/40 font-semibold block mb-4">
              Society Services
            </span>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {[
                { name: 'Upcoming Events', href: '#events' },
                { name: 'Estate Rules & Policies', href: '#guidelines' },
                { name: 'Emergency SOS Hotline', href: '#emergency' },
                { name: 'Financial Audit Logs', href: '#features' },
                { name: 'Resident Support', href: '#features' },
              ].map((item, idx) => (
                <li key={idx}>
                  <a
                    href={item.href}
                    className="text-white/70 hover:text-white transition-colors no-underline flex items-center gap-1.5 group"
                  >
                    <span>{item.name}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* BOTTOM METRIC & LEGAL BAR */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-white/60" />
            <span>© 2026 SmartSociety Platform. All Rights Reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#hero" className="hover:text-white transition-colors no-underline">
              Privacy Policy
            </a>
            <a href="#hero" className="hover:text-white transition-colors no-underline">
              Terms of Service
            </a>
            <a href="#hero" className="hover:text-white transition-colors no-underline">
              Security Compliance
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
