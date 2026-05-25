import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Box, Tag, Globe, Sparkles, AlertCircle } from 'lucide-react';

export default function VerificationModal({
  isOpen,
  product,
  onEdit,
  onGenerateQR,
  isPublishing = false
}) {
  if (!isOpen || !product) return null;

  // Prepare public preview URL based on active client hostname
  const publicPreviewUrl = `${window.location.origin}/p/${product.slug || 'slug'}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-[#0b121f]/70 border border-[#1e2e4f]/60 backdrop-blur-3xl w-full max-w-2xl rounded-[32px] p-6 md:p-8 shadow-[0_0_80px_rgba(0,240,255,0.15)] relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-400/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Close Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#00F0FF] px-2.5 py-1 bg-[#00F0FF]/10 rounded-full border border-[#00F0FF]/25">
                Verification & Review
              </span>
              <h2 className="text-2xl font-black text-white mt-3 flex items-center gap-2">
                Verify Product Identity <Sparkles className="w-5 h-5 text-[#00F0FF]" />
              </h2>
            </div>
            <button
              onClick={onEdit}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5 transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
            {/* Visual Assets Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#070b13] border border-[#16223b] rounded-2xl p-4 flex items-center justify-center min-h-[160px] relative overflow-hidden">
                <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <Box className="w-3.5 h-3.5 text-[#00F0FF]" /> 3D GLB Model
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📦</div>
                  <p className="text-xs font-bold text-slate-300 truncate max-w-[200px]">
                    {(product.modelUrl || product.model_url)
                      ? (product.modelUrl || product.model_url).split('/').pop()
                      : 'model.glb'}
                  </p>
                </div>
              </div>

              <div className="bg-[#070b13] border border-[#16223b] rounded-2xl p-4 flex items-center justify-center min-h-[160px] relative overflow-hidden">
                <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                  <Tag className="w-3.5 h-3.5 text-[#a855f7]" /> Thumbnail
                </div>
                {(product.thumbnailUrl || product.thumbnail_url) ? (
                  <img
                    src={product.thumbnailUrl || product.thumbnail_url}
                    alt="Preview"
                    className="max-h-[120px] object-contain rounded-xl mix-blend-lighten"
                  />
                ) : (
                  <p className="text-xs text-slate-500 italic">No thumbnail uploaded</p>
                )}
              </div>
            </div>

            {/* Core Identity Info */}
            <div className="bg-[#070b13]/60 border border-[#16223b] rounded-2xl p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Product Name</p>
                  <p className="text-sm font-bold text-white mt-0.5">{product.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Brand / SKU</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {product.brand || 'N/A'} {product.sku ? `(${product.sku})` : ''}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Category</p>
                  <p className="text-sm font-semibold text-[#00F0FF] mt-0.5">{product.category}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Price Point</p>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {product.price ? `${parseFloat(product.price).toLocaleString()} ${product.currency || 'INR'}` : 'Not Specified'}
                  </p>
                </div>
              </div>
              {product.description && (
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Description</p>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{product.description}</p>
                </div>
              )}
            </div>

            {/* Highlights & Features */}
            {((product.features && product.features.length > 0) || (product.specs && product.specs.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.features && product.features.length > 0 && (
                  <div className="bg-[#070b13]/60 border border-[#16223b] rounded-2xl p-5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Key Features</p>
                    <ul className="space-y-2">
                      {product.features.map((feature, i) => (
                        <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.specs && product.specs.length > 0 && (
                  <div className="bg-[#070b13]/60 border border-[#16223b] rounded-2xl p-5">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3">Technical Specs</p>
                    <div className="space-y-2">
                      {product.specs.map((spec, i) => (
                        <div key={i} className="flex justify-between text-xs border-b border-[#16223b] pb-1">
                          <span className="text-slate-400">{spec.key}</span>
                          <span className="font-semibold text-slate-200">{spec.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Public URL Preview */}
            <div className="bg-[#00F0FF]/5 border border-[#00F0FF]/20 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#00F0FF]/10 flex items-center justify-center text-[#00F0FF]">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Generated Public URL</p>
                  <p className="text-xs font-bold text-[#00F0FF] mt-0.5 truncate max-w-[280px] sm:max-w-[400px]">
                    {publicPreviewUrl}
                  </p>
                </div>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                Draft
              </span>
            </div>

            {/* Draft Warning */}
            <div className="flex gap-2.5 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-xs text-amber-300">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Review your digital twin information carefully. Click <strong>Generate QR Code</strong> to publish the product and generate its permanent QR Code. You can reopen previously generated QR codes later from the contents table.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-[#1e2e4f]/50">
            <button
              onClick={onEdit}
              disabled={isPublishing}
              className="flex-1 bg-[#11192b] border border-[#1d2d4a] hover:bg-[#1a263f] text-slate-300 hover:text-white py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              Edit Details
            </button>
            <button
              onClick={onGenerateQR}
              disabled={isPublishing}
              className="flex-1 bg-[#00F0FF] hover:bg-[#00D8E6] text-black font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_30px_rgba(0,240,255,0.45)] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPublishing ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                'Generate QR Code'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
