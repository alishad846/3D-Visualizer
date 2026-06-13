import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { MoveHorizontal } from 'lucide-react';
import ProductCanvas from '../product/viewer/canvas/ProductCanvas';

export default function ComparisonSlider() {
  const containerRef = useRef(null);
  const [sliderWidth, setSliderWidth] = useState(0);
  const x = useMotionValue(0);
  
  useEffect(() => {
    if (containerRef.current) {
      setSliderWidth(containerRef.current.offsetWidth);
      x.set(containerRef.current.offsetWidth / 2);
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setSliderWidth(containerRef.current.offsetWidth);
        x.set(containerRef.current.offsetWidth / 2);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x]);

  const clipPathLeft = useTransform(x, v => `inset(0 ${sliderWidth - v}px 0 0)`);
  const clipPathRight = useTransform(x, v => `inset(0 0 0 ${v}px)`);

  return (
    <section className="py-32 bg-[#050b14]">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            The Difference is <span className="text-[#00F0FF]">Clear</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Static images leave customers guessing. Interactive 3D builds confidence. Drag to compare.
          </p>
        </div>

        <div 
          ref={containerRef}
          className="relative h-[600px] rounded-[40px] border border-white/10 overflow-hidden bg-[#0a1523]"
        >
          {/* Left Side: Traditional 2D */}
          <motion.div 
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#121622]"
            style={{ clipPath: clipPathLeft }}
          >
            <div className="absolute top-8 left-8 px-4 py-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10 z-20">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Traditional 2D</span>
            </div>
            
            <div className="w-full h-full flex items-center justify-center p-12">
              <img 
                src="/images/simple_boombox.png" 
                alt="2D Boombox" 
                className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-2xl border border-white/5"
              />
            </div>
          </motion.div>

          {/* Right Side: 3D Interactive */}
          <motion.div 
            className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.1),transparent)]"
            style={{ clipPath: clipPathRight }}
          >
            <div className="absolute top-8 right-8 px-4 py-2 bg-[#00F0FF]/10 backdrop-blur-md rounded-full border border-[#00F0FF]/20 z-20">
              <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-widest">ScanVista 3D</span>
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <ProductCanvas modelUrl="/models/headphone.glb" autoRotate={true} />
            </div>
          </motion.div>

          {/* Draggable Handle */}
          <motion.div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center"
            style={{ x, xOrigin: 0.5 }}
            drag="x"
            dragConstraints={containerRef}
            dragElastic={0}
            dragMomentum={false}
          >
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
              <MoveHorizontal size={20} />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
