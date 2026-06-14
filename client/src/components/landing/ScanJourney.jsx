import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { QrCode, Box, Smartphone, FileText } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { id: 1, title: 'QR Scan', icon: QrCode, desc: 'User scans the smart QR code on packaging or in-store.' },
  { id: 2, title: '3D Model Load', icon: Box, desc: 'Instant browser-based 3D rendering. No app download required.' },
  { id: 3, title: 'AR View', icon: Smartphone, desc: 'One tap to place the product in their physical space.' },
  { id: 4, title: 'Product Details', icon: FileText, desc: 'Deep dive into specs, AI assistant, and checkout.' }
];

export default function ScanJourney() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    let ctx = gsap.context(() => {
      // Calculate how far to move the track
      const walk = -(track.scrollWidth - window.innerWidth + 200); // 200 padding

      gsap.to(track, {
        x: walk,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: `+=${track.scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          id: 'horizontal-scroll'
        }
      });

      // Animate cards revealing
      gsap.utils.toArray('.journey-card').forEach((card, i) => {
        gsap.fromTo(card, 
          { opacity: 0.2, scale: 0.8 },
          { 
            opacity: 1, 
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              containerAnimation: gsap.getById('horizontal-scroll'),
              start: 'left center+=200',
              end: 'left center',
              scrub: true
            }
          }
        );
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="h-screen bg-[#02050a] flex items-center overflow-hidden">
      <div className="absolute top-20 left-12 md:left-24">
        <div className="text-[#00F0FF] text-xs font-bold uppercase tracking-[0.2em] mb-2">The Flow</div>
        <h2 className="text-4xl md:text-6xl font-display font-bold text-white">Seamless Journey</h2>
      </div>

      <div 
        ref={trackRef} 
        className="flex gap-12 px-[10vw] items-center h-full mt-20"
      >
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.id} 
              className="journey-card flex-shrink-0 w-[300px] md:w-[450px] relative group"
            >
              {/* Connector Line */}
              {index !== STEPS.length - 1 && (
                <div className="absolute top-1/2 right-[-3rem] md:right-[-3rem] w-[3rem] h-[2px] bg-gradient-to-r from-white/20 to-transparent transform -translate-y-1/2" />
              )}
              
              <div className="h-[400px] rounded-[40px] border border-white/10 bg-[#0a1523] p-8 flex flex-col justify-between transition-transform duration-500 hover:-translate-y-4">
                <div>
                  <div className="text-[120px] font-display font-black text-white/5 leading-none absolute top-4 right-8 select-none">
                    {step.id}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center text-[#00F0FF] mb-8">
                    <Icon size={32} />
                  </div>
                  <h3 className="text-3xl font-display font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-lg">{step.desc}</p>
                </div>

                {/* Progress Indicator */}
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-8">
                  <div className="h-full bg-gradient-to-r from-[#00F0FF] to-[#b366ff] w-1/3 group-hover:w-full transition-all duration-700" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
