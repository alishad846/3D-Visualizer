import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import {
  BarChart2,
  Package,
  Globe,
  FileEdit,
  FolderOpen,
  Layers,
  CheckCircle2,
  Clock,
  Box,
  Plus,
  ExternalLink
} from 'lucide-react';

function relativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function ProjectView() {
  const { projects, products, activeProject, loadingProducts } = useWorkspaceStore();
  const navigate = useNavigate();

  // Real derived stats
  const publishedProducts = useMemo(() => products.filter(p => p.is_published), [products]);
  const draftProducts = useMemo(() => products.filter(p => !p.is_published), [products]);
  const withModelProducts = useMemo(() => products.filter(p => !!p.model_url), [products]);
  const recentProducts = useMemo(
    () => [...products].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 5),
    [products]
  );

  // ── No project selected ──────────────────────────────────────────────────
  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <div className="w-16 h-16 bg-[#0c1324] border border-[#1d2d4a] rounded-2xl flex items-center justify-center mb-6">
          <FolderOpen className="w-7 h-7 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Project Selected</h2>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          Select a project from the top bar to view its analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in pb-16">

      {/* Page title */}
      <div>
        <h2 className="text-2xl font-black text-white">{activeProject.name}</h2>
        <p className="text-slate-400 text-xs mt-1 font-semibold">Project overview &amp; product breakdown</p>
      </div>

      {/* Real stats row */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

        <StatCard
          label="Total Products"
          value={products.length}
          valueColor="text-white"
          icon={<Package className="w-5 h-5" />}
          iconBg="bg-violet-500/10 text-violet-400"
        />

        <StatCard
          label="Published"
          value={publishedProducts.length}
          valueColor="text-[#10b981]"
          icon={<Globe className="w-5 h-5" />}
          iconBg="bg-[#10b981]/10 text-[#10b981]"
          subtitle={products.length > 0 ? `${Math.round((publishedProducts.length / products.length) * 100)}% of total` : null}
        />

        <StatCard
          label="Drafts"
          value={draftProducts.length}
          valueColor="text-amber-400"
          icon={<FileEdit className="w-5 h-5" />}
          iconBg="bg-amber-400/10 text-amber-400"
        />

        <StatCard
          label="With 3D Model"
          value={withModelProducts.length}
          valueColor="text-[#00F0FF]"
          icon={<Box className="w-5 h-5" />}
          iconBg="bg-[#00F0FF]/10 text-[#00F0FF]"
          subtitle={products.length > 0 ? `${Math.round((withModelProducts.length / products.length) * 100)}% coverage` : null}
        />
      </div>

      {/* Middle row */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Product Status Breakdown */}
        <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-100 mb-6">Status Breakdown</h3>

          {products.length === 0 ? (
            <EmptyAnalyticsState message="Add products to see the breakdown." />
          ) : (
            <div className="space-y-5">
              <BreakdownBar
                label="Published"
                count={publishedProducts.length}
                total={products.length}
                color="bg-[#10b981]"
                glow="shadow-[0_0_8px_rgba(16,185,129,0.35)]"
                textColor="text-[#10b981]"
              />
              <BreakdownBar
                label="Draft"
                count={draftProducts.length}
                total={products.length}
                color="bg-amber-400"
                glow=""
                textColor="text-amber-400"
              />
              <BreakdownBar
                label="With 3D Model"
                count={withModelProducts.length}
                total={products.length}
                color="bg-[#00F0FF]"
                glow="shadow-[0_0_8px_rgba(0,240,255,0.35)]"
                textColor="text-[#00F0FF]"
              />
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed mt-6 pt-4 border-t border-[#1e2e4f]/30">
            {products.length === 0
              ? 'No products yet. Create products to start tracking your project health.'
              : `${publishedProducts.length} out of ${products.length} products are live.`}
          </p>
        </div>

        {/* QR Scan Analytics — coming in Phase 2 */}
        <div className="lg:col-span-2 bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">QR Scan Analytics</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Coming in Phase 2
                </span>
              </div>
            </div>
            <div className="p-2 bg-[#11192b] border border-[#1d2d4a] rounded-xl">
              <BarChart2 className="w-4 h-4 text-slate-500" />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-[#11192b] border border-[#1d2d4a] rounded-2xl flex items-center justify-center mb-4">
              <BarChart2 className="w-7 h-7 text-slate-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-300 mb-2">No Scan Data Yet</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Publish your products and share their QR codes. Scan analytics — including scan counts, device types, and geographic data — will appear here automatically.
            </p>
            {publishedProducts.length === 0 && (
              <button
                onClick={() => navigate('/add-product')}
                className="mt-6 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/20 font-bold py-2 px-5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Create &amp; Publish a Product
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Products activity */}
      <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">
            Recently Updated Products
          </h3>
          {products.length > 0 && (
            <button
              onClick={() => navigate('/dashboard/products')}
              className="text-xs font-bold text-[#00F0FF] hover:underline"
            >
              View all
            </button>
          )}
        </div>

        {products.length === 0 ? (
          <div className="py-10 text-center">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-semibold mb-1">No products yet</p>
            <p className="text-slate-600 text-xs mb-5">Add products to start tracking activity in this project.</p>
            <button
              onClick={() => navigate('/add-product')}
              className="bg-[#00F0FF] hover:bg-[#00D8E6] text-[#050b14] font-black py-2 px-5 rounded-xl text-xs uppercase tracking-wider transition-all"
            >
              Create Product
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {recentProducts.map(product => (
              <div
                key={product.id}
                className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-[#11192b]/60 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#11192b] border border-[#1d2d4a] flex items-center justify-center shrink-0 overflow-hidden">
                    {product.thumbnail_url
                      ? <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
                      : <Box className="w-4 h-4 text-slate-500" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white truncate max-w-[200px]">{product.name}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {relativeTime(product.updated_at || product.created_at)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                    product.is_published
                      ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/25'
                      : 'text-amber-400 bg-amber-400/10 border-amber-400/25'
                  }`}>
                    {product.is_published ? 'Published' : 'Draft'}
                  </span>
                  {product.is_published && product.slug && (
                    <a
                      href={`/p/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-slate-600 hover:text-[#00F0FF] hover:bg-[#00F0FF]/10 transition-all opacity-0 group-hover:opacity-100"
                      title="View live"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All projects summary */}
      <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-100 mb-4">All Projects</h3>
        {projects.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-6">No projects found.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map(proj => (
              <div
                key={proj.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                  proj.id === activeProject?.id
                    ? 'bg-[#0f1a2e] border-[#00F0FF]/25 text-[#00F0FF]'
                    : 'bg-[#0a101d] border-[#1d2d4a] text-slate-400 hover:border-[#1d2d4a] hover:bg-[#11192b]/40'
                }`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold truncate">{proj.name}</span>
                {proj.id === activeProject?.id && (
                  <span className="ml-auto text-[9px] font-black uppercase tracking-wider text-[#00F0FF]">Active</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, valueColor, icon, iconBg, subtitle }) {
  return (
    <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-2xl p-6 hover:border-[#00F0FF]/15 transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
      </div>
      <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase mb-1">{label}</p>
      <h3 className={`text-3xl font-black ${valueColor}`}>{value}</h3>
      {subtitle && <p className="text-[10px] text-slate-500 font-semibold mt-1">{subtitle}</p>}
    </div>
  );
}

function BreakdownBar({ label, count, total, color, glow, textColor }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs font-bold text-slate-300">
        <span>{label}</span>
        <span className={textColor}>{count} <span className="text-slate-500 font-semibold">({pct}%)</span></span>
      </div>
      <div className="relative bg-[#0a101d] h-6 rounded-lg overflow-hidden border border-[#1a253c]">
        <div
          className={`${color} h-full rounded-r transition-all duration-700 ${glow}`}
          style={{ width: `${pct}%`, minWidth: pct > 0 ? '2px' : '0' }}
        />
      </div>
    </div>
  );
}

function EmptyAnalyticsState({ message }) {
  return (
    <div className="py-8 text-center">
      <p className="text-slate-500 text-xs font-semibold">{message}</p>
    </div>
  );
}