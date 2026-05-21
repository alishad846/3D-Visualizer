import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Flashlight, ScanLine, Image as ImageIcon, CameraOff } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export default function Scan() {
  const navigate = useNavigate();
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [hasCameraError, setHasCameraError] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    let html5QrCode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: window.innerHeight / window.innerWidth, // Try to fill screen
          },
          (decodedText) => {
            // Success Callback
            if (scannerRef.current?.isScanning) {
              scannerRef.current.stop().catch(console.error);
            }
            setScannedData(decodedText);
            
            // Redirect after brief success animation
            setTimeout(() => {
              navigate('/showcase');
            }, 1500);
          },
          (errorMessage) => {
            // Parse error, ignore to keep scanning
          }
        );
      } catch (err) {
        console.error("Camera access failed", err);
        setHasCameraError(true);
      }
    };

    startScanner();

    // Cleanup on unmount
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().then(() => {
          scannerRef.current.clear();
        }).catch(console.error);
      }
    };
  }, [navigate]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black z-[100] flex flex-col items-center justify-center overflow-hidden font-sans">
      
      {/* Live Camera Feed Container */}
      <div 
        id="qr-reader" 
        className={`absolute inset-0 z-0 w-full h-full object-cover [&>video]:object-cover [&>video]:w-full [&>video]:h-full transition-all duration-300 ${flashlightOn ? 'brightness-125 saturate-110' : ''}`}
      />

      {/* Camera Error Fallback */}
      {hasCameraError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/90 p-6 text-center">
          <CameraOff className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Camera Access Denied</h3>
          <p className="text-slate-400 text-sm">Please allow camera permissions in your browser to use the AR scanner.</p>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/60 to-transparent">
        <button 
          onClick={() => navigate(-1)}
          className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/10 hover:bg-white/20 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setFlashlightOn(!flashlightOn)}
          className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center border transition-all ${
            flashlightOn 
              ? 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400' 
              : 'bg-black/40 border-white/10 text-white hover:bg-white/20'
          }`}
        >
          <Flashlight className="w-5 h-5" />
        </button>
      </div>

      {/* Scanner UI Overlay */}
      <div className="relative z-10 w-full max-w-[320px] aspect-square pointer-events-none">
        {/* Reticle Frame */}
        <div className="absolute inset-0 border-2 border-white/20 rounded-3xl" />
        
        {/* Corner Accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#00F0FF] rounded-tl-3xl" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#00F0FF] rounded-tr-3xl" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#00F0FF] rounded-bl-3xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#00F0FF] rounded-br-3xl" />

        {/* Animated Laser Scanning Line */}
        {!scannedData && !hasCameraError && (
          <motion.div 
            className="absolute top-0 left-0 w-full h-[2px] bg-[#00F0FF] shadow-[0_0_20px_4px_rgba(0,240,255,0.7)]"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Success Overlay */}
        {scannedData && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-3xl p-4 text-center"
          >
            <div className="w-16 h-16 bg-[#00F0FF] rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,240,255,0.5)]">
              <ScanLine className="w-8 h-8 text-black" />
            </div>
            <p className="font-bold text-[#00F0FF] text-lg mb-1">QR Detected!</p>
            <p className="text-white/80 text-xs truncate w-full">{scannedData}</p>
            <p className="text-white/50 text-[10px] mt-2">Redirecting...</p>
          </motion.div>
        )}
      </div>

      {/* Bottom Instructions */}
      <div className="absolute bottom-12 w-full text-center z-20 pointer-events-none">
        <p className="text-white/90 font-bold bg-black/50 backdrop-blur-md inline-block px-6 py-3 rounded-full text-sm border border-white/10">
          Point camera at a ScanVista QR code
        </p>
        
        <div className="mt-8 flex justify-center gap-6 pointer-events-auto">
          <button className="flex flex-col items-center gap-2 text-white/60 hover:text-white transition-colors">
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur border border-white/10 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Gallery</span>
          </button>
        </div>
      </div>
      
    </div>
  );
}
