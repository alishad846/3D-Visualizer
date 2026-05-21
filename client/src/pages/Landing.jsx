import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  CheckCircle2,
  UploadCloud,
  Box,
  Image as ImageIcon,
  Zap,
  LayoutDashboard,
  Mic,
  MonitorSmartphone,
  Scan,
  ShieldCheck,
  BarChart3,
  ShoppingCart,
  Layers,
  Sparkles,
  ArrowRight,
  Globe,
  Settings,
  PenTool,
  Code2,
  View,
  Compass,
  Rotate3D,
  Camera,
  Info,
  ArrowRightLeft,
  Smartphone,
  Play,
  QrCode
} from 'lucide-react';

// ==============================================================
// 1. PLATFORM VIEW (Matches Screenshot 1)
// ==============================================================
const PlatformView = ({ navigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center pb-32"
    >
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center text-center pt-32 pb-20 px-6">
        {/* Subtle SVG Globe Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[600px] h-[600px] opacity-20 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-slate-500 animate-[spin_60s_linear_infinite]">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <ellipse cx="50" cy="50" rx="20" ry="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <ellipse cx="50" cy="50" rx="48" ry="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
        
        {/* Sparkle Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 mb-8 backdrop-blur-md relative z-10">
          <Sparkles className="w-3.5 h-3.5" />
          <span>V1.0 NOW LIVE</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-semibold leading-[1.1] mb-6 tracking-tight relative z-10 max-w-4xl">
          The Future of <span className="text-[#00F0FF]">Product Experience</span>
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed relative z-10">
          Bridge the gap between physical products and digital immersion with AI-powered 3D, AR, and Voice.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <button 
            onClick={() => navigate('/register')}
            className="px-8 py-3.5 bg-[#00F0FF] text-[#050b14] rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00D8E6] transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
          >
            Start Creating <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => navigate('/scan')}
            className="w-20 h-20 bg-white/5 border border-white/10 text-white rounded-full hover:bg-white/10 transition-all flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]"
            title="Scan QR Code"
          >
            <div className="relative flex items-center justify-center w-12 h-12">
              <Scan className="w-full h-full absolute inset-0 text-slate-300" strokeWidth={1.5} />
              <QrCode className="w-[60%] h-[60%] absolute text-[#00F0FF]" strokeWidth={1.5} />
            </div>
          </button>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="w-full max-w-5xl mx-auto border-t border-[#1e2e4f]/30 pt-10 pb-24 text-center">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">Trusted by innovative brands</p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale">
          <span className="text-lg font-display font-bold tracking-widest">TECHNE</span>
          <span className="text-lg font-display font-bold tracking-widest">LUMINA</span>
          <span className="text-lg font-display font-bold tracking-widest">VERTEX</span>
          <span className="text-lg font-display font-bold tracking-widest">NEXUS</span>
          <span className="text-lg font-display font-bold tracking-widest italic">ORBIT</span>
        </div>
      </section>

      {/* Feature 1: Empower Workflow */}
      <section className="w-full max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[10px] font-black text-[#00F0FF] uppercase tracking-widest mb-4">For Modellers & Creators</div>
            <h2 className="text-4xl md:text-5xl font-display font-semibold mb-6">Empower Your Workflow</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md">
              Manage projects, upload 3D models, and generate QR codes in seconds. Our intuitive dashboard puts precision engineering at your fingertips.
            </p>
            <ul className="space-y-4 mb-10">
              {['Batch Object Management', 'One-Click AR Generation', 'Advanced Analytics & Heatmaps'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#00F0FF]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-sm font-bold text-[#00F0FF] flex items-center gap-2 hover:gap-3 transition-all"
            >
              Explore Creator Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mock Dashboard UI Graphic */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#16223b]/40 to-[#0c1324] border border-[#1e2e4f]/50 p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0055ff]/10 blur-[80px] pointer-events-none rounded-full" />
            <div className="flex items-center gap-4 mb-6 border-b border-[#1e2e4f]/50 pb-4">
              <h3 className="font-bold text-white">Audio Gear</h3>
              <button className="ml-auto bg-[#0055ff]/20 text-[#00F0FF] text-xs font-bold px-3 py-1.5 rounded-lg">+ Add Asset</button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'Sony WH-1000XM5', img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=200&q=80' },
                { name: 'WH-XB910N', img: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=200&q=80' },
                { name: 'WH-CH520', img: 'https://images.unsplash.com/photo-1599669454699-248893623440?auto=format&fit=crop&w=200&q=80' },
                { name: 'Airpods Max', img: 'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=200&q=80' }
              ].map((mock, i) => (
                <div key={i} className="bg-[#11192b]/60 border border-[#1e2e4f]/30 p-3 rounded-xl flex items-center gap-3 hover:border-[#00F0FF]/30 transition-colors">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/50 shrink-0">
                    <img src={mock.img} alt={mock.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-white truncate">{mock.name}</p>
                    <div className="flex gap-1.5 mt-1">
                      <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center"><PenTool className="w-2.5 h-2.5 text-slate-400" /></div>
                      <div className="w-4 h-4 rounded bg-white/5 flex items-center justify-center"><LayoutDashboard className="w-2.5 h-2.5 text-slate-400" /></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Digital Immersion */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Mock 3D Viewer UI */}
          <div className="relative rounded-3xl bg-[#090b14] border border-[#1e2e4f]/30 p-2 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#00F0FF]/10 to-transparent opacity-50" />
            <img 
              src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80" 
              alt="3D Headphones" 
              className="w-full aspect-square object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 mix-blend-lighten opacity-80"
            />
            <div className="absolute bottom-6 left-0 w-full flex flex-col items-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-[#00F0FF] mb-1">Live Environment Mode</span>
              <span className="text-xs font-semibold text-white">Interactive 3D Model: Studio Pro V2</span>
            </div>
            <div className="absolute top-6 right-6 flex gap-2">
              <div className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <Box className="w-4 h-4 text-white" />
              </div>
              <div className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center">
                <MonitorSmartphone className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          <div className="order-first lg:order-last">
            <div className="text-[10px] font-black text-[#00F0FF] uppercase tracking-widest mb-4">For Your Customers</div>
            <h2 className="text-4xl md:text-5xl font-display font-semibold mb-6">Total Digital Immersion</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-md">
              Immersive 3D viewing, AR placement, and AI-powered voice guidance. Give your customers the confidence to purchase with a true-to-life preview.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-10">
              <div className="bg-[#0c1324] border border-[#1e2e4f]/50 p-5 rounded-2xl">
                <Scan className="w-5 h-5 text-[#00F0FF] mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">Vision AI</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">Real-world placement without apps.</p>
              </div>
              <div className="bg-[#0c1324] border border-[#1e2e4f]/50 p-5 rounded-2xl">
                <Mic className="w-5 h-5 text-[#0055ff] mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">Voice AI</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">Conversational guided unboxing.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/scan')}
              className="text-sm font-bold text-[#00F0FF] flex items-center gap-2 hover:gap-3 transition-all"
            >
              See Viewer Experience <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Next-Gen Core Features</h2>
        <p className="text-slate-400 text-sm mb-16">Engineered for performance and clarity on the spatial web.</p>

        <div className="grid md:grid-cols-2 gap-6 text-left">
          {/* Card 1 */}
          <div className="bg-[#0c1324] border border-[#1e2e4f]/40 p-8 rounded-3xl hover:border-[#00F0FF]/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#00F0FF]/10 group-hover:border-[#00F0FF]/30 transition-all">
              <Box className="w-5 h-5 text-slate-300 group-hover:text-[#00F0FF]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Hyper-Realistic 3D Visualizer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">PBR material support and real-time lighting engines ensure your products look identical to their physical counterparts in any environment.</p>
          </div>
          {/* Card 2 */}
          <div className="bg-[#0c1324] border border-[#1e2e4f]/40 p-8 rounded-3xl hover:border-[#00F0FF]/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#00F0FF]/10 group-hover:border-[#00F0FF]/30 transition-all">
              <Scan className="w-5 h-5 text-slate-300 group-hover:text-[#00F0FF]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Object Recognition</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Instantly identify parts and features through our neural-vision processing.</p>
          </div>
          {/* Card 3 */}
          <div className="bg-[#0c1324] border border-[#1e2e4f]/40 p-8 rounded-3xl hover:border-[#00F0FF]/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:bg-[#00F0FF]/10 group-hover:border-[#00F0FF]/30 transition-all">
              <Mic className="w-5 h-5 text-slate-300 group-hover:text-[#00F0FF]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Voice AI Assistant</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Hands-free support that explains specific features as users explore the model.</p>
          </div>
          {/* Card 4 */}
          <div className="bg-[#0c1324] border border-[#1e2e4f]/40 p-8 rounded-3xl hover:border-[#00F0FF]/30 transition-colors group relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-black/40 flex items-center justify-center rounded-tl-[100px]">
              <Globe className="w-8 h-8 text-slate-600 ml-4 mt-4" />
            </div>
            <h3 className="text-lg font-bold text-white mb-3">Frictionless WebXR AR</h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-[70%]">No apps required. Just scan a QR code and project high-detail 3D assets directly into your physical space with millimeter precision.</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

// ==============================================================
// 2. CREATORS / BRANDS VIEW (Matches Screenshots 2 & 3)
// ==============================================================
const CreatorsView = ({ navigate }) => {
  // Mock upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'model/gltf-binary': ['.glb'], 'model/obj': ['.obj'] }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center pb-32"
    >
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center text-center pt-32 pb-20 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[10px] font-bold text-[#00F0FF] mb-8 tracking-widest uppercase">
          For Brands & Creators
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-semibold leading-[1.1] mb-6 tracking-tight max-w-4xl">
          Convert <span className="text-[#00F0FF]">Viewers</span> into<br/>loyal Customers
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
          Transform your static ecommerce into an immersive high-precision showroom. ScanVista empowers brands to leverage GLB models for exponential sales lift.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => navigate('/register')}
            className="px-8 py-3.5 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Start Your Free Pilot
          </button>
          <button 
            onClick={() => navigate('/scan')}
            className="px-8 py-3.5 bg-transparent border border-white/20 text-white rounded-full font-bold text-sm hover:bg-white/5 transition-all"
          >
            Watch Demo
          </button>
        </div>
      </section>

      {/* Feature: Seamless Asset Management with Interactive Uploader */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-6">Seamless Asset Management</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-md">
              Centralize your 3D pipeline. Our robust infrastructure handles high-fidelity GLB models with lightning-fast cloud delivery, ensuring your assets look premium on every device.
            </p>
            <ul className="space-y-5">
              {[
                { icon: UploadCloud, text: 'Bulk GLB & USDZ Uploading' },
                { icon: Zap, text: 'Auto-mesh Optimization' },
                { icon: ShieldCheck, text: 'Encrypted IP Protection' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-sm font-semibold text-slate-200">
                  <div className="w-8 h-8 rounded-full bg-[#00F0FF]/10 flex items-center justify-center border border-[#00F0FF]/20">
                    <item.icon className="w-4 h-4 text-[#00F0FF]" />
                  </div>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive Drag & Drop Area */}
          <div className="relative rounded-2xl bg-[#0c1324] border border-[#1e2e4f]/50 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-white">Project_Watch_2024</span>
              </div>
              <span className="text-[10px] font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-1 rounded">250MB Quota</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Dummy Uploaded File */}
              <div className="bg-[#11192b]/60 border border-[#1e2e4f] rounded-xl flex flex-col items-center justify-center p-6 relative">
                <Box className="w-8 h-8 text-[#00F0FF] mb-3" />
                <span className="text-[10px] font-bold text-white">Smartwatch_Mesh.glb</span>
                <span className="text-[9px] text-slate-500 mt-1">12.4 MB</span>
              </div>

              {/* Functional Dropzone */}
              <div 
                {...getRootProps()} 
                className={`bg-[#11192b]/60 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-all ${
                  isDragActive ? 'border-[#00F0FF] bg-[#00F0FF]/5' : 'border-[#1e2e4f] hover:border-[#00F0FF]/50'
                }`}
              >
                <input {...getInputProps()} />
                {uploadedFile && !isUploading && uploadProgress === 100 ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 text-[#10b981] mb-3" />
                    <span className="text-[10px] font-bold text-white truncate max-w-full px-2">{uploadedFile.name}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setUploadProgress(0); }}
                      className="text-[9px] text-rose-400 hover:text-rose-300 mt-2 underline"
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-8 h-8 flex items-center justify-center mb-3 text-slate-400">
                      <span className="text-2xl font-light">+</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 text-center">
                      {isDragActive ? 'Drop file here' : 'Drag & Drop GLB'}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar Area */}
            <div className="mt-6">
              <div className="flex justify-between text-[10px] font-bold mb-2">
                <span className="text-slate-400">Optimization Status</span>
                <span className="text-[#00F0FF]">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#16223b] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#00F0FF] to-[#0055ff] transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature: Bridge Digital & Physical */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-semibold mb-4">Bridge Digital & Physical</h2>
        <p className="text-slate-400 text-sm mb-16">Generate custom-branded, high-precision QR codes that instantly launch AR experiences. No apps required for your customers.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#0c1324] border border-[#1e2e4f]/40 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#11192b] border border-[#1d2d4a] flex items-center justify-center mb-6 text-[#00F0FF]">
              <PenTool className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Custom Branding</h3>
            <p className="text-xs text-slate-400">Inject your logo, brand colors, and custom CTA directly into the code structure.</p>
          </div>
          <div className="bg-[#0c1324] border border-[#00F0FF]/30 p-8 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.1)]">
            <div className="absolute inset-0 bg-gradient-to-b from-[#00F0FF]/10 to-transparent" />
            <div className="w-32 h-32 border-[8px] border-white rounded-3xl relative z-10 shadow-[0_0_20px_rgba(255,255,255,0.5)] flex items-center justify-center">
              <div className="w-16 h-16 bg-white rounded-xl" />
            </div>
          </div>
          <div className="bg-[#0c1324] border border-[#1e2e4f]/40 p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#11192b] border border-[#1d2d4a] flex items-center justify-center mb-6 text-[#00F0FF]">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Instant AR</h3>
            <p className="text-xs text-slate-400">Browser-based visualization with 1:1 scale accuracy on iOS and Android devices.</p>
          </div>
        </div>
      </section>

      {/* Feature: Quantifiable Sales Lift */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 border-t border-[#1e2e4f]/30">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Mock Analytics Dashboard */}
          <div className="relative rounded-2xl bg-[#0c1324] border border-[#1e2e4f]/50 p-6 shadow-2xl overflow-hidden">
            <div className="absolute top-4 right-4 bg-white text-black text-[9px] font-black uppercase px-2 py-1 rounded">
              +42% Conversion
            </div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Real-Time Dashboard</h4>
            
            <div className="flex items-end gap-4 h-32 mb-6 border-b border-[#1e2e4f]/40 pb-4">
              <div className="w-full bg-[#16223b] rounded-t-sm h-[20%]" />
              <div className="w-full bg-[#16223b] rounded-t-sm h-[40%]" />
              <div className="w-full bg-[#00F0FF]/30 border-t-2 border-[#00F0FF] rounded-t-sm h-[80%] relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#00F0FF]">Launch</div>
              </div>
              <div className="w-full bg-[#00F0FF] rounded-t-sm h-[100%] shadow-[0_0_15px_rgba(0,240,255,0.5)]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#11192b]/60 p-3 rounded-xl border border-[#1e2e4f]/50">
                <p className="text-[10px] text-slate-400 font-semibold mb-1">Views</p>
                <p className="text-lg font-display font-bold text-white">12.4k</p>
              </div>
              <div className="bg-[#11192b]/60 p-3 rounded-xl border border-[#1e2e4f]/50">
                <p className="text-[10px] text-slate-400 font-semibold mb-1">Avg AR Session</p>
                <p className="text-lg font-display font-bold text-white">2m 45s</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl font-display font-semibold mb-6">Quantifiable Sales Lift</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-md">
              Stop guessing. Track how 3D visualization impacts your bottom line. Our analytics suite provides granular data on engagement, dwell time, and "add-to-cart" conversion from AR views.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Dwell Time Metrics', 'Geo-location Reports', 'A/B Testing'].map((pill, i) => (
                <span key={i} className="px-4 py-2 rounded-full border border-[#1e2e4f] bg-[#0c1324] text-xs font-semibold text-slate-300">
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Integration */}
      <section className="w-full max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-2xl font-display font-semibold mb-4">Enterprise-Grade Integration</h2>
        <p className="text-slate-400 text-sm mb-16">ScanVista plays well with your existing tech stack. Deploy 3D viewers to your store in minutes, not days.</p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-60">
          <div className="flex flex-col items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-white" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Shopify</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Box className="w-6 h-6 text-white" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Magento</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-white" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Webflow</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Code2 className="w-6 h-6 text-white" />
            <span className="text-[10px] font-bold tracking-widest uppercase">React API</span>
          </div>
        </div>
      </section>

    </motion.div>
  );
};


// ==============================================================
// 3. VIEWERS VIEW (Matches Screenshot for Viewers Tab)
// ==============================================================
const ViewersView = ({ navigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full flex flex-col items-center pb-32"
    >
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center text-center pt-32 pb-20 px-6">
        
        {/* Subtle SVG Rings Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[800px] h-[800px] opacity-[0.15] pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-full h-full text-[#00F0FF] animate-[spin_120s_linear_infinite]">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 2" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="2 6" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 mb-8 tracking-widest uppercase relative z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
          The Future of Discovery
        </div>

        <h1 className="text-5xl md:text-7xl font-display font-semibold leading-[1.1] mb-6 tracking-tight relative z-10 max-w-4xl">
          Experience Products in<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#b366ff]">Your Reality</span>
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 font-light leading-relaxed relative z-10">
          Stop guessing. Start experiencing. ScanVista brings hyper-realistic 3D products directly into your physical space with precision AR technology.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <button 
            onClick={() => navigate('/showcase')}
            className="px-8 py-3.5 bg-[#00F0FF] text-[#050b14] rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#00D8E6] transition-all shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]"
          >
            <Compass className="w-4 h-4" /> Explore Showcase
          </button>
        </div>
      </section>

      {/* Grid: Interactive 3D & AI Voice Guide */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Interactive 3D Card */}
          <div className="bg-[#0c1324] border border-[#1e2e4f]/50 p-10 rounded-3xl flex flex-col justify-between group">
            <div>
              <div className="w-10 h-10 rounded-full bg-[#00F0FF]/10 flex items-center justify-center mb-6">
                <Rotate3D className="w-5 h-5 text-[#00F0FF]" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-white mb-4">Interactive 3D</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8 max-w-sm">
                Unboxing without the box. Explore every detail of high-fidelity 3D models. Rotate, zoom, and inspect every texture as if it were in your hands.
              </p>
            </div>
            {/* Embedded mockup graphic */}
            <div className="w-full aspect-[4/3] rounded-2xl bg-[#070b14] relative overflow-hidden flex items-center justify-center border border-[#1e2e4f]/30 mt-auto">
              {/* Cyan glow accents */}
              <div className="absolute top-1/4 left-1/4 w-3 h-1 bg-[#00F0FF] rounded-full rotate-45 opacity-50 blur-[1px]" />
              <div className="absolute bottom-1/4 right-1/4 w-4 h-1.5 bg-[#00F0FF] rounded-full -rotate-45 opacity-50 blur-[1px]" />
              <img 
                src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80" 
                alt="3D Headphones preview" 
                className="w-[80%] h-[80%] object-contain mix-blend-lighten opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* AI Voice Guide Card */}
          <div className="bg-[#150f24] border border-[#2d1b4e]/50 p-10 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
            {/* Subtle violet ambient background */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#b366ff]/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#b366ff]/20 flex items-center justify-center mb-6 border border-[#b366ff]/30">
                <Mic className="w-5 h-5 text-[#b366ff]" />
              </div>
              <h3 className="text-2xl font-display font-semibold text-white mb-4">AI Voice Guide</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-12 max-w-sm">
                Ask questions, get instant answers. "What's the battery life?" or "Show me the internal sensors." Your personal AI expert knows every spec.
              </p>
            </div>

            {/* Chat Bubbles Mockup */}
            <div className="space-y-4 relative z-10 mt-auto">
              <div className="bg-[#1f1533] border border-[#3d256a] text-sm text-slate-200 p-4 rounded-2xl rounded-tl-sm w-[90%] shadow-lg">
                <div className="flex gap-2 items-center mb-1 text-[10px] font-bold text-[#b366ff] uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#b366ff]" /> User
                </div>
                "How does the noise cancellation work?"
              </div>
              
              <div className="bg-[#1a1c29] border border-[#1e2e4f]/50 text-sm text-slate-300 p-4 rounded-2xl rounded-tr-sm w-[95%] ml-auto shadow-lg relative group-hover:-translate-y-1 transition-transform duration-500">
                <div className="flex gap-2 items-center mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider justify-end">
                  Aria AI <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                </div>
                It uses four dedicated microphones to neutralize up to 98% of ambient noise in real-time.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Augmented Reality Section (See it in your room) */}
      <section className="w-full max-w-6xl mx-auto px-6 py-6">
        <div className="bg-[#0c1324] border border-[#1e2e4f]/50 p-10 lg:p-16 rounded-3xl flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 mb-6 tracking-widest uppercase">
              Augmented Reality
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-white mb-6">See it in your room</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-10 max-w-md">
              One-tap places the object in your physical environment. Perfectly scaled, with dynamic lighting that matches your room's actual conditions.
            </p>
            <ul className="space-y-4">
              {[
                'True-to-life scale and dimensions',
                'Real-time light and shadow matching',
                'Collaborative multi-user viewing'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-200">
                  <div className="w-5 h-5 rounded-full bg-[#00F0FF]/10 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00F0FF]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 w-full max-w-sm relative">
            {/* Phone Mockup graphic */}
            <div className="w-full aspect-[4/5] bg-black rounded-[40px] border-8 border-[#1a1f2e] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1a1f2e] rounded-b-3xl z-20" />
               <img 
                 src="https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?auto=format&fit=crop&w=600&q=80" 
                 alt="AR Drone Preview" 
                 className="w-full h-full object-cover opacity-80"
               />
               <div className="absolute top-8 right-4 bg-black/60 backdrop-blur border border-white/20 text-white text-[9px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1.5 z-20">
                 <div className="w-1.5 h-1.5 bg-[#00F0FF] rounded-full animate-pulse" /> Live AR Active
               </div>
               {/* Faux AR UI Reticle */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-[#00F0FF]/50 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#00F0FF] rounded-full" />
               </div>
               {/* Faux Camera Button */}
               <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Object Recognition Scan */}
      <section className="w-full max-w-6xl mx-auto px-6 py-12">
        <div className="bg-[#0c1324] border border-[#1e2e4f]/50 p-16 rounded-3xl flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#11192b] border border-[#1e2e4f] flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(0,240,255,0.1)]">
            <Camera className="w-7 h-7 text-[#00F0FF]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-white mb-6">Object Recognition Scan</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-12 max-w-2xl">
            Point your camera at any real-world object to instantly identify it, see its digital twin, and access technical specifications or purchase options.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#11192b] border border-[#1e2e4f] flex items-center justify-center hover:border-[#00F0FF]/50 transition-colors cursor-pointer">
                <Zap className="w-5 h-5 text-slate-300" />
              </div>
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">Instant ID</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#11192b] border border-[#1e2e4f] flex items-center justify-center hover:border-[#00F0FF]/50 transition-colors cursor-pointer">
                <Info className="w-5 h-5 text-slate-300" />
              </div>
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">Deep Specs</span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#11192b] border border-[#1e2e4f] flex items-center justify-center hover:border-[#00F0FF]/50 transition-colors cursor-pointer">
                <ArrowRightLeft className="w-5 h-5 text-slate-300" />
              </div>
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">Compare</span>
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
};


// ==============================================================
// MAIN LANDING LAYOUT
// ==============================================================
export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Platform'); // 'Platform', 'Creators', or 'Viewers'

  // Scroll handler for navbar blur
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#050b14] min-h-screen text-white font-sans overflow-x-hidden selection:bg-[#00F0FF]/30">
      
      {/* Dynamic Navbar */}
      <nav 
        className={`fixed top-0 w-full px-6 lg:px-12 py-4 flex justify-between items-center z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#02050a]/90 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div 
          onClick={() => { setActiveTab('Platform'); window.scrollTo(0,0); }}
          className="text-xl font-display font-bold tracking-wider flex items-center gap-2 cursor-pointer"
        >
          <View className="text-[#00F0FF] w-6 h-6" />
          <span>SCAN<span className="text-[#00F0FF]">VISTA</span></span>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-8 items-center font-bold text-[11px] tracking-wider uppercase text-slate-400">
          <button 
            onClick={() => setActiveTab('Platform')}
            className={`transition-colors relative py-2 ${activeTab === 'Platform' ? 'text-white' : 'hover:text-slate-200'}`}
          >
            Platform
            {activeTab === 'Platform' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0FF]" />}
          </button>
          <button 
            onClick={() => setActiveTab('Creators')}
            className={`transition-colors relative py-2 ${activeTab === 'Creators' ? 'text-white' : 'hover:text-slate-200'}`}
          >
            Creators
            {activeTab === 'Creators' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0FF]" />}
          </button>
          <button 
            onClick={() => setActiveTab('Viewers')}
            className={`transition-colors relative py-2 ${activeTab === 'Viewers' ? 'text-white' : 'hover:text-slate-200'}`}
          >
            Viewers
            {activeTab === 'Viewers' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#00F0FF]" />}
          </button>
          <button className="hover:text-slate-200 transition-colors">Pricing</button>
        </div>

        <div className="flex gap-4 items-center">
          <button onClick={() => navigate('/login')} className="hidden sm:block text-xs font-bold hover:text-[#00F0FF] transition-colors">Sign In</button>
          <button 
            onClick={() => navigate('/register')}
            className="px-5 py-2 bg-[#00F0FF] text-black text-xs font-bold rounded-full hover:bg-[#00D8E6] transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Main Content Area - Transitions between views */}
      <AnimatePresence mode="wait">
        {activeTab === 'Platform' ? (
          <PlatformView key="platform" navigate={navigate} />
        ) : activeTab === 'Creators' ? (
          <CreatorsView key="creators" navigate={navigate} />
        ) : (
          <ViewersView key="viewers" navigate={navigate} />
        )}
      </AnimatePresence>

      {/* Shared CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden flex flex-col items-center text-center border-t border-[#1e2e4f]/20 bg-[#02050a]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#0055ff]/5 rounded-full blur-[100px] pointer-events-none" />
        <h2 className="text-3xl md:text-5xl font-display font-semibold mb-6 relative z-10">
          {activeTab === 'Platform' ? 'Ready to bring your products to life?' 
           : activeTab === 'Creators' ? 'Ready to evolve your customer journey?'
           : 'Ready to see more?'}
        </h2>
        <p className="text-sm text-slate-400 mb-10 relative z-10 max-w-md">
          {activeTab === 'Platform' 
            ? 'Join hundreds of brands already transforming their e-commerce experience.' 
            : activeTab === 'Creators' 
            ? 'Start your 14-day free trial. No credit card required.'
            : 'Download the ScanVista app or enter the Web Viewer to start your immersive journey today.'}
        </p>
        
        {/* Conditional Buttons based on View */}
        {activeTab === 'Viewers' ? (
          <div className="flex flex-col sm:flex-row gap-4 relative z-10">
            <button 
              onClick={() => navigate('/scan')}
              className="px-8 py-3.5 bg-[#00F0FF] text-[#050b14] rounded-xl font-bold text-sm hover:bg-[#00D8E6] transition-all"
            >
              Open Web Viewer
            </button>
            <button className="px-6 py-3.5 bg-[#11192b] border border-[#1e2e4f] hover:border-slate-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> App Store
            </button>
            <button className="px-6 py-3.5 bg-[#11192b] border border-[#1e2e4f] hover:border-slate-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-2">
              <Play className="w-4 h-4" /> Play Store
            </button>
          </div>
        ) : (
          <button 
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-[#00F0FF] text-black rounded-full font-bold text-sm hover:scale-105 transition-all shadow-[0_0_30px_rgba(0,240,255,0.2)] relative z-10"
          >
            {activeTab === 'Platform' ? 'Get Started For Free' : 'Start a Strategic Review'}
          </button>
        )}
        
        {activeTab !== 'Viewers' && (
          <p className="text-[9px] font-semibold text-slate-600 mt-6 tracking-wider uppercase relative z-10">
            No credit card required. Cancel anytime.
          </p>
        )}
      </section>

      {/* Shared Footer */}
      <footer className="border-t border-[#1e2e4f]/30 py-10 px-6 bg-[#02050a]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-lg font-display font-bold mb-2">
              <span>SCAN<span className="text-[#00F0FF]">VISTA</span></span>
            </div>
            <p className="text-[10px] text-slate-600 font-semibold">© 2026 ScanVista AI. Precision 3D Visualization.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
            <button onClick={() => { setActiveTab('Platform'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer">Platform</button>
            <button onClick={() => { setActiveTab('Creators'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer">Creators</button>
            <button onClick={() => { setActiveTab('Viewers'); window.scrollTo(0,0); }} className="hover:text-white transition-colors cursor-pointer">Viewers</button>
            <button className="hover:text-white transition-colors cursor-pointer">Pricing</button>
            <button className="hover:text-white transition-colors cursor-pointer">Privacy Policy</button>
            <button className="hover:text-white transition-colors cursor-pointer">Terms</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
