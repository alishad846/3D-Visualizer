import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Shield, 
  Camera, 
  Eye, 
  Settings,
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export default function Profile() {
  // Form states to ensure page isn't just static hardcoded HTML
  const [fullName, setFullName] = useState('Alex Chen');
  const [email, setEmail] = useState('alex.chen@scanvista.io');
  const [bio, setBio] = useState(
    'Specializing in high-fidelity 3D environment scans and technical architectural visualization for enterprise Metaverse applications.'
  );
  
  const [darkMode, setDarkMode] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [resolution, setResolution] = useState('4K UHD (Extreme)');

  const handleSaveChanges = (e) => {
    e.preventDefault();
    alert('Changes saved successfully! (Frontend demo only)');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Banner / Header Card */}
      <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-6 shadow-md">
        {/* Avatar with Camera overlay */}
        <div className="relative shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80" 
            alt="Alex Chen" 
            className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-[#00F0FF]/30 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
          />
          <button className="absolute -bottom-1 -right-1 bg-[#00F0FF] hover:bg-[#00D8E6] text-black p-2 rounded-xl transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* User description & badges */}
        <div className="flex-1 text-center md:text-left space-y-3">
          <div>
            <h2 className="text-2xl font-black text-white font-display">Alex Chen</h2>
            <p className="text-slate-400 text-sm font-medium mt-0.5">
              Senior 3D Artist & Technical Lead
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
            <span className="text-xs font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-full border border-[#00F0FF]/20 shadow-[0_0_8px_rgba(0,240,255,0.05)]">
              Active Pro
            </span>
            <span className="text-xs font-semibold text-slate-300 bg-slate-800/60 px-3 py-1 rounded-full flex items-center gap-1 border border-slate-700/30">
              <MapPin className="w-3 h-3 text-[#00F0FF]" />
              San Francisco, CA
            </span>
          </div>
        </div>

        {/* View public profile button */}
        <button className="md:self-center bg-transparent hover:bg-white/5 text-slate-200 hover:text-white border border-[#1e2e4f] hover:border-[#00F0FF]/40 font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
          View Public Profile
        </button>
      </div>

      {/* Grid: Personal Info Form & Preferences */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Personal Information (2/3 width) */}
        <div className="md:col-span-2 bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-2.5 mb-6 text-[#00F0FF] border-b border-[#1e2e4f] pb-4">
            <User className="w-5 h-5" />
            <h3 className="text-base font-black uppercase tracking-wider text-slate-100 font-display">
              Personal Information
            </h3>
          </div>

          <form onSubmit={handleSaveChanges} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white text-[#111] font-bold rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00F0FF] shadow-inner"
                  placeholder="Enter full name"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white text-[#111] font-bold rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00F0FF] shadow-inner"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Professional Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Professional Bio
              </label>
              <textarea 
                rows="4"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#060a14] border border-[#1e2e4f] rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all resize-none leading-relaxed"
                placeholder="Write a brief professional bio..."
              />
            </div>

            {/* Save Changes button */}
            <div className="flex justify-end pt-2">
              <button 
                type="submit"
                className="bg-[#00F0FF] hover:bg-[#00D8E6] text-[#050b14] font-black py-2.5 px-6 rounded-xl text-sm transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Preferences (1/3 width) */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6 text-[#00F0FF] border-b border-[#1e2e4f] pb-4">
              <Settings className="w-5 h-5" />
              <h3 className="text-base font-black uppercase tracking-wider text-slate-100 font-display">
                Preferences
              </h3>
            </div>

            <div className="space-y-6">
              {/* Dark Mode toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-200">Dark Mode</p>
                  <p className="text-xs text-slate-500 mt-0.5">Toggle visual theme</p>
                </div>
                <button 
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 flex items-center ${
                    darkMode ? 'bg-[#00F0FF]' : 'bg-slate-700'
                  }`}
                >
                  <span className={`w-4.5 h-4.5 rounded-full bg-[#050b14] transition-all duration-300 transform ${
                    darkMode ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Auto Sync toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-200">Auto-Sync</p>
                  <p className="text-xs text-slate-500 mt-0.5">Cloud backup active</p>
                </div>
                <button 
                  onClick={() => setAutoSync(!autoSync)}
                  className={`w-12 h-6.5 rounded-full p-1 transition-all duration-300 flex items-center ${
                    autoSync ? 'bg-[#00F0FF]' : 'bg-slate-700'
                  }`}
                >
                  <span className={`w-4.5 h-4.5 rounded-full bg-[#050b14] transition-all duration-300 transform ${
                    autoSync ? 'translate-x-5.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Default Resolution */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Default Resolution
                </label>
                <select 
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-[#060a14] border border-[#1e2e4f] text-slate-200 font-bold rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00F0FF] transition-all cursor-pointer"
                >
                  <option value="4K UHD (Extreme)">4K UHD (Extreme)</option>
                  <option value="1080p (Standard)">1080p (Standard)</option>
                  <option value="720p (Draft)">720p (Draft)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security & Authentication Card */}
      <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md">
        <div className="flex items-center gap-2.5 mb-6 text-[#00F0FF] border-b border-[#1e2e4f] pb-4">
          <Shield className="w-5 h-5" />
          <h3 className="text-base font-black uppercase tracking-wider text-slate-100 font-display">
            Security & Authentication
          </h3>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Recent Sessions
          </h4>
          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-4 bg-[#080e1a]/60 border border-[#131e33] rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-white">Chrome - San Francisco, CA</p>
                  <p className="text-xs text-slate-500 mt-0.5">Active session • Current Device</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#00F0FF] bg-[#00F0FF]/15 px-2.5 py-1 rounded-full">
                Active Now
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#080e1a]/20 border border-[#131e33]/50 rounded-xl text-slate-400">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                <div>
                  <p className="text-sm font-semibold">Safari - Oakland, CA</p>
                  <p className="text-xs text-slate-500 mt-0.5">2 days ago</p>
                </div>
              </div>
              <button className="text-xs text-red-400 hover:text-red-300 font-semibold p-1 hover:underline">
                Revoke
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-[#1e2e4f]/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
        <p>© 2023 ScanVista Inc.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-400 transition-colors">Help Center</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Feedback</a>
          <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}