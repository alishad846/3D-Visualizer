import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { ScanLine, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

/** Resolve a scanned string into an in-app route, or null if unknown. */
export function resolveQrDestination(decodedText) {
  const raw = (decodedText || '').trim();
  if (!raw) return null;

  try {
    const url = raw.startsWith('http') ? new URL(raw) : new URL(raw, window.location.origin);
    const path = url.pathname;

    const tokenMatch = path.match(/\/s\/([^/]+)/);
    if (tokenMatch) return `/s/${tokenMatch[1]}`;

    const slugMatch = path.match(/\/p\/([^/]+)/);
    if (slugMatch) return `/p/${slugMatch[1]}`;

    const viewerMatch = path.match(/\/viewer\/([^/]+)/);
    if (viewerMatch) return `/p/${viewerMatch[1]}`;
  } catch {
    // not a URL — fall through
  }

  if (raw.startsWith('/s/') || raw.startsWith('/p/')) return raw;
  return null;
}

export default function QRScanner({ embedded = false }) {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (scanResult) return;

    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        aspectRatio: 1.0,
        videoConstraints: {
          facingMode: { ideal: "environment" }
        }
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setScanResult(decodedText);
        scanner.clear().catch(() => {});

        const route = resolveQrDestination(decodedText);
        setTimeout(() => {
          if (route) {
            navigate(route, { replace: true });
          } else {
            setError('This QR code is not a ScanVista product link.');
            setScanResult(null);
          }
        }, embedded ? 600 : 1200);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanResult, navigate, embedded]);

  const shellClass = embedded
    ? 'relative w-full min-h-[320px] flex flex-col items-center justify-center p-4'
    : 'relative w-screen h-screen bg-[#050b14] flex flex-col items-center justify-center text-white overflow-hidden';

  return (
    <div className={shellClass}>
      {!embedded && (
        <div className="absolute top-0 w-full p-6 flex justify-between z-50">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="p-3 rounded-full border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </button>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        {!embedded && (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">Scan product QR</h2>
            <p className="text-slate-400 text-sm">Point your camera at the code on the package</p>
          </div>
        )}

        <div className="relative w-full aspect-square max-w-[300px] border border-white/10 rounded-2xl overflow-hidden bg-black/60">
          {!scanResult ? (
            <div
              id="reader"
              className="w-full h-full [&>div]:border-none [&_video]:rounded-xl [&_video]:object-cover"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-cyan-400/10"
            >
              <ScanLine className="w-10 h-10 text-cyan-400 mb-2 animate-pulse" />
              <p className="text-sm font-semibold">Opening product…</p>
            </motion.div>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400 text-center max-w-xs">{error}</p>
        )}
      </div>

      <style>{`
        #reader { border: none !important; width: 100% !important; }
        #reader__dashboard_section_swaplink { display: none !important; }
        #reader button {
          background: rgba(255,255,255,0.08) !important;
          color: white !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 999px !important;
          margin-top: 8px !important;
        }
      `}</style>
    </div>
  );
}
