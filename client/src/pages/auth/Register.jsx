import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { View, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0055FF]/10 rounded-full blur-[100px] pointer-events-none" />

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

        <h2 className="text-3xl font-display font-semibold mb-2 text-center tracking-tight">Create Account</h2>
        <p className="text-[#888888] text-sm text-center mb-10">Start building your 3D product library</p>

        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-10"
          >
            <div className="w-16 h-16 bg-[#00F0FF]/20 rounded-full flex items-center justify-center mb-4">
              <div className="w-8 h-8 bg-[#00F0FF] rounded-full flex items-center justify-center text-black font-bold">✓</div>
            </div>
            <h3 className="text-xl font-display font-semibold mb-2 text-[#00F0FF]">Registered Successfully!</h3>
            <p className="text-[#888888] text-sm">Redirecting to login...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#555555] group-focus-within:text-[#00F0FF] transition-colors" />
                <input 
                  type="text" 
                  required
                  placeholder="Full Name" 
                  className="w-full bg-[#050505] border border-white/10 rounded-full py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00F0FF]/50 focus:ring-1 focus:ring-[#00F0FF]/50 transition-all text-white placeholder-[#555]"
                />
              </div>

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

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#00F0FF] text-black font-bold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-[#00D0DD] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        )}

        <p className="mt-8 text-center text-xs text-[#888888]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00F0FF] hover:underline font-medium">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}