import React, { Suspense, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Float, Sparkles, Edges } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, ArrowLeft, Share2, Zap, Box, X } from 'lucide-react';
import * as THREE from 'three';

const store = createXRStore();

// 3D Model with Futuristic Edges
const FuturisticModel = () => {
  const meshRef = useRef();
  
  useFrame((state) => {
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow receiveShadow position={[0, 0, -1]}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshPhysicalMaterial 
          color="#050505" 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1} 
          clearcoatRoughness={0.1}
          emissive="#00F0FF"
          emissiveIntensity={0.1}
        />
        <Edges
          linewidth={2}
          threshold={15} 
          color="#00F0FF" 
        />
      </mesh>
    </Float>
  );
};

export default function ProductViewer() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [transcript, setTranscript] = useState([
    { sender: 'ai', text: 'Hello! I am Aria, your AI guide. I can explain the features of this product. What would you like to know?' }
  ]);

  // AI Description TTS
  const speakDescription = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = "The Quantum Core X is a revolutionary leap in processing power, encased in an aerodynamic structure designed for maximum thermal efficiency. It features aerospace titanium material, weighs 1.2 kilograms, and provides 48 hours of active battery life.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = 1;
      utterance.rate = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      setTranscript(prev => [...prev, { sender: 'ai', text }]);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in this browser.");
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleMicToggle = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setTranscript(prev => [...prev, { sender: 'user', text: 'What are the main features?' }]);
        setIsListening(false);
        setTimeout(() => {
          speakDescription();
        }, 500);
      }, 2000);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#020202] overflow-hidden text-white font-sans">
      
      {/* 3D Canvas - Center / Fullscreen Background Layer */}
      <div className="absolute inset-0 z-0">
        <Canvas shadows camera={{ position: [0, 1.5, 5], fov: 45 }}>
          <XR store={store}>
            <color attach="background" args={['#020202']} />
            <ambientLight intensity={0.4} />
            <spotLight position={[5, 10, 5]} angle={0.2} penumbra={1} intensity={2} castShadow color="#ffffff" />
            <pointLight position={[-5, -5, -5]} intensity={1} color="#0055FF" />
            <pointLight position={[5, -5, 5]} intensity={1} color="#00F0FF" />
            
            <Suspense fallback={null}>
              <FuturisticModel />
              <Environment preset="night" />
              <ContactShadows position={[0, -1.5, 0]} opacity={0.6} scale={10} blur={2.5} far={4} color="#00F0FF" />
              <Sparkles count={150} scale={8} size={2} speed={0.2} opacity={0.3} color="#00F0FF" />
            </Suspense>
            <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 1.7} minDistance={1} maxDistance={8} />
          </XR>
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 w-full h-full flex flex-col pointer-events-none">
        
        {/* Top Navigation */}
        <div className="flex justify-between items-center p-6 pointer-events-auto">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setShowQR(true)}
              className="px-5 py-2.5 bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 backdrop-blur-md rounded-full hover:bg-[#00F0FF]/20 transition-colors flex items-center gap-2"
            >
              <Box className="w-4 h-4" />
              <span className="text-sm font-bold">AR Mode</span>
            </button>
            <button className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-full hover:bg-white/10 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQR && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 pointer-events-auto"
              onClick={() => setShowQR(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowQR(false)}
                  className="absolute top-4 right-4 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
                
                <h3 className="text-xl font-display font-semibold mb-2">View in AR</h3>
                <p className="text-sm text-[#888888] mb-8">Scan this QR code with your mobile device to view this product in your space.</p>
                
                <div className="bg-white p-4 rounded-2xl mb-8">
                  <QRCodeSVG 
                    value={window.location.href} 
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"H"}
                  />
                </div>
                
                <p className="text-xs text-[#555] mb-4">Or if you are already on mobile:</p>
                <button 
                  onClick={() => {
                    setShowQR(false);
                    store.enterAR();
                  }}
                  className="w-full py-3 bg-[#00F0FF] text-black font-bold rounded-xl hover:bg-[#00D0DD] transition-colors"
                >
                  Enter AR on this device
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex justify-between px-6 pb-6 gap-6 overflow-hidden">
          
          {/* Left Panel - Product Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-[380px] flex flex-col gap-4 pointer-events-auto overflow-y-auto hidden-scrollbar pb-10"
          >
            <div className="bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] text-xs font-bold mb-5 border border-[#00F0FF]/20">
                <Zap className="w-3 h-3" /> PREMIER PRODUCT
              </div>
              <h1 className="text-4xl font-display font-semibold mb-3 tracking-tight">Quantum Core X</h1>
              <p className="text-[#A0A0A0] text-sm leading-relaxed mb-8">
                A revolutionary leap in processing power, encased in an aerodynamic structure designed for maximum thermal efficiency.
              </p>
              
              <div className="space-y-5">
                <h3 className="text-xs uppercase tracking-[0.2em] text-[#00F0FF] font-semibold">Key Specifications</h3>
                <div className="grid gap-3">
                  {[
                    { label: "Material", value: "Aerospace Titanium" },
                    { label: "Weight", value: "1.2 kg" },
                    { label: "Battery", value: "48 Hours Active" }
                  ].map((spec, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3 text-sm">
                      <span className="text-[#888888]">{spec.label}</span>
                      <span className="font-medium text-white">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#00F0FF] font-semibold mb-4">AI Suggestions</h3>
              <div className="flex flex-wrap gap-2">
                {["Explain features", "Compare with Pro model", "How does cooling work?"].map((sugg, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      if(sugg === "Explain features") speakDescription();
                    }}
                    className="text-xs px-4 py-2.5 rounded-full border border-white/10 hover:border-[#00F0FF] hover:text-[#00F0FF] transition-all bg-white/5 whitespace-nowrap"
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Panel - AI Voice Assistant */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="w-[380px] flex flex-col gap-4 pointer-events-auto"
          >
            <div className="bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex-1 flex flex-col relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00F0FF] to-[#0055FF]" />
              
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isListening || isSpeaking ? 'bg-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.4)]' : 'bg-white/5 border border-white/10'}`}>
                    {isSpeaking ? (
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <motion.div 
                            key={i} 
                            animate={{ height: ['4px', '16px', '4px'] }} 
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} 
                            className="w-1 bg-[#0A0A0A] rounded-full" 
                          />
                        ))}
                      </div>
                    ) : (
                      <Mic className={`w-5 h-5 ${isListening ? 'text-[#0A0A0A]' : 'text-[#00F0FF]'}`} />
                    )}
                  </div>
                  {isListening && <div className="absolute inset-0 rounded-full bg-[#00F0FF]/30 animate-ping" />}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">Aria Assistant</h3>
                  <p className="text-xs text-[#888888]">{isSpeaking ? 'Speaking...' : isListening ? 'Listening...' : 'Ready to help'}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto hidden-scrollbar flex flex-col gap-4 space-y-2 pr-2">
                <AnimatePresence>
                  {transcript.map((msg, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed ${
                        msg.sender === 'ai' 
                        ? 'bg-white/10 self-start rounded-tl-sm' 
                        : 'bg-[#00F0FF]/15 text-[#00F0FF] self-end rounded-tr-sm border border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                      }`}
                    >
                      {msg.text}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="mt-5 pt-5 border-t border-white/10 flex justify-center">
                <button 
                  onClick={handleMicToggle}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    isListening || isSpeaking 
                    ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' 
                    : 'bg-[#00F0FF] text-[#0A0A0A] hover:bg-[#00D0DD] hover:scale-105 shadow-[0_0_25px_rgba(0,240,255,0.3)]'
                  }`}
                >
                  {isListening || isSpeaking ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}