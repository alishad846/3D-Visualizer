import React from 'react';
import { motion } from 'framer-motion';

const WORDS_ROW_1 = [
  "3D Models", "AR Commerce", "QR Scanning", "Analytics", "AI Insights", "Data Cleaning", 
  "3D Models", "AR Commerce", "QR Scanning", "Analytics", "AI Insights", "Data Cleaning"
];

const WORDS_ROW_2 = [
  "Interactive Viewers", "Product Management", "Conversion Optimization", "WebAR", "Real-time Metrics",
  "Interactive Viewers", "Product Management", "Conversion Optimization", "WebAR", "Real-time Metrics"
];

const MarqueeRow = ({ words, direction = 1, speed = 40 }) => {
  return (
    <div className="flex overflow-hidden whitespace-nowrap py-4">
      <motion.div
        className="flex gap-8 px-4"
        animate={{
          x: direction === 1 ? [0, -1000] : [-1000, 0]
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: speed
        }}
      >
        {words.map((word, i) => (
          <div 
            key={i} 
            className={`text-4xl md:text-6xl font-display font-black uppercase tracking-wider ${
              i % 2 === 0 ? 'text-white/80' : 'text-transparent'
            }`}
            style={{
              WebkitTextStroke: i % 2 !== 0 ? '1px rgba(255,255,255,0.3)' : 'none'
            }}
          >
            {word}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default function InfiniteMarquee() {
  return (
    <section className="py-20 bg-[#050b14] overflow-hidden rotate-[-2deg] scale-110">
      <MarqueeRow words={WORDS_ROW_1} direction={1} speed={30} />
      <MarqueeRow words={WORDS_ROW_2} direction={-1} speed={35} />
    </section>
  );
}
