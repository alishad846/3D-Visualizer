import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Video,
  Headphones,
  Hexagon,
} from "lucide-react";

export default function Scan() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const matchedId = searchParams.get("matched") || "demo-product";

  const handleNavigateToResult = () => {
    navigate(`/scanned-result?id=${encodeURIComponent(matchedId)}`);
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-black text-white font-sans selection:bg-cyan-400/30">

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1400&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover scale-[1.02] blur-[2px] opacity-50"
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/20 to-black/90" />
        {/* Cyan Glow */}
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-cyan-400/10 blur-[150px] rounded-full pointer-events-none" />
      </div>

      {/* ================= HUD CORNERS (Cyberpunk Style) ================= */}
      <div className="absolute inset-4 border border-cyan-400/20 pointer-events-none z-10" />
      
      {/* Top Left Corner */}
      <svg className="absolute top-4 left-4 w-16 h-16 pointer-events-none z-10 opacity-60" viewBox="0 0 64 64" fill="none" stroke="#22d3ee">
        <polyline points="0,64 0,0 64,0" strokeWidth="2" />
        <polyline points="5,5 25,5" strokeWidth="4" />
      </svg>
      
      {/* Top Right Corner */}
      <svg className="absolute top-4 right-4 w-16 h-16 pointer-events-none z-10 opacity-60" viewBox="0 0 64 64" fill="none" stroke="#22d3ee">
        <polyline points="64,64 64,0 0,0" strokeWidth="2" />
      </svg>
      
      {/* Bottom Left Corner */}
      <svg className="absolute bottom-4 left-4 w-16 h-16 pointer-events-none z-10 opacity-60" viewBox="0 0 64 64" fill="none" stroke="#22d3ee">
        <polyline points="0,0 0,64 64,64" strokeWidth="2" />
      </svg>
      
      {/* Bottom Right Corner */}
      <svg className="absolute bottom-4 right-4 w-16 h-16 pointer-events-none z-10 opacity-60" viewBox="0 0 64 64" fill="none" stroke="#22d3ee">
        <polyline points="64,0 64,64 0,64" strokeWidth="2" />
      </svg>

      {/* Decorative Lines */}
      <div className="absolute top-[30%] bottom-[30%] left-4 w-[2px] border-l-2 border-cyan-400 opacity-30 border-dashed z-10 pointer-events-none" />
      <div className="absolute top-[30%] bottom-[30%] right-4 w-[2px] border-r-2 border-cyan-400 opacity-30 border-dashed z-10 pointer-events-none" />

      {/* ================= TOP UI ================= */}
      <div className="absolute top-10 left-10 z-50 flex flex-col items-start">
        <div 
          className="flex items-center gap-2 mb-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <Box className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="text-cyan-400 text-lg font-bold tracking-widest">ScanVista</span>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
          Object Recognition Scanner
        </h1>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-cyan-400/20 border border-cyan-400/50 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <Video className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] pt-0.5">Live Feed</span>
        </div>
      </div>

      {/* Top Right HUD text */}
      <div className="absolute top-10 right-10 z-50 font-mono text-[10px] tracking-[0.3em] text-cyan-400/60 flex flex-col items-end gap-1">
        <span>0088 : 1 : 98.88</span>
        <span>SYS_SCAN_ACTIVE</span>
      </div>

      {/* ================= CENTER RETICLE ================= */}
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center pointer-events-none mt-[-5vh]">
        
        <div className="relative w-[380px] h-[380px] flex items-center justify-center">
          
          {/* Main Brackets */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 80 40 L 40 40 L 40 120" stroke="#22d3ee" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M 320 40 L 360 40 L 360 120" stroke="#22d3ee" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M 80 360 L 40 360 L 40 280" stroke="#22d3ee" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
            <path d="M 320 360 L 360 360 L 360 280" stroke="#22d3ee" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
            
            {/* Inner Details */}
            <path d="M 50 150 L 50 250" stroke="#22d3ee" strokeWidth="2" opacity="0.5" strokeDasharray="2 6" />
            <path d="M 350 150 L 350 250" stroke="#22d3ee" strokeWidth="2" opacity="0.5" strokeDasharray="2 6" />
          </svg>

          {/* Product Image */}
          <motion.img
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop"
            alt="Product"
            className="w-[80%] h-[80%] object-contain drop-shadow-[0_0_50px_rgba(34,211,238,0.4)] mix-blend-screen opacity-90"
          />

          {/* Glowing Center Hexagons */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
              transition={{ rotate: { repeat: Infinity, duration: 20, ease: "linear" }, scale: { repeat: Infinity, duration: 4 } }}
              className="absolute flex items-center justify-center"
            >
              <Hexagon className="w-48 h-48 text-cyan-400/30" strokeWidth={1} />
            </motion.div>
            <motion.div 
              animate={{ rotate: -360 }} 
              transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              className="absolute flex items-center justify-center"
            >
              <Hexagon className="w-32 h-32 text-cyan-400/60" strokeWidth={1.5} />
            </motion.div>
            <div className="absolute flex items-center justify-center">
              <Hexagon className="w-16 h-16 text-cyan-400" strokeWidth={2} />
            </div>
          </div>
        </div>

        {/* Status Text */}
        <motion.p 
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="mt-6 text-white text-lg font-medium tracking-wide drop-shadow-md"
        >
          Identifying product...
        </motion.p>

      </div>

      {/* ================= RESULT CARD ================= */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="
          absolute bottom-10 right-10
          w-auto min-w-[320px] max-w-[380px]
          bg-black/40 border border-cyan-400/30
          backdrop-blur-3xl rounded-[24px] p-5
          shadow-[0_0_40px_rgba(34,211,238,0.15)]
          z-50 flex flex-col gap-4
        "
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
            <Headphones className="w-5 h-5 text-white/80" />
          </div>
          <p className="text-xs md:text-sm font-semibold text-white/90 leading-tight">
            <span className="text-cyan-400 font-bold mr-1">Detected:</span> 
            Sony WH-1000XM5<br />
            <span className="text-[10px] text-white/50 font-normal block mt-0.5">(98% confidence)</span>
          </p>
        </div>

        <button
          onClick={handleNavigateToResult}
          className="
            w-full py-3.5 rounded-[14px]
            bg-gradient-to-r from-cyan-500 to-cyan-400
            text-black font-extrabold text-[11px] uppercase tracking-[0.2em]
            flex items-center justify-center gap-3
            hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]
            hover:-translate-y-0.5
            transition-all duration-300
          "
        >
          <Box className="w-4 h-4" />
          View in 3D
        </button>
      </motion.div>

    </div>
  );
}