import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, View } from 'lucide-react';
import SphereLogo from '../../components/SphereLogo';
import { requestPasswordReset } from '../../api/auth';

const SUCCESS_MESSAGE = 'If an account exists for this email, a password reset link has been sent.';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const data = await requestPasswordReset({ email });
      setMessage(data.message || SUCCESS_MESSAGE);
    } catch (err) {
      setError(err.message || 'Unable to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121214] text-white flex font-sans">
      <div className="hidden lg:flex w-1/2 bg-[#05050A] flex-col items-center justify-center relative overflow-hidden border-r border-white/5">
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
          transition={{ duration: 1, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-lg mt-20 px-12"
        >
          <SphereLogo className="w-[450px] h-[450px]" />
        </motion.div>
      </div>

      <div className="w-full lg:w-1/2 bg-[#1C1D21] flex flex-col items-center justify-center p-8 sm:p-12 lg:p-24 relative">
        <button
          onClick={() => navigate('/login')}
          className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2 text-sm font-medium text-[#888] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Login
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <h2 className="text-3xl font-display font-medium mb-4 text-center tracking-tight">Forgot Password</h2>
          <p className="text-[#A0A0A0] text-center text-sm mb-8">
            Enter your email and we will send a secure reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-transparent border border-[#3A3B40] rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all text-white placeholder-[#666]"
            />

            {message && (
              <p className="text-[#00F0FF] text-xs text-center leading-5">{message}</p>
            )}
            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00F0FF] text-black font-semibold py-3.5 rounded-xl flex items-center justify-center hover:bg-[#00D0DD] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-[15px]">Send Reset Link</span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-[#A0A0A0]">
            Remember your password?{' '}
            <Link to="/login" className="text-white hover:text-[#00F0FF] transition-colors font-medium">Log in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
