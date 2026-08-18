import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Globe,
  Lock,
  UserCheck,
  ShieldCheck,
  Wrench,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import sitemapBg from '@/assets/images/sitemap-bg.jpg'
import { Link } from 'react-router-dom'
import FoldText from '@/marketing/ui/FoldText.jsx'

gsap.registerPlugin(ScrollTrigger)

const rolesData = [
  {
    roleNumber: 'Role 01',
    title: 'Resident Panel',
    icon: UserCheck,
    accentColor: 'text-emerald-400',
    accentBorder: 'hover:border-emerald-500/40',
    accentGlow: 'from-emerald-500/10 to-transparent',
    description: 'Self-service dashboard for flat owners and tenants.',
    ctaText: 'Resident Panel',
    pagesCount: '14 Pages',
    features: [
      '1. Resident Authentication (Login, Logout, Password Reset, MFA)',
      '2. Resident Dashboard (Flat Info, Dues, Bookings, Active Passes)',
      '3. Profile Management (Owner/Tenant Info, Emergency Contacts, Vehicle Plate)',
      '4. Maintenance Bills (Fee Breakdown, Overdue Penalty, PDF Receipts)',
      '5. Visitor Pass Management (Timed QR Gate Pass & Numeric Key)',
      '6. Complaint / Helpdesk (Plumbing, Electrical, Lift Faults, Photo Upload)',
      '7. Amenity Booking (Clubhouse, Swimming Pool, Sports Courts, Party Hall)',
      '8. Notices & Announcements (Official Circulars & Emergency Notices)',
      '9. Events (Community Event Calendar & Schedules)',
      '10. Digital Polling (Active Community Polls & Voting)',
      '11. Society Guidelines (Rules, Regulations & Policies)',
      '12. Emergency Features (Contact Directory & Siren Alert)',
      '13. Notifications (Pass Approvals, Bill Alerts, Status Updates)',
      '14. Resident Activity History (Ledgers, Passes, Complaints, Bookings)',
    ],
  },
  {
    roleNumber: 'Role 02',
    title: 'Security Guard Panel',
    icon: ShieldCheck,
    accentColor: 'text-blue-400',
    accentBorder: 'hover:border-blue-500/40',
    accentGlow: 'from-blue-500/10 to-transparent',
    description: 'Gate terminal tools for real-time security & access.',
    ctaText: 'Security Guard Panel',
    pagesCount: '14 Pages',
    features: [
      '1. Guard Authentication (Guard Login, Secure Auth, Logout)',
      '2. Guard Dashboard (Today’s Visitors, Active Passes, Entry/Exit Stats)',
      '3. Visitor Entry Management (Walk-in Photo, Phone, Vehicle, Flat No)',
      '4. QR Gate Pass Verification (Barcode Scanner & Validity Check)',
      '5. Numeric Gate Key Verification (Keypad Verification & Single-Use Check)',
      '6. Visitor Access Clearance (Approve/Deny Entry, Timestamp Logs)',
      '7. Entry & Exit Management (Visitor Exit Records & Vehicle Search)',
      '8. Delivery & Vendor Management (Courier Logs & Push Alerts)',
      '9. Overstay Alerts (Automated Alerts for Prolonged Stays)',
      '10. Visitor Search (Search by Name, Phone, Vehicle, Flat, Code)',
      '11. Gate Logs (Comprehensive Checkpoint Entry/Exit Records)',
      '12. Notifications & Alerts (Invalid Pass, Expired Pass, Emergency Alert)',
      '13. Emergency Support (Distress Broadcasts & Panic Lockdown)',
      '14. Security History (Gate Verification History & Rejected Attempts)',
    ],
  },
  {
    roleNumber: 'Role 03',
    title: 'Maintenance Staff Panel',
    icon: Wrench,
    accentColor: 'text-amber-400',
    accentBorder: 'hover:border-amber-500/40',
    accentGlow: 'from-amber-500/10 to-transparent',
    description: 'Field operations portal for technician work orders.',
    ctaText: 'Maintenance Staff Panel',
    pagesCount: '12 Pages',
    features: [
      '1. Staff Authentication (Staff Login, Password Change, Profile)',
      '2. Staff Dashboard (Assigned, Pending, In-Progress, Resolved, SLA Due)',
      '3. Assigned Complaints (Complaint ID, Resident, Flat, Priority, SLA)',
      '4. Complaint Categories (Plumbing, Electrical, Elevator, Repair/Maintenance)',
      '5. Status Management (Pending → In-Progress → Resolved Workflow)',
      '6. Complaint Details (Resident Info, Problem Description, Photo Uploads)',
      '7. Work / Resolution Details (Work Notes, Remarks, Completion Time)',
      '8. SLA Tracking (SLA Deadlines, Remaining Countdown, Overdue Alerts)',
      '9. Complaint Search & Filters (Filter by ID, Category, Status, Priority, Date)',
      '10. Notifications (New Assigned Ticket, Priority Change, SLA Warnings)',
      '11. Complaint History (Resolved Assignments & Service History)',
      '12. Profile Management (Contact Info Update, Password Reset)',
    ],
  },
  {
    roleNumber: 'Role 04',
    title: 'Admin Panel',
    icon: Building2,
    accentColor: 'text-purple-400',
    accentBorder: 'hover:border-purple-500/40',
    accentGlow: 'from-purple-500/10 to-transparent',
    description: 'Executive suite for society administration & audit.',
    ctaText: 'Admin Panel',
    pagesCount: '16 Pages',
    features: [
      '1. Admin Authentication (Admin Login, Role-Based Authorization)',
      '2. Admin Dashboard (Total Residents, Flats, Visitors, Complaints, Billing)',
      '3. Resident & Flat Management (Onboard/Offboard, Occupancy Maps, Vehicles)',
      '4. Maintenance Billing Engine (Monthly Invoices, Water/Security, Penalties)',
      '5. Complaint Management (View All, Filter, Assign to Staff, SLA Tracking)',
      '6. Visitor & Security Management (Gate Logs, Overstay, Audit Records)',
      '7. Amenity Management (Add Amenities, Set Availability, Manage Bookings)',
      '8. Maintenance Staff Management (Add/Edit Staff, Assign Complaints, Track SLA)',
      '9. Security Guard Management (Add/Edit Guards, Gate Post Assignments)',
      '10. Notices & Announcements (Create, Publish Circulars, Broadcast Notices)',
      '11. Events Management (Create & Schedule Upcoming Society Events)',
      '12. Polls / Digital Voting (Create Polls, Set Options, View Results)',
      '13. Emergency Management (Manage Contacts, Trigger Siren Broadcasts)',
      '14. Society Guidelines (Create & Update Society Rules)',
      '15. Comprehensive Reports (Collections, Overdue Bills, Visitors, SLA Compliance)',
      '16. Audit Logs (Immutable Records of Admin Financial Edits & User Activity)',
    ],
  },
]

export default function SitemapFlowchart() {
  const sectionRef = useRef(null)
  const bgImageRef = useRef(null)
  const headerRef = useRef(null)
  const step1Ref = useRef(null)
  const line1Ref = useRef(null)
  const step2Ref = useRef(null)
  const treeBranchesRef = useRef(null)
  const cardsGridRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Ghosted Background Parallax
      if (bgImageRef.current) {
        gsap.to(bgImageRef.current, {
          yPercent: 15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      }

      // 2. Cinematic Sequential Flow Timeline
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      })

      // Phase 1: Header Drop
      masterTl.fromTo(
        headerRef.current.children,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      )

      // Phase 2: Step 1 Node Reveal
      masterTl.fromTo(
        step1Ref.current,
        { opacity: 0, scale: 0.9, y: 25 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' },
        '-=0.2'
      )

      // Phase 3: Laser Line Draw from Step 1 to Step 2
      masterTl.fromTo(
        line1Ref.current,
        { scaleY: 0 },
        { scaleY: 1, duration: 0.35, ease: 'power2.inOut', transformOrigin: 'top center' },
        '-=0.1'
      )

      // Phase 4: Step 2 Node Glow & Pop
      masterTl.fromTo(
        step2Ref.current,
        { opacity: 0, scale: 0.9, y: 25 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' },
        '-=0.1'
      )

      // Phase 5: Tree Crossbar Draw Outwards from Center
      if (treeBranchesRef.current) {
        const crossbar = treeBranchesRef.current.querySelector('.tree-crossbar')
        const drops = treeBranchesRef.current.querySelectorAll('.tree-drop')

        masterTl.fromTo(
          crossbar,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.45, ease: 'power2.inOut', transformOrigin: 'center center' },
          '-=0.1'
        )

        masterTl.fromTo(
          drops,
          { scaleY: 0 },
          { scaleY: 1, duration: 0.35, stagger: 0.08, ease: 'power2.inOut', transformOrigin: 'top center' },
          '-=0.2'
        )
      }

      // Phase 6: 3D Flip & Stagger Reveal of 4 Role Cards
      const cards = cardsGridRef.current.querySelectorAll('.sitemap-card')
      masterTl.fromTo(
        cards,
        {
          opacity: 0,
          y: 50,
          rotateX: 12,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power4.out',
        },
        '-=0.2'
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="sitemap"
      ref={sectionRef}
      className="relative overflow-hidden bg-[#000000] text-white py-28 md:py-36 px-4 sm:px-6 md:px-10 xl:px-16 border-t border-white/10 selection:bg-white selection:text-black z-30 flex flex-col items-center [perspective:1200px]"
    >
      {/* Background Society Image with Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          ref={bgImageRef}
          src={sitemapBg}
          alt="Smart Society Architecture"
          className="w-full h-[125%] object-cover opacity-20 grayscale brightness-50 absolute left-0 -top-[10%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/85 to-black z-10" />
      </div>

      {/* Main Foreground Container */}
      <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Section Header */}
        <div ref={headerRef} className="text-center max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/80 uppercase tracking-widest mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Application Pipeline</span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-[60px] font-medium leading-tight tracking-tight text-white">
            <FoldText text="SmartSociety Navigation Flow" duration={0.8} />
          </h2>
          <p className="text-white/60 text-base sm:text-lg mt-3 max-w-2xl mx-auto font-normal leading-relaxed">
            Live pipeline tracing user authentication to dedicated role portals and functional subsystem modules.
          </p>
        </div>

        {/* STEP 1: Public Website (Root Node) */}
        <div
          ref={step1Ref}
          className="w-full max-w-md bg-[#16181a] border border-white/12 rounded-[20px] p-6 flex items-center justify-between shadow-2xl relative group hover:border-white/30 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <span className="text-xs text-white/50 uppercase tracking-wider block">Public Web Application</span>
              <h3 className="text-lg font-medium text-white">SmartSociety Home Page</h3>
              <p className="text-xs text-white/60">Overview, Guidelines & Emergency Directory</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
            Step 1
          </span>
        </div>

        {/* Animated Laser Connector Line 1 */}
        <div
          ref={line1Ref}
          className="w-[2px] h-12 bg-gradient-to-b from-white/40 via-emerald-400/80 to-white/40 shadow-[0_0_8px_rgba(52,211,153,0.5)]"
        />

        {/* STEP 2: User Login & Authentication */}
        <div
          ref={step2Ref}
          className="w-full max-w-md bg-[#16181a] border border-white/12 rounded-[20px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xl relative group hover:border-white/30 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 stroke-[1.75]" />
            </div>
            <div>
              <span className="text-xs text-white/50 uppercase tracking-wider block">Access Control</span>
              <h3 className="text-lg font-medium text-white">User Login & Authentication</h3>
              <p className="text-xs text-white/60">Secure multi-factor login & role detection</p>
            </div>
          </div>
          <Link
            to="/login"
            className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-xs hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-1.5 no-underline shrink-0 cursor-pointer"
          >
            <span>Login Gateway</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Animated Tree Branches (Desktop) */}
        <div ref={treeBranchesRef} className="hidden lg:block w-full max-w-6xl relative h-14">
          {/* Vertical stem from Step 2 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-6 bg-gradient-to-b from-white/40 to-white/20" />
          
          {/* Horizontal crossbar */}
          <div className="tree-crossbar absolute top-6 left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-emerald-400/40 via-white/30 to-purple-400/40 shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
          
          {/* 4 Vertical drop lines */}
          <div className="tree-drop absolute top-6 left-[12.5%] w-[2px] h-8 bg-gradient-to-b from-emerald-400/60 to-emerald-400/20" />
          <div className="tree-drop absolute top-6 left-[37.5%] w-[2px] h-8 bg-gradient-to-b from-blue-400/60 to-blue-400/20" />
          <div className="tree-drop absolute top-6 left-[62.5%] w-[2px] h-8 bg-gradient-to-b from-amber-400/60 to-amber-400/20" />
          <div className="tree-drop absolute top-6 right-[12.5%] w-[2px] h-8 bg-gradient-to-b from-purple-400/60 to-purple-400/20" />
        </div>

        {/* STEP 3: 4 Role-Based Portals Grid */}
        <div
          ref={cardsGridRef}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-4 lg:mt-0 items-stretch"
        >
          {rolesData.map((col, idx) => {
            const Icon = col.icon
            return (
              <div
                key={idx}
                className={`sitemap-card bg-[#16181a] border border-white/10 ${col.accentBorder} rounded-[24px] p-6 h-[520px] flex flex-col justify-between transition-all duration-500 shadow-2xl relative overflow-hidden group hover:-translate-y-2`}
              >
                {/* Subtle Hover Ambient Glow Gradient inside Card */}
                <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl ${col.accentGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-tr-[24px]`} />

                {/* Fixed Card Top Section */}
                <div className="border-b border-white/10 pb-3 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 stroke-[1.75]" />
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/70">
                      {col.pagesCount}
                    </span>
                  </div>

                  <h4 className="text-lg font-medium text-white tracking-tight">
                    {col.title}
                  </h4>
                  <p className="text-xs text-white/50 mt-1 leading-snug">
                    {col.description}
                  </p>
                </div>

                {/* Smooth Scrollable Sub-Pages (Invisible Scrollbar) */}
                <div className="flex-1 overflow-y-auto my-3 space-y-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden relative z-10">
                  <span className="text-[10px] uppercase tracking-wider text-white/40 font-semibold block mb-1">
                    System Sub-Pages & Features
                  </span>
                  {col.features.map((feat, fIdx) => (
                    <div
                      key={fIdx}
                      className="flex items-start gap-2 py-1.5 px-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] transition-colors"
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${col.accentColor} shrink-0 mt-0.5`} />
                      <span className="text-[11px] font-normal text-white/85 leading-snug">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Fixed Card Bottom Redirect CTA Button */}
                <div className="pt-3 border-t border-white/10 relative z-10">
                  <Link
                    to="/login"
                    className="w-full py-2.5 px-3.5 rounded-full bg-white text-black font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-white/90 transition-all duration-300 no-underline cursor-pointer group-hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                  >
                    <span>Go to {col.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
