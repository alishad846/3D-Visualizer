import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { Search, ExternalLink, Edit3, Box, Globe, FolderOpen, Package, Heart, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

function relativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Favorites() {
  const { products, loadingProducts, activeProject, favorites, toggleFavorite: storeToggleFavorite } = useWorkspaceStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQRProduct, setSelectedQRProduct] = useState(null);

  const toggleFavorite = (e, id) => {
    e.stopPropagation();
    storeToggleFavorite(id);
  };

  const favoriteProducts = useMemo(
    () => products.filter(p => favorites.includes(p.id)),
    [products, favorites]
  );

  const filtered = useMemo(() => {
    let result = activeTab === 'all' ? favoriteProducts : [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [favoriteProducts, activeTab, searchQuery]);

  // ── No project selected ──────────────────────────────────────────────────
  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <div className="w-16 h-16 bg-[#0c1324] border border-[#1d2d4a] rounded-2xl flex items-center justify-center mb-6">
          <FolderOpen className="w-7 h-7 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Project Selected</h2>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          Select a project from the top bar to see its published products here.
        </p>
      </div>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loadingProducts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="animate-spin rounded-full border-[3px] border-slate-700 border-b-[#00F0FF] w-10 h-10" />
        <p className="mt-4 text-slate-400 text-sm font-medium">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-16">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Favorites</h2>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            Favorited products in <span className="text-slate-300">{activeProject.name}</span>
            {' '}&mdash; {favoriteProducts.length} items
          </p>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {[{ value: 'all', label: 'Favorites' }].map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`text-xs font-bold px-4 py-2 rounded-full transition-all border ${
                activeTab === tab.value
                  ? 'bg-[#152037] text-white border-[#00F0FF]/35 shadow-sm'
                  : 'text-slate-400 hover:text-white border-transparent hover:bg-white/5'
              }`}
            >
              {tab.label} ({favoriteProducts.length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#11192b] border border-[#1d2d4a] rounded-full pl-11 pr-5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] transition-all"
          />
        </div>
      </div>

      {/* ── Empty: no published products ── */}
      {favoriteProducts.length === 0 && (
        <div className="bg-[#0c1324] border-2 border-dashed border-[#1d2d4a] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-[#11192b] border border-[#1d2d4a] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart className="w-7 h-7 text-slate-600" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Favorites Yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed mb-6">
            Products you favorite from the library will appear here for quick access.
          </p>
          <button
            onClick={() => navigate('/dashboard/products')}
            className="bg-[#00F0FF] hover:bg-[#00D8E6] text-[#050b14] font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            Go to Products
          </button>
        </div>
      )}

      {/* ── Search returned nothing ── */}
      {favoriteProducts.length > 0 && filtered.length === 0 && (
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-12 text-center">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 font-semibold text-sm">No products match your search.</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-xs font-bold text-[#00F0FF] hover:underline"
          >
            Clear search
          </button>
        </div>
      )}

      {/* ── Published product cards ── */}
      {filtered.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(product => (
            <FavoriteProductCard 
              key={product.id} 
              product={product} 
              navigate={navigate}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={(e) => toggleFavorite(e, product.id)}
              onShowQR={(e) => { e.stopPropagation(); setSelectedQRProduct(product); }}
            />
          ))}
        </div>
      )}
      {/* ── QR Modal ── */}
      {selectedQRProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedQRProduct(null)}
        >
          <div 
            className="bg-[#0a1523] border border-[#1e2e4f] p-8 rounded-3xl max-w-sm w-full relative flex flex-col items-center shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedQRProduct(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/20 flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-6 h-6 text-[#00F0FF]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{selectedQRProduct.name}</h3>
              <p className="text-sm text-slate-400">Scan this QR code to view the product.</p>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center">
              <QRCodeSVG 
                value={`${window.location.origin}/p/${selectedQRProduct.slug}`} 
                size={200}
                fgColor="#000000"
                bgColor="#ffffff"
                level="H"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FavoriteProductCard({ product, navigate, isFavorite, onToggleFavorite, onShowQR }) {
  const hasThumbnail = !!product.thumbnail_url;

  return (
    <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl overflow-hidden shadow-md group hover:border-[#00F0FF]/30 transition-all duration-300 flex flex-col">

      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#080d1a] flex items-center justify-center">
        {hasThumbnail ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-700">
            <Box className="w-10 h-10" />
          </div>
        )}

        {/* Published/Draft badge */}
        <span className={`absolute top-3 left-3 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded border ${
          product.is_published 
            ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/25'
            : 'text-amber-400 bg-amber-400/10 border-amber-400/25'
        }`}>
          {product.is_published ? 'Live' : 'Draft'}
        </span>

        {/* View live button overlay */}
        {product.slug && (
          <a
            href={`/p/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10 text-white/70 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-all"
            title="View live page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Card content */}
      <div className="p-5 space-y-3 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="text-sm font-black text-white leading-tight">{product.name}</h3>
          {product.tagline && (
            <p className="text-xs text-slate-500 font-semibold mt-0.5 line-clamp-1">{product.tagline}</p>
          )}
        </div>

        {/* Stats: category + price */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#0f182f] border border-[#182645] rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Category</p>
            <p className="text-xs font-black text-white mt-0.5 truncate">
              {product.category || '—'}
            </p>
          </div>
          <div className="bg-[#0f182f] border border-[#182645] rounded-xl p-3 text-center">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Price</p>
            <p className="text-xs font-black text-white mt-0.5 truncate">
              {product.price
                ? `${product.currency || 'INR'} ${Number(product.price).toLocaleString()}`
                : '—'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#1a2540] flex items-center justify-between">
          <span className="text-[10px] text-slate-600 font-semibold">
            {product.brand || 'No brand'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleFavorite}
              className={`p-1.5 rounded-lg transition-all ${isFavorite ? 'text-rose-500 hover:bg-rose-500/10' : 'text-slate-500 hover:text-rose-400 hover:bg-[#1a263f]'}`}
              title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            {product.is_published && product.slug && (
              <button
                onClick={onShowQR}
                className="p-1.5 rounded-lg text-slate-500 hover:text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-all"
                title="View QR Code"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => navigate(`/edit-product/${product.id}`)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a263f] transition-all"
              title="Edit product"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
