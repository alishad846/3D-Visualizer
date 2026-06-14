import React from 'react';

const WORDS_ROW_1 = [
  "3D Models", "AR Commerce", "QR Scanning", "Analytics", "AI Insights", "Data Cleaning", 
  "3D Models", "AR Commerce", "QR Scanning", "Analytics", "AI Insights", "Data Cleaning",
  "3D Models", "AR Commerce", "QR Scanning", "Analytics", "AI Insights", "Data Cleaning"
];

const WORDS_ROW_2 = [
  "Interactive Viewers", "Product Management", "Conversion Optimization", "WebAR", "Real-time Metrics",
  "Interactive Viewers", "Product Management", "Conversion Optimization", "WebAR", "Real-time Metrics",
  "Interactive Viewers", "Product Management", "Conversion Optimization", "WebAR", "Real-time Metrics"
];

const MarqueeRow = ({ words, reverse = false }) => {
  return (
    <div className="flex overflow-hidden whitespace-nowrap py-4">
      <div 
        className="flex gap-8 px-4"
        style={{
          animation: `marquee ${reverse ? '35s' : '30s'} linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal'
        }}
      >
        {words.map((word, i) => (
          <div 
            key={i} 
            className={`text-4xl md:text-6xl font-display font-black uppercase tracking-wider ${
              i % 2 === 0 ? 'text-white/80' : 'text-slate-600'
            }`}
          >
            {word}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function InfiniteMarquee() {
  return (
    <section className="py-20 bg-[#050b14] overflow-hidden rotate-[-2deg] scale-110">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33%); }
        }
      `}</style>
      <MarqueeRow words={WORDS_ROW_1} />
      <MarqueeRow words={WORDS_ROW_2} reverse={true} />
    </section>
  );
}
