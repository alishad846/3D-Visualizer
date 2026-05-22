import React, { Suspense, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { ArrowLeft, View, ShoppingCart, Info, Share2, CheckCircle2, Hexagon, Maximize2, Minimize2 } from 'lucide-react';
import ProductModel from '../../components/product/viewer/model/ProductModel';

export default function ScannedProductUI() {
  const navigate = useNavigate();
  const canvasContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (canvasContainerRef.current?.requestFullscreen) {
        canvasContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Mock product data for the scanned item
  const product = {
    name: 'Sony WH-1000XM5',
    brand: 'SONY',
    price: '$398.00',
    description: 'Industry-leading noise cancellation. Two processors control 8 microphones for unprecedented noise cancellation. With Auto NC Optimizer, noise canceling is automatically optimized based on your wearing conditions and environment.',
    specs: [
      { label: 'Battery Life', value: '30 Hours' },
      { label: 'Noise Cancellation', value: 'Active (ANC)' },
      { label: 'Bluetooth', value: 'Version 5.2' },
      { label: 'Weight', value: '250g' },
    ],
    features: ['High-Resolution Audio', 'Multipoint Connection', 'Speak-to-Chat']
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  return (
    <div className="relative min-h-screen bg-[#03060a] text-white overflow-hidden font-sans selection:bg-[#00F0FF]/30">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00F0FF]/10 blur-[150px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#b366ff]/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50" />
      </div>

      {/* Top Navbar */}
      <nav className="relative z-50 px-6 py-6 flex items-center justify-between backdrop-blur-sm border-b border-white/5">
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/scan')}
          className="w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 group"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
        </motion.button>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[10px] font-bold text-[#00F0FF] tracking-widest uppercase mb-1 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Product Verified
          </div>
        </motion.div>

        <motion.button 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-12 h-12 rounded-full glass-panel flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
        >
          <Share2 className="w-5 h-5 text-slate-300" />
        </motion.button>
      </nav>

      {/* Main Content Split Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row h-[calc(100vh-100px)] max-w-[1600px] mx-auto">
        
        {/* Left Side: Product Information */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full lg:w-[40%] p-8 lg:p-12 flex flex-col justify-center overflow-y-auto hide-scrollbar"
        >
          <motion.div variants={itemVariants} className="mb-2">
            <span className="text-[#00F0FF] font-bold tracking-widest uppercase text-xs flex items-center gap-2">
              <Hexagon className="w-4 h-4" /> {product.brand}
            </span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl lg:text-7xl font-display font-bold leading-tight mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">
            {product.name}
          </motion.h1>
          
          <motion.div variants={itemVariants} className="text-3xl font-light text-slate-300 mb-8">
            {product.price}
          </motion.div>

          <motion.p variants={itemVariants} className="text-sm text-slate-400 leading-relaxed mb-10 max-w-md">
            {product.description}
          </motion.p>

          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mb-10">
            {product.specs.map((spec, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:border-[#00F0FF]/30 transition-colors group">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1 group-hover:text-[#00F0FF] transition-colors">{spec.label}</p>
                <p className="text-sm font-semibold text-slate-200">{spec.value}</p>
              </div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-4 mt-auto pt-8 border-t border-white/10">
            <button className="flex-1 py-4 bg-gradient-to-r from-[#00F0FF] to-[#0088FF] text-black font-bold rounded-full hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all flex items-center justify-center gap-2 hover:scale-[1.02]">
              <ShoppingCart className="w-5 h-5" /> Buy Now
            </button>
            <button className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all group shrink-0">
              <Info className="w-5 h-5 text-slate-300 group-hover:text-white" />
            </button>
          </motion.div>
        </motion.div>

        {/* Right Side: 3D Interactive Canvas */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="w-full lg:w-[60%] h-[50vh] lg:h-full relative flex items-center justify-center p-4 lg:p-12"
        >
          {/* Glass framing for the 3D viewer */}
          <div 
            ref={canvasContainerRef}
            className="absolute inset-4 lg:inset-12 border border-white/10 bg-white/[0.02] backdrop-blur-3xl rounded-[40px] overflow-hidden shadow-2xl"
          >
            
            <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
              <ambientLight intensity={1.5} />
              <directionalLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
              <directionalLight position={[-10, 0, -10]} intensity={1} color="#00F0FF" />
              <spotLight position={[0, 10, 0]} intensity={3} angle={0.5} penumbra={1} color="#b366ff" />
              
              <Suspense fallback={null}>
                {/* Reusing the ProductModel with the downloaded Boombox GLB */}
                <ProductModel modelUrl="/models/headphone.glb" />
                <Environment preset="city" />
                <ContactShadows position={[0, -2, 0]} opacity={0.6} scale={15} blur={2.5} far={4} color="#000000" />
              </Suspense>

              <OrbitControls 
                enablePan={false} 
                enableZoom={true} 
                minDistance={5}
                maxDistance={25}
                autoRotate 
                autoRotateSpeed={0.5}
                enableDamping
                dampingFactor={0.05}
              />
            </Canvas>

            {/* Floating UI on top of 3D Canvas */}
            <div className="absolute bottom-8 right-8 flex flex-col gap-3">
              <button 
                onClick={toggleFullscreen}
                className="w-12 h-12 bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center hover:bg-[#00F0FF]/20 hover:border-[#00F0FF] transition-all group shadow-lg"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-white group-hover:text-[#00F0FF]" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-white group-hover:text-[#00F0FF]" />
                )}
              </button>
            </div>
            
            <div className="absolute top-8 right-8">
              <button className="px-6 py-3 bg-black/60 backdrop-blur-md border border-white/20 rounded-full flex items-center gap-2 hover:bg-[#00F0FF]/20 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all font-bold text-xs uppercase tracking-widest shadow-lg">
                <View className="w-4 h-4" /> View in AR
              </button>
            </div>

            <div className="absolute bottom-8 left-8 bg-black/60 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" /> 3D Interactive
            </div>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
}
