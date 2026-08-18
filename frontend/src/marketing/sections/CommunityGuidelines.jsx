import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Plus,
  Sparkles,
} from 'lucide-react';
import FoldText from '@/marketing/ui/FoldText.jsx';

gsap.registerPlugin(ScrollTrigger);

const guidelinesData = [
  {
    id: '01',
    category: 'Traffic & Access',
    title: 'Vehicle & Parking Protocol',
    summary:
      'Estate-wide 20 km/h speed limit, automated RFID barrier access, and designated resident bay allocation.',
    details:
      'All resident motor vehicles must carry a registered SmartSociety RFID windshield tag for automated gate entry. Guest vehicles are strictly restricted to marked Visitor Parking Bays and require prior QR pre-approval via the Resident Panel. Overnight parking in transit lanes will trigger an automatic security advisory and tow alert.',
    keyPoints: [
      'Internal estate speed limit: 20 km/h strictly enforced via radar sensors',
      'One designated covered basement slot per flat unit registration',
      'Commercial deliveries permitted between 08:00 AM and 08:00 PM only',
    ],
  },
  {
    id: '02',
    category: 'Peace & Acoustics',
    title: 'Noise & Curfew Regulations',
    summary:
      'Quiet hours observed daily from 10:00 PM to 07:00 AM to ensure undisturbed rest for all families.',
    details:
      'High-decibel audio equipment, private patio parties, and acoustic disturbances must cease by 10:00 PM on weekdays and 11:00 PM on weekends. Major apartment renovation works involving heavy drilling or structural masonry are permitted strictly Monday through Friday between 09:00 AM and 05:00 PM with prior management NOC.',
    keyPoints: [
      'Estate quiet hours: 10:00 PM – 07:00 AM daily',
      'Structural renovations require 48-hour advance digital notice',
      'No heavy drilling or construction noise permitted on Sundays',
    ],
  },
  {
    id: '03',
    category: 'Pet Welfare',
    title: 'Pet Ownership & Care Charter',
    summary:
      'Mandatory leash compliance in common corridors, dedicated pet-walk lawns, and hygiene protocols.',
    details:
      'All resident pets must be registered with the Society Administrative Office with up-to-date rabies vaccination records. Pets must remain on a standard leash at all times while transitioning through elevators, lobbies, and shared perimeter grounds. Pet owners are required to use dedicated waste stations installed across the central park.',
    keyPoints: [
      'Mandatory leash adherence in all elevators, lobbies, and walkways',
      'Service elevators prioritized when escorting large animals',
      'Annual vaccination certification submitted to admin desk',
    ],
  },
  {
    id: '04',
    category: 'Recreation SLA',
    title: 'Shared Amenities Etiquette',
    summary:
      'Digital slot reservations, proper swimwear attire, and zero-waste policy across clubhouse facilities.',
    details:
      'Access to the Infinity Swimming Pool, Rooftop Lounge, and Tennis Courts is governed by live booking quotas via the Resident Portal. Appropriate athletic and swimming attire is required. Glassware and outside banqueting are strictly prohibited inside the aquatic perimeter. Clubhouse banquet bookings require a security deposit against incidental damages.',
    keyPoints: [
      'Digital reservation required prior to pool & tennis court usage',
      'Maximum 4 accompanied guests per resident reservation',
      'Shower mandatory prior to entering the heated swimming pool',
    ],
  },
  {
    id: '05',
    category: 'Architecture',
    title: 'Balcony & Façade Uniformity',
    summary:
      'Preservation of the estate’s architectural elegance and exterior aesthetic standards.',
    details:
      'To maintain the luxury visual identity and structural integrity of the residential towers, external modifications to balcony railings, painting exterior walls in non-standard hues, or mounting unsightly laundry airers on street-facing balconies are prohibited. Outdoor terrace greenery must be maintained in approved planters.',
    keyPoints: [
      'Exterior facade color tones cannot be altered individually',
      'Uniform charcoal sun-louvers standard across all tower balconies',
      'Satellite dish antennas restricted to the central building headend',
    ],
  },
];

export default function CommunityGuidelines() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const accordionRef = useRef(null);

  // Active open item index (Default 0 open)
  const [openIndex, setOpenIndex] = useState(0);

  const toggleItem = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header Entrance
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

      // 2. Accordion Rows Stagger
      const rows = accordionRef.current.querySelectorAll('.guideline-row');
      gsap.fromTo(
        rows,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: accordionRef.current,
            start: 'top 75%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="guidelines"
      ref={sectionRef}
      className="relative w-full bg-[#000000] text-white py-32 md:py-44 px-4 sm:px-6 md:px-12 xl:px-16 overflow-hidden z-30 border-t border-white/10"
    >
      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* Section Header */}
        <div
          ref={headerRef}
          className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/10 pb-12 gap-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs tracking-widest uppercase mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              <span>Community Charter & Policies</span>
            </div>
            
            <h2 className="text-[42px] sm:text-[60px] md:text-[80px] font-medium tracking-tighter leading-[1.05] text-white">
              <FoldText text="Estate Rules" duration={0.8} /> <br />
              <span className="text-white/40">
                <FoldText text="& Guidelines." delay={0.15} duration={0.8} />
              </span>
            </h2>
          </div>

          <p className="text-white/50 text-base md:text-lg max-w-md font-normal leading-relaxed">
            A framework designed to maintain harmony, security, and the premium lifestyle standard across our residential ecosystem.
          </p>
        </div>

        {/* Editorial Accordion List */}
        <div ref={accordionRef} className="border-t border-white/10">
          {guidelinesData.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.id}
                className={`guideline-row border-b border-white/10 transition-all duration-500 overflow-hidden ${
                  isOpen ? 'bg-white/[0.03]' : 'hover:bg-white/[0.015]'
                }`}
              >
                {/* Header Row Clickable */}
                <button
                  onClick={() => toggleItem(idx)}
                  className="w-full py-7 md:py-9 px-4 sm:px-6 flex items-center justify-between gap-6 text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-6 sm:gap-10">
                    <span className="font-mono text-xs sm:text-sm text-white/40 tracking-wider shrink-0">
                      /{item.id}
                    </span>
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-white/40 block mb-1">
                        {item.category}
                      </span>
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-white">
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Toggle Plus/Minus Icon */}
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80 shrink-0 transition-transform duration-500">
                    <Plus
                      className={`w-5 h-5 transition-transform duration-500 ${
                        isOpen ? 'rotate-45 text-white' : 'rotate-0'
                      }`}
                    />
                  </div>
                </button>

                {/* Collapsible Content with CSS Grid Transition */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-4 sm:px-6 pb-8 md:pb-10 pt-2 pl-14 sm:pl-20 max-w-4xl space-y-5">
                      
                      <p className="text-white/70 text-sm sm:text-base leading-relaxed font-normal">
                        {item.details}
                      </p>

                      {/* Key Points Checklist */}
                      <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2.5">
                        <span className="text-xs uppercase tracking-wider text-white/40 font-medium block mb-2">
                          Standard Operating Procedures:
                        </span>
                        {item.keyPoints.map((point, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0 mt-2" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
