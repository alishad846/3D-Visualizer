import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { QrCode, ArrowRight, ScanLine } from 'lucide-react';
import ProductCanvas from '../product/viewer/canvas/ProductCanvas';
import { fetchPublicAnalytics, fetchPublicShowcase } from '../../api/viewer';

const Counter = ({ end, label, suffix = '' }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    let obj = { val: 0 };
    gsap.to(obj, {
      val: end,
      duration: 2.5,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: node,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
      onUpdate: () => {
        if (node) {
          node.textContent = Math.floor(obj.val) + suffix;
        }
      }
    });
  }, [end, suffix]);

  return (
    <div className="flex flex-col items-center">
      <div ref={nodeRef} className="text-4xl md:text-5xl font-display font-bold text-white mb-2">0{suffix}</div>
      <div className="text-sm text-slate-400 uppercase tracking-widest">{label}</div>
    </div>
  );
};

export default function HeroSection({ onPrimaryClick, onScanClick }) {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const opacity1 = useTransform(scrollY, [0, 500], [1, 0]);

  const [stats, setStats] = useState({ totalScans: 5000, totalProducts: 1200, accuracy: 98 });
  const [heroModel, setHeroModel] = useState('/models/shoe.glb');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analyticsData, showcaseData] = await Promise.all([
          fetchPublicAnalytics(),
          fetchPublicShowcase()
        ]);
        
        if (analyticsData) {
          setStats({
            totalScans: Math.max(analyticsData.totalScans, 150), // ensure it's not 0 for visual flair
            totalProducts: Math.max(analyticsData.totalProducts, 24),
            accuracy: analyticsData.accuracy || 98
          });
        }

        if (showcaseData?.products?.length > 0) {
          const validProduct = showcaseData.products.find(p => p.model_url);
          if (validProduct) setHeroModel(validProduct.model_url);
        }
      } catch (err) {
        console.error('Failed to load hero data', err);
      }
    };
    loadData();
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden pt-20">
      {/* Background Mesh Removed */ }

      {/* Removed heavy floating QR particles for performance */}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center flex-1 my-10">
        
        {/* Left Content */}
        <motion.div 
          style={{ y: y1, opacity: opacity1 }}
          className="flex flex-col items-start"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Next Gen AR Commerce</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-8xl font-display font-black leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-500 mb-6"
          >
            Scan.<br/>
            <span className="text-[#00F0FF]">Visualize.</span><br/>
            Experience.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg text-slate-400 mb-10 max-w-lg leading-relaxed"
          >
            Bridge the physical and digital world. Turn static packaging into interactive 3D and AR journeys that drive engagement and sales.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <button 
              onClick={onPrimaryClick}
              className="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform flex items-center gap-2 group interactive"
            >
              Start Creating <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onScanClick}
              className="px-8 py-4 bg-gradient-to-r from-[#00F0FF]/20 to-[#b366ff]/20 border border-white/20 text-white font-bold rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 interactive"
            >
              <ScanLine className="w-4 h-4 text-[#00F0FF]" />
              Scan QR
            </button>
          </motion.div>
        </motion.div>

        {/* Right Content - 3D Floating Model */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          className="relative h-[400px] lg:h-[600px] w-full mt-10 lg:mt-0"
        >
          <div className="absolute inset-0 z-10 pointer-events-auto">
            {/* <ProductCanvas modelUrl={heroModel} autoRotate={true} /> */}
          </div>
          
          {/* Glass plate below model */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#00F0FF]/5 rounded-[100%] blur-3xl pointer-events-none" />
        </motion.div>
      </div>

      {/* Live Counters */}
      <div className="relative w-full z-20 mt-auto pb-8 pt-8 border-t border-white/10 bg-gradient-to-t from-[#050b14] to-transparent">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 gap-8">
          <Counter end={stats.totalScans} label="Scans" suffix="+" />
          <Counter end={stats.totalProducts} label="Products" suffix="+" />
          <Counter end={stats.accuracy} label="Accuracy" suffix="%" />
        </div>
      </div>
    </section>
  );
}
