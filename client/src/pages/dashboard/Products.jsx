import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import {
  Search, Grid, List, Plus, Box,
  Edit3, ExternalLink, ChevronLeft, ChevronRight,
  Package, FolderOpen, CheckCircle2, Clock
} from 'lucide-react';

const PAGE_SIZE = 10;

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

function formatPrice(price, currency) {
  if (!price) return null;
  return `${currency || 'INR'} ${Number(price).toLocaleString()}`;
}

export default function Products() {
  const { products, loadingProducts, activeProject } = useWorkspaceStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modelFilter, setModelFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [page, setPage] = useState(1);

  // Derive unique categories from real data only
  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  }, [products]);

  // Real stats derived from actual products
  const publishedCount = useMemo(() => products.filter(p => p.is_published).length, [products]);
  const draftCount = useMemo(() => products.filter(p => !p.is_published).length, [products]);
  const withModelCount = useMemo(() => products.filter(p => !!p.model_url).length, [products]);

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || modelFilter !== 'all';

  const filtered = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.tagline || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }

    if (statusFilter === 'published') result = result.filter(p => p.is_published);
    else if (statusFilter === 'draft') result = result.filter(p => !p.is_published);

    if (modelFilter === 'has_model') result = result.filter(p => !!p.model_url);
    else if (modelFilter === 'no_model') result = result.filter(p => !p.model_url);

    switch (sortBy) {
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'name_asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name_desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      default: // newest
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return result;
  }, [products, searchQuery, categoryFilter, statusFilter, modelFilter, sortBy]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, total);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setModelFilter('all');
    setSortBy('newest');
    setPage(1);
  };

  const goToPage = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

  // ── No project selected ──────────────────────────────────────────────────
  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <div className="w-16 h-16 bg-[#0c1324] border border-[#1d2d4a] rounded-2xl flex items-center justify-center mb-6">
          <FolderOpen className="w-7 h-7 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Project Selected</h2>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          Select a project from the top bar to browse and manage its products.
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
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-16">

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white leading-tight">{activeProject.name}</h2>
          <p className="text-slate-400 text-xs mt-1 font-semibold">
            {products.length} product{products.length !== 1 ? 's' : ''} in this project
          </p>
        </div>
        <button
          onClick={() => navigate('/add-product')}
          className="shrink-0 bg-[#00F0FF] hover:bg-[#00D8E6] text-[#050b14] font-black py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.35)]"
        >
          <Plus className="w-4 h-4 stroke-[3px]" />
          New Product
        </button>
      </div>

      {/* Real Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={products.length} color="text-white" />
        <StatCard label="Published" value={publishedCount} color="text-[#10b981]" />
        <StatCard label="Drafts" value={draftCount} color="text-amber-400" />
        <StatCard label="With 3D Model" value={withModelCount} color="text-[#00F0FF]" />
      </div>

      {/* Search + Filters */}
      <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, brand, SKU, tagline..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-[#11192b] border border-[#1d2d4a] rounded-xl pl-11 pr-5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00F0FF] transition-all"
            />
          </div>

          {/* Filter controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status */}
            <FilterSelect
              value={statusFilter}
              onChange={v => { setStatusFilter(v); setPage(1); }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
              ]}
            />

            {/* Category — only shown if any products have a category */}
            {categories.length > 0 && (
              <FilterSelect
                value={categoryFilter}
                onChange={v => { setCategoryFilter(v); setPage(1); }}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...categories.map(c => ({ value: c, label: c })),
                ]}
              />
            )}

            {/* 3D Model */}
            <FilterSelect
              value={modelFilter}
              onChange={v => { setModelFilter(v); setPage(1); }}
              options={[
                { value: 'all', label: 'All Assets' },
                { value: 'has_model', label: 'Has 3D Model' },
                { value: 'no_model', label: 'No 3D Model' },
              ]}
            />

            {/* Sort */}
            <FilterSelect
              value={sortBy}
              onChange={v => { setSortBy(v); setPage(1); }}
              options={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'name_asc', label: 'Name A → Z' },
                { value: 'name_desc', label: 'Name Z → A' },
              ]}
            />

            {/* View toggle */}
            <div className="flex bg-[#11192b] border border-[#1d2d4a] rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[#1c2a44] text-[#00F0FF]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="List view"
                className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-[#1c2a44] text-[#00F0FF]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[10px] font-bold text-slate-500 hover:text-rose-400 uppercase tracking-wider transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Empty: no products at all ── */}
      {products.length === 0 && (
        <div className="bg-[#0c1324] border-2 border-dashed border-[#1d2d4a] rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-[#11192b] border border-[#1d2d4a] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-7 h-7 text-slate-500" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Products Yet</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto leading-relaxed mb-6">
            This project doesn't have any products. Create your first one to get started.
          </p>
          <button
            onClick={() => navigate('/add-product')}
            className="bg-[#00F0FF] hover:bg-[#00D8E6] text-[#050b14] font-black py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
          >
            Create First Product
          </button>
        </div>
      )}

      {/* ── Empty: filters returned nothing ── */}
      {products.length > 0 && total === 0 && (
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-12 text-center">
          <Search className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-white mb-2">No products match your filters</h3>
          <p className="text-slate-400 text-sm mb-5">Try adjusting your search or filter criteria.</p>
          <button
            onClick={resetFilters}
            className="bg-[#11192b] border border-[#1d2d4a] hover:border-[#00F0FF]/40 text-slate-300 hover:text-white font-bold py-2 px-5 rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* ── Product Grid ── */}
      {viewMode === 'grid' && paged.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map(product => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}
          {/* Dashed "Add Product" card — always last in the grid */}
          <button
            onClick={() => navigate('/add-product')}
            className="bg-[#0b101f] border-2 border-dashed border-[#1d2d4a] hover:border-[#00F0FF]/40 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all group min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#11192b] border border-[#1d2d4a] group-hover:border-[#00F0FF]/30 flex items-center justify-center transition-all">
              <Plus className="w-5 h-5 text-slate-500 group-hover:text-[#00F0FF] transition-colors" />
            </div>
            <p className="text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors uppercase tracking-wider">
              Add Product
            </p>
          </button>
        </div>
      )}

      {/* ── Product List ── */}
      {viewMode === 'list' && paged.length > 0 && (
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1a253c] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-5">Product</th>
                <th className="py-3 px-5 hidden md:table-cell">Category</th>
                <th className="py-3 px-5 hidden lg:table-cell">Brand</th>
                <th className="py-3 px-5 hidden lg:table-cell">Price</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 hidden md:table-cell">Updated</th>
                <th className="py-3 px-5 w-20" />
              </tr>
            </thead>
            <tbody>
              {paged.map(product => (
                <ProductListRow key={product.id} product={product} navigate={navigate} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pagination ── */}
      {total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-400">
            {from}–{to} of {total} product{total !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(safePage - 1)}
              disabled={safePage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#11192b] border border-[#1d2d4a] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-300 min-w-[80px] text-center">
              Page {safePage} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(safePage + 1)}
              disabled={safePage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#11192b] border border-[#1d2d4a] text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function StatCard({ label, value, color }) {
  return (
    <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-xl p-4">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <h3 className={`text-2xl font-black ${color}`}>{value}</h3>
    </div>
  );
}

function FilterSelect({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="appearance-none bg-[#11192b] border border-[#1d2d4a] text-slate-300 text-xs font-semibold py-2.5 px-4 rounded-xl focus:outline-none focus:border-[#00F0FF] transition-all cursor-pointer"
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function StatusBadge({ isPublished }) {
  return (
    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
      isPublished
        ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/25'
        : 'text-amber-400 bg-amber-400/10 border-amber-400/25'
    }`}>
      {isPublished ? 'Published' : 'Draft'}
    </span>
  );
}

function relativeTimeInternal(dateStr) {
  return relativeTime(dateStr);
}

function ProductCard({ product, navigate }) {
  const isPublished = product.is_published;
  const hasModel = !!product.model_url;
  const hasThumbnail = !!product.thumbnail_url;

  return (
    <div className="bg-[#0c1324] border border-[#1e2e4f] hover:border-[#00F0FF]/30 rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col shadow-sm hover:shadow-[0_4px_24px_rgba(0,240,255,0.06)]">
      {/* Thumbnail area */}
      <div className="relative aspect-video bg-[#080d1a] flex items-center justify-center overflow-hidden">
        {hasThumbnail ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-700">
            <Box className="w-10 h-10" />
            <span className="text-[9px] font-bold uppercase tracking-wider">No thumbnail</span>
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3">
          <StatusBadge isPublished={isPublished} />
        </div>
        {hasModel && (
          <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border text-[#00F0FF] bg-[#00F0FF]/10 border-[#00F0FF]/25">
            3D
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1 space-y-1.5">
          <h3 className="text-sm font-black text-white leading-tight truncate">{product.name}</h3>
          {product.tagline && (
            <p className="text-xs text-slate-500 leading-relaxed line-clamp-1">{product.tagline}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap pt-0.5">
            {product.category && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#11192b] border border-[#1d2d4a] text-slate-400">
                {product.category}
              </span>
            )}
            {product.brand && (
              <span className="text-[10px] text-slate-500 font-semibold">{product.brand}</span>
            )}
          </div>
          {product.price && (
            <p className="text-sm font-black text-white pt-1">
              {product.currency || 'INR'} {Number(product.price).toLocaleString()}
            </p>
          )}
        </div>

        {/* Footer actions */}
        <div className="mt-4 pt-3 border-t border-[#182030] flex items-center justify-between">
          <span className="text-[10px] text-slate-600 font-semibold">
            {relativeTime(product.updated_at || product.created_at)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate(`/edit-product/${product.id}`)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a263f] transition-all"
              title="Edit product"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            {isPublished && product.slug && (
              <a
                href={`/p/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-slate-500 hover:text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-all"
                title="View live page"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductListRow({ product, navigate }) {
  const isPublished = product.is_published;
  return (
    <tr className="border-b border-[#16223b]/50 hover:bg-[#11192b]/40 transition-all">
      <td className="py-4 px-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#11192b] border border-[#1d2d4a] flex items-center justify-center shrink-0 overflow-hidden">
            {product.thumbnail_url
              ? <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
              : <Box className="w-4 h-4 text-slate-500" />
            }
          </div>
          <div>
            <p className="text-sm font-bold text-white truncate max-w-[160px]">{product.name}</p>
            {product.sku && <p className="text-[10px] text-slate-500 font-semibold">SKU: {product.sku}</p>}
          </div>
        </div>
      </td>
      <td className="py-4 px-5 hidden md:table-cell">
        <span className="text-xs text-slate-400 font-semibold">{product.category || '—'}</span>
      </td>
      <td className="py-4 px-5 hidden lg:table-cell">
        <span className="text-xs text-slate-400 font-semibold">{product.brand || '—'}</span>
      </td>
      <td className="py-4 px-5 hidden lg:table-cell">
        <span className="text-xs font-bold text-white">
          {product.price
            ? `${product.currency || 'INR'} ${Number(product.price).toLocaleString()}`
            : '—'}
        </span>
      </td>
      <td className="py-4 px-5">
        <StatusBadge isPublished={isPublished} />
      </td>
      <td className="py-4 px-5 hidden md:table-cell">
        <span className="text-xs text-slate-500 font-semibold">
          {relativeTime(product.updated_at || product.created_at)}
        </span>
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate(`/edit-product/${product.id}`)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-[#1a263f] transition-all"
            title="Edit"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {isPublished && product.slug && (
            <a
              href={`/p/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-all"
              title="View Live"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}