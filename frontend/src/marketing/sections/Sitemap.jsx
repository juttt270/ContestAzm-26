import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const sitemapTiers = [
  {
    role: 'Resident Portal',
    badge: 'Residents & Owners',
    featured: false,
    summary: 'Self-service mobile and web access for occupants and family members.',
    links: [
      { name: 'Account Profile & Flat Link', href: '#account-profile' },
      { name: 'Visitor QR Gate Pass Generator', href: '#visitor-passes' },
      { name: 'Maintenance Invoices & PDF Receipts', href: '#maintenance-dues' },
      { name: 'Clubhouse & Amenity Booking', href: '#amenity-booking' },
      { name: 'Complaint Ticketing & SLA Tracking', href: '#helpdesk' },
      { name: 'Notice Board & Digital Polling', href: '#notice-board' },
    ],
    ctaText: 'Explore Resident OS',
  },
  {
    role: 'Security Gate Command',
    badge: 'Security & Checkpoints',
    featured: true,
    summary: 'High-throughput terminal for physical checkpoints and perimeter guard posts.',
    links: [
      { name: 'Guard Station Shift Authentication', href: '#guard-login' },
      { name: 'Live Camera QR Pass Scanner', href: '#pass-scanner' },
      { name: 'Walk-in Visitor & Cab Entry Log', href: '#visitor-log' },
      { name: 'Delivery Courier Clearance & Alerts', href: '#courier-sync' },
      { name: 'Emergency Barrier Lockdown & SOS', href: '#emergency-siren' },
    ],
    ctaText: 'Access Gate Terminal',
  },
  {
    role: 'Executive Admin Panel',
    badge: 'Management Committee',
    featured: false,
    summary: 'Financial engine, automated billing, maintenance dispatch, and audit logs.',
    links: [
      { name: 'Tenant & Owner Onboarding', href: '#resident-onboarding' },
      { name: 'Automated Dues & Billing Engine', href: '#billing-engine' },
      { name: 'Helpdesk Ticket SLA Dispatch', href: '#ticket-routing' },
      { name: 'Gate Checkpoint Audit Trail Logs', href: '#security-logs' },
      { name: 'Emergency Announcements Broadcast', href: '#announcements' },
    ],
    ctaText: 'Open Admin Suite',
  },
]

export default function Sitemap() {
  const sectionRef = useRef(null)
  const headerRef = useRef(null)
  const gridRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.fromTo(
        headerRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          },
        }
      )

      // Cards Stagger Reveal
      const cards = gridRef.current.querySelectorAll('.tier-card')
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: gridRef.current,
            start: 'top 75%',
          },
        }
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#ffffff] text-[#191c1f] py-[88px] px-6 lg:px-16 border-t border-[#e2e2e7] selection:bg-[#191c1f] selection:text-white relative z-30"
    >
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div
          ref={headerRef}
          className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8"
        >
          <div>
            <span className="text-[14px] uppercase tracking-widest text-[#5c5e60] font-medium block mb-4">
              Platform Sitemap & Roles
            </span>
            <h2 className="text-[55px] sm:text-[72px] lg:text-[88px] font-medium leading-[1.0] tracking-[-0.8px] text-[#191c1f]">
              One system. <br />
              Every stakeholder.
            </h2>
          </div>
          <p className="text-[#505a63] text-lg lg:text-xl max-w-md font-normal leading-relaxed">
            A structured breakdown of dedicated portal interfaces, gate protocols, and administrative management workflows.
          </p>
        </div>

        {/* 3-Column Architecture Matrix */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch"
        >
          {sitemapTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`tier-card rounded-[20px] p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                tier.featured
                  ? 'bg-[#191c1f] text-white'
                  : 'bg-[#f4f4f4] text-[#191c1f] border border-[#e2e2e7]'
              }`}
            >
              <div>
                {/* Badge & Title */}
                <span
                  className={`text-xs font-mono px-3 py-1 rounded-full inline-block mb-6 ${
                    tier.featured
                      ? 'bg-white/10 text-white/80 border border-white/12'
                      : 'bg-white text-[#505a63] border border-[#e2e2e7]'
                  }`}
                >
                  {tier.badge}
                </span>

                <h3
                  className={`text-[32px] font-medium tracking-tight leading-tight mb-3 ${
                    tier.featured ? 'text-white' : 'text-[#191c1f]'
                  }`}
                >
                  {tier.role}
                </h3>

                <p
                  className={`text-sm leading-relaxed mb-8 ${
                    tier.featured ? 'text-white/70' : 'text-[#505a63]'
                  }`}
                >
                  {tier.summary}
                </p>

                {/* Sub-links List */}
                <div
                  className={`border-t pt-4 space-y-1 ${
                    tier.featured ? 'border-white/10' : 'border-[#e2e2e7]'
                  }`}
                >
                  {tier.links.map((link, lIdx) => (
                    <a
                      key={lIdx}
                      href={link.href}
                      className={`flex items-center justify-between py-3 text-[15px] font-medium no-underline transition-colors ${
                        tier.featured
                          ? 'text-white/80 hover:text-white border-b border-white/5'
                          : 'text-[#1f2226] hover:text-[#494fdf] border-b border-[#e2e2e7]/60'
                      }`}
                    >
                      <span>{link.name}</span>
                      <span className="text-xs opacity-50">&rarr;</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Bottom Pill CTA */}
              <div className="mt-10 pt-6">
                <a
                  href="#login"
                  className={`w-full py-3.5 px-6 rounded-full text-center text-[14px] font-semibold transition-all duration-300 block no-underline ${
                    tier.featured
                      ? 'bg-white text-black hover:bg-[#f4f4f4]'
                      : 'bg-[#191c1f] text-white hover:bg-black'
                  }`}
                >
                  {tier.ctaText}
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
