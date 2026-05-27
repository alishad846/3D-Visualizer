import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { View } from 'lucide-react';
import SphereLogo from '../../components/SphereLogo';
import { registerUser } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export default function Register() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password });
      setAuth(data.accessToken, data.user);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] text-white flex font-sans">
      
      {/* Left Side - Hidden on smaller screens */}
      <div className="hidden lg:flex w-1/2 bg-[#05050A] flex-col items-center justify-center relative overflow-hidden border-r border-white/5">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00F0FF]/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="absolute top-16 flex flex-col items-center z-20">
          <div className="text-3xl font-display font-bold tracking-wide flex items-center gap-3 mb-3 cursor-pointer" onClick={() => navigate('/')}>
            <View className="text-white w-8 h-8" />
            <span>ScanVista</span>
          </div>
          <p className="text-[#A0A0A0] text-lg font-light tracking-wide">Bring your products to life</p>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 w-full max-w-lg mt-20 px-12"
        >
          <SphereLogo className="w-[450px] h-[450px]" />
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 bg-[#1C1D21] flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        
        {/* Toggle Switch */}
        <div className="absolute top-8 right-8 sm:top-12 sm:right-12 flex items-center gap-3 text-sm font-medium">
          <span className="text-[#888] hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/login')}>Login</span>
          <button 
            onClick={() => navigate('/login')} 
            className="w-12 h-6 bg-[#333] rounded-full relative flex items-center cursor-pointer transition-colors hover:bg-[#444]"
          >
            <div className="w-5 h-5 bg-[#00F0FF] rounded-full absolute right-0.5 shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all"></div>
          </button>
          <span className="text-[#00F0FF]">Register</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          <h2 className="text-3xl font-display font-medium mb-10 text-center tracking-tight">Create Account</h2>
          
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10"
            >
              <div className="w-16 h-16 bg-[#00F0FF]/10 rounded-full flex items-center justify-center mb-4">
                <div className="w-8 h-8 bg-[#00F0FF] rounded-full flex items-center justify-center text-black font-bold">✓</div>
              </div>
              <h3 className="text-xl font-display font-medium mb-2 text-[#00F0FF]">Account created</h3>
              <p className="text-[#A0A0A0] text-sm">Taking you to the dashboard…</p>
            </motion.div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-5">
                <div>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name" 
                    className="w-full bg-transparent border border-[#3A3B40] rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all text-white placeholder-[#666]"
                  />
                </div>

                <div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address" 
                    className="w-full bg-transparent border border-[#3A3B40] rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all text-white placeholder-[#666]"
                  />
                </div>
                
                <div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" 
                    className="w-full bg-transparent border border-[#3A3B40] rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all text-white placeholder-[#666]"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#00F0FF] text-black font-semibold py-3.5 rounded-xl flex items-center justify-center hover:bg-[#00D0DD] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="text-[15px]">Sign Up</span>
                )}
              </button>
            </form>
          )}
          
          <p className="mt-8 text-center text-[13px] text-[#A0A0A0]">
            Already have an account?{' '}
            <Link to="/login" className="text-white hover:text-[#00F0FF] transition-colors font-medium">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}