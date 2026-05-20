import React, { useState } from 'react';
import { Heart, Search, Layers, Compass, Zap, Map } from 'lucide-react';

export default function Favorites() {
  const [activeTab, setActiveTab] = useState('All Projects');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial favorites data matching Screenshot 2
  const [favorites, setFavorites] = useState([
    {
      id: 'fav-1',
      title: 'Industrial Turbine v4',
      time: 'Last edited 2h ago',
      status: 'COMPLETED',
      statusColor: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/25',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
      type: '3D Assets',
      stats: [
        { label: 'DENSITY', value: '4.2M', unit: 'pts' },
        { label: 'ACCURACY', value: '99.8', unit: '%' }
      ],
      isFavorite: true
    },
    {
      id: 'fav-2',
      title: 'Neo-Seoul Complex',
      time: 'Last edited 1d ago',
      status: 'IN REVIEW',
      statusColor: 'text-[#0055ff] bg-[#0055ff]/10 border-[#0055ff]/25',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
      type: 'Recent',
      stats: [
        { label: 'LAYERS', value: '24', unit: 'lvls' },
        { label: 'SCALE', value: '1:500', unit: '' }
      ],
      isFavorite: true
    },
    {
      id: 'fav-3',
      title: 'PCB Thermal Map',
      time: 'Last edited 3d ago',
      status: 'COMPLETED',
      statusColor: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/25',
      image: 'https://images.unsplash.com/photo-1608978147841-e67f65c37baf?auto=format&fit=crop&w=400&q=80',
      type: '3D Assets',
      stats: [
        { label: 'HOTSPOTS', value: '12', unit: 'crit' },
        { label: 'VARIANCE', value: '0.05', unit: '' }
      ],
      isFavorite: true
    },
    {
      id: 'fav-4',
      title: 'Alpine Range LiDAR',
      time: 'Last edited 5m ago',
      status: 'SCANNING',
      statusColor: 'text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/25',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      type: 'Recent',
      stats: [
        { label: 'PROGRESS', value: '67', unit: '%' },
        { label: 'AREA', value: '12k', unit: 'm²' }
      ],
      isFavorite: true
    }
  ]);

  const toggleFavorite = (id) => {
    setFavorites(favorites.map(item => 
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  // Filter items by tab selection and search query
  const filteredFavorites = favorites.filter(item => {
    const matchesTab = activeTab === 'All Projects' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      {/* Search and Filters row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {['All Projects', 'Recent', '3D Assets'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-all duration-200 border ${
                activeTab === tab
                  ? 'bg-[#152037] text-white border-[#00F0FF]/35 shadow-sm'
                  : 'text-slate-400 hover:text-white border-transparent hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-4.5 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#11192b] border border-[#1d2d4a] rounded-full pl-11 pr-5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] transition-all"
          />
        </div>
      </div>

      {/* Favorites Grid */}
      {filteredFavorites.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredFavorites.map((item) => (
            <div 
              key={item.id}
              className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl overflow-hidden shadow-md group hover:border-[#00F0FF]/40 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Asset Graphic / Card Image Area */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                
                {/* Status Badge */}
                <span className={`absolute top-4 left-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${item.statusColor}`}>
                  {item.status}
                </span>

                {/* Heart Favorite button */}
                <button 
                  onClick={() => toggleFavorite(item.id)}
                  className={`absolute top-4 right-4 p-2 rounded-xl backdrop-blur-md border transition-all ${
                    item.isFavorite 
                      ? 'bg-[#00F0FF]/15 border-[#00F0FF]/30 text-[#00F0FF]' 
                      : 'bg-black/40 border-white/10 text-white/70 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-[#00F0FF]' : ''}`} />
                </button>
              </div>

              {/* Text info and stats details */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-white leading-tight font-display">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    {item.time}
                  </p>
                </div>

                {/* Bottom Stats details */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {item.stats.map((stat) => (
                    <div 
                      key={stat.label} 
                      className="bg-[#0f182f] border border-[#182645] rounded-xl p-3 text-center"
                    >
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        {stat.label}
                      </p>
                      <p className="text-sm font-black text-white font-display mt-0.5">
                        {stat.value}
                        {stat.unit && (
                          <span className="text-[10px] text-slate-400 font-bold ml-0.5 uppercase">
                            {stat.unit}
                          </span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#11192b]/40 border border-[#1e2e4f]/60 rounded-2xl p-12 text-center">
          <Heart className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold text-sm">No favorites found matching query.</p>
        </div>
      )}

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
