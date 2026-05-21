import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronDown,
  Box,
  Maximize,
  Scan,
  View
} from 'lucide-react';

export default function Showcase() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('All Items');

  const filters = ['All Items', 'Electronics', 'Fashion', 'Home & Living', 'Industrial'];

  // Mock data for featured product per category
  const featuredProducts = {
    'All Items': {
      series: 'Chronos Series',
      name: 'Astra-V Carbon Hybrid',
      desc: 'Experience precision engineering in the palm of your hand. The Astra-V features over 450 scanned components, rendered in real-time with sub-millimeter accuracy.',
      polys: '1.2M',
      res: '8K',
      format: 'USDZ',
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80',
      badge: 'Featured of the Week'
    },
    'Electronics': {
      series: 'Immerse Series',
      name: 'Quantum VR Headset',
      desc: 'Step into new worlds. Ultra-lightweight 3D model featuring hyper-realistic glass materials and intricate internal lens geometries optimized for WebXR.',
      polys: '850K',
      res: '4K',
      format: 'GLB',
      image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=80',
      badge: 'New Release'
    },
    'Fashion': {
      series: 'Streetwear Collection',
      name: 'AirMax Retro 95',
      desc: 'Every thread rendered perfectly. Photogrammetry-scanned sneaker model with physically based rendering (PBR) for hyper-realistic leather and mesh textures.',
      polys: '2.1M',
      res: '8K',
      format: 'USDZ',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      badge: 'Trending Now'
    },
    'Home & Living': {
      series: 'Luxe Interiors',
      name: 'Velvet Cloud Sofa',
      desc: 'Visualize comfort in your own living room. Complete with customizable velvet shader node materials and real-time ambient occlusion.',
      polys: '1.5M',
      res: '4K',
      format: 'GLTF',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
      badge: 'Best Seller'
    },
    'Industrial': {
      series: 'Automation Pro',
      name: 'Robotic Arm X-7',
      desc: 'Industrial-grade precision. High-fidelity CAD converted model with fully rigged joints, ready for interactive web animation and exploded-view demonstrations.',
      polys: '3.4M',
      res: '8K',
      format: 'STEP',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
      badge: 'Engineering Pick'
    }
  };

  // Mock data for gallery items
  const allGalleryItems = [
    { id: 1, name: 'Neon Pulse Runner', category: 'Fashion', price: '$129', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
    { id: 2, name: 'Sonic Pure X1', category: 'Electronics', price: '$349', image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=400&q=80' },
    { id: 3, name: 'Eames-Style Lounge', category: 'Home & Living', price: '$1,850', image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=400&q=80' },
    { id: 4, name: 'SkyEye Pro Drone', category: 'Industrial', price: '$2,100', image: 'https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=400&q=80' },
    { id: 5, name: 'Smart Watch Pro', category: 'Electronics', price: '$299', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80' },
    { id: 6, name: 'Vintage Leather Jacket', category: 'Fashion', price: '$199', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80' },
    { id: 7, name: 'Ceramic Vase Set', category: 'Home & Living', price: '$85', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&q=80' },
    { id: 8, name: 'CNC Milling Machine', category: 'Industrial', price: '$15,000', image: 'https://images.unsplash.com/photo-1565514020179-0c6ca2010209?auto=format&fit=crop&w=400&q=80' },
    { id: 9, name: 'Noise-Canceling Earbuds', category: 'Electronics', price: '$149', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80' },
    { id: 10, name: 'Minimalist Desk Lamp', category: 'Home & Living', price: '$120', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&q=80' },
    { id: 11, name: 'High-Vis Safety Vest', category: 'Industrial', price: '$45', image: 'https://images.unsplash.com/photo-1587614203923-b1d5f2a1b9b6?auto=format&fit=crop&w=400&q=80' },
    { id: 12, name: 'Designer Sunglasses', category: 'Fashion', price: '$250', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80' },
  ];

  const filteredItems = activeFilter === 'All Items' 
    ? allGalleryItems 
    : allGalleryItems.filter(item => item.category === activeFilter);

  const featured = featuredProducts[activeFilter];

  return (
    <div className="bg-[#101217] min-h-screen text-white font-sans selection:bg-[#00F0FF]/30">
      
      {/* Simplified Navbar */}
      <nav className="w-full px-6 lg:px-12 py-4 flex justify-between items-center border-b border-[#1e2e4f]/20 bg-[#101217]">
        <div 
          onClick={() => navigate('/')}
          className="text-xl font-display font-bold tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <View className="text-white w-6 h-6" />
          <span>SCAN<span className="text-white">VISTA</span></span>
        </div>

        <div className="hidden md:flex gap-8 items-center font-bold text-[11px] tracking-wider uppercase text-slate-400">
          <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Platform</button>
          <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Creators</button>
          <button onClick={() => navigate('/')} className="text-white transition-colors">Viewers</button>
          <button className="hover:text-white transition-colors">Pricing</button>
        </div>

        <div className="flex gap-4 items-center">
          <button onClick={() => navigate('/login')} className="hidden sm:block text-xs font-bold hover:text-white text-slate-400 transition-colors">Sign In</button>
          <button 
            onClick={() => navigate('/register')}
            className="px-5 py-2 bg-[#00F0FF] text-black text-xs font-bold rounded-full hover:bg-[#00D8E6] transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Showcase Content */}
      <main className="w-full max-w-7xl mx-auto px-6 py-16">
        
        {/* Header Area */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Product Showcase</h1>
          <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
            Step into the future of digital commerce. Interact with premium 3D models in high-resolution detail.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-16 items-start md:items-center">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search 3D models..." 
              className="w-full bg-[#161a22] border border-[#222833] text-sm text-white rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#00F0FF]/50 transition-colors placeholder:text-slate-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 text-xs font-semibold rounded-full border transition-colors ${
                  activeFilter === filter 
                    ? 'bg-[#1e2e4f]/30 border-[#00F0FF]/30 text-[#00F0FF]' 
                    : 'bg-transparent border-[#222833] text-slate-400 hover:text-slate-200 hover:border-slate-500'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Product Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeFilter + '-featured'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full bg-[#161a22] border border-[#222833] rounded-3xl flex flex-col lg:flex-row overflow-hidden mb-24"
          >
            {/* Featured Image Side */}
            <div className="lg:w-[55%] relative bg-gradient-to-br from-[#0c1324] to-black p-8 flex items-center justify-center min-h-[400px]">
              <div className="absolute top-6 left-6 px-3 py-1 bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[#00F0FF] text-[10px] font-bold rounded-full z-20">
                {featured.badge}
              </div>
              {/* Soft cyan glow behind item */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00F0FF]/10 blur-[100px] rounded-full z-0" />
              <img 
                src={featured.image} 
                alt={featured.name} 
                className="w-[80%] h-[80%] object-contain mix-blend-lighten relative z-10 scale-125"
              />
            </div>

            {/* Featured Content Side */}
            <div className="lg:w-[45%] p-10 lg:p-14 flex flex-col justify-center">
              <span className="text-[10px] font-bold tracking-widest text-[#00F0FF] uppercase mb-3">{featured.series}</span>
              <h2 className="text-4xl lg:text-5xl font-display font-semibold mb-6 leading-tight" dangerouslySetInnerHTML={{ __html: featured.name.replace(' ', '<br/>') }} />
              <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-sm">
                {featured.desc}
              </p>

              <div className="grid grid-cols-3 gap-6 py-6">
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Polygons</p>
                  <p className="text-xl font-display font-bold">{featured.polys}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Resolution</p>
                  <p className="text-xl font-display font-bold">{featured.res}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Format</p>
                  <p className="text-xl font-display font-bold">{featured.format}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Curated Gallery Section */}
        <div className="flex justify-between items-end border-b border-[#222833] pb-4 mb-8">
          <h3 className="text-2xl font-display font-semibold">Curated Gallery</h3>
          <span className="text-xs font-semibold text-slate-400">{filteredItems.length} Models Available</span>
        </div>

        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <AnimatePresence>
            {filteredItems.map((item, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                key={item.id}
                className="bg-[#161a22] border border-[#222833] rounded-2xl overflow-hidden group hover:border-[#00F0FF]/30 transition-colors flex flex-col"
              >
                <div className="w-full aspect-[4/3] bg-[#0c1324] relative flex items-center justify-center overflow-hidden p-6">
                  {/* Simulated lighting effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#00F0FF]/10 blur-[50px] rounded-full pointer-events-none" />
                  
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-contain mix-blend-lighten relative z-0 group-hover:scale-105 transition-transform duration-500"
                  />


                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-bold truncate pr-2">{item.name}</h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">{item.category}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Shared Footer */}
      <footer className="border-t border-[#1e2e4f]/20 py-10 px-6 bg-[#0a0c10] mt-24">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-lg font-display font-bold mb-2">
              <span>SCAN<span className="text-white">VISTA</span></span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">© 2026 ScanVista AI. Precision 3D Visualization.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Platform</button>
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Creators</button>
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Viewers</button>
            <button className="hover:text-white transition-colors">Pricing</button>
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
