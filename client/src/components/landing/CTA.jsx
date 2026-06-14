import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';

export default function CTA() {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleCTA = () => {
    // Particle burst
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#00F0FF', '#b366ff', '#ffffff']
    });

    // Smooth redirect
    setTimeout(() => {
      navigate('/register');
    }, 600);
  };

  return (
    <section className="py-40 bg-[#050b14] relative overflow-hidden flex items-center justify-center min-h-[80vh]">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <h2 className="text-5xl md:text-8xl font-display font-black text-white mb-12 leading-tight">
          Ready to transform <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#b366ff]">product experiences?</span>
        </h2>

        {/* Glowing Sphere Button */}
        <div className="relative inline-block mt-8">
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.5, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-[#00F0FF] to-[#b366ff] rounded-full blur-[60px] -z-10"
              />
            )}
          </AnimatePresence>

          <motion.button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCTA}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-48 h-48 rounded-full flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl border border-white/20 shadow-[0_0_50px_rgba(0,240,255,0.2)] interactive"
          >
            {/* Spinning ring */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-white/20"
            />
            
            <span className="text-white font-bold text-lg mb-2">Start Now</span>
            <ArrowRight className="w-6 h-6 text-[#00F0FF] group-hover:translate-x-2 transition-transform" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}
