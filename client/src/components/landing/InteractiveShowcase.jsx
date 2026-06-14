import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { View, Smartphone, Layers } from 'lucide-react';
import ProductCanvas from '../product/viewer/canvas/ProductCanvas';
import { fetchPublicShowcase } from '../../api/viewer';

const DEFAULT_CATEGORIES = [
  { id: 'helmet', name: 'Sci-Fi Helmet', model: '/models/shoe.glb', color: '#b366ff' },
  { id: 'furniture', name: 'Furniture', model: '/models/sofa.glb', color: '#FF00F0' },
  { id: 'accessories', name: 'Accessories', model: '/models/watch.glb', color: '#00FF00' }
];

export default function InteractiveShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const mvRef = useRef(null);

  const activeCategory = DEFAULT_CATEGORIES[activeIndex];

  const handleViewInAR = () => {
    if (mvRef.current) {
      try {
        mvRef.current.activateAR();
      } catch (err) {
        console.error("Failed to activate AR:", err);
      }
    }
  };

  return (
    <section className="relative py-32 bg-[#050b14] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Any Product. <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-white">Any Detail.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Experience true-to-life 3D models with interactive 360° rotation and augmented reality features.
          </p>
        </div>

        <div className="grid lg:grid-cols-[250px_1fr] gap-12 items-center">
          
          {/* Navigation */}
          <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar">
            {DEFAULT_CATEGORIES.map((cat, index) => (
              <button
                key={cat.id}
                onClick={() => setActiveIndex(index)}
                className={`relative px-6 py-4 rounded-2xl text-left transition-all whitespace-nowrap ${
                  activeIndex === index 
                    ? 'bg-white/10 text-white font-bold' 
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }`}
              >
                {activeIndex === index && (
                  <motion.div 
                    layoutId="activeCategory"
                    className="absolute inset-0 border border-white/20 rounded-2xl bg-white/5"
                    style={{ borderColor: cat.color }}
                  />
                )}
                <span className="relative z-10">{cat.name}</span>
              </button>
            ))}
          </div>

          {/* 3D Showcase Area */}
          <div className="relative h-[500px] lg:h-[700px] rounded-[40px] border border-white/10 bg-[#0a1523] overflow-hidden group">
            
            {/* Hidden model-viewer for genuine AR launching */}
            <model-viewer
              ref={mvRef}
              src={activeCategory.model}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls="false"
              auto-rotate="false"
              style={{ position: 'absolute', width: 0, height: 0, visibility: 'hidden', pointerEvents: 'none' }}
            />

            {/* Ambient Background Light based on active category */}
            <motion.div 
              className="absolute inset-0 opacity-20 blur-[100px] transition-colors duration-1000"
              style={{ backgroundColor: activeCategory.color }}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory.model} // re-render when model changes
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <ProductCanvas modelUrl={activeCategory.model} autoRotate={true} />
              </motion.div>
            </AnimatePresence>

            {/* Glowing AR Button */}
            <div className="absolute bottom-8 right-8">
              <button 
                onClick={handleViewInAR}
                className="relative group/btn flex items-center gap-2 px-6 py-4 bg-black/60 backdrop-blur-xl border border-white/20 rounded-full overflow-hidden interactive"
              >
                <motion.div 
                  className="absolute inset-0 opacity-0 group-hover/btn:opacity-50 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${activeCategory.color}, transparent)` }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
                <Smartphone className="w-5 h-5 relative z-10 text-white" />
                <span className="text-sm font-bold tracking-widest uppercase relative z-10 text-white">View in AR</span>
              </button>
            </div>

            {/* Interactive Hints */}
            <div className="absolute top-8 left-8 flex flex-col gap-4">
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <View className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">360° Rotate</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                <Layers className="w-4 h-4 text-[#b366ff]" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Auto Morph</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
