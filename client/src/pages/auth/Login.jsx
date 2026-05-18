import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { View, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00F0FF]/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md p-8 md:p-12 bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl"
      >
        <div className="flex justify-center mb-8">
          <div className="text-xl font-display font-bold tracking-wider flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <View className="text-[#00F0FF] w-8 h-8" />
            <span>SCAN<span className="text-[#00F0FF]">VISTA</span></span>
          </div>
        </div>

        <h2 className="text-3xl font-display font-semibold mb-2 text-center tracking-tight">Welcome Back</h2>
        <p className="text-[#888888] text-sm text-center mb-10">Access your 3D product dashboard</p>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#00F0FF] transition-colors" />
              <input 
                type="email" 
                required
                placeholder="Email Address" 
                className="w-full bg-[#050505] border border-white/10 rounded-full py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 transition-all text-white placeholder-[#555]"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#00F0FF] transition-colors" />
              <input 
                type="password" 
                required
                placeholder="Password" 
                className="w-full bg-[#050505] border border-white/10 rounded-full py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 transition-all text-white placeholder-[#555]"
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-[#00F0FF]" />
              <span className="text-[#A0A0A0]">Remember me</span>
            </label>
            <a href="#" className="text-[#00F0FF] hover:underline">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#00F0FF] text-black font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#00D0DD] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/register')}
            className="w-full mt-4 bg-transparent text-[#00F0FF] border border-[#00F0FF]/50 font-bold py-4 rounded-full flex items-center justify-center hover:bg-[#00F0FF]/10 hover:border-[#00F0FF] transition-all"
          >
            Register
          </button>
        </form>
      </motion.div>
    </div>
  );
}