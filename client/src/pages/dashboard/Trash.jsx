import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trash2,
  RotateCcw,
  FolderOpen,
  Layers,
  Clock,
  AlertTriangle,
  Info,
  RefreshCw,
  Package,
  User,
  ChevronRight,
} from 'lucide-react';
import { fetchDeletedProjects, restoreProject, fetchRestorePreflight } from '../../api/projects';
import { fetchDeletedProducts, restoreProduct } from '../../api/products';
import RestoreProjectModal from '../../components/ui/RestoreProjectModal';

/* ─── Helpers ─────────────────────────────────────────────── */

function daysUntilPurge(purgeAt) {
  if (!purgeAt) return null;
  const diff = new Date(purgeAt) - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function PurgeBadge({ purgeAt }) {
  const days = daysUntilPurge(purgeAt);
  if (days === null) return null;

  let colorClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (days <= 2) colorClass = 'bg-red-500/15 text-red-400 border-red-500/30';
  else if (days <= 4) colorClass = 'bg-amber-500/15 text-amber-400 border-amber-500/30';

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colorClass}`}
    >
      <Clock className="w-3 h-3" />
      {days === 0 ? 'Purging today' : `Purged in ${days}d`}
    </span>
  );
}

/* ─── Empty State ─────────────────────────────────────────── */
function EmptyState({ type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 gap-4"
    >
      <div className="w-20 h-20 rounded-2xl bg-[#0d1629] border border-[#1d2d4a] flex items-center justify-center">
        <Trash2 className="w-9 h-9 text-slate-600" />
      </div>
      <p className="text-slate-400 font-semibold text-lg">No deleted {type}</p>
      <p className="text-slate-600 text-sm text-center max-w-xs">
        {type === 'projects'
          ? 'Deleted projects will appear here for 7 days before being permanently removed.'
          : 'Deleted products will appear here for 7 days before being permanently removed.'}
      </p>
    </motion.div>
  );
}

/* ─── Project Row ─────────────────────────────────────────── */
function ProjectRow({ project, onRestore }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRestore = async () => {
    setLoading(true);
    setError(null);
    try {
      await onRestore(project.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group bg-[#0b101e] border border-[#1a253c] hover:border-[#1d2d4a] rounded-2xl p-4 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-[#00F0FF]/8 border border-[#00F0FF]/15 flex items-center justify-center shrink-0">
          <FolderOpen className="w-5 h-5 text-[#00F0FF]/70" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-100 truncate">{project.name}</span>
            <PurgeBadge purgeAt={project.purge_at} />
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {project.description && (
              <span className="text-xs text-slate-500 truncate max-w-[200px]">{project.description}</span>
            )}
            <span className="text-xs text-slate-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Deleted {formatRelativeTime(project.deleted_at)}
            </span>
            {project.deleted_by_name && (
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <User className="w-3 h-3" />
                by {project.deleted_by_name}
              </span>
            )}
          </div>
          {error && (
            <p className="mt-1.5 text-xs text-red-400 flex items-start gap-1">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Restore Button */}
        <button
          onClick={handleRestore}
          disabled={loading}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/20 hover:border-[#00F0FF]/40 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5" />
          )}
          {loading ? 'Restoring…' : 'Restore'}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Product Row ─────────────────────────────────────────── */
function ProductRow({ product, onRestore }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRestore = async () => {
    setLoading(true);
    setError(null);
    try {
      await onRestore(product.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group bg-[#0b101e] border border-[#1a253c] hover:border-[#1d2d4a] rounded-2xl p-4 transition-all"
    >
      <div className="flex items-center gap-4">
        {/* Thumbnail or fallback icon */}
        <div className="w-11 h-11 rounded-xl border border-[#1a253c] overflow-hidden shrink-0 bg-[#0d1629] flex items-center justify-center">
          {product.thumbnail_url ? (
            <img
              src={product.thumbnail_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <Package className="w-5 h-5 text-slate-600" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-100 truncate">{product.name}</span>
            {product.brand && (
              <span className="text-[10px] text-slate-500 bg-[#1a253c] px-2 py-0.5 rounded-full">{product.brand}</span>
            )}
            <PurgeBadge purgeAt={product.purge_at} />
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <FolderOpen className="w-3 h-3" />
              {product.project_name}
            </span>
            {product.category && (
              <span className="text-xs text-slate-600">{product.category}</span>
            )}
            <span className="text-xs text-slate-600 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Deleted {formatRelativeTime(product.deleted_at)}
            </span>
            {product.deleted_by_name && (
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <User className="w-3 h-3" />
                by {product.deleted_by_name}
              </span>
            )}
          </div>
          {error && (
            <p className="mt-1.5 text-xs text-red-400 flex items-start gap-1">
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {error}
            </p>
          )}
        </div>

        {/* Restore button */}
        <button
          onClick={handleRestore}
          disabled={loading}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/20 hover:border-[#00F0FF]/40 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RotateCcw className="w-3.5 h-3.5" />
          )}
          {loading ? 'Restoring…' : 'Restore'}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function Trash() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Restore project preflight and modal state
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [restorePreflight, setRestorePreflight] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const loadData = useCallback(async () => {
    setFetchError(null);
    setLoadingProjects(true);
    setLoadingProducts(true);

    try {
      const [proj, prod] = await Promise.all([
        fetchDeletedProjects(),
        fetchDeletedProducts(),
      ]);
      setProjects(proj);
      setProducts(prod);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setLoadingProjects(false);
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* Restore handlers — remove the item from the local list on success */
  const handleRestoreProject = async (id) => {
    try {
      const preflight = await fetchRestorePreflight(id);
      if (preflight.deletedProductCount === 0) {
        await restoreProject(id, false);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } else {
        setRestorePreflight(preflight);
        setRestoreModalOpen(true);
      }
    } catch (err) {
      throw err;
    }
  };

  const handleConfirmRestoreProject = async (includeProducts) => {
    if (!restorePreflight) return;
    setModalLoading(true);
    try {
      const { projectId } = restorePreflight;
      await restoreProject(projectId, includeProducts);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      if (includeProducts) {
        setProducts((prev) => prev.filter((p) => p.project_id !== projectId));
      }
      setRestoreModalOpen(false);
      setRestorePreflight(null);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleRestoreProduct = async (id) => {
    await restoreProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const totalItems = projects.length + products.length;
  const isLoading = loadingProjects || loadingProducts;

  const tabs = [
    { id: 'projects', label: 'Projects', icon: FolderOpen, count: projects.length },
    { id: 'products', label: 'Products', icon: Layers, count: products.length },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Trash2 className="w-6 h-6 text-slate-500" />
            Recently Deleted
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Items are permanently purged 7 days after deletion. Restore them before they're gone.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#11192b] border border-[#1d2d4a] text-slate-400 hover:text-white hover:border-[#2a3d5c] text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4">
        <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-300/80 leading-relaxed">
          <span className="font-bold text-amber-300">Permanent deletion warning.</span>{' '}
          After 7 days, items are hard-deleted along with all associated QR codes, scan analytics, 3D models, and AI data. This cannot be undone.
          Restoring a product also re-activates its QR code so scans work again immediately.
        </p>
      </div>

      {/* Fetch Error */}
      {fetchError && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <p className="text-sm text-red-400">{fetchError}</p>
        </div>
      )}

      {/* Summary pills */}
      {!isLoading && !fetchError && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            {totalItems === 0 ? 'Trash is empty' : `${totalItems} item${totalItems !== 1 ? 's' : ''} in trash`}
          </span>
          {totalItems > 0 && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
              <span className="text-xs text-slate-600">{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
              <span className="text-xs text-slate-700">·</span>
              <span className="text-xs text-slate-600">{products.length} product{products.length !== 1 ? 's' : ''}</span>
            </>
          )}
        </div>
      )}

      {/* Info: project restore note */}
      {!isLoading && products.some((p) => p.project_id) && (
        <div className="flex items-start gap-2.5 bg-[#0d1629] border border-[#1a253c] rounded-xl p-3">
          <Info className="w-3.5 h-3.5 text-[#00F0FF]/60 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Deleted products inside a deleted project cannot be restored until the project is restored first.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0b101e] border border-[#1a253c] rounded-2xl p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/20'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-[#00F0FF]/20 text-[#00F0FF]'
                    : 'bg-[#1a253c] text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'projects' && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            {loadingProjects ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[72px] rounded-2xl bg-[#0b101e] border border-[#1a253c] animate-pulse" />
                ))}
              </div>
            ) : projects.length === 0 ? (
              <EmptyState type="projects" />
            ) : (
              <AnimatePresence>
                {projects.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    onRestore={handleRestoreProject}
                  />
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        )}

        {activeTab === 'products' && (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            {loadingProducts ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-[72px] rounded-2xl bg-[#0b101e] border border-[#1a253c] animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState type="products" />
            ) : (
              <AnimatePresence>
                {products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onRestore={handleRestoreProduct}
                  />
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav */}
      {!isLoading && totalItems > 0 && (
        <div className="flex items-center gap-3 pt-4 border-t border-[#1a253c]">
          <button
            onClick={() => navigate('/dashboard/products')}
            className="text-xs text-slate-500 hover:text-[#00F0FF] transition-colors font-medium"
          >
            → Go to Products
          </button>
          <span className="text-slate-700">·</span>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-slate-500 hover:text-[#00F0FF] transition-colors font-medium"
          >
            → Go to Dashboard
          </button>
        </div>
      )}

      {/* Restore Project Modal */}
      <RestoreProjectModal
        isOpen={restoreModalOpen}
        onClose={() => {
          setRestoreModalOpen(false);
          setRestorePreflight(null);
        }}
        onConfirm={handleConfirmRestoreProject}
        projectName={restorePreflight?.projectName || ''}
        deletedProductCount={restorePreflight?.deletedProductCount || 0}
        expiringSoonCount={restorePreflight?.expiringSoonCount || 0}
        loading={modalLoading}
      />
    </div>
  );
}
