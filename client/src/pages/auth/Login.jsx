import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { View, ArrowLeft } from 'lucide-react';
import SphereLogo from '../../components/SphereLogo';
import { loginUser } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      setAuth(data.accessToken, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResetSent(true);
    }, 1500);
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
        
        {/* Back to Home Button */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 text-sm font-medium text-[#888] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </button>

        {/* Toggle Switch */}
        <div className="absolute top-8 right-8 sm:top-12 sm:right-12 flex items-center gap-3 text-sm font-medium">
          <span className="text-[#00F0FF]">Login</span>
          <button 
            onClick={() => navigate('/register')} 
            className="w-12 h-6 bg-[#333] rounded-full relative flex items-center cursor-pointer transition-colors hover:bg-[#444]"
          >
            <div className="w-5 h-5 bg-[#00F0FF] rounded-full absolute left-0.5 shadow-[0_0_10px_rgba(0,240,255,0.4)] transition-all"></div>
          </button>
          <span className="text-[#888] hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/register')}>Register</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          {forgotPasswordMode ? (
            <>
              <h2 className="text-3xl font-display font-medium mb-4 text-center tracking-tight">Reset Password</h2>
              <p className="text-[#A0A0A0] text-center text-sm mb-8">
                {resetSent 
                  ? "Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder."
                  : "Enter your email address and we'll send you a link to reset your password."}
              </p>

              {!resetSent ? (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <input 
                      type="email" 
                      required
                      placeholder="Email Address" 
                      className="w-full bg-transparent border border-[#3A3B40] rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all text-white placeholder-[#666]"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-[#00F0FF] text-black font-semibold py-3.5 rounded-xl flex items-center justify-center hover:bg-[#00D0DD] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-[15px]">Send Reset Link</span>
                    )}
                  </button>
                </form>
              ) : (
                <button 
                  onClick={() => { setForgotPasswordMode(false); setResetSent(false); }}
                  className="w-full bg-[#333] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center hover:bg-[#444] transition-all mt-4"
                >
                  Return to Login
                </button>
              )}
              
              {!resetSent && (
                <p className="mt-8 text-center text-[13px] text-[#A0A0A0]">
                  Remember your password?{' '}
                  <button onClick={() => setForgotPasswordMode(false)} className="text-white hover:text-[#00F0FF] transition-colors font-medium cursor-pointer">Log In</button>
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className="text-3xl font-display font-medium mb-10 text-center tracking-tight">Welcome Back</h2>
              
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-5">
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

                <div className="flex justify-end text-xs">
                  <button type="button" onClick={() => setForgotPasswordMode(true)} className="text-[#A0A0A0] hover:text-white transition-colors cursor-pointer">Forgot password?</button>
                </div>

                {error && (
                  <p className="text-red-400 text-xs text-center -mt-2">{error}</p>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#00F0FF] text-black font-semibold py-3.5 rounded-xl flex items-center justify-center hover:bg-[#00D0DD] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="text-[15px]">Sign In</span>
                  )}
                </button>
              </form>
              
              <p className="mt-8 text-center text-[13px] text-[#A0A0A0]">
                Don't have an account?{' '}
                <Link to="/register" className="text-white hover:text-[#00F0FF] transition-colors font-medium">Register</Link>
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}