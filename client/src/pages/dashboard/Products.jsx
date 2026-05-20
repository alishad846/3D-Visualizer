import React, { useState, useEffect } from 'react';
import { fetchProducts } from '../../api/products';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Grid, 
  List, 
  ChevronLeft, 
  ChevronRight, 
  Box, 
  Image as ImageIcon, 
  FileCode, 
  MoreHorizontal,
  Plus
} from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts().catch(e => {
          console.warn('Failed to load products, using default library only:', e);
          return [];
        });
        
        const finalProducts = Array.isArray(data) ? data : [];
        setProducts(finalProducts);
      } catch (err) {
        console.error('Products loading error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Screenshot mock files
  const defaultAssets = [
    {
      id: 'default-asset-1',
      name: 'Lunar_Rover_V2.glb',
      subBadge: '3D MODEL',
      badgeStyle: 'text-[#00F0FF] bg-[#00F0FF]/10',
      type: 'GLB Binary',
      size: '42.5 MB',
      lastModified: 'Oct 24, 2023',
      icon: Box
    },
    {
      id: 'default-asset-2',
      name: 'Carbon_Fiber_Normal.png',
      subBadge: 'TEXTURE',
      badgeStyle: 'text-blue-400 bg-blue-500/10',
      type: 'PNG Image',
      size: '8.2 MB',
      lastModified: 'Oct 23, 2023',
      icon: ImageIcon
    },
    {
      id: 'default-asset-3',
      name: 'ScanVista_Logo_Primary.svg',
      subBadge: 'BRAND',
      badgeStyle: 'text-slate-400 bg-slate-800/60',
      type: 'SVG Vector',
      size: '45 KB',
      lastModified: 'Oct 20, 2023',
      icon: FileCode
    },
    {
      id: 'default-asset-4',
      name: 'Neo_City_Sector_7.glb',
      subBadge: '3D MODEL',
      badgeStyle: 'text-[#00F0FF] bg-[#00F0FF]/10',
      type: 'GLB Binary',
      size: '1.2 GB',
      lastModified: 'Oct 19, 2023',
      icon: Box
    }
  ];

  // Dynamic products mapped from DB
  const mappedRealAssets = products.map((p) => ({
    id: p.id,
    name: p.name.includes('.') ? p.name : `${p.name.replace(/\s+/g, '_')}_V1.glb`,
    subBadge: '3D MODEL',
    badgeStyle: 'text-[#00F0FF] bg-[#00F0FF]/10',
    type: 'GLB Binary',
    size: p.price ? `${(parseFloat(p.price) / 10).toFixed(1)} MB` : '12.4 MB',
    lastModified: new Date(p.updated_at || p.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    icon: Box,
    isReal: true
  }));

  // Merge so real products are listed first, followed by default mockup files
  const displayAssets = [...mappedRealAssets, ...defaultAssets].filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Stats Summary Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Total Assets */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Total Assets
          </p>
          <h3 className="text-2xl font-black text-white font-display">
            {(1284 + products.length).toLocaleString()}
          </h3>
        </div>

        {/* Storage Used */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Storage Used
          </p>
          <h3 className="text-2xl font-black text-white font-display">
            {(14.2 + (products.length * 0.015)).toFixed(1)} GB
          </h3>
        </div>

        {/* 3D Models */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            3D Models
          </p>
          <h3 className="text-2xl font-black text-[#00F0FF] font-display">
            {412 + products.length}
          </h3>
        </div>

        {/* Processing */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Processing
            </p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-black text-white font-display">3</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F0FF] animate-ping" />
            </div>
          </div>
        </div>
      </div>

      {/* Main card list */}
      <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 shadow-md">
        {/* Search, filters, grid/list view */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#11192b] border border-[#1d2d4a] rounded-xl pl-11 pr-5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button className="bg-[#11192b] border border-[#1d2d4a] text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter
            </button>
            <button className="bg-[#11192b] border border-[#1d2d4a] text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort
            </button>

            {/* Layout Toggle Buttons */}
            <div className="flex bg-[#11192b] border border-[#1d2d4a] rounded-xl p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-[#1c2a44] text-[#00F0FF]' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'list' 
                    ? 'bg-[#1c2a44] text-[#00F0FF]' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* View Mode content */}
        {viewMode === 'list' ? (
          /* List Mode Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1a253c] text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pt-1">Name</th>
                  <th className="pb-3 pt-1">Type</th>
                  <th className="pb-3 pt-1">Size</th>
                  <th className="pb-3 pt-1">Last Modified</th>
                  <th className="pb-3 pt-1 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {displayAssets.map((asset) => {
                  const FileIcon = asset.icon;
                  return (
                    <tr 
                      key={asset.id} 
                      className="border-b border-[#16223b]/50 hover:bg-[#11192b]/40 text-slate-300 transition-all duration-150 group"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                            asset.subBadge === '3D MODEL'
                              ? 'bg-[#00F0FF]/5 border-[#00F0FF]/15 text-[#00F0FF] group-hover:border-[#00F0FF]/30'
                              : 'bg-[#11192b] border-[#1d2d4a] text-slate-400'
                          }`}>
                            <FileIcon className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white leading-tight">
                              {asset.name}
                            </p>
                            <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded mt-1.5 ${asset.badgeStyle}`}>
                              {asset.subBadge}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm font-semibold text-slate-400">{asset.type}</td>
                      <td className="py-4">
                        <span className="text-xs font-bold text-slate-300 bg-[#16223b] px-2.5 py-1 rounded-md border border-[#1f2f4e]/30">
                          {asset.size}
                        </span>
                      </td>
                      <td className="py-4 text-sm font-semibold text-slate-500">{asset.lastModified}</td>
                      <td className="py-4 text-center">
                        <button 
                          onClick={() => asset.isReal && navigate(`/edit-product/${asset.id}`)}
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
        ) : (
          /* Grid Mode cards */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayAssets.map((asset) => {
              const FileIcon = asset.icon;
              return (
                <div 
                  key={asset.id}
                  className="bg-[#0b101f] border border-[#1e2e4f]/70 rounded-xl p-5 hover:border-[#00F0FF]/30 transition-all group flex flex-col justify-between h-40"
                >
                  <div className="flex items-start justify-between">
                    <div className={`p-2.5 rounded-lg border ${
                      asset.subBadge === '3D MODEL'
                        ? 'bg-[#00F0FF]/5 border-[#00F0FF]/25 text-[#00F0FF]'
                        : 'bg-[#11192b] border-[#1d2d4a] text-slate-400'
                    }`}>
                      <FileIcon className="w-5 h-5" />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${asset.badgeStyle}`}>
                      {asset.subBadge}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white truncate">{asset.name}</p>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold pt-1">
                      <span>{asset.size}</span>
                      <span>{asset.lastModified}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination & Inner Footer inside main container card */}
        <div className="mt-8 pt-6 border-t border-[#1a253c]/40 flex flex-col lg:flex-row items-center justify-between gap-6">
          <p className="text-xs font-semibold text-slate-500 order-2 lg:order-1">
            Showing 1 to {displayAssets.length} of {(1284 + products.length).toLocaleString()} assets
          </p>

          {/* Page buttons */}
          <div className="flex items-center gap-1.5 order-1 lg:order-2">
            <button className="bg-[#11192b] border border-[#1d2d4a] text-slate-400 hover:text-white p-2 rounded-lg transition-all">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="bg-[#00F0FF]/10 border border-[#00F0FF]/40 text-[#00F0FF] text-xs font-bold w-8 h-8 rounded-lg">
              1
            </button>
            <button className="bg-[#11192b] border border-[#1d2d4a] text-slate-400 hover:text-white text-xs font-semibold w-8 h-8 rounded-lg transition-all">
              2
            </button>
            <button className="bg-[#11192b] border border-[#1d2d4a] text-slate-400 hover:text-white text-xs font-semibold w-8 h-8 rounded-lg transition-all">
              3
            </button>
            <span className="text-slate-600 px-1 text-xs">...</span>
            <button className="bg-[#11192b] border border-[#1d2d4a] text-slate-400 hover:text-white text-xs font-semibold w-8 h-8 rounded-lg transition-all">
              321
            </button>
            <button className="bg-[#11192b] border border-[#1d2d4a] text-slate-400 hover:text-white p-2 rounded-lg transition-all">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Footer Links */}
          <div className="flex gap-4 text-[11px] font-semibold text-slate-500 order-3">
            <a href="#" className="hover:text-slate-400 transition-colors">Help Center</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Feedback</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms</a>
            <span>© 2023 ScanVista Inc.</span>
          </div>
        </div>
      </div>
    </div>
  );
}