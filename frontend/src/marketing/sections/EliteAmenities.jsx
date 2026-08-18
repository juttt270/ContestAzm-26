import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import {
  Waves,
  Sparkles,
  Building,
  Dumbbell,
  Compass,
  Laptop,
  Trophy,
  Users,
  X,
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import FoldText from '@/marketing/ui/FoldText.jsx';
import { useAuth } from '@/context/AuthContext';
import * as amenityService from '@/services/amenityService';
import { formatCurrency } from '@/lib/currency';

gsap.registerPlugin(ScrollTrigger);

const ICON_CYCLE = [Waves, Building, Compass, Trophy, Dumbbell, Laptop];
const ACCENT_CYCLE = [
  { text: 'text-cyan-400', border: 'group-hover:border-cyan-500/40' },
  { text: 'text-amber-400', border: 'group-hover:border-amber-500/40' },
  { text: 'text-purple-400', border: 'group-hover:border-purple-500/40' },
  { text: 'text-emerald-400', border: 'group-hover:border-emerald-500/40' },
  { text: 'text-rose-400', border: 'group-hover:border-rose-500/40' },
  { text: 'text-blue-400', border: 'group-hover:border-blue-500/40' },
];

const PAGE_SIZE = 6;

export default function EliteAmenities() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const [selectedAmenity, setSelectedAmenity] = useState(null);

  useEffect(() => {
    amenityService
      .getPublicAmenities()
      .then(setAmenities)
      .catch(() => setError('Unable to load amenities right now.'))
      .finally(() => setLoading(false));
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = selectedAmenity ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedAmenity]);

  // Master GSAP ScrollTrigger Animations — re-run whenever the visible page of cards changes.
  useEffect(() => {
    if (loading) return;
    const el = sectionRef.current;
    const cards = el.querySelectorAll('.amenity-card');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current.querySelectorAll('.reveal-line'),
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' }
      );
      gsap.fromTo(
        cards,
        { opacity: 0, y: 45, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, page]);

  const pageCount = Math.max(1, Math.ceil(amenities.length / PAGE_SIZE));
  const visible = amenities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleReserve = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/amenities');
  };

  return (
    <section
      id="amenities"
      ref={sectionRef}
      className="relative w-full bg-[#000000] text-white py-24 sm:py-32 md:py-44 px-3 sm:px-6 md:px-12 xl:px-16 overflow-hidden z-30 border-t border-white/10"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto z-10">
        <div
          ref={headerRef}
          className="mb-14 sm:mb-20 flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/10 pb-8 sm:pb-12 gap-6 sm:gap-8"
        >
          <div>
            <div className="reveal-line inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-[11px] sm:text-xs tracking-widest uppercase mb-4 sm:mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>✦ Community Lifestyle & Recreation</span>
            </div>

            <h2 className="reveal-line text-[38px] sm:text-[60px] md:text-[80px] font-medium tracking-tighter leading-[1.05] text-white">
              <FoldText text="Elite Shared" duration={0.8} /> <br />
              <span className="text-white/40">
                <FoldText text="Amenities." delay={0.15} duration={0.8} />
              </span>
            </h2>
          </div>

          <p className="reveal-line text-white/50 text-sm sm:text-base md:text-lg max-w-md font-normal leading-relaxed">
            World-class recreational infrastructure reserved exclusively for SmartSociety residents, flat owners, and verified guests.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-white/50 gap-2.5">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Loading amenities...</span>
          </div>
        ) : error ? (
          <div className="text-center py-24 text-white/50 text-sm">{error}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
              {visible.map((amenity, i) => {
                const Icon = ICON_CYCLE[i % ICON_CYCLE.length];
                const accent = ACCENT_CYCLE[i % ACCENT_CYCLE.length];
                return (
                  <div
                    key={amenity._id}
                    onClick={() => setSelectedAmenity(amenity)}
                    className={`group relative bg-[#090b0e] border border-white/10 ${accent.border} rounded-[20px] sm:rounded-[28px] overflow-hidden min-h-[300px] sm:min-h-[380px] md:min-h-[460px] flex flex-col justify-between p-3.5 sm:p-6 md:p-8 cursor-pointer shadow-2xl transition-all duration-500 hover:border-white/30 amenity-card`}
                  >
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      {amenity.image?.url ? (
                        <img
                          src={amenity.image.url}
                          alt={amenity.name}
                          className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-white/[0.04] to-transparent" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-[#090b0e]/80 to-transparent" />
                    </div>

                    <div className="relative z-10 flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl text-[10px] sm:text-xs text-white/90 font-medium truncate">
                        <Icon className={`w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 ${accent.text}`} />
                        <span className="truncate">{amenity.bookingFee > 0 ? formatCurrency(amenity.bookingFee) : 'Free'}</span>
                      </div>
                      <span className="p-1.5 sm:p-2.5 rounded-full bg-white/10 border border-white/15 text-white group-hover:bg-white group-hover:text-black transition-all duration-300 backdrop-blur-md shrink-0">
                        <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                    </div>

                    <div className="relative z-10 mt-8 sm:mt-16 md:mt-20">
                      <div>
                        <h3 className="text-sm sm:text-lg md:text-2xl font-medium tracking-tight text-white mb-1 md:mb-2 leading-snug">
                          {amenity.name}
                        </h3>
                        <p className="text-white/60 text-[11px] sm:text-xs md:text-sm font-normal leading-relaxed mb-2 md:mb-4 line-clamp-1 sm:line-clamp-2 hidden xs:block">
                          {amenity.description || 'Available for residents to book by time slot.'}
                        </p>
                      </div>

                      <div className="hidden sm:flex flex-wrap items-center gap-2 pt-2 md:pt-3 border-t border-white/10 text-xs text-white/70">
                        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full backdrop-blur-md text-[10px] sm:text-[11px]">
                          <Users className="w-3 h-3 text-white/50" />
                          <span>Up to {amenity.capacity} guests</span>
                        </div>
                      </div>

                      <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-white/10">
                        <button
                          onClick={(e) => handleReserve(e)}
                          className="w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-full bg-white text-black font-semibold text-[10px] sm:text-xs hover:bg-[#f4f4f4] transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer shadow-md"
                        >
                          <span>Reserve</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pageCount > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12 sm:mt-16">
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
          </>
        )}
      </div>

      {selectedAmenity && (
        <div
          data-lenis-prevent
          data-modal-open="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedAmenity(null);
          }}
          className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/90 backdrop-blur-2xl overflow-y-auto"
        >
          <div data-lenis-prevent className="relative w-full max-w-xl bg-[#111317] border border-white/20 rounded-[28px] p-6 sm:p-8 flex flex-col max-h-[78vh] my-auto overflow-hidden shadow-2xl">
            <div className="flex items-start justify-between pb-4 border-b border-white/10 relative z-10">
              <div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 w-max mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Facility Details</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-medium text-white tracking-tight">{selectedAmenity.name}</h3>
              </div>
              <button
                onClick={() => setSelectedAmenity(null)}
                className="p-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto my-4 space-y-4 relative z-10 text-xs sm:text-sm no-scrollbar">
              <p className="text-white/70 leading-relaxed">
                {selectedAmenity.description || 'Available for residents to book by time slot.'}
              </p>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Maximum Capacity:</span>
                  <span className="text-white font-medium">{selectedAmenity.capacity} guests</span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/70">
                  <span>Booking Fee:</span>
                  <span className="text-white font-medium">
                    {selectedAmenity.bookingFee > 0 ? formatCurrency(selectedAmenity.bookingFee) : 'Free'}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => handleReserve(e)}
                className="w-full py-3 rounded-full bg-white text-black font-semibold text-xs sm:text-sm hover:bg-[#f4f4f4] transition-all flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <span>{isAuthenticated ? 'Continue to Book a Slot' : 'Log In to Reserve'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
