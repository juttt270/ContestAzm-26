import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Navbar from "@/marketing/Navbar";
import Hero from "@/marketing/sections/Hero";
import SitemapFlowchart from "@/marketing/sections/SitemapFlowchart";
import CoreFeatures from "@/marketing/sections/CoreFeatures";
import EliteAmenities from "@/marketing/sections/EliteAmenities";
import CommunityNotices from "@/marketing/sections/CommunityNotices";
import UpcomingEvents from "@/marketing/sections/UpcomingEvents";
import CommunityGuidelines from "@/marketing/sections/CommunityGuidelines";
import EmergencySOS from "@/marketing/sections/EmergencySOS";
import Footer from "@/marketing/Footer";
import ScrollProgressNav from "@/marketing/ui/ScrollProgressNav";

gsap.registerPlugin(ScrollTrigger);

/** Public marketing homepage — the SmartSociety website. Scoped Lenis/GSAP smooth-scroll
 *  lives only here so it never interferes with the authenticated dashboard's own scrolling. */
export default function HomePage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.8,
      syncTouch: true,
      syncTouchLerp: 0.075,
      infinite: false,
    });

    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const updateTicker = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    const handleHashLinkClick = (e) => {
      const target = e.target.closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        e.preventDefault();
        const targetEl = document.querySelector(href);
        if (targetEl) lenis.scrollTo(targetEl);
      }
    };
    document.addEventListener("click", handleHashLinkClick);

    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    window.addEventListener("resize", handleResize);

    const observer = new MutationObserver(() => {
      const isLocked =
        document.body.style.overflow === "hidden" ||
        document.body.classList.contains("overflow-hidden") ||
        document.querySelector('[data-modal-open="true"]') !== null;
      if (isLocked) lenis.stop();
      else lenis.start();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["style", "class"], subtree: true });

    document.documentElement.classList.add("lenis");

    // Lenis mutates document/body layout (html.lenis { height: auto }) after section-level GSAP
    // ScrollTrigger pins have already measured their start/end offsets — re-measure once everything
    // has settled so pinned animations (e.g. the Hero) start from their true resting state.
    const refreshId = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      cancelAnimationFrame(refreshId);
      observer.disconnect();
      document.removeEventListener("click", handleHashLinkClick);
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      gsap.ticker.remove(updateTicker);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      lenis.destroy();
      window.__lenis = null;
      document.documentElement.classList.remove("lenis");
    };
  }, []);

  return (
    <div className="bg-black min-h-screen text-white w-full overflow-x-hidden font-sans relative selection:bg-white selection:text-black">
      <ScrollProgressNav />
      <Navbar />

      <main className="relative z-20 bg-black shadow-[0_50px_100px_rgba(0,0,0,1)]">
        <Hero />
        <CoreFeatures />
        <SitemapFlowchart />
        <EliteAmenities />
        <CommunityNotices />
        <UpcomingEvents />
        <CommunityGuidelines />
        <EmergencySOS />
      </main>

      <Footer />
    </div>
  );
}
