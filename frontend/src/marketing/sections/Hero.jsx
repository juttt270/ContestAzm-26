import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { QrCode, CreditCard, Calendar, Search, ArrowRight, X, CheckCircle2, AlertCircle } from 'lucide-react'
import heroImg from '@/assets/images/society-hero.png'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import FoldText from '@/marketing/ui/FoldText.jsx'
import * as billingService from '@/services/billingService'
import { formatCurrency } from '@/lib/currency'
import { formatDate } from '@/lib/date'

gsap.registerPlugin(ScrollTrigger)

export default function Hero() {
  const { isAuthenticated } = useAuth()
  const sectionRef = useRef(null)
  const layer1Ref = useRef(null)
  const layer2Ref = useRef(null)
  const layer3Ref = useRef(null)

  const [flatNumber, setFlatNumber] = useState('')
  const [duesResult, setDuesResult] = useState(null)
  const [duesError, setDuesError] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=200%',
          scrub: 0.2,
          pin: true,
          anticipatePin: 1,
          // Layer 1 stays clickable only while still visible near the top — once scrolled past,
          // stop it from blocking clicks on the Layer 3 content revealed underneath.
          onUpdate: (self) => {
            if (layer1Ref.current) {
              layer1Ref.current.style.pointerEvents = self.progress > 0.08 ? 'none' : 'auto'
            }
          },
        },
      })

      // Step 1: Fade out & slide up Layer 1
      tl.to(
        layer1Ref.current,
        {
          opacity: 0,
          y: -100,
          scale: 0.95,
          duration: 0.4,
          ease: 'power2.inOut',
        },
        0
      )

      // Step 2: Expand Layer 2 Image Card to cover full viewport (using left/right/height to avoid layout translation clashes)
      tl.to(
        layer2Ref.current,
        {
          left: '0%',
          right: '0%',
          height: '100vh',
          borderTopLeftRadius: '0px',
          borderTopRightRadius: '0px',
          borderColor: 'rgba(255,255,255,0)', // Animating color is much cheaper than animating borderWidth
          duration: 1,
          ease: 'power2.inOut',
        },
        0
      )

      // Step 3: Staggered reveal of Layer 3 inner content & glassmorphism cards
      const layer3Items = layer3Ref.current.querySelectorAll('.layer3-anim')
      tl.fromTo(
        layer3Items,
        {
          y: 40,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power2.out',
        },
        '>-0.2'
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  const handleCheckDues = async (e) => {
    e.preventDefault()
    if (!flatNumber.trim()) return
    setIsSearching(true)
    setDuesError('')
    setDuesResult(null)
    try {
      const result = await billingService.checkFlatDues(flatNumber.trim())
      if (!result.found) {
        setDuesError(`No flat found matching "${flatNumber.trim()}". Try e.g. A-101.`)
      } else if (!result.hasBills) {
        setDuesError(`Flat ${result.flat} has no bills generated yet.`)
      } else {
        setDuesResult(result)
      }
    } catch (err) {
      setDuesError(err.message || 'Unable to check dues right now.')
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full h-[100dvh] md:h-screen bg-black overflow-hidden"
    >
      {/* LAYER 0: Looping Cinematic Video Background with Image Fallback on Mobile (z-0) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        {/* Instant Fallback Image for Mobile */}
        <img
          src={heroImg}
          alt="Society Backdrop"
          className="md:hidden absolute inset-0 w-full h-full object-cover opacity-35"
        />

        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-night-in-the-city-4364/1080p.mp4"
            type="video/mp4"
          />
        </video>
        
        {/* Pure Black Dark Overlay (70% opacity) */}
        <div className="absolute inset-0 bg-black/70 z-5 pointer-events-none" />
      </div>

      {/* LAYER 1: Initial Text & CTA (z-20) */}
      <div
        ref={layer1Ref}
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20 pb-32 sm:pb-36 md:pb-48 pointer-events-auto"
      >
        <h1 className="text-white text-5xl sm:text-7xl lg:text-[80px] xl:text-[110px] leading-none tracking-tighter font-medium text-center z-20">
          <FoldText text="Living, Reimagined." duration={0.8} />
        </h1>

        <p className="text-[#8d969e] mt-4 sm:mt-6 text-base sm:text-lg max-w-xl text-center font-normal z-20 px-2">
          Experience the ultimate standard in luxury society management.
        </p>

        <Link
          to={isAuthenticated ? "/dashboard" : "/login"}
          className="mt-6 sm:mt-8 bg-white text-black px-8 py-3.5 sm:py-4 rounded-full font-semibold hover:bg-[#f4f4f4] transition-colors cursor-pointer border-0 text-sm sm:text-base z-20 no-underline"
        >
          {isAuthenticated ? "Go to Dashboard" : "Get Started"}
        </Link>
      </div>

      {/* LAYER 2: Expanding Image Card (z-10) */}
      <div
        ref={layer2Ref}
        className="hero-expanding-card overflow-hidden border-t border-x border-white/12 bg-[#16181a] z-10"
      >
        {/* Full Cover Image */}
        <img
          src={heroImg}
          alt="Smart Society Housing"
          className="w-full h-full object-cover"
        />

        {/* Pure Black Dark Overlay for Readability */}
        <div className="absolute inset-0 bg-black/50 z-10" />

        {/* LAYER 3: Luxury Society Interface Reveal (z-20 inside Card) */}
        <div
          ref={layer3Ref}
          className="absolute inset-0 flex flex-col items-center justify-center text-center z-20 px-4 sm:px-6"
        >
          {/* Main Heading */}
          <h2 className="layer3-anim text-white text-4xl sm:text-6xl md:text-7xl lg:text-[80px] xl:text-[100px] font-semibold tracking-tighter leading-none">
            <FoldText text="Elevated Living." duration={0.7} />
          </h2>

          {/* Sub-heading */}
          <div className="layer3-anim text-white/70 text-xl sm:text-3xl md:text-4xl lg:text-[40px] xl:text-[60px] font-medium tracking-tight mt-2">
            <FoldText text="Effortless Control." delay={0.15} duration={0.7} />
          </div>

          {/* Glassmorphism Quick-Action Cards Row */}
          <div className="mt-6 sm:mt-10 flex flex-wrap justify-center gap-3 sm:gap-6 z-30">
            {/* Card 1: Gate Access */}
            <div className="layer3-anim bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 sm:p-5 flex flex-col items-center justify-center w-[105px] sm:w-[170px] md:w-[200px] text-center hover:bg-white/10 transition-colors">
              <QrCode className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[1.5]" />
              <h3 className="text-white font-semibold text-xs sm:text-sm mt-2 sm:mt-3">
                Quick Access
              </h3>
              <p className="text-white/60 text-[11px] sm:text-xs mt-0.5 hidden sm:block">
                Digital Gate Pass
              </p>
            </div>

            {/* Card 2: Maintenance */}
            <div className="layer3-anim bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 sm:p-5 flex flex-col items-center justify-center w-[105px] sm:w-[170px] md:w-[200px] text-center hover:bg-white/10 transition-colors">
              <CreditCard className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[1.5]" />
              <h3 className="text-white font-semibold text-xs sm:text-sm mt-2 sm:mt-3">
                Maintenance
              </h3>
              <p className="text-white/60 text-[11px] sm:text-xs mt-0.5 hidden sm:block">
                Automated Dues
              </p>
            </div>

            {/* Card 3: Amenities */}
            <div className="layer3-anim bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] p-4 sm:p-5 flex flex-col items-center justify-center w-[105px] sm:w-[170px] md:w-[200px] text-center hover:bg-white/10 transition-colors">
              <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[1.5]" />
              <h3 className="text-white font-semibold text-xs sm:text-sm mt-2 sm:mt-3">
                Amenities
              </h3>
              <p className="text-white/60 text-[11px] sm:text-xs mt-0.5 hidden sm:block">
                Instant Booking
              </p>
            </div>
          </div>

          {/* CHECK FLAT DUES SEARCH INPUT CONTAINER */}
          <div className="layer3-anim mt-5 sm:mt-8 w-full max-w-xl mx-auto z-30 px-2">
            <form
              onSubmit={handleCheckDues}
              className="bg-black/70 backdrop-blur-2xl border border-white/20 rounded-2xl sm:rounded-full p-2 flex flex-col sm:flex-row items-stretch sm:items-center shadow-[0_10px_30px_rgba(0,0,0,0.6)] group hover:border-white/40 transition-all duration-300 gap-2 sm:gap-0"
            >
              <div className="flex items-center gap-2 pl-2 sm:pl-4 text-white/50 flex-1 min-w-0">
                <Search className="w-4 h-4 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  placeholder="Check Dues (e.g. B-402)"
                  className="w-full bg-transparent text-white placeholder-white/40 text-xs sm:text-sm px-1 sm:px-2 focus:outline-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="bg-white text-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-xs sm:text-sm font-semibold hover:bg-[#f4f4f4] transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-md w-full sm:w-auto"
              >
                <span>{isSearching ? 'Checking...' : 'Check Balance'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* DUES LOOKUP ERROR / NOT FOUND */}
          {duesError && (
            <div className="layer3-anim mt-4 w-full max-w-md mx-auto z-40 bg-[#12141a]/95 backdrop-blur-2xl border border-amber-500/20 rounded-[20px] p-4 text-left shadow-2xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <p className="text-xs text-white/70">{duesError}</p>
            </div>
          )}

          {/* DUES RESULT LIVE POPUP MODAL — real data from the flat's latest maintenance bill */}
          {duesResult && (
            <div className="layer3-anim mt-4 w-full max-w-md mx-auto z-40 bg-[#12141a]/95 backdrop-blur-2xl border border-white/20 rounded-[24px] p-5 text-left shadow-2xl animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">Flat {duesResult.flat}</h4>
                    <span className="text-[11px] text-white/50">Billing month: {duesResult.billingMonth}</span>
                  </div>
                </div>
                <button
                  onClick={() => setDuesResult(null)}
                  className="p-1 rounded-full text-white/40 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 py-3 text-xs">
                <div>
                  <span className="text-white/40 block">Water Charges:</span>
                  <span className="text-white font-medium">{formatCurrency(duesResult.breakdown?.waterCharges)}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Security Charges:</span>
                  <span className="text-white font-medium">{formatCurrency(duesResult.breakdown?.securityCharges)}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Repair Charges:</span>
                  <span className="text-white font-medium">{formatCurrency(duesResult.breakdown?.repairCharges)}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Common Area:</span>
                  <span className="text-white font-medium">{formatCurrency(duesResult.breakdown?.commonAreaCharges)}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Due Date:</span>
                  <span className="text-white/80 font-medium">{formatDate(duesResult.dueDate)}</span>
                </div>
                <div>
                  <span className="text-white/40 block">Status:</span>
                  <span
                    className={`font-semibold ${
                      duesResult.paymentStatus === 'PAID'
                        ? 'text-emerald-400'
                        : duesResult.paymentStatus === 'OVERDUE'
                        ? 'text-red-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {duesResult.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-white/40 block">Total Outstanding:</span>
                  <span className="text-lg font-bold text-white tracking-tight">{formatCurrency(duesResult.totalDue)}</span>
                </div>
                {duesResult.paymentStatus !== 'PAID' && (
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-[#f4f4f4] transition-all no-underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Pay Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
