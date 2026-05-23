import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  MapPin, 
  MessageSquare, 
  ChevronDown, 
  Maximize2, 
  Search, 
  Download, 
  Plus,
  Check,
  RefreshCw
} from 'lucide-react';

export default function ProjectView() {
  const [timeRange, setTimeRange] = useState('Last 30 Days');
  const [comparison, setComparison] = useState('Compare to Prev.');
  const [toastMessage, setToastMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleDropdownChange = (setter, value) => {
    setter(value);
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Data refreshed successfully');
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in relative pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#00F0FF] text-black font-bold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.4)] animate-slide-in flex items-center gap-2">
          <Check className="w-5 h-5" />
          {toastMessage}
        </div>
      )}

      {/* Global Refresh Overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 z-40 bg-[#070b13]/50 backdrop-blur-[2px] rounded-2xl flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-[#00F0FF] animate-spin" />
        </div>
      )}

      {/* Dropdown filters aligned top right */}
      <div className="flex justify-end gap-3 -mt-4 mb-2 relative z-10">
        <div className="relative">
          <select 
            value={timeRange} 
            onChange={(e) => handleDropdownChange(setTimeRange, e.target.value)}
            disabled={isRefreshing}
            className="appearance-none bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs font-bold py-2.5 pl-4 pr-9 rounded-full focus:outline-none cursor-pointer transition-all hover:bg-[#00F0FF]/15 disabled:opacity-50"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last Year">Last Year</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#00F0FF] absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select 
            value={comparison} 
            onChange={(e) => handleDropdownChange(setComparison, e.target.value)}
            disabled={isRefreshing}
            className="appearance-none bg-[#11192b] border border-[#1d2d4a] text-slate-300 text-xs font-bold py-2.5 pl-4 pr-9 rounded-full focus:outline-none cursor-pointer transition-all hover:bg-[#1a263f] disabled:opacity-50"
          >
            <option value="Compare to Prev.">Compare to Prev.</option>
            <option value="Compare to Year">Compare to Year</option>
            <option value="None">None</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 transform -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Metric 1: AR Placement Accuracy */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              AR Placement Accuracy
            </span>
            <span className="text-[10px] font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-2 py-0.5 rounded border border-[#00F0FF]/15">
              +12.4%
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-white font-display">98.2</span>
            <span className="text-base text-slate-400 font-bold">%</span>
          </div>
          {/* Mini line chart */}
          <div className="w-full h-8 mt-2">
            <svg viewBox="0 0 300 40" className="w-full h-full" preserveAspectRatio="none">
              <path 
                d="M0,35 Q50,25 100,30 T200,10 T300,5" 
                fill="none" 
                stroke="#00F0FF" 
                strokeWidth="2" 
                className="drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]"
              />
            </svg>
          </div>
        </div>

        {/* Metric 2: Voice Assistant Success */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Voice Assistant Success
            </span>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/15">
              -2.1%
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-white font-display">84.7</span>
            <span className="text-base text-slate-400 font-bold">%</span>
          </div>
          {/* Mini line chart */}
          <div className="w-full h-8 mt-2">
            <svg viewBox="0 0 300 40" className="w-full h-full" preserveAspectRatio="none">
              <path 
                d="M0,10 C50,15 100,20 150,25 C200,30 250,32 300,35" 
                fill="none" 
                stroke="#475569" 
                strokeWidth="2" 
              />
            </svg>
          </div>
        </div>

        {/* Metric 3: Total Scans Originating */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total Scans Originating
            </span>
            <span className="text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/15">
              +44%
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-3xl font-black text-white font-display">12.4</span>
            <span className="text-base text-slate-400 font-bold">k</span>
          </div>
          {/* Segmented bar */}
          <div className="flex gap-1.5 mt-4 w-full">
            <div className="flex-1 bg-[#00F0FF] h-1.5 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
            <div className="flex-1 bg-[#00F0FF] h-1.5 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
            <div className="flex-1 bg-[#00F0FF] h-1.5 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
            <div className="flex-1 bg-[#00F0FF] h-1.5 rounded-full shadow-[0_0_8px_rgba(0,240,255,0.4)]" />
            <div className="flex-1 bg-slate-800 h-1.5 rounded-full" />
          </div>
        </div>
      </div>

      {/* Middle row: Conversion Funnel & Global Scan Origins Map */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversion Funnel (1/3 width) */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-100 font-display">
                Conversion Funnel
              </h3>
              <button className="text-slate-500 hover:text-white transition-colors">
                <Plus className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Funnel Steps */}
            <div className="space-y-5">
              {/* Step 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Scan Initiated</span>
                  <span>100%</span>
                </div>
                <div className="relative bg-slate-900 h-7 rounded-lg overflow-hidden border border-slate-800">
                  <div className="bg-[#00F0FF] h-full rounded-r shadow-[0_0_12px_rgba(0,240,255,0.25)] flex items-center justify-end px-3 transition-all duration-500" style={{ width: '100%' }}>
                    <span className="text-[10px] font-black text-black">12.4k</span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Cloud Processing</span>
                  <span>78%</span>
                </div>
                <div className="relative bg-slate-900 h-7 rounded-lg overflow-hidden border border-slate-800">
                  <div className="bg-[#00F0FF] h-full rounded-r shadow-[0_0_12px_rgba(0,240,255,0.25)] flex items-center justify-end px-3 transition-all duration-500" style={{ width: '78%' }}>
                    <span className="text-[10px] font-black text-black">9.6k</span>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>AR Visualization</span>
                  <span>54%</span>
                </div>
                <div className="relative bg-slate-900 h-7 rounded-lg overflow-hidden border border-slate-800">
                  <div className="bg-[#00F0FF] h-full rounded-r shadow-[0_0_12px_rgba(0,240,255,0.25)] flex items-center justify-end px-3 transition-all duration-500" style={{ width: '54%' }}>
                    <span className="text-[10px] font-black text-black">6.7k</span>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>Final Action</span>
                  <span>22%</span>
                </div>
                <div className="relative bg-slate-900 h-7 rounded-lg overflow-hidden border border-slate-800">
                  <div className="bg-[#00F0FF] h-full rounded-r shadow-[0_0_12px_rgba(0,240,255,0.25)] flex items-center justify-end px-3 transition-all duration-500" style={{ width: '22%' }}>
                    <span className="text-[10px] font-black text-black">2.7k</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Funnel Note */}
          <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-6 pt-4 border-t border-[#1e2e4f]/30">
            Drop-off rate at <span className="text-[#00F0FF]">Cloud Processing</span> is slightly higher this week due to local latency peaks in EMEA.
          </p>
        </div>

        {/* Global Scan Origins (2/3 width) */}
        <div className="lg:col-span-2 bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 z-10">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-100 font-display">
                Global Scan Origins
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Real-time heat density
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => showToast('Search focused (Simulated)')}
                className="bg-[#11192b] border border-[#1d2d4a] text-slate-400 hover:text-white p-2 rounded-lg transition-all"
              >
                <Search className="w-4 h-4" />
              </button>
              <button 
                onClick={() => showToast('Entered Fullscreen')}
                className="bg-[#11192b] border border-[#1d2d4a] text-slate-400 hover:text-white p-2 rounded-lg transition-all"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stylized high-tech vector world map */}
          <div className="w-full h-[240px] flex items-center justify-center my-2 relative">
            <svg 
              viewBox="0 0 600 240" 
              className="w-full h-full opacity-65"
              fill="none"
              stroke="#1d2d4a"
              strokeWidth="1"
            >
              {/* Simple stylized high-tech world continent vectors */}
              {/* North America */}
              <path d="M 50,40 C 90,30 110,60 120,80 C 130,100 100,120 70,110 Z" fill="#131e33" />
              {/* South America */}
              <path d="M 120,130 C 150,150 140,200 130,220 C 120,210 110,160 110,140 Z" fill="#131e33" />
              {/* Africa */}
              <path d="M 250,110 C 290,110 310,150 290,190 C 270,190 250,150 240,130 Z" fill="#131e33" />
              {/* Eurasia */}
              <path d="M 220,50 C 300,30 450,40 500,80 C 420,110 320,100 270,90 Z" fill="#131e33" />
              {/* Australia */}
              <path d="M 480,160 C 510,160 520,190 490,195 C 470,190 470,170 480,160 Z" fill="#131e33" />

              {/* Glowing flight/network arcs */}
              <path d="M 90,80 Q 200,30 280,130" stroke="#00F0FF" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
              <path d="M 280,130 Q 380,80 480,85" stroke="#0055ff" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <path d="M 90,80 Q 280,100 480,85" stroke="#00F0FF" strokeWidth="1" opacity="0.4" />

              {/* Hotspot Circles */}
              {/* SF/North America */}
              <circle cx="90" cy="80" r="7" fill="#00F0FF" fillOpacity="0.25" className="animate-ping" />
              <circle cx="90" cy="80" r="3.5" fill="#00F0FF" />

              {/* London/Europe */}
              <circle cx="280" cy="130" r="7" fill="#0055ff" fillOpacity="0.25" />
              <circle cx="280" cy="130" r="3.5" fill="#0055ff" />

              {/* Seoul/East Asia */}
              <circle cx="480" cy="85" r="7" fill="#00F0FF" fillOpacity="0.25" />
              <circle cx="480" cy="85" r="3.5" fill="#00F0FF" />
            </svg>

            {/* Floating Legend Block in bottom right */}
            <div className="absolute bottom-4 right-4 bg-[#080e1a]/95 border border-[#13223f] rounded-xl p-4 space-y-2 z-10 shadow-lg text-left">
              <div className="flex items-center gap-6 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                  <span className="text-slate-400">North America:</span>
                </div>
                <span className="text-white ml-auto">4,502</span>
              </div>
              <div className="flex items-center gap-6 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0055ff]" />
                  <span className="text-slate-400">Europe:</span>
                </div>
                <span className="text-white ml-auto">3,210</span>
              </div>
              <div className="flex items-center gap-6 text-[10px] font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-400">Asia Pacific:</span>
                </div>
                <span className="text-white ml-auto">1,894</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row Breakdown widgets */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Accuracy Breakdown */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md flex justify-between items-center">
          <div>
            <h4 className="text-sm font-black text-white font-display uppercase tracking-wider">
              Accuracy Breakdown
            </h4>
            <p className="text-xs text-slate-500 mt-1">Spatial vs Textural stability metrics</p>
          </div>
          <button className="bg-[#11192b] border border-[#1d2d4a] text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all">
            Weekly View
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Voice Intent Success */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md flex justify-between items-center">
          <div>
            <h4 className="text-sm font-black text-white font-display uppercase tracking-wider">
              Voice Intent Success
            </h4>
            <p className="text-xs text-slate-500 mt-1">Success rate by common items</p>
          </div>
          <button 
            onClick={() => showToast('Exporting CSV...')}
            className="bg-[#11192b] border border-[#1d2d4a] text-slate-400 hover:text-white p-2.5 rounded-xl hover:bg-[#1a263f] transition-all"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Cyan Action Button */}
      <button 
        onClick={() => showToast('New deep analysis task created!')}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-[#00F0FF] hover:bg-[#00D8E6] text-[#050b14] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_30px_rgba(0,240,255,0.65)] hover:scale-105 transition-all duration-300 z-50 group font-bold"
      >
        <Plus className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
      </button>

      {/* Footer */}
      <footer className="pt-8 border-t border-[#1e2e4f]/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500 relative z-10">
        <p>© 2026 ScanVista Inc.</p>
        <div className="flex gap-6">
          <a href="#" onClick={e => e.preventDefault()} className="hover:text-slate-400 transition-colors">Help Center</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:text-slate-400 transition-colors">Feedback</a>
          <a href="#" onClick={e => e.preventDefault()} className="hover:text-slate-400 transition-colors">Terms of Service</a>
        </div>
      </footer>
    </div>
  );
}