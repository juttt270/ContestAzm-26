import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ShieldAlert,
  Flame,
  Siren,
  PhoneCall,
  ArrowUpRight,
  HeartPulse,
  Radio,
} from 'lucide-react';
import FoldText from '@/marketing/ui/FoldText.jsx';

gsap.registerPlugin(ScrollTrigger);

const emergencyContacts = [
  {
    id: 'gate-security',
    title: 'Main Gate Security',
    subtitle: 'Armed perimeter guards, visitor checks, and camera monitoring.',
    tel: '+923001234567',
    displayNumber: '+92 (300) 123-4567',
    responseTime: '< 45 Sec',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=600&auto=format&fit=crop',
    icon: ShieldAlert,
    accent: 'text-red-400',
    borderGlow: 'hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]',
    btnColor: 'bg-red-500 hover:bg-red-600 text-white border-red-500/30 hover:border-red-600',
  },
  {
    id: 'ambulance-medical',
    title: 'Paramedic Dispatch',
    subtitle: 'Immediate medical ambulance support and quick hospital transit.',
    tel: '115',
    displayNumber: '115',
    responseTime: 'Priority Line',
    image: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?q=80&w=600&auto=format&fit=crop',
    icon: HeartPulse,
    accent: 'text-rose-400',
    borderGlow: 'hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]',
    btnColor: 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500/30 hover:border-rose-600',
  },
  {
    id: 'fire-rescue',
    title: 'Fire & Hazard Rescue',
    subtitle: 'Hydrant team response, gas leak control, and hazard evacuation.',
    tel: '16',
    displayNumber: '16',
    responseTime: 'Immediate',
    image: 'https://images.unsplash.com/photo-1633092228879-d6a88c22e7bc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZpcmUlMjByZXNjdWV8ZW58MHx8MHx8fDA%3D',
    icon: Flame,
    accent: 'text-amber-400',
    borderGlow: 'hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]',
    btnColor: 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500/30 hover:border-amber-600',
  },
  {
    id: 'police-patrol',
    title: 'Police & Patrol',
    subtitle: 'Security breach control, estate patrolling, and police connect.',
    tel: '15',
    displayNumber: '15',
    responseTime: 'Direct Precinct',
    image: 'https://images.unsplash.com/photo-1502101872923-d48509bff386?q=80&w=600&auto=format&fit=crop',
    icon: Siren,
    accent: 'text-blue-400',
    borderGlow: 'hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
    btnColor: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500/30 hover:border-blue-600',
  },
];

export default function EmergencySOS() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    const cards = el.querySelectorAll('.sos-card');

    const ctx = gsap.context(() => {
      // 1. Header Reveal
      gsap.fromTo(
        headerRef.current.children,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          },
        }
      );

      // 2. 3D Boot-up Stagger of SOS Cards
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 50,
          rotateX: 10,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 1,
          stagger: 0.12,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="emergency"
      ref={sectionRef}
      className="relative w-full bg-[#000000] text-white py-32 md:py-44 px-4 sm:px-6 md:px-12 xl:px-16 overflow-hidden z-30 border-t border-white/10"
    >
      {/* Background Radial Threat Detection Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-red-600/5 rounded-full blur-[180px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* Section Header */}
        <div
          ref={headerRef}
          className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/10 pb-12 gap-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs tracking-widest uppercase mb-6 backdrop-blur-md">
              <Radio className="w-3.5 h-3.5" />
              <span>Rapid Response & Security</span>
            </div>
            
            <h2 className="text-[42px] sm:text-[60px] md:text-[80px] font-medium tracking-tighter leading-[1.05] text-white">
              <FoldText text="Emergency SOS" duration={0.8} /> <br />
              <span className="text-white/40">
                <FoldText text="Dispatch." delay={0.15} duration={0.8} />
              </span>
            </h2>
          </div>

          <p className="text-white/50 text-base md:text-lg max-w-md font-normal leading-relaxed">
            Instant access to critical estate security and emergency first responders. Tap any emergency button to directly initialize a call from your phone.
          </p>
        </div>

        {/* 4-Column / 2x2 High-Contrast SOS Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {emergencyContacts.map((contact) => {
            const Icon = contact.icon;
            return (
              <div
                key={contact.id}
                className={`group relative bg-[#080a0f]/60 border border-white/5 ${contact.borderGlow} rounded-2xl flex flex-col justify-between min-h-[420px] transition-all duration-500 shadow-xl overflow-hidden sos-card cursor-pointer`}
              >
                {/* Image Header with Hover Scale */}
                <div className="relative overflow-hidden aspect-[16/10] w-full">
                  <img
                    src={contact.image}
                    alt={contact.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-85 group-hover:scale-105 transition-all duration-700"
                  />
                  {/* Response Time Badge */}
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold text-white/90 tracking-wide">
                    {contact.responseTime}
                  </span>
                </div>

                {/* Card Content details */}
                <div className="p-6 pt-8 flex-1 flex flex-col justify-between space-y-4 relative">
                  {/* Floating Overlap Icon Badge */}
                  <div className="absolute -top-5 left-6 w-10 h-10 rounded-xl bg-[#0e1117] border border-white/15 flex items-center justify-center text-white shadow-md z-20 group-hover:scale-110 transition-transform duration-300">
                    <Icon className={`w-5 h-5 ${contact.accent}`} />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-semibold tracking-tight text-white group-hover:text-emerald-400 transition-colors duration-300">
                      {contact.title}
                    </h3>
                    <p className="text-white/60 text-xs leading-relaxed line-clamp-2">
                      {contact.subtitle}
                    </p>
                  </div>

                  {/* Hotline Information Box */}
                  <div className="pt-3 border-t border-white/5">
                    <span className="text-[9px] uppercase tracking-wider text-white/40 block mb-0.5">
                      Hotline Number
                    </span>
                    <span className="text-xl font-bold font-mono tracking-tight text-white group-hover:text-red-400 transition-colors">
                      {contact.displayNumber}
                    </span>
                  </div>
                </div>

                {/* Button Action */}
                <div className="p-6 pt-0 mt-auto">
                  <a
                    href={`tel:${contact.tel}`}
                    className={`w-full py-3 rounded-full flex items-center justify-center gap-1.5 font-bold text-xs shadow-md no-underline transition-all duration-300 ${contact.btnColor}`}
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>SOS CALL NOW</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
