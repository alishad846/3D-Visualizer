import React, { useState, useRef, Suspense, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges, Float, ContactShadows, Environment } from '@react-three/drei';
import { XR, createXRStore } from '@react-three/xr';
import { QRCodeSVG } from 'qrcode.react';
import { Upload, ArrowLeft, View, CheckCircle2, Wand2, Image as ImageIcon, Box, Share2, Download, BookmarkPlus, Settings2, Check, X } from 'lucide-react';
import * as THREE from 'three';

const store = createXRStore();

// 3D Model with uploaded image as texture
const TexturedModel = ({ imageUrl }) => {
  const meshRef = useRef();
  const texture = imageUrl ? new THREE.TextureLoader().load(imageUrl) : null;
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={meshRef}>
        {/* Main textured box */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.8, 1.8, 0.3]} />
          <meshPhysicalMaterial 
            map={texture}
            metalness={0.3} 
            roughness={0.4} 
            clearcoat={0.8}
            color={texture ? '#ffffff' : '#050505'}
            emissive="#00F0FF"
            emissiveIntensity={0.05}
          />
          <Edges linewidth={1.5} threshold={15} color="#00F0FF" />
        </mesh>
        {/* Back panel with depth effect */}
        <mesh position={[0, 0, -0.25]} castShadow>
          <boxGeometry args={[2.0, 2.0, 0.1]} />
          <meshPhysicalMaterial 
            color="#080808" 
            metalness={0.9} 
            roughness={0.2} 
            clearcoat={1}
          />
          <Edges linewidth={1} threshold={15} color="#00F0FF" opacity={0.3} />
        </mesh>
        {/* Side accent panels */}
        <mesh position={[1.0, 0, -0.1]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.4, 1.6]} />
          <meshPhysicalMaterial color="#0A0A0A" metalness={0.8} roughness={0.3} emissive="#00F0FF" emissiveIntensity={0.02} />
        </mesh>
        <mesh position={[-1.0, 0, -0.1]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.4, 1.6]} />
          <meshPhysicalMaterial color="#0A0A0A" metalness={0.8} roughness={0.3} emissive="#00F0FF" emissiveIntensity={0.02} />
        </mesh>
      </group>
    </Float>
  );
};

// Fallback model (no texture)
const PlaceholderModel = () => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshPhysicalMaterial 
          color="#050505" 
          metalness={0.9} 
          roughness={0.2} 
          clearcoat={1} 
          emissive="#00F0FF"
          emissiveIntensity={0.1}
        />
        <Edges linewidth={2} threshold={15} color="#00F0FF" />
      </mesh>
    </Float>
  );
};

export default function AddProduct() {
  const navigate = useNavigate();
  // Steps: 1: Upload, 2: Preview, 3: Processing, 4: Model View, 5: Actions
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', description: '', quality: 'High (Better Detail)', texture: 'Yes', format: 'GLB' });
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const [productId] = useState(() => `sv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(URL.createObjectURL(file));
    }
  };

  const startProcessing = () => {
    setStep(3);
    setProgress(0);
  };

  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep(4), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step]);

  const getProcessingPhase = () => {
    if (progress < 25) return 0;
    if (progress < 50) return 1;
    if (progress < 75) return 2;
    if (progress < 100) return 3;
    return 4;
  };

  const processingSteps = [
    "Analyzing image",
    "Extracting Features",
    "Generating Geometry",
    "Applying Textures",
    "Optimizing Model"
  ];

  return (
    <div className="h-full w-full bg-[#020202] text-white flex flex-col font-sans selection:bg-[#00F0FF]/30 overflow-hidden">
      
      {/* Compact Step Header */}
      <div className="w-full px-6 py-4 flex justify-between items-center border-b border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')} className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-display font-semibold">
            {step === 1 && 'Upload Image'}
            {step === 2 && 'Preview & Confirm'}
            {step === 3 && 'Processing'}
            {step === 4 && '3D Model Viewer'}
            {step === 5 && 'My 3D Model'}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Progress Indicators */}
          {[1,2,3,4,5].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all duration-300 ${step >= s ? 'w-6 bg-[#00F0FF]' : 'w-2 bg-white/10'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 max-w-2xl w-full mx-auto px-6 py-10 flex flex-col relative overflow-y-auto hidden-scrollbar pb-32">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: UPLOAD */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-display font-semibold mb-2">Upload Image</h2>
                <p className="text-[#888] text-sm">Upload a clear image of the object you want to convert to 3D.</p>
              </div>

              <div className="w-full h-64 bg-[#0A0A0A] border-2 border-dashed border-white/10 rounded-3xl relative overflow-hidden group flex items-center justify-center hover:border-[#00F0FF]/50 transition-colors shrink-0">
                {image ? (
                  <>
                    <img src={image} alt="Upload preview" className="absolute inset-0 w-full h-full object-contain p-4" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <label className="cursor-pointer px-6 py-3 bg-[#00F0FF] text-black font-semibold rounded-full hover:scale-105 transition-transform">
                        Change Image
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-[#00F0FF]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-[#00F0FF]" />
                    </div>
                    <h3 className="font-semibold text-lg mb-1">Tap to upload or drag & drop</h3>
                    <p className="text-[#666] text-sm">JPG, PNG • Max 10MB</p>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-white/80">Model Name</h3>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Vintage Bicycle" 
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2 text-white/80">Image Description</h3>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the object in detail for better 3D generation..." 
                    rows={4}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-4 px-4 text-sm focus:outline-none focus:border-[#00F0FF]/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={() => {
                  if (!formData.name) setFormData(prev => ({...prev, name: 'Untitled Model'}));
                  setStep(2);
                }}
                disabled={!image}
                className="w-full mt-4 bg-[#00F0FF] text-black font-bold py-4 rounded-xl flex items-center justify-center disabled:opacity-50 hover:bg-[#00D0DD] transition-colors shadow-lg"
              >
                {image ? 'Continue' : 'Upload Image to Continue'}
              </button>
            </motion.div>
          )}

          {/* STEP 2: PREVIEW */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
              <div>
                <h2 className="text-2xl font-display font-semibold mb-2">Preview & Confirm</h2>
                <p className="text-[#888] text-sm">Review Image & Details Before Processing</p>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-2 relative shrink-0">
                <img src={image} alt="Preview" className="w-full h-64 object-cover rounded-2xl" />
                <button onClick={() => setStep(1)} className="absolute bottom-6 right-6 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-xs font-semibold border border-white/10 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Edit Image
                </button>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-white/80">Description</h3>
                  <button onClick={() => setStep(1)} className="text-[#00F0FF] text-xs font-semibold">Edit</button>
                </div>
                <p className="text-sm text-[#A0A0A0] leading-relaxed">{formData.description || "No description provided."}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-4 text-white/80">Processing Settings</h3>
                <div className="space-y-3">
                  {[
                    { label: "Quality", value: formData.quality },
                    { label: "Texture", value: formData.texture },
                    { label: "Output Format", value: formData.format }
                  ].map((setting, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-[#0A0A0A] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-colors">
                      <span className="text-sm text-white/90">{setting.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-[#00F0FF]">{setting.value}</span>
                        <ArrowLeft className="w-4 h-4 rotate-180 opacity-50" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <button 
                  onClick={startProcessing}
                  className="w-full bg-[#00F0FF] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00D0DD] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
                >
                  <Wand2 className="w-5 h-5" /> Start Processing
                </button>
                <p className="text-center text-xs text-[#666] mt-4 flex items-center justify-center gap-2">
                  <Settings2 className="w-3 h-3" /> This may take a few minutes.
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PROCESSING */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center flex-1 h-full py-20">
              <h2 className="text-2xl font-display font-semibold mb-2">Generating 3D Model</h2>
              <p className="text-[#888] text-sm text-center max-w-xs mb-16">Please wait while we convert your image into a spatial model.</p>
              
              <div className="relative w-48 h-48 mb-16 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="96" cy="96" r="88" 
                    stroke="#00F0FF" 
                    strokeWidth="8" 
                    fill="none" 
                    strokeDasharray={2 * Math.PI * 88}
                    strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                    className="transition-all duration-100 ease-linear"
                  />
                </svg>
                <div className="w-20 h-20 bg-[#00F0FF]/10 rounded-2xl flex items-center justify-center animate-pulse border border-[#00F0FF]/30">
                  <Box className="w-10 h-10 text-[#00F0FF]" />
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="flex justify-between items-end mb-2">
                  <span className="font-semibold text-lg">Processing...</span>
                  <span className="text-[#00F0FF] font-bold text-xl">{progress}%</span>
                </div>
                
                <div className="space-y-3 mt-8">
                  {processingSteps.map((pStep, i) => {
                    const isDone = getProcessingPhase() > i;
                    const isActive = getProcessingPhase() === i;
                    return (
                      <div key={i} className={`flex items-center gap-4 transition-all duration-300 ${isDone || isActive ? 'opacity-100' : 'opacity-30'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${isDone ? 'bg-[#00F0FF] border-[#00F0FF]' : isActive ? 'border-[#00F0FF] text-[#00F0FF]' : 'border-white/20'}`}>
                          {isDone ? <Check className="w-4 h-4 text-black" /> : isActive && <div className="w-2 h-2 bg-[#00F0FF] rounded-full animate-ping" />}
                        </div>
                        <span className={`text-sm ${isDone ? 'text-white' : isActive ? 'text-[#00F0FF] font-medium' : 'text-[#888]'}`}>{pStep}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: 3D MODEL VIEW */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-display font-semibold">3D Model Viewer</h2>
                <button onClick={() => setShowQR(true)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-semibold flex items-center gap-2 hover:bg-white/10">
                  <Box className="w-4 h-4" /> AR Mode
                </button>
              </div>

              {/* QR Code Modal for AddProduct */}
              <AnimatePresence>
                {showQR && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 pointer-events-auto rounded-3xl"
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
                          value={`${window.location.origin}/view/${productId}`} 
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

              <div className="w-full h-80 shrink-0 bg-[#050505] rounded-3xl border border-white/10 relative overflow-hidden">
                <Canvas camera={{ position: [0, 1, 4], fov: 45 }}>
                  <XR store={store}>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[5, 10, 5]} intensity={2} color="#ffffff" />
                    <pointLight position={[-5, -5, -5]} intensity={1} color="#0055FF" />
                    <Suspense fallback={null}>
                      <TexturedModel imageUrl={image} />
                      <Environment preset="city" />
                      <ContactShadows position={[0, -1.2, 0]} opacity={0.8} scale={10} blur={2} far={4} color="#00F0FF" />
                    </Suspense>
                    <OrbitControls enableZoom={true} autoRotate autoRotateSpeed={1} />
                  </XR>
                </Canvas>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                <h3 className="text-sm font-semibold mb-4 border-b border-white/5 pb-3">Model Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between"><span className="text-[#888] text-sm">Polygons</span><span className="text-sm">52,348</span></div>
                  <div className="flex justify-between"><span className="text-[#888] text-sm">Vertices</span><span className="text-sm">28,731</span></div>
                  <div className="flex justify-between"><span className="text-[#888] text-sm">File Size</span><span className="text-sm">8.4 MB</span></div>
                  <div className="flex justify-between"><span className="text-[#888] text-sm">Format</span><span className="text-sm">GLB</span></div>
                </div>
              </div>

              <button 
                onClick={() => setStep(5)}
                className="w-full bg-[#00F0FF] text-black font-bold py-4 rounded-xl flex items-center justify-center hover:bg-[#00D0DD] transition-colors mt-2"
              >
                Continue to Actions
              </button>
            </motion.div>
          )}

          {/* STEP 5: ACTIONS */}
          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
              <h2 className="text-2xl font-display font-semibold mb-2 text-center">My 3D Model</h2>

              <div className="w-full h-[300px] bg-[#050505] rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                 <Canvas camera={{ position: [0, 0, 4] }}>
                  <ambientLight intensity={0.5} />
                  <spotLight position={[5, 10, 5]} intensity={1.5} />
                  <Suspense fallback={null}>
                    <TexturedModel imageUrl={image} />
                    <Environment preset="city" />
                  </Suspense>
                  <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.5} />
                </Canvas>
              </div>

              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="text-xs text-[#888] uppercase tracking-wider mb-1">Model Name</h3>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-lg">{formData.name}</p>
                    <button className="text-[#00F0FF] text-xs font-semibold">Edit</button>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs text-[#888] uppercase tracking-wider mb-1">Description</h3>
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-[#ccc] leading-relaxed pr-4">{formData.description}</p>
                    <button className="text-[#00F0FF] text-xs font-semibold mt-1">Edit</button>
                  </div>
                </div>
              </div>

              {/* Generated QR Code */}
              <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6">
                <h3 className="text-sm font-semibold mb-4 text-white/80">Product QR Code</h3>
                <div className="flex items-center gap-6">
                  <div className="bg-white p-3 rounded-2xl shrink-0">
                    <QRCodeSVG 
                      value={`${window.location.origin}/view/${productId}`} 
                      size={120}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"H"}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold mb-1">Scan to view in 3D + AR</p>
                    <p className="text-xs text-[#888] mb-3 leading-relaxed">Share this QR code with customers. Scanning it opens the interactive 3D viewer with AR support on mobile devices.</p>
                    <p className="text-xs text-[#555] font-mono break-all">{`${window.location.origin}/view/${productId}`}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-4 text-white/80">Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="flex flex-col items-center justify-center gap-3 p-6 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 rounded-2xl transition-colors">
                    <Download className="w-6 h-6 text-[#00F0FF]" />
                    <span className="text-sm font-medium">Download GLB</span>
                  </button>
                  <button onClick={() => navigate(`/view/${productId}`)} className="flex flex-col items-center justify-center gap-3 p-6 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 border border-[#00F0FF]/30 rounded-2xl transition-colors">
                    <View className="w-6 h-6 text-[#00F0FF]" />
                    <span className="text-sm font-medium text-[#00F0FF]">View in 3D</span>
                  </button>
                  <button onClick={() => setShowQR(true)} className="flex flex-col items-center justify-center gap-3 p-6 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 rounded-2xl transition-colors">
                    <Box className="w-6 h-6 text-white/80" />
                    <span className="text-sm font-medium">AR Mode</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-3 p-6 bg-[#0A0A0A] hover:bg-white/5 border border-white/10 rounded-2xl transition-colors">
                    <Share2 className="w-6 h-6 text-white/80" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>
              </div>

              <button 
                onClick={() => {
                  setFormData({ name: '', description: '', quality: 'High (Better Detail)', texture: 'Yes', format: 'GLB' });
                  setImage(null);
                  setStep(1);
                }}
                className="w-full mt-6 bg-[#00F0FF] text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#00D0DD] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
              >
                <Upload className="w-5 h-5" /> Create Another
              </button>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}