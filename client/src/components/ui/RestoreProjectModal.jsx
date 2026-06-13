import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, FolderOpen, Layers } from 'lucide-react';

export default function RestoreProjectModal({
  isOpen,
  onClose,
  onConfirm,
  projectName,
  deletedProductCount,
  expiringSoonCount,
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={loading ? undefined : onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#00F0FF]/20 bg-[#0d0f17] p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#00F0FF]/10 text-[#00F0FF]">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-display uppercase tracking-wide">
                  Restore Project
                </h3>
                <p className="text-[10px] text-[#00F0FF] font-bold uppercase tracking-wider mt-0.5">
                  Select Restore Option
                </p>
              </div>
            </div>
            {!loading && (
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-500 hover:text-white hover:bg-white/5 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <p className="text-sm text-slate-300">
              You are restoring the project <span className="font-bold text-white">"{projectName}"</span>. This project contains <span className="font-bold text-[#00F0FF]">{deletedProductCount}</span> deleted product(s).
            </p>
          </div>

          {/* Warning banner for expiring products */}
          {expiringSoonCount > 0 && (
            <div className="mb-5 flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-300">Expiring Soon Warning</p>
                <p className="text-xs text-amber-300/80 mt-1 leading-relaxed">
                  {expiringSoonCount} of these products are expiring in less than 48 hours and will be permanently deleted unless restored.
                </p>
              </div>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {/* Option A Card */}
            <button
              onClick={() => !loading && onConfirm(false)}
              disabled={loading}
              className="w-full flex items-start gap-4 p-4 rounded-2xl border border-[#20293d] hover:border-[#00F0FF]/40 hover:bg-[#00F0FF]/5 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:border-[#00F0FF]/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 group-hover:bg-[#00F0FF]/10 group-hover:text-[#00F0FF] transition-colors mt-0.5">
                <FolderOpen className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-wider">
                  Option A: Restore Project Only
                </span>
                <span className="block text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Only the project structure is restored. The {deletedProductCount} product(s) will remain in the trash and can be restored individually later.
                </span>
              </div>
            </button>

            {/* Option B Card */}
            <button
              onClick={() => !loading && onConfirm(true)}
              disabled={loading}
              className="w-full flex items-start gap-4 p-4 rounded-2xl border border-[#20293d] hover:border-[#00F0FF]/40 hover:bg-[#00F0FF]/5 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed group focus:outline-none focus:border-[#00F0FF]/50"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400 group-hover:bg-[#00F0FF]/10 group-hover:text-[#00F0FF] transition-colors mt-0.5">
                <Layers className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-xs font-bold text-slate-200 group-hover:text-white transition-colors uppercase tracking-wider">
                  Option B: Restore Project & All Products
                </span>
                <span className="block text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Restores the project and all {deletedProductCount} associated products in a single action. This will also re-activate all of their QR codes.
                </span>
              </div>
            </button>
          </div>

          {/* Action Row */}
          {!loading ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-4 px-5 py-2.5 rounded-xl border border-[#20293d] bg-transparent text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider text-center"
            >
              Cancel
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 mt-5 py-2 text-xs font-semibold text-slate-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-[#00F0FF]" />
              <span>Restoring project...</span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
