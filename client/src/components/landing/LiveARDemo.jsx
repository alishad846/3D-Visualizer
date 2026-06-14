import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, ScanLine, Maximize, Cuboid } from 'lucide-react';
import ProductCanvas from '../product/viewer/canvas/ProductCanvas';

export default function LiveARDemo() {
  return (
    <section className="py-32 bg-[#050b14] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00F0FF] opacity-[0.02] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Phone Mockup */}
        <div className="relative mx-auto w-full max-w-[320px] lg:max-w-[400px]">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            className="relative z-10 rounded-[3rem] border-8 border-[#1a1f2e] bg-[#000] aspect-[9/19] overflow-hidden shadow-2xl shadow-[#00F0FF]/20"
          >
            {/* Dynamic Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-7 bg-[#1a1f2e] rounded-b-3xl z-50" />

            {/* Simulated AR Screen */}
            <div className="absolute inset-0 bg-[#0a1523] flex flex-col items-center justify-center overflow-hidden">
              
              {/* Realistic Room Background (simulating camera feed) */}
              <img src="/images/ar_bg.png" alt="AR Camera Feed" className="absolute inset-0 w-full h-full object-cover opacity-80" />

              {/* Scanning Reticle Animation */}
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-x-8 top-1/3 aspect-square border-2 border-dashed border-[#00F0FF]/50 rounded-3xl"
              />

              {/* 3D Object Appearance Animation */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                animate={{ scale: 1.25, opacity: 1, rotateY: 0 }}
                transition={{ duration: 1.5, delay: 0.5, type: "spring" }}
                className="absolute inset-0 z-10"
              >
                <div className="w-48 h-48 bg-gradient-to-br from-[#00F0FF] to-[#b366ff] opacity-10 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                <div className="absolute inset-0 pointer-events-auto">
                  <ProductCanvas modelUrl="/models/shoe.glb" autoRotate={true} controls={false} />
                </div>
              </motion.div>

              {/* AR UI Overlay */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                <button className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                  <ScanLine size={24} />
                </button>
                <button className="w-14 h-14 rounded-full bg-[#00F0FF] text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center">
                  <Maximize size={24} />
                </button>
              </div>

            </div>
          </motion.div>

          {/* Floating UI Elements around phone */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -right-12 lg:-right-24 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl z-20"
          >
            <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Scale</div>
            <div className="text-white font-bold">1:1 True Size</div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 -left-12 lg:-left-24 bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl z-20 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
              <Smartphone size={16} />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-bold uppercase">Tracking</div>
              <div className="text-white font-bold text-sm">Surface Locked</div>
            </div>
          </motion.div>

        </div>

        {/* Right: Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md w-fit">
            <Smartphone className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">WebAR Technology</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-display font-bold text-white leading-tight">
            Try before they buy. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#b366ff]">In their own space.</span>
          </h2>

          <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
            Let customers visualize your products in their exact environment. No app downloads required. Our browser-based WebAR works instantly on both iOS and Android devices directly from the scan.
          </p>

          <ul className="grid gap-4 mt-4">
            {['True-to-scale rendering', 'Real-time surface detection', 'Lighting estimation', 'Instant browser launch'].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[#00F0FF]">
                  ✓
                </div>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
}
