import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Clock,
  Check,
  ShieldCheck,
  Sparkles,
  Vote,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import FoldText from '@/marketing/ui/FoldText.jsx';
import { useAuth } from '@/context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

// 3 Real-time Estate Notices
const noticesData = [
  {
    id: 'notice-1',
    tag: 'Maintenance',
    title: 'Main Underground Reservoir Cleaning',
    date: 'Aug 18, 2026',
    time: '10:00 AM – 04:00 PM',
    description:
      'Bi-annual hydrostatic disinfection and pump servicing. Backup overhead tanks will supply secondary water lines during this maintenance window.',
    author: 'Facility Management',
  },
  {
    id: 'notice-2',
    tag: 'Community Meeting',
    title: 'Annual General Body Meeting (AGM 2026)',
    date: 'Aug 28, 2026',
    time: '07:30 PM',
    description:
      'Review of the annual financial audit, clubhouse solar upgrade discussion, and committee elections for the upcoming term.',
    author: 'Management Committee',
  },
  {
    id: 'notice-3',
    tag: 'Safety & Elevator',
    title: 'Tower Elevators Routine Inspection',
    date: 'Sep 02, 2026',
    time: '09:00 AM – 01:00 PM',
    description:
      'Certified routine sensor calibration and brake system inspections for Tower A and Tower B passenger elevators.',
    author: 'Engineering Team',
  },
];

// Active Community Polls
const initialPolls = [
  {
    id: 'poll-1',
    category: 'Capital Fund Upgrade',
    question: 'Next Quarter Society Improvements',
    description: 'Select which project should be prioritized with the Q4 surplus reserve fund.',
    totalVoters: 222,
    selectedOption: null,
    options: [
      { id: 'p1-opt1', label: 'Rooftop Solar & Sky Garden Setup', votes: 124 },
      { id: 'p1-opt2', label: 'Gym Equipment & Fitness Studio Upgrade', votes: 67 },
      { id: 'p1-opt3', label: 'EV Charging Stations in Resident Parking', votes: 31 },
    ],
  },
  {
    id: 'poll-2',
    category: 'Clubhouse Policy',
    question: 'Weekend Clubhouse Operating Hours',
    description: 'Vote on adjusting Friday and Saturday evening clubhouse facility timings.',
    totalVoters: 293,
    selectedOption: null,
    options: [
      { id: 'p2-opt1', label: 'Extend Closing to 12:00 Midnight', votes: 156 },
      { id: 'p2-opt2', label: 'Maintain Current 10:30 PM Curfew', votes: 48 },
      { id: 'p2-opt3', label: '24/7 Keycard Access for Residents', votes: 89 },
    ],
  },
  {
    id: 'poll-3',
    category: 'Estate Security',
    question: 'Visitor Vehicle Gate Verification',
    description: 'Choose the primary verification method for guest vehicles entering the estate.',
    totalVoters: 342,
    selectedOption: null,
    options: [
      { id: 'p3-opt1', label: 'Mandatory RFID Windshield Tag', votes: 178 },
      { id: 'p3-opt2', label: 'Digital Pre-Approved QR Code Pass', votes: 142 },
      { id: 'p3-opt3', label: 'Security Guard Manual Register Entry', votes: 22 },
    ],
  },
];

export default function CommunityNotices() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  // Active Poll Carousel Index (Shows exactly 1 poll at a time)
  const [activePollIndex, setActivePollIndex] = useState(0);

  // Multi-Poll State
  const [polls, setPolls] = useState(initialPolls);

  // Cast vote on a specific poll — must be signed in to vote.
  const handleVote = (pollId, optionId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setPolls((prevPolls) =>
      prevPolls.map((poll) => {
        if (poll.id !== pollId) return poll;

        const previousSelection = poll.selectedOption;
        if (previousSelection === optionId) return poll;

        const updatedOptions = poll.options.map((opt) => {
          if (opt.id === optionId) return { ...opt, votes: opt.votes + 1 };
          if (opt.id === previousSelection) return { ...opt, votes: Math.max(0, opt.votes - 1) };
          return opt;
        });

        const totalVoters = previousSelection ? poll.totalVoters : poll.totalVoters + 1;

        return {
          ...poll,
          selectedOption: optionId,
          options: updatedOptions,
          totalVoters,
        };
      })
    );
  };

  const currentPoll = polls[activePollIndex];
  const currentTotalVotes = currentPoll.options.reduce((sum, opt) => sum + opt.votes, 0);

  const nextPoll = () => {
    setActivePollIndex((prev) => (prev + 1) % polls.length);
  };

  const prevPoll = () => {
    setActivePollIndex((prev) => (prev - 1 + polls.length) % polls.length);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Reveal
      gsap.fromTo(
        headerRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="notices"
      ref={sectionRef}
      className="relative w-full bg-[#000000] text-white py-24 sm:py-32 md:py-44 px-3 sm:px-6 md:px-12 xl:px-16 overflow-hidden z-30 border-t border-white/10"
    >
      <div className="relative max-w-7xl mx-auto z-10">
        
        {/* Section Header */}
        <div
          ref={headerRef}
          className="mb-14 sm:mb-20 flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/10 pb-8 sm:pb-12 gap-6 sm:gap-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-xs tracking-widest uppercase mb-4 sm:mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              <span>Digital Notice Board & Resident Polling</span>
            </div>
            
            <h2 className="text-[38px] sm:text-[60px] md:text-[80px] font-medium tracking-tighter leading-[1.05] text-white">
              <FoldText text="Community Voice" duration={0.8} /> <br />
              <span className="text-white/40">
                <FoldText text="& Live Updates." delay={0.15} duration={0.8} />
              </span>
            </h2>
          </div>

          <p className="text-white/50 text-sm sm:text-base md:text-lg max-w-md font-normal leading-relaxed">
            Stay informed with estate announcements and participate in community decisions through active resident polls.
          </p>
        </div>

        {/* 12-Column Responsive Layout (Fixed Height, Zero Clutter) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: 3 Estate Notices Stack (Span 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/70">
                <Bell className="w-4 h-4 text-white/60" />
                <span>Recent Estate Notices</span>
              </div>
              <span className="text-xs text-white/40">3 Active</span>
            </div>

            {noticesData.map((notice) => (
              <div
                key={notice.id}
                className="bg-[#0c0e12] border border-white/10 hover:border-white/20 rounded-[20px] sm:rounded-[24px] p-5 sm:p-6 transition-all duration-300 shadow-xl"
              >
                {/* Top Meta Bar */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/5 border border-white/10 text-white/80">
                    {notice.tag}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] text-white/40">
                    <Calendar className="w-3 h-3" />
                    <span>{notice.date}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-base sm:text-lg font-medium text-white mb-2 leading-snug">
                  {notice.title}
                </h3>
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-4">
                  {notice.description}
                </p>

                {/* Footer Meta */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[11px] text-white/40">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{notice.time}</span>
                  </div>
                  <span>{notice.author}</span>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Dynamic Single-Card Poll Carousel (Span 7) - Always Compact */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Polls Carousel Bar Header */}
            <div className="flex items-center justify-between px-1 mb-2">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/70">
                <Vote className="w-4 h-4 text-white/60" />
                <span>Active Resident Polling</span>
              </div>

              {/* Prev / Next Pagination Controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/50 font-medium">
                  Poll {activePollIndex + 1} of {polls.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevPoll}
                    className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white hover:text-black transition-all cursor-pointer"
                    aria-label="Previous Poll"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={nextPoll}
                    className="p-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white hover:text-black transition-all cursor-pointer"
                    aria-label="Next Poll"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* FOCUSED SINGLE POLL CARD (OPTIONS DIRECTLY INSIDE) */}
            <div className="bg-[#0c0e12] border border-white/10 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl transition-all duration-300">
              
              {/* Poll Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-white/10 gap-3 sm:gap-4">
                <div>
                  <span className="text-[11px] text-white/50 uppercase tracking-wider block mb-1 font-medium">
                    {currentPoll.category}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-medium tracking-tight text-white">
                    {currentPoll.question}
                  </h3>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-left sm:text-right shrink-0 w-max">
                  <span className="text-[10px] text-white/40 block">Participation</span>
                  <span className="text-xs sm:text-sm font-semibold text-white">{currentPoll.totalVoters} Votes</span>
                </div>
              </div>

              <p className="text-white/60 text-xs sm:text-sm leading-relaxed my-4 sm:my-5 font-normal">
                {currentPoll.description}
              </p>

              {/* Options for THIS EXACT Active Poll */}
              <div className="space-y-2.5 sm:space-y-3">
                {currentPoll.options.map((opt) => {
                  const pct = currentTotalVotes > 0 ? Math.round((opt.votes / currentTotalVotes) * 100) : 0;
                  const isSelected = currentPoll.selectedOption === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleVote(currentPoll.id, opt.id)}
                      className={`relative rounded-xl sm:rounded-2xl border p-3.5 sm:p-4 cursor-pointer transition-all duration-300 overflow-hidden ${
                        isSelected
                          ? 'border-white/40 bg-white/10'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      {/* Animated Progress Bar Fill */}
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-white/10 transition-all duration-500 pointer-events-none"
                        style={{ width: `${pct}%` }}
                      />

                      <div className="relative z-10 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 sm:gap-3">
                          <div
                            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                              isSelected ? 'border-white bg-white text-black' : 'border-white/30'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm md:text-base font-medium text-white">
                              {opt.label}
                            </h4>
                            <span className="text-[10px] sm:text-xs text-white/40">{opt.votes} flats voted</span>
                          </div>
                        </div>

                        <span className="text-sm sm:text-lg font-semibold text-white tracking-tight shrink-0">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Poll Bottom Bar */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/40">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-white/60" />
                  <span>1 Verified Vote per Flat Unit</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-white/60 font-medium">
                    {currentPoll.selectedOption ? 'Vote Recorded ✓' : 'Select option to cast vote'}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
