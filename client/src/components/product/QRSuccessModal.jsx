import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, Download, ExternalLink, Library, CheckCircle2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function QRSuccessModal({
  isOpen,
  product,
  qrCode,
  onClose,
  onCreateAnother,
  onViewLibrary
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !product || !qrCode) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrCode.destination_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCode.qr_image_url;
    link.download = `${product.brand || 'ScanVista'}-${product.name}-QR.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-[#0b121f]/70 border border-[#1e2e4f]/60 backdrop-blur-3xl w-full max-w-md rounded-[32px] p-8 shadow-[0_0_80px_rgba(0,240,255,0.25)] relative overflow-hidden flex flex-col items-center text-center"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-400/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Success Check Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-16 h-16 bg-green-500/15 border border-green-500/35 rounded-full flex items-center justify-center mb-5 text-green-400 shadow-[0_0_20px_rgba(34,197,94,0.15)]"
          >
            <CheckCircle2 className="w-8 h-8" />
          </motion.div>

          <h2 className="text-2xl font-black text-white mb-2">QR Code Generated!</h2>
          <p className="text-slate-400 text-xs max-w-sm mb-6">
            Your 3D Digital Twin is now live and published. Point any mobile camera at this code to instantly launch the immersive WebXR experience.
          </p>

          {/* QR Code Container */}
          <div className="bg-white p-4 rounded-[24px] mb-6 shadow-[0_0_40px_rgba(0,240,255,0.25)] group relative">
            <img
              src={qrCode.qr_image_url}
              alt="QR Code"
              className="w-44 h-44 object-contain"
            />
          </div>

          {/* Short URL copy box */}
          <div className="w-full bg-[#070b13] border border-[#16223b] rounded-2xl p-3.5 mb-6 flex items-center justify-between gap-3">
            <span className="text-[11px] font-bold text-slate-400 truncate text-left flex-1 max-w-[260px]">
              {qrCode.destination_url}
            </span>
            <button
              onClick={handleCopyLink}
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/5 transition-all flex items-center justify-center shrink-0 cursor-pointer"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Main Action Options */}
          <div className="w-full space-y-2">
            <button
              onClick={handleDownloadQR}
              className="w-full bg-cyan-400 hover:bg-cyan-300 text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
            >
              <Download className="w-4 h-4" /> Download QR Code Image
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  window.open(`/p/${product.slug}`, '_blank');
                }}
                className="bg-[#11192b] border border-[#1d2d4a] hover:bg-[#1a263f] text-slate-300 hover:text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" /> View Public
              </button>
              <button
                onClick={onViewLibrary}
                className="bg-[#11192b] border border-[#1d2d4a] hover:bg-[#1a263f] text-slate-300 hover:text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Library className="w-3.5 h-3.5" /> library
              </button>
            </div>

            <button
              onClick={onCreateAnother}
              className="w-full pt-4 text-xs font-semibold text-[#00F0FF] hover:text-[#00D8E6] transition-colors uppercase tracking-wider"
            >
              + Create Another Product
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
