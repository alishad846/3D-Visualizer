import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../../api/products';
import { fetchAnalytics } from '../../api/analytics';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShoppingBag,
  Cpu,
  MoreHorizontal,
  QrCode,
  ArrowUpRight,
  Headphones,
  FolderSync
} from 'lucide-react';

export default function DashboardHome() {
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Last Month');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productsData, analyticsData] = await Promise.all([
          fetchProducts().catch(e => {
            console.warn('Failed to fetch products, using fallback:', e);
            return [];
          }),
          fetchAnalytics().catch(e => {
            console.warn('Failed to fetch analytics, using fallback:', e);
            return {};
          })
        ]);

        // Guard against router returning placeholder objects instead of arrays
        const finalProducts = Array.isArray(productsData) ? productsData : [];
        const finalAnalytics = (analyticsData && typeof analyticsData === 'object' && !analyticsData.message)
          ? analyticsData
          : {};

        setProducts(finalProducts);
        setAnalytics(finalAnalytics);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
        console.error('Dashboard data loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Standard fallback/mock products matching the design in the screenshot
  const defaultProducts = [
    {
      id: 'default-sony-headphones',
      name: 'Sony WH-1000XM5',
      category: 'Premium Audio',
      scans: 1200,
      growth: '+$860',
      status: 'Active',
      updatedAt: '24 days ago',
      icon: Headphones
    },
    {
      id: 'default-quantum',
      name: 'Quantum Headphones Pro',
      category: 'Electronics • Audio',
      scans: 850,
      growth: '+$340',
      status: 'Active',
      updatedAt: '2 hours ago',
      icon: Headphones
    },
    {
      id: 'default-shoes',
      name: 'Nova Running Shoes',
      category: 'Fashion • Footwear',
      scans: 620,
      growth: '+$190',
      status: 'Active',
      updatedAt: '1 day ago',
      icon: FolderSync
    }
  ];

  // Merge backend products with fallback list. Real items show up at the top.
  const displayProducts = products.length > 0
    ? [
      ...products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category || 'Product Category',
        scans: p.scans || Math.floor(Math.random() * 300) + 15,
        growth: p.growth || `+$${Math.floor(Math.random() * 250) + 40}`,
        status: p.is_published ? 'Active' : 'Draft',
        // Human readable difference
        updatedAt: p.updated_at
          ? `${Math.floor((Date.now() - new Date(p.updated_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`
          : 'Just now',
        icon: FolderSync
      })),
      ...defaultProducts
    ]
    : defaultProducts;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full border-[3px] border-slate-700 border-b-[#00F0FF] w-10 h-10"></div>
        <p className="mt-4 text-slate-400 text-sm font-medium">Loading workspace data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#11192b]/50 border border-red-500/20 rounded-2xl p-8 text-center max-w-xl mx-auto">
        <h2 className="text-xl font-bold text-red-400 mb-2">Error Loading Dashboard</h2>
        <p className="text-slate-400 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 bg-[#00F0FF] text-[#050b14] font-black py-2.5 px-6 rounded-xl hover:bg-[#00D8E6] transition-all duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative pb-16">
      {/* Stats Summary row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Card 1: Total Owners */}
        <div className="bg-[#0c1324] border border-[#00F0FF] rounded-2xl p-6 relative overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.08)]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#00F0FF]/10 text-[#00F0FF] rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#10b981] bg-[#10b981]/15 px-2.5 py-1 rounded-full flex items-center gap-1">
              + 12.5%
            </span>
          </div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">
            Total owners
          </p>
          <h3 className="text-3xl font-black text-white font-display">
            1,433
          </h3>
        </div>

        {/* Card 2: Market Accounts */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] hover:border-[#00F0FF]/40 rounded-2xl p-6 transition-all duration-300 shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-[#10b981] bg-[#10b981]/15 px-2.5 py-1 rounded-full">
              + 100%
            </span>
          </div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase mb-1">
            Market accounts
          </p>
          <h3 className="text-3xl font-black text-white font-display">
            3,632
          </h3>
        </div>

        {/* Card 3: Network Health */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] hover:border-[#00F0FF]/40 rounded-2xl p-6 transition-all duration-300 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                Network Health
              </span>
              <div className="p-2.5 bg-[#00F0FF]/5 text-[#00F0FF] rounded-lg">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <h3 className="text-lg font-bold text-slate-100 font-display">
                All Systems Optimal
              </h3>
            </div>
          </div>
          {/* Neon Health Progress Bar */}
          <div className="w-full bg-[#16223b] h-1.5 rounded-full overflow-hidden">
            <div className="w-[88%] bg-gradient-to-r from-[#00F0FF] to-[#0055FF] h-full rounded-full shadow-[0_0_10px_rgba(0,240,255,0.6)]" />
          </div>
        </div>
      </div>

      {/* Middle row: Trends & Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Engagement Trends Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-100 font-display">
              Engagement Trends
            </h2>
            <div className="flex gap-2">
              {['Last Month', 'All Views'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all duration-200 ${activeTab === tab
                      ? 'bg-[#152037] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Wave Line Graph */}
          <div className="relative w-full h-[220px]">
            <svg
              viewBox="0 0 800 240"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Chart Gradient Fill */}
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="60" x2="800" y2="60" stroke="#16223b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="800" y2="120" stroke="#16223b" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="0" y1="180" x2="800" y2="180" stroke="#16223b" strokeWidth="1" strokeDasharray="3 3" />

              {/* Shaded Area Under Curve */}
              <path
                d="M 20,180 C 150,180 230,100 320,120 C 440,140 500,205 620,180 C 700,163 740,75 780,80 L 780,240 L 20,240 Z"
                fill="url(#chartGlow)"
              />

              {/* Smooth Glow Outline Path */}
              <path
                d="M 20,180 C 150,180 230,100 320,120 C 440,140 500,205 620,180 C 700,163 740,75 780,80"
                fill="none"
                stroke="#00F0FF"
                strokeWidth="4"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]"
              />
            </svg>
          </div>

          {/* X Axis Months */}
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 mt-4 px-2">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
          </div>
        </div>

        {/* Distribution Chart (1/3 width) */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md flex flex-col justify-between gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-display mb-6">
              Distribution
            </h2>

            {/* Category breakdown */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF]" />
                  <span className="text-sm font-semibold text-slate-300">3D Models</span>
                </div>
                <span className="text-sm font-bold text-white">64%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0055FF]" />
                  <span className="text-sm font-semibold text-slate-300">AR Experiences</span>
                </div>
                <span className="text-sm font-bold text-white">24%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#374151]" />
                  <span className="text-sm font-semibold text-slate-300">Video Renderings</span>
                </div>
                <span className="text-sm font-bold text-white">12%</span>
              </div>
            </div>
          </div>

          {/* Segmented bar */}
          <div className="w-full bg-[#16223b] h-3 rounded-full flex overflow-hidden">
            <div className="bg-[#00F0FF] h-full" style={{ width: '64%' }} />
            <div className="bg-[#0055FF] h-full" style={{ width: '24%' }} />
            <div className="bg-[#374151] h-full" style={{ width: '12%' }} />
          </div>

          {/* Top Category Performance Promo */}
          <div className="bg-[#0f192f] border-l-2 border-[#00F0FF] rounded-xl p-4">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
              Top Category Performance
            </p>
            <p className="text-sm font-bold text-[#00F0FF] flex items-center gap-1">
              +14% Growth this week
            </p>
          </div>
        </div>
      </div>

      {/* Bottom section: Active Products */}
      <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-100 font-display">
            Active Products
          </h2>
          <select
            className="bg-[#11192b] border border-[#1d2d4a] text-slate-300 text-xs font-semibold py-1.5 px-3 rounded-lg focus:outline-none focus:border-[#00F0FF] transition-all cursor-pointer"
            defaultValue="All Categories"
          >
            <option>All Categories</option>
            <option>Premium Audio</option>
            <option>Electronics</option>
            <option>Fashion</option>
          </select>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1a253c] text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 pt-1">Product Name</th>
                <th className="pb-3 pt-1">Scans</th>
                <th className="pb-3 pt-1">Growth</th>
                <th className="pb-3 pt-1">Status</th>
                <th className="pb-3 pt-1">Last Update</th>
                <th className="pb-3 pt-1 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {displayProducts.map((product) => {
                const ItemIcon = product.icon;
                return (
                  <tr
                    key={product.id}
                    className="border-b border-[#16223b]/50 hover:bg-[#11192b]/40 text-slate-300 transition-all duration-150 group"
                  >
                    {/* Name & Subtitle */}
                    <td className="py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 bg-[#11192b] border border-[#1d2d4a] text-[#00F0FF] rounded-xl flex items-center justify-center shadow-sm group-hover:border-[#00F0FF]/30 transition-all">
                          <ItemIcon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white leading-tight">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {product.category}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Scans */}
                    <td className="py-4 text-sm font-bold text-slate-200">
                      {product.scans.toLocaleString()}
                    </td>

                    {/* Growth */}
                    <td className="py-4 text-sm font-bold text-[#10b981]">
                      {product.growth}
                    </td>

                    {/* Status */}
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${product.status === 'Active' ? 'bg-[#10b981]' : 'bg-slate-500'
                          }`} />
                        <span className="text-xs font-semibold text-slate-300">
                          {product.status}
                        </span>
                      </div>
                    </td>

                    {/* Last Update */}
                    <td className="py-4 text-sm text-slate-500 font-semibold">
                      {product.updatedAt}
                    </td>

                    {/* Actions */}
                    <td className="py-4 text-center">
                      <button
                        onClick={() => navigate(`/edit-product/${product.id}`)}
                        className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-[#1a263f] transition-all"
                      >
                        <MoreHorizontal className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating QR Scanner Button */}
      <button
        onClick={() => navigate('/viewer')}
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-[#00F0FF] hover:bg-[#00D8E6] text-[#050b14] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.35)] hover:shadow-[0_0_30px_rgba(0,240,255,0.65)] hover:scale-105 transition-all duration-300 z-50 group"
        title="Open QR Code Scanner"
      >
        <QrCode className="w-6 h-6 transition-transform duration-300 group-hover:rotate-6" />
      </button>
    </div>
  );
}