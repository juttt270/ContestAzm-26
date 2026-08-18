import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Check,
  X,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import FoldText from '@/marketing/ui/FoldText.jsx';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const PAGE_SIZE = 3;

const eventsData = [
  {
    id: 'event-1',
    day: '24',
    month: 'AUG',
    title: 'Annual Summer Solstice Gala',
    category: 'Banquet & Jazz',
    location: 'Grand Ballroom & Courtyard',
    time: '07:00 PM – 11:30 PM',
    spotsLeft: '14 Spots Remaining',
    image: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200&auto=format&fit=crop',
    description:
      'An evening of bespoke culinary pairings, live jazz performance, and celebration of our homeowner community.',
  },
  {
    id: 'event-2',
    day: '05',
    month: 'SEP',
    title: 'Sunrise Rooftop Sound Bath & Yoga',
    category: 'Wellness & Vitality',
    location: 'Skyline Horizon Terrace',
    time: '06:30 AM – 08:00 AM',
    spotsLeft: '8 Spots Remaining',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format&fit=crop',
    description:
      'Guided mindfulness meditation, Tibetan singing bowl sound bath, and sunrise Vinyasa flow led by certified instructors.',
  },
  {
    id: 'event-3',
    day: '18',
    month: 'SEP',
    title: 'Starlight Open-Air Cinema Evening',
    category: 'Community Social',
    location: 'Central Garden Lawn',
    time: '08:00 PM – 10:30 PM',
    spotsLeft: 'Open to All Residents',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
    description:
      'Under-the-stars 4K projection screening with cozy loungers, gourmet popcorn bars, and warm artisan ciders.',
  },
  {
    id: 'event-4',
    day: '02',
    month: 'OCT',
    title: 'Artisan Wine Tasting & Soirée',
    category: 'Tasting & Networking',
    location: 'Clubhouse Cellar Suite',
    time: '07:30 PM – 10:00 PM',
    spotsLeft: '12 Spots Remaining',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200&auto=format&fit=crop',
    description:
      'Sommelier-curated vintage tasting paired with imported cheeses, charcuterie boards, and live classical acoustic guitar.',
  },
];

export default function UpcomingEvents() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const listRef = useRef(null);
  
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [guestsCount, setGuestsCount] = useState(2);
  const [page, setPage] = useState(1);

  const pageCount = Math.max(1, Math.ceil(eventsData.length / PAGE_SIZE));
  const visibleEvents = eventsData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Lock background scroll during modal open
  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setRsvpSuccess(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedEvent]);

  // Header reveal — runs once, on first scroll into view.
  useEffect(() => {
    const ctx = gsap.context(() => {
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
    }, sectionRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Card grid stagger — re-plays whenever the visible page of events changes.
  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = listRef.current.querySelectorAll('.event-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [page]);

  const handleOpenRsvp = (e, event) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSelectedEvent(event);
  };

  const handleConfirmRsvp = (e) => {
    e.preventDefault();
    setRsvpSuccess(true);
  };

  const activeImage = eventsData[activeEventIndex]?.image || eventsData[0].image;

  return (
    <section
      id="events"
      ref={sectionRef}
      className="relative w-full bg-[#000000] text-white py-32 md:py-44 px-4 sm:px-6 md:px-12 xl:px-16 overflow-hidden z-30 border-t border-white/10"
    >
      {/* Background Dynamic Ambient Image with Cross-fade */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={activeImage}
          alt=""
          className="w-full h-full object-cover opacity-10 filter grayscale contrast-125 transition-all duration-1000 ease-out scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#000000] via-[#000000]/95 to-[#000000]" />
      </div>

      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* Section Header */}
        <div
          ref={headerRef}
          className="mb-20 flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/10 pb-12 gap-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs tracking-widest uppercase mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              <span>✦ Estate Social Calendar</span>
            </div>
            
            <h2 className="text-[42px] sm:text-[60px] md:text-[80px] font-medium tracking-tighter leading-[1.05] text-white">
              <FoldText text="Upcoming" duration={0.8} /> <br />
              <span className="text-white/40">
                <FoldText text="Community Events." delay={0.15} duration={0.8} />
              </span>
            </h2>
          </div>

          <p className="text-white/50 text-base md:text-lg max-w-md font-normal leading-relaxed">
            Experience the vibrant social lifestyle of our community. Register for exclusive gatherings, wellness sessions, and festive evenings.
          </p>
        </div>

        {/* Dynamic Card-based Events Grid */}
        <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleEvents.map((event, idx) => {
            return (
              <div
                key={event.id}
                onMouseEnter={() => setActiveEventIndex(idx)}
                onClick={(e) => handleOpenRsvp(e, event)}
                className="event-card group bg-[#080a0f]/60 border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 hover:bg-[#0e1117] transition-all duration-500 flex flex-col h-full cursor-pointer shadow-lg"
              >
                {/* 1. Card Header Image */}
                <div className="relative overflow-hidden aspect-[16/10] w-full">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Glassmorphic Category tag */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] uppercase font-bold text-white/95 tracking-wider">
                    {event.category}
                  </span>

                  {/* Spots Left tag */}
                  <span className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-emerald-500/25 backdrop-blur-md border border-emerald-500/35 text-[9px] font-bold text-emerald-400 tracking-wide">
                    {event.spotsLeft}
                  </span>

                  {/* Floating Date Badge */}
                  <div className="absolute bottom-4 left-4 flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/10 shadow-lg">
                    <span className="text-2xl font-light text-white tracking-tighter leading-none">
                      {event.day}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase leading-none">
                        {event.month}
                      </span>
                      <span className="text-[9px] text-white/40 leading-none mt-0.5 font-semibold">2026</span>
                    </div>
                  </div>
                </div>

                {/* 2. Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-medium tracking-tight text-white group-hover:text-emerald-400 transition-colors duration-300">
                      {event.title}
                    </h3>
                    
                    <p className="text-white/60 text-xs leading-relaxed line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  {/* Meta Details with Icons */}
                  <div className="space-y-2 pt-2 border-t border-white/5 text-[11px] text-white/50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-emerald-400/80 shrink-0" />
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Card Action Button */}
                <div className="p-6 pt-0 mt-auto">
                  <button
                    onClick={(e) => handleOpenRsvp(e, event)}
                    className="w-full py-3.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-[#f4f4f4] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                    <span>Register Pass</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-3 mt-14">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs text-white/50 tracking-wider uppercase">
              Page {page} of {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="p-2.5 rounded-full bg-white/5 border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* Interactive Reservation Modal */}
      {selectedEvent && (
        <div
          data-lenis-prevent
          data-modal-open="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEvent(null);
          }}
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/90 backdrop-blur-2xl overflow-y-auto"
        >
          <div data-lenis-prevent className="relative w-full max-w-lg bg-[#111317] border border-white/20 rounded-[28px] p-6 sm:p-8 flex flex-col max-h-[78vh] my-auto overflow-hidden shadow-2xl animate-fadeIn">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 w-max mb-2">
                  <Calendar className="w-3.5 h-3.5 text-white/70" />
                  <span>{selectedEvent.day} {selectedEvent.month} 2026 · {selectedEvent.category}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight">
                  {selectedEvent.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto my-4 space-y-4 text-xs sm:text-sm no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {!rsvpSuccess ? (
                <form onSubmit={handleConfirmRsvp} className="space-y-4">
                  <p className="text-white/70 leading-relaxed">
                    {selectedEvent.description}
                  </p>

                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-white/70">
                      <span>Venue:</span>
                      <span className="text-white font-medium">{selectedEvent.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-white/70">
                      <span>Schedule:</span>
                      <span className="text-white font-medium">{selectedEvent.time}</span>
                    </div>
                    <div className="flex items-center justify-between text-white/70">
                      <span>Access:</span>
                      <span className="text-white font-medium">Verified Resident Entry Pass</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 font-medium text-[11px] uppercase tracking-wider">
                      Flat / Unit Number:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Unit A-301"
                      className="w-full bg-[#181a20] border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-white/40 text-xs font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 mb-1 font-medium text-[11px] uppercase tracking-wider">
                      Number of Attending Guests:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          type="button"
                          key={num}
                          onClick={() => setGuestsCount(num)}
                          className={`py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                            guestsCount === num
                              ? 'bg-white text-black border-white'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-white/90 transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                    >
                      <span>Confirm Booking</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mx-auto">
                    <Check className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <h4 className="text-xl font-medium text-white">Booking Confirmed</h4>
                  <p className="text-white/60 text-xs max-w-sm mx-auto leading-relaxed">
                    Your pass for <span className="text-white font-medium">{selectedEvent.title}</span> ({guestsCount} {guestsCount === 1 ? 'Guest' : 'Guests'}) has been recorded.
                  </p>
                  <div className="pt-4">
                    <button
                      onClick={() => setSelectedEvent(null)}
                      className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-white/90 transition-all cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!rsvpSuccess && (
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Resident Portal Verification</span>
                </span>
                <span>Complimentary Entry</span>
              </div>
            )}

          </div>
        </div>
      )}
    </section>
  );
}
