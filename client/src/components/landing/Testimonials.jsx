import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    role: 'Head of E-Commerce, TechGear',
    text: "ScanVista completely changed how we display our complex hardware. Customers can now zoom into specific ports and components before buying. Returns dropped by 22%.",
    rating: 5,
    avatar: 'SJ'
  },
  {
    id: 2,
    name: 'David Chen',
    role: 'Product Manager, Aura Home',
    text: "The AR feature is flawless. The fact that customers don't have to download an app to place our furniture in their living room is a massive conversion booster.",
    rating: 5,
    avatar: 'DC'
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    role: 'Marketing Director, SoleKicks',
    text: "We put ScanVista QR codes on all our new shoe boxes. The scan rate is incredible, and the AI assistant answers sizing questions instantly.",
    rating: 5,
    avatar: 'ER'
  }
];

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-32 bg-[#02050a] relative">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">Brands</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left: Rotating Avatars */}
          <div className="relative h-[400px] flex items-center justify-center">
            <div className="absolute inset-0 bg-yellow-500 opacity-[0.02] rounded-full" />
            
            <div className="relative w-64 h-64">
              {REVIEWS.map((review, i) => {
                const isActive = i === activeIndex;
                const angle = (i * 360) / REVIEWS.length;
                
                return (
                  <motion.button
                    key={review.id}
                    onClick={() => setActiveIndex(i)}
                    className={`absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all ${
                      isActive ? 'bg-yellow-500 border-yellow-400 text-black z-20 scale-125 shadow-[0_0_30px_rgba(234,179,8,0.4)]' : 'bg-[#121622] border-white/10 text-white/50 hover:border-white/30 z-10'
                    }`}
                    animate={{
                      rotate: angle,
                      x: Math.cos((angle * Math.PI) / 180) * 120,
                      y: Math.sin((angle * Math.PI) / 180) * 120,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.span animate={{ rotate: -angle }}>{review.avatar}</motion.span>
                  </motion.button>
                );
              })}
              
              {/* Center Logo/Icon */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#0a1523] border border-white/10 rounded-full flex items-center justify-center">
                <Quote className="w-8 h-8 text-white/20" />
              </div>
            </div>
          </div>

          {/* Right: Review Content */}
          <div className="relative h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: REVIEWS[activeIndex].rating }).map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                    </motion.div>
                  ))}
                </div>
                
                <p className="text-2xl md:text-3xl text-white font-medium leading-relaxed mb-8">
                  "{REVIEWS[activeIndex].text}"
                </p>
                
                <div>
                  <div className="text-lg font-bold text-white">{REVIEWS[activeIndex].name}</div>
                  <div className="text-slate-400">{REVIEWS[activeIndex].role}</div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
