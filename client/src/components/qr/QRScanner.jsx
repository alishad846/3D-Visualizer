import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { ScanLine, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QRScanner() {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    // We only want to render the scanner if there is no scan result yet.
    if (scanResult) return;

    const scanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        aspectRatio: 1.0,
      }, 
      false
    );

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        scanner.clear();
        
        // Simulating analyzing effect before redirecting
        setTimeout(() => {
          // Assuming the QR code contains a product ID or URL. We will redirect to the viewer frontend without hitting the backend.
          navigate('/scanned-result');
        }, 1500);
      },
      (error) => {
        // Handle error silently
      }
    );

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, [scanResult, navigate]);

  return (
    <div className="relative w-screen h-screen bg-background flex flex-col items-center justify-center text-textMain overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00F0FF 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <div className="absolute top-0 w-full p-6 flex justify-between z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 glass-panel rounded-full hover:bg-white/10 transition-colors group flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium text-sm pr-2">Back</span>
        </button>
      </div>

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl font-display font-bold mb-2">Scan Product QR</h2>
          <p className="text-textMuted text-sm">Align the QR code within the frame to visualize</p>
        </motion.div>

        {/* Scanner Container */}
        <div className="relative w-full aspect-square max-w-[300px] glass-panel p-2 glow-box overflow-hidden rounded-3xl flex items-center justify-center bg-black/50">
          
          {!scanResult ? (
            <div id="reader" className="w-full h-full [&>div]:border-none [&>div]:shadow-none [&_video]:rounded-2xl [&_video]:object-cover" />
          ) : (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-black mb-4 animate-bounce">
                <ScanLine className="w-8 h-8" />
              </div>
              <p className="font-bold font-display text-lg">Product Found!</p>
              <p className="text-sm text-textMuted">Initializing 3D Environment...</p>
            </motion.div>
          )}

          {/* Animated Scanning Line */}
          {!scanResult && (
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_#00F0FF] z-20 pointer-events-none"
            />
          )}

          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-2xl z-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-2xl z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-2xl z-20 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-2xl z-20 pointer-events-none" />
        </div>
      </div>
      
      {/* Global styles override for the html5-qrcode injected elements to make it cinematic */}
      <style>{`
        #reader { border: none !important; }
        #reader__dashboard_section_csr span { color: #A0A0A0 !important; font-family: 'Inter', sans-serif !important; }
        #reader__dashboard_section_swaplink { display: none !important; }
        #reader button { 
          background: rgba(255,255,255,0.1) !important; 
          color: white !important; 
          border: 1px solid rgba(255,255,255,0.2) !important; 
          padding: 8px 16px !important; 
          border-radius: 99px !important;
          font-family: 'Inter', sans-serif !important;
          margin-top: 10px !important;
          cursor: pointer;
        }
        #reader video { border-radius: 16px !important; }
      `}</style>
    </div>
  );
}