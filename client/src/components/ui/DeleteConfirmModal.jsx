import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType = 'product', // 'project' | 'product'
  extraDetails = null
}) {
  const [typedName, setTypedName] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset input when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTypedName('');
      setIsDeleting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isMatched = typedName.trim().toLowerCase() === (itemName || '').toLowerCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMatched || isDeleting) return;

    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      console.error('Delete action failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const warningText =
    itemType === 'project'
      ? `This action will soft-delete the project "${itemName}" and all of its associated products, making them completely inactive. Scanning their QRs will show a product unavailable error. They will be scheduled for permanent deletion in 7 days.`
      : `This action will soft-delete the product "${itemName}". Scanning its QR code will immediately render it unavailable. The product and all its assets will be scheduled for permanent deletion in 7 days.`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-rose-500/20 bg-[#0d0f17] p-6 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white font-display uppercase tracking-wide">
                  Delete {itemType}
                </h3>
                <p className="text-[10px] text-rose-400 font-bold uppercase tracking-wider mt-0.5">
                  Dangerous Action
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Description / Warning */}
          <div className="mb-6 space-y-3">
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs leading-relaxed text-slate-300">
              {warningText}
            </div>
            {extraDetails && (
              <p className="text-xs text-slate-400">
                {extraDetails}
              </p>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Type <span className="text-white select-all font-mono font-black normal-case tracking-normal">{itemName}</span> to confirm
              </label>
              <input
                type="text"
                autoFocus
                required
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Enter item name..."
                className="w-full bg-[#131824] border border-[#20293d] focus:border-rose-500/50 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-[#20293d] bg-transparent text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isMatched || isDeleting}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md ${
                  isMatched && !isDeleting
                    ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white shadow-rose-950/20 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                }`}
              >
                {isDeleting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-white" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>{isDeleting ? 'Deleting...' : `Delete ${itemType}`}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
