import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Box, Eye, Download, TrendingUp, Zap, Clock, ArrowUpRight } from 'lucide-react';

export default function DashboardHome() {
  const navigate = useNavigate();

  const stats = [
    { label: 'Total Models', value: '12', icon: Box, change: '+3 this week', color: '#00F0FF' },
    { label: 'Total Views', value: '1,847', icon: Eye, change: '+24%', color: '#8B5CF6' },
    { label: 'Downloads', value: '342', icon: Download, change: '+12%', color: '#10B981' },
    { label: 'AR Sessions', value: '89', icon: Zap, change: '+8 today', color: '#F59E0B' },
  ];

  const recentModels = [
    { name: 'Vintage Bicycle', date: '2 hours ago', views: 234, status: 'Live' },
    { name: 'Smart Watch Pro', date: '1 day ago', views: 1089, status: 'Live' },
    { name: 'Ceramic Vase', date: '3 days ago', views: 412, status: 'Processing' },
    { name: 'Running Shoes X1', date: '5 days ago', views: 67, status: 'Draft' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Live': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Processing': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Draft': return 'bg-white/5 text-[#888] border-white/10';
      default: return '';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      {/* Welcome Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-display font-semibold mb-2">Welcome back 👋</h1>
          <p className="text-[#888] text-sm">Here's what's happening with your 3D models today.</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/new')}
          className="px-6 py-3 bg-[#00F0FF] text-black font-bold rounded-xl flex items-center gap-2 hover:bg-[#00D0DD] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
        >
          <Plus className="w-5 h-5" />
          New Model
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </span>
            </div>
            <p className="text-3xl font-display font-bold mb-1">{stat.value}</p>
            <p className="text-xs text-[#888]">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Recent Models */}
        <div className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-display font-semibold">Recent Models</h2>
            <button className="text-xs text-[#00F0FF] font-semibold hover:underline">View All</button>
          </div>

          <div className="space-y-3">
            {recentModels.map((model, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="flex items-center justify-between p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-xl cursor-pointer transition-all group"
                onClick={() => navigate('/view/demo')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF]/10 to-[#0055FF]/10 border border-[#00F0FF]/10 flex items-center justify-center">
                    <Box className="w-5 h-5 text-[#00F0FF]/60" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold group-hover:text-[#00F0FF] transition-colors">{model.name}</p>
                    <p className="text-xs text-[#666] flex items-center gap-2">
                      <Clock className="w-3 h-3" /> {model.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#888]">{model.views} views</span>
                  <span className={`text-xs px-3 py-1 rounded-full border ${getStatusStyle(model.status)}`}>
                    {model.status}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#555] group-hover:text-[#00F0FF] transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-display font-semibold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/new')}
                className="w-full flex items-center gap-3 p-4 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/15 border border-[#00F0FF]/20 rounded-xl transition-colors text-left"
              >
                <Plus className="w-5 h-5 text-[#00F0FF]" />
                <div>
                  <p className="text-sm font-semibold text-[#00F0FF]">Create 3D Model</p>
                  <p className="text-xs text-[#888]">Upload image & generate</p>
                </div>
              </button>
              <button
                onClick={() => navigate('/scan')}
                className="w-full flex items-center gap-3 p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-xl transition-colors text-left"
              >
                <Eye className="w-5 h-5 text-[#888]" />
                <div>
                  <p className="text-sm font-semibold">QR Scanner</p>
                  <p className="text-xs text-[#888]">Scan product codes</p>
                </div>
              </button>
            </div>
          </div>

          {/* Usage */}
          <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-display font-semibold mb-4">Plan Usage</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#888]">Models Created</span>
                  <span className="text-white font-medium">12 / 25</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00F0FF] to-[#0055FF] rounded-full" style={{ width: '48%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-[#888]">Storage Used</span>
                  <span className="text-white font-medium">2.4 GB / 5 GB</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] rounded-full" style={{ width: '48%' }} />
                </div>
              </div>
            </div>
            <button className="w-full mt-5 py-2.5 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-bold rounded-xl hover:bg-[#00F0FF]/10 transition-colors">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
