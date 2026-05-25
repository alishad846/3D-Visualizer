import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../api/config';
import { ShieldAlert, RefreshCw, QrCode } from 'lucide-react';

export default function QRRedirector() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid QR token.');
      return;
    }

    const logAndRedirect = async () => {
      try {
        const response = await fetch(`${BASE_URL}/viewer/qr/${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to resolve QR redirect link.');
        }

        // Navigate replace to the public product slug page
        if (data.slug) {
          navigate(`/p/${data.slug}`, { replace: true });
        } else if (data.product_id) {
          navigate(`/p/${data.product_id}`, { replace: true });
        } else {
          throw new Error('Redirect destination unresolved.');
        }
      } catch (err) {
        console.error('QR redirect error:', err);
        setError(err.message || 'Unable to scan QR code.');
      }
    };

    logAndRedirect();
  }, [token, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b13] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,#0f2c3d,transparent_55%)]" />
          <div className="absolute top-20 left-20 w-[420px] h-[420px] bg-red-500/5 blur-[120px] rounded-full" />
        </div>

        <div className="bg-[#0b121e]/80 border border-red-500/20 max-w-md w-full rounded-3xl p-8 shadow-2xl backdrop-blur-md flex flex-col items-center">
          <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black mb-2">QR Code Resolution Error</h2>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#11192b] border border-[#1d2d4a] hover:bg-[#1a263f] text-slate-300 hover:text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Go to ScanVista Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,#13254f,transparent_60%)]" />
        <div className="absolute top-20 left-20 w-[420px] h-[420px] bg-cyan-500/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div className="w-16 h-16 bg-[#00F0FF]/10 text-[#00F0FF] rounded-2xl flex items-center justify-center border border-[#00F0FF]/25 shadow-[0_0_30px_rgba(0,240,255,0.2)] relative">
          <QrCode className="w-8 h-8" />
          <div className="absolute inset-0 border border-[#00F0FF]/40 rounded-2xl animate-ping opacity-25" />
        </div>
        
        <div>
          <h2 className="text-lg font-bold tracking-wide">Syncing ScanVista Security</h2>
          <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1.5 justify-center">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00F0FF]" /> Logging secure redirect analytics...
          </p>
        </div>
      </div>
    </div>
  );
}
