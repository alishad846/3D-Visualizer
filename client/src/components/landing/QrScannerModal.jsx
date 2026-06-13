import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import QRScanner, { resolveQrDestination } from '../qr/QRScanner';

export default function QrScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Detect mobile device
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const processFile = async (file) => {
    setIsProcessing(true);
    setError(null);
    try {
      const html5QrCode = new Html5Qrcode("desktop-qr-reader");
      const decodedText = await html5QrCode.scanFile(file, true);
      
      const route = resolveQrDestination(decodedText);
      if (route) {
        onClose();
        navigate(route);
      } else {
        setError('This QR code is not a valid ScanVista product link.');
      }
    } catch (err) {
      setError('Could not detect a QR code in the uploaded image.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      processFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1
  });

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#02050a]/80 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-[30%] left-[10%] -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 p-4"
          >
            <div className="bg-[#0a1523] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-lg font-bold text-white pl-2">Scan Product</h3>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {isMobile ? (
                  <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50">
                    <QRScanner embedded={true} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <p className="text-slate-400 text-sm text-center mb-6">
                      Upload a photo of the QR code. You will automatically be redirected to the 3D model.
                    </p>

                    <div 
                      {...getRootProps()} 
                      className={`w-full aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 transition-all cursor-pointer ${
                        isDragActive ? 'border-[#00F0FF] bg-[#00F0FF]/5' : 'border-slate-700 bg-white/5 hover:bg-white/10 hover:border-slate-500'
                      }`}
                    >
                      <input {...getInputProps()} />
                      <UploadCloud className={`w-10 h-10 mb-4 ${isDragActive ? 'text-[#00F0FF]' : 'text-slate-400'}`} />
                      {isProcessing ? (
                        <p className="text-sm font-semibold text-white animate-pulse">Scanning Image...</p>
                      ) : isDragActive ? (
                        <p className="text-sm font-semibold text-[#00F0FF]">Drop image here</p>
                      ) : (
                        <div className="text-center">
                          <p className="text-sm font-semibold text-white mb-1">Click to upload or drag & drop</p>
                          <p className="text-xs text-slate-500">SVG, PNG, JPG or WEBP</p>
                        </div>
                      )}
                    </div>

                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                      >
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-200">{error}</p>
                      </motion.div>
                    )}

                    {/* Hidden div required by html5-qrcode library even for file scanning */}
                    <div id="desktop-qr-reader" style={{ display: 'none' }}></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Use portal to break out of any CSS transforms in parent components
  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
}
