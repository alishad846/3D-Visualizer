import { QRCodeCanvas } from "qrcode.react";

export default function MobileHandoffModal({ isOpen, onClose, sessionId }) {
  if (!isOpen) return null;

  const mobileUrl = `${window.location.origin}/mobile-upload/${sessionId}`;

  return (
    <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-xl flex items-center justify-center font-sans">
      <div className="w-[420px] rounded-[36px] border border-cyan-400/20 bg-[#0b0c10] p-8 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white text-xl transition-colors"
        >
          ✕
        </button>

        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Upload from Mobile
          </h2>
          <p className="text-slate-400 mb-8 text-sm leading-relaxed max-w-[280px]">
            Scan this QR code with your phone's camera to seamlessly upload a 3D model directly to this session.
          </p>

          <div className="bg-white p-4 rounded-3xl w-fit mx-auto shadow-[0_0_40px_rgba(0,240,255,0.2)]">
            <QRCodeCanvas value={mobileUrl} size={220} />
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-cyan-400 text-xs font-bold uppercase tracking-widest animate-pulse">
              Waiting for upload...
            </p>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 w-full text-left">
            <p className="text-xs text-cyan-200 mb-1 font-bold uppercase">Pro Tip (Prototype):</p>
            <p className="text-xs text-cyan-400/80 leading-relaxed break-all">
              If your phone is not on the exact same localhost network, just copy this link and open it in a new tab on this PC to test the feature!
              <br/><br/>
              <span className="text-white/60 select-all">{mobileUrl}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
