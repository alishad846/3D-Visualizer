import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UploadCloud, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileUpload() {
  const { sessionId } = useParams();
  const [status, setStatus] = useState('idle'); // 'idle', 'processing', 'success'
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setStatus('processing');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dataUrl = event.target.result;
        // Save to local storage for the desktop session to pick up
        localStorage.setItem(`handoff_${sessionId}`, dataUrl);
        
        setTimeout(() => {
          setStatus('success');
        }, 1000); // Artificial delay for nice UX
      } catch (err) {
        console.error(err);
        alert("File is too large for LocalStorage prototype! Try a smaller file under 3MB.");
        setStatus('idle');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#00F0FF]/10 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">ScanVista Handoff</h1>
        <p className="text-slate-400 text-center text-sm mb-10">
          Upload a 3D model from your device to instantly send it to your desktop session.
        </p>

        {status === 'idle' && (
          <label className="flex flex-col items-center justify-center w-full aspect-square rounded-[36px] border-2 border-dashed border-[#00F0FF]/30 bg-[#00F0FF]/5 hover:bg-[#00F0FF]/10 transition-colors cursor-pointer p-8 text-center group">
            <div className="w-20 h-20 rounded-full bg-[#00F0FF]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-10 h-10 text-[#00F0FF]" />
            </div>
            <span className="text-lg font-bold mb-2">Select 3D Model</span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
              .GLB or .GLTF
            </span>
            <input 
              type="file" 
              accept=".glb,.gltf" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>
        )}

        {status === 'processing' && (
          <div className="flex flex-col items-center justify-center w-full aspect-square rounded-[36px] border border-white/10 bg-[#121622] p-8 text-center">
            <div className="w-16 h-16 border-4 border-[#00F0FF]/20 border-t-[#00F0FF] rounded-full animate-spin mb-6" />
            <h3 className="text-lg font-bold mb-2">Syncing File...</h3>
            <p className="text-sm text-slate-400 truncate w-full px-4">{fileName}</p>
          </div>
        )}

        {status === 'success' && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center w-full aspect-square rounded-[36px] border border-[#00F0FF]/30 bg-[#00F0FF]/10 p-8 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#00F0FF] flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,240,255,0.5)]">
              <CheckCircle className="w-10 h-10 text-black" />
            </div>
            <h3 className="text-2xl font-bold text-[#00F0FF] mb-2">Sent!</h3>
            <p className="text-sm text-white/80">
              You can now look back at your desktop screen.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
