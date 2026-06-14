import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { View, ScanLine } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

// Landing Components
import SmoothScroll from '../components/landing/SmoothScroll';
import CustomCursor from '../components/landing/CustomCursor';
import HeroSection from '../components/landing/HeroSection';
import InteractiveShowcase from '../components/landing/InteractiveShowcase';
import ScanJourney from '../components/landing/ScanJourney';
import LiveARDemo from '../components/landing/LiveARDemo';
import BentoGrid from '../components/landing/BentoGrid';
import ComparisonSlider from '../components/landing/ComparisonSlider';
import DashboardPreview from '../components/landing/DashboardPreview';
import InfiniteMarquee from '../components/landing/InfiniteMarquee';
import Testimonials from '../components/landing/Testimonials';
import CTA from '../components/landing/CTA';
import QrScannerModal from '../components/landing/QrScannerModal';

function BrandMark() {
  return (
    <div className="flex items-center gap-2 font-display font-bold tracking-wide text-white">
      <View className="h-5 w-5 text-[#00F0FF]" />
      <span>
        Scan<span className="text-[#00F0FF]">Vista</span>
      </span>
    </div>
  );
}

export default function LandingHome() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [scrolled, setScrolled] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openPrimary = () => {
    navigate(isAuthenticated ? '/dashboard' : '/register');
  };

  return (
    <>
    <SmoothScroll>
      <div className="min-h-screen bg-[#050b14] text-white selection:bg-[#00F0FF]/30 font-sans">
        <CustomCursor />

        {/* Header */}
        <header
          className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
            scrolled ? 'border-b border-white/8 bg-[#050b14]/92 backdrop-blur-xl py-4' : 'bg-transparent py-6'
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="interactive"
            >
              <BrandMark />
            </button>

            <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-400 lg:flex absolute left-1/2 -translate-x-1/2">
              <a href="#showcase" className="hover:text-white transition-colors interactive">Showcase</a>
              <a href="#journey" className="hover:text-white transition-colors interactive">Journey</a>
              <a href="#ar" className="hover:text-white transition-colors interactive">WebAR</a>
              <a href="#analytics" className="hover:text-white transition-colors interactive">Analytics</a>
            </nav>

            <div className="flex items-center gap-4 z-10">
              {isAuthenticated ? (
                <Link to="/dashboard" className="px-5 py-2 text-sm font-bold text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors interactive">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors interactive">
                    Log in
                  </Link>
                  <Link to="/register" className="px-5 py-2 text-sm font-bold text-black bg-[#00F0FF] hover:bg-[#00F0FF]/80 shadow-[0_0_15px_rgba(0,240,255,0.4)] rounded-full transition-all interactive">
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        <main>
          <HeroSection onPrimaryClick={openPrimary} onScanClick={() => setIsScannerOpen(true)} />
          
          <div id="showcase">
            <InteractiveShowcase />
          </div>
          
          <div id="journey">
            <ScanJourney />
          </div>

          <div id="ar">
            <LiveARDemo />
          </div>

          <BentoGrid />

          <ComparisonSlider />

          <div id="analytics">
            <DashboardPreview />
          </div>

          <InfiniteMarquee />

          <Testimonials />

          <CTA />
        </main>

        <footer className="border-t border-white/10 bg-[#02050a] px-6 py-12 relative z-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
            <BrandMark />
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm font-semibold text-slate-500">
              <span className="hover:text-slate-300 cursor-pointer interactive">Privacy Policy</span>
              <span className="hover:text-slate-300 cursor-pointer interactive">Terms of Service</span>
              <span>© {new Date().getFullYear()} ScanVista</span>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScroll>
    <QrScannerModal 
      isOpen={isScannerOpen} 
      onClose={() => setIsScannerOpen(false)} 
    />
    </>
  );
}
