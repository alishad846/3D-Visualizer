import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Box, 
  QrCode, 
  Share2, 
  PlusSquare, 
  Maximize,
  Cloud,
  Zap,
  X
} from 'lucide-react';

export default function ProductSuccess() {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("scanvista-product");
      if (raw) {
        setProduct(JSON.parse(raw));
      } else {
        // Fallback data if accessed directly without saving
        setProduct({
          name: "Luxury Watch",
          brand: "Astra-V",
          model: "AV-9942-X",
          thumbnails: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80']
        });
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  if (!product) return null;

  return (
    <div className="min-h-screen bg-[#101217] text-white font-sans selection:bg-[#00F0FF]/30 p-6 flex flex-col items-center">
      
      {/* Header */}
      <div className="mt-16 mb-12 flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-16 h-16 bg-[#00F0FF] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.4)]"
        >
          <CheckCircle2 className="w-8 h-8 text-[#101217]" />
        </motion.div>
        <h1 className="text-4xl font-display font-bold mb-3">Product Saved Successfully</h1>
        <p className="text-slate-400 text-sm max-w-md">
          Your high-fidelity scan is now being finalized. You can view, share, or continue managing your 3D assets below.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Left Column: Product Preview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#161a22] border border-[#222833] rounded-3xl p-6"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold">{product.brand} {product.name}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                DIGITAL TWIN ID: {product.model || 'N/A'}
              </p>
            </div>
            <div className="px-3 py-1 bg-[#b366ff]/10 border border-[#b366ff]/20 text-[#b366ff] text-[10px] font-bold rounded-full">
              Saved Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <div className="w-full aspect-square bg-[#0c1324] rounded-2xl relative overflow-hidden flex items-center justify-center">
            {/* Ambient background glow */}
            <div className="absolute w-64 h-64 bg-[#00F0FF]/10 blur-[80px] rounded-full" />
            
            <img 
              src={product.thumbnails?.[0] || 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80'} 
              alt="Product Preview"
              className="w-[80%] h-[80%] object-contain mix-blend-lighten relative z-10"
            />

            <button 
              onClick={() => navigate('/viewer')}
              className="absolute bottom-4 right-4 px-4 py-2 bg-black/50 backdrop-blur border border-white/10 rounded-lg flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white hover:bg-black/80 transition-all z-20"
            >
              <Maximize className="w-3.5 h-3.5" /> Expand 3D View
            </button>
          </div>
        </motion.div>

        {/* Right Column: Status & Specs */}
        <div className="flex flex-col gap-6">
          
          {/* Processing Status Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#161a22] border border-[#222833] rounded-3xl p-6"
          >
            <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-6">Processing Status</h3>
            
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">Neural Reconstruction</p>
                  <p className="text-[10px] text-[#00F0FF] font-bold mt-0.5">Complete</p>
                </div>
              </div>

              {/* Step 2 (In Progress) */}
              <div className="flex gap-4 items-center">
                <div className="w-8 h-8 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-bold">WebXR Optimization</p>
                    <span className="text-[10px] text-[#00F0FF] font-bold">95%</span>
                  </div>
                  <div className="w-full h-1 bg-[#222833] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '95%' }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className="h-full bg-[#00F0FF] shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4 items-center opacity-50">
                <div className="w-8 h-8 rounded-full bg-[#222833] text-slate-400 flex items-center justify-center shrink-0">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold">Global CDN Deployment</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">Pending</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Technical Specs Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#161a22] border border-[#222833] rounded-3xl p-6 flex-1 flex flex-col"
          >
            <h3 className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-6">Technical Specs</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#101217] border border-[#222833] rounded-xl p-4">
                <p className="text-[10px] text-slate-500 font-bold mb-1">Polygons</p>
                <p className="text-lg font-bold">1.2M</p>
              </div>
              <div className="bg-[#101217] border border-[#222833] rounded-xl p-4">
                <p className="text-[10px] text-slate-500 font-bold mb-1">Resolution</p>
                <p className="text-lg font-bold">8K PBR</p>
              </div>
            </div>
            
            <div className="bg-[#101217] border border-[#222833] rounded-xl p-4 flex-1">
              <p className="text-[10px] text-slate-500 font-bold mb-1">Optimized File Size</p>
              <p className="text-lg font-bold">
                42.5 MB <span className="text-xs text-slate-500 ml-1">(-65% via GLTF)</span>
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Bottom Action Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <button 
          onClick={() => navigate('/viewer')}
          className="bg-[#161a22] border border-[#222833] hover:border-[#00F0FF]/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-colors group"
        >
          <Box className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">View in 3D Portal</span>
        </button>

        <button 
          onClick={() => setShowQRModal(true)}
          className="bg-[#161a22] border border-[#222833] hover:border-[#00F0FF]/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-colors group"
        >
          <QrCode className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">Generate QR Code</span>
        </button>

        <button 
          onClick={() => navigate('/dashboard/products')}
          className="bg-[#161a22] border border-[#222833] hover:border-[#00F0FF]/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-colors group"
        >
          <Share2 className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
          <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">Share to Workspace</span>
        </button>

        <button 
          onClick={() => navigate('/add-product')}
          className="bg-[#00F0FF] border border-[#00F0FF] hover:bg-[#00D8E6] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 transition-colors text-[#101217] shadow-[0_0_20px_rgba(0,240,255,0.2)]"
        >
          <PlusSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold">Add Another Product</span>
        </button>
      </motion.div>

      {/* QR Code Modal Overlay */}
      <AnimatePresence>
        {showQRModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#161a22] border border-[#222833] rounded-[32px] p-8 max-w-md w-full relative shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center text-center"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowQRModal(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 bg-[#00F0FF]/10 rounded-2xl flex items-center justify-center mb-6">
                <QrCode className="w-8 h-8 text-[#00F0FF]" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Scan to View in AR</h2>
              <p className="text-slate-400 text-sm mb-8">
                Point any mobile camera at this code to instantly launch the 3D model.
              </p>

              <div className="bg-white p-4 rounded-2xl mb-8 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ScanVista-${encodeURIComponent(product.name)}`} 
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>

              {/* Product Info inside Modal */}
              <div className="flex items-center gap-4 bg-[#0c1324] border border-[#222833] p-4 rounded-2xl w-full">
                <div className="w-12 h-12 bg-black rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  <img 
                    src={product.thumbnails?.[0] || 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80'} 
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left flex-1 overflow-hidden">
                  <h4 className="text-sm font-bold truncate">{product.brand} {product.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-1 truncate">
                    ID: {product.model || 'N/A'}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
