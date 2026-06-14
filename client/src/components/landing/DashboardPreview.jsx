import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchPublicAnalytics } from '../../api/viewer';

const FALLBACK_DATA = [
  { name: 'Mon', scans: 40, ar: 24 },
  { name: 'Tue', scans: 30, ar: 13 },
  { name: 'Wed', scans: 20, ar: 9 },
  { name: 'Thu', scans: 27, ar: 19 },
  { name: 'Fri', scans: 18, ar: 8 },
  { name: 'Sat', scans: 23, ar: 18 },
  { name: 'Sun', scans: 34, ar: 23 },
];

export default function DashboardPreview() {
  const [chartData, setChartData] = useState(FALLBACK_DATA);
  const [stats, setStats] = useState({ totalScans: 0, arSessions: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchPublicAnalytics();
        if (data && data.chartData && data.chartData.length > 0) {
          // If the DB is completely empty (no scans at all), fallback data looks better for a landing page demo.
          const hasScans = data.chartData.some(d => d.scans > 0);
          if (hasScans) {
            setChartData(data.chartData);
          }
          
          setStats({
            totalScans: data.totalScans,
            arSessions: data.chartData.reduce((acc, curr) => acc + curr.ar, 0)
          });
        }
      } catch (err) {
        console.error('Failed to load dashboard analytics', err);
      }
    };
    loadData();
  }, []);

  return (
    <section className="py-32 bg-[#02050a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left: Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Actionable Insights</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
            Track what happens <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">after the scan.</span>
          </h2>
          
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Stop guessing. See exactly which products are driving engagement, how many users open AR mode, and where conversions happen in real-time.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-display font-bold text-white mb-1">2.4x</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">Engagement</div>
            </div>
            <div>
              <div className="text-3xl font-display font-bold text-white mb-1">45%</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest font-bold">AR Conversion</div>
            </div>
          </div>
        </motion.div>

        {/* Right: Dashboard Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 50, rotateX: 10 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, type: "spring" }}
          style={{ perspective: 1000 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-rose-500 opacity-[0.05] rounded-full pointer-events-none" />
          
          <div className="relative z-10 bg-[#0a1523] border border-white/10 rounded-3xl p-6 shadow-2xl">
            {/* Mock Header */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center">
                  <div className="w-3 h-3 bg-rose-500 rounded-full" />
                </div>
                <div className="text-white font-bold">Analytics Overview</div>
              </div>
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
              </div>
            </div>

            {/* Mock Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Total Scans</div>
                <div className="text-xl font-bold text-white">{stats.totalScans}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">AR Sessions</div>
                <div className="text-xl font-bold text-white">{stats.arSessions}</div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Avg Time</div>
                <div className="text-xl font-bold text-white">01:24</div>
              </div>
            </div>

            {/* Recharts Chart */}
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#ffffff05'}}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="scans" fill="#00F0FF" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ar" fill="#b366ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
