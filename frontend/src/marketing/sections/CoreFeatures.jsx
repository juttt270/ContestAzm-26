import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ShieldCheck,
  UserCheck,
  Building,
  Wrench,
  ArrowUpRight,
  X,
  CheckCircle2,
  QrCode,
  Calendar,
  Sparkles,
} from 'lucide-react';
import FoldText from '@/marketing/ui/FoldText.jsx';

gsap.registerPlugin(ScrollTrigger);

const srsModules = [
  {
    num: '01',
    title: 'Resident Panel',
    role: 'Resident Management',
    desc: 'Secure authentication, profile management, maintenance bills, visitor pass management, complaints, amenity booking, notices, and digital polling.',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=1200&auto=format&fit=crop',
    icon: <UserCheck className="w-4 h-4" />,
    span: 'lg:col-span-2',
    accentColor: 'text-emerald-400',
    capabilities: [
      'Resident Authentication: Login, logout, secure authentication, password reset, and multi-factor authentication (MFA)',
      'Resident Dashboard: Flat info, current bill, payment status, upcoming bookings, active passes, recent complaints, and emergency alerts',
      'Profile Management: Manage flat details, owner/tenant info, emergency contacts, family members, and vehicle registrations',
      'Maintenance Bills: View current & previous bills, charge breakdown (water, security, repairs), simulated payments, and PDF receipts',
      'Visitor Pass Management: Generate timed QR Gate Passes and numeric gate keys for guests, deliveries, and cabs',
      'Complaint / Helpdesk: Create complaints (plumbing, electrical, elevator), upload photos, and track status (Pending, In-Progress, Resolved)',
      'Amenity Booking: Real-time availability for Clubhouse, Swimming Pool, Sports Courts, and Party Hall',
      'Notices, Events & Polling: Official society notices, event calendar, and community voting polls',
    ],
  },
  {
    num: '02',
    title: 'Security Guard Panel',
    role: 'Gate Management',
    desc: 'Guard dashboard, walk-in visitor entry, QR gate pass verification, numeric gate keys, delivery logging, overstay alerts, and emergency support.',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=1200&auto=format&fit=crop',
    icon: <ShieldCheck className="w-4 h-4" />,
    span: 'lg:col-span-1',
    accentColor: 'text-blue-400',
    capabilities: [
      'Guard Authentication: Guard login, secure authentication, and profile management',
      'Guard Dashboard: Today’s total visitors, entries, exits, active passes, pending visitors, and recent gate logs',
      'Visitor Entry Management: Record walk-in visitor name, phone, photo, vehicle number, target flat, and visit purpose',
      'QR Gate Pass Verification: Scan QR code, display visitor & flat details, verify time window, and approve entry',
      'Numeric Gate Key Verification: Validate numeric keys, check single-use validity, and reject expired keys',
      'Entry & Exit Management: Record visitor entries and exits with automated timestamps',
      'Delivery & Vendor Management: Log courier details, track vendor stays, and trigger overstay alerts',
      'Emergency Support: Receive emergency notices, access emergency contacts, and view active emergency alerts',
    ],
  },
  {
    num: '03',
    title: 'Maintenance Staff Panel',
    role: 'Staff Operations',
    desc: 'Staff dashboard, assigned complaints inbox, category handling, Pending to Resolved status workflow, photo documentation, and SLA tracking.',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1200&auto=format&fit=crop',
    icon: <Wrench className="w-4 h-4" />,
    span: 'lg:col-span-1',
    accentColor: 'text-amber-400',
    capabilities: [
      'Staff Authentication: Staff login, secure authentication, password change, and staff profile',
      'Staff Dashboard: Total assigned, pending, in-progress, resolved, urgent complaints, and SLA due/overdue tickets',
      'Assigned Complaints: View Complaint ID, Resident Name, Flat Number, Category, Description, Photo, Priority, and SLA deadline',
      'Complaint Categories: Handle Plumbing, Electrical, Elevator, Repair/Maintenance, and Other issues',
      'Status Workflow: Update ticket lifecycle across Pending → In-Progress → Resolved',
      'Work / Resolution Details: Add work performed notes, remarks, completion date/time, and mark resolved',
      'SLA Tracking: View SLA deadlines, remaining time, due tickets, and overdue alerts',
      'Complaint Search & History: Search by ID, category, status, priority, date, and view completed work history',
    ],
  },
  {
    num: '04',
    title: 'Admin Panel',
    role: 'Society Administration',
    desc: 'Resident & flat management, maintenance billing engine, complaint dispatch, staff & guard management, emergency circulars, and audit reports.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    icon: <Building className="w-4 h-4" />,
    span: 'lg:col-span-2',
    accentColor: 'text-purple-400',
    capabilities: [
      'Admin Dashboard: Total residents, flats, visitors, complaints, pending bills, overdue payments, and active notices',
      'Resident & Flat Management: Add, edit, delete, onboard/offboard residents, manage owners/tenants, and flat occupancy maps',
      'Maintenance Billing: Generate monthly bills, set charge breakdown (water, security, repairs), apply penalties, and export collection reports',
      'Complaint Management: View all complaints, filter by category/status, assign to staff, and monitor SLAs',
      'Visitor & Security Management: View visitor records, gate pass logs, entry/exit timestamps, and overstay alerts',
      'Staff & Guard Management: Add, edit, deactivate maintenance staff and security guards, and monitor activity',
      'Notices, Events, Polls & Emergency: Create announcements, manage events, publish polls, trigger siren alerts, and maintain audit logs',
      'Comprehensive Reports: Collection reports, overdue bills report, visitor report, complaint SLA report, and staff activity logs',
    ],
  },
  {
    num: '05',
    title: 'Visitor Pre-Approval & Gate Passes',
    role: 'Security & Access',
    desc: 'Generate digital QR gate passes for pre-approved guests, delivery drivers, and cab operators with custom time windows.',
    image: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=1200&auto=format&fit=crop',
    icon: <QrCode className="w-4 h-4" />,
    span: 'lg:col-span-1',
    accentColor: 'text-blue-400',
    capabilities: [
      'Instant digital QR pass generation for expected guests and cab riders',
      'Custom time-window validity to prevent unauthorized prolonged stays',
      'Real-time scanning and verification logs at security checkpoints by guards',
      'Instant smartphone push notifications upon visitor entry clearance',
      'Overstay tracking system alerts for unapproved vendor stays',
    ],
  },
  {
    num: '06',
    title: 'Facility & Amenity Booking',
    role: 'Community Lifestyle',
    desc: 'Check real-time availability and reserve community amenities including the clubhouse, swimming pool, sports courts, and party hall.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
    icon: <Calendar className="w-4 h-4" />,
    span: 'lg:col-span-2',
    accentColor: 'text-amber-400',
    capabilities: [
      'Live calendar slot availability for shared community spaces',
      'Seamless online booking for clubhouse, swimming pool, and sports courts',
      'Automated scheduling conflict prevention for party halls',
      'Instant booking confirmation and digital pass generation for residents',
      'Reservation cancellation management and booking history records',
    ],
  },
];

export default function CoreFeatures() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const [selectedCard, setSelectedCard] = useState(null);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (selectedCard) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedCard]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedCard(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    const cards = el.querySelectorAll('.core-feature-card');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        cards,
        { opacity: 0, y: 60, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="w-full bg-[#000000] text-white py-32 md:py-44 px-6 md:px-16 relative z-30"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div
          ref={headerRef}
          className="mb-24 flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/10 pb-12 gap-6"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs tracking-widest uppercase mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Master Community Ecosystem</span>
            </div>
            <h2 className="text-[45px] sm:text-[60px] md:text-[80px] font-medium tracking-tighter leading-[1.05] text-white">
              <FoldText text="Features" duration={0.8} /> <br />
              <span className="text-white/40">
                <FoldText text="& Core Modules." delay={0.15} duration={0.8} />
              </span>
            </h2>
          </div>
          <p className="text-white/50 text-base md:text-lg max-w-sm font-normal leading-relaxed">
            Centralizing administration, security, field maintenance staff, billing, and lifestyle amenities into a world-class digital experience.
          </p>
        </div>

        {/* Bento Grid with Exact Spans and High-End Proptech Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {srsModules.map((card, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedCard(card)}
              className={`${card.span} core-feature-card bg-[#08090c] border border-white/10 rounded-[36px] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group hover:border-white/40 transition-all duration-700 min-h-[420px] cursor-pointer shadow-2xl`}
            >
              {/* Background Property Image */}
              <div className="absolute inset-0 z-0 overflow-hidden opacity-35 group-hover:opacity-55 transition-opacity duration-700">
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-[#08090c]/80 to-transparent"></div>
              </div>

              {/* Top Meta Bar */}
              <div className="relative z-10 flex justify-between items-center">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs text-white/70">
                  {card.icon}
                  <span>{card.role}</span>
                </div>
                <span className="p-3 rounded-full bg-white/5 border border-white/10 text-white/60 group-hover:bg-white group-hover:text-black transition-all duration-300 backdrop-blur-md">
                  <ArrowUpRight className="w-5 h-5" />
                </span>
              </div>

              {/* Bottom Content */}
              <div className="relative z-10 mt-28">
                <span className="text-xs text-white/40 mb-2 block">Module {card.num}</span>
                <h3 className="text-2xl md:text-4xl font-medium tracking-tight text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-white/60 text-sm md:text-base font-normal leading-relaxed max-w-xl">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Perfectly Fitted Detail Modal */}
      {selectedCard && (
        <div
          data-lenis-prevent
          data-modal-open="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedCard(null);
          }}
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/90 backdrop-blur-2xl overflow-y-auto"
        >
          <div data-lenis-prevent className="relative w-full max-w-2xl bg-[#111317] border border-white/20 rounded-[28px] p-6 sm:p-8 flex flex-col max-h-[78vh] my-auto overflow-hidden shadow-2xl">
            
            {/* Background Subtle Image Effect */}
            <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
              <img src={selectedCard.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111317] via-[#111317]/95 to-[#111317]/60"></div>
            </div>

            {/* Modal Header */}
            <div className="relative z-10 flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 w-max mb-2">
                  <span className={selectedCard.accentColor}>{selectedCard.icon}</span>
                  <span>{selectedCard.role} — Module {selectedCard.num}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
                  {selectedCard.title}
                </h3>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedCard(null)}
                className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black transition-all cursor-pointer shrink-0 ml-4"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="relative z-10 overflow-y-auto my-4 space-y-4 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                {selectedCard.desc}
              </p>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <h4 className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-3">
                  Core Capabilities & Module Features
                </h4>
                <div className="space-y-2">
                  {selectedCard.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/85 leading-snug">
                      <CheckCircle2 className={`w-4 h-4 ${selectedCard.accentColor} shrink-0 mt-0.5`} />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/40 font-normal">
                Module {selectedCard.num} Active Overview
              </span>
              <button
                onClick={() => setSelectedCard(null)}
                className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all cursor-pointer"
              >
                Close Overview
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}