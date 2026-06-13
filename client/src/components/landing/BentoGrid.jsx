import React from 'react';
import { motion } from 'framer-motion';
import { Box, Smartphone, QrCode, BrainCircuit } from 'lucide-react';

const BENTO_ITEMS = [
  {
    id: 'models',
    title: '3D Models',
    desc: 'Upload GLB/GLTF files and manage your entire spatial catalog in one place.',
    icon: Box,
    color: '#00F0FF',
    className: 'md:col-span-2 md:row-span-1 bg-gradient-to-br from-[#00F0FF]/10 to-transparent border-[#00F0FF]/30'
  },
  {
    id: 'ar',
    title: 'AR View',
    desc: 'Instant WebAR placement.',
    icon: Smartphone,
    color: '#00FFA3',
    className: 'md:col-span-1 md:row-span-1 bg-gradient-to-br from-[#00FFA3]/10 to-transparent border-[#00FFA3]/30'
  },
  {
    id: 'qr',
    title: 'QR Scanner',
    desc: 'Dynamic QR codes.',
    icon: QrCode,
    color: '#FFB800',
    className: 'md:col-span-1 md:row-span-1 bg-gradient-to-br from-[#FFB800]/10 to-transparent border-[#FFB800]/30'
  },
  {
    id: 'ai',
    title: 'AI Data',
    desc: 'Context-aware conversational assistant trained on your specs.',
    icon: BrainCircuit,
    color: '#b366ff',
    className: 'md:col-span-2 md:row-span-1 bg-gradient-to-br from-[#b366ff]/10 to-transparent border-[#b366ff]/30'
  }
];

export default function BentoGrid() {
  return (
    <section className="py-32 bg-[#02050a] relative">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
            Why ScanVista Works
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A cohesive ecosystem that bridges the physical gap. Not just another 3D viewer, but a complete spatial commerce platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {BENTO_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, zIndex: 10 }}
                className={`relative rounded-[32px] border p-8 overflow-hidden group flex flex-col justify-between backdrop-blur-md cursor-pointer ${item.className}`}
              >
                {/* Hover Glow Effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl -z-10"
                  style={{ background: `radial-gradient(circle at center, ${item.color}30 0%, transparent 70%)` }}
                />

                <div className="relative z-10">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${item.color}20`, color: item.color }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm">{item.desc}</p>
                </div>

                {/* Abstract background elements */}
                <div className="absolute -bottom-8 -right-8 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none" style={{ color: item.color }}>
                  <Icon size={120} strokeWidth={1} />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
