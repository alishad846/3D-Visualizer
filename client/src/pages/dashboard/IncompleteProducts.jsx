import React, { useEffect, useState, useRef } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { fetchIncompleteProducts, uploadAsset, attachProductModel } from '../../api/products';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, CircleDashed } from 'lucide-react';

const ALLOWED_MODEL_EXTENSIONS = ['glb'];

export default function IncompleteProducts() {
  const activeProject = useWorkspaceStore((state) => state.activeProject);
  const fetchProductsForActiveProject = useWorkspaceStore((state) => state.fetchProductsForActiveProject);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadState, setUploadState] = useState({});
  const [selectedProductId, setSelectedProductId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!activeProject) return;
    loadIncompleteProducts();
  }, [activeProject?.id]);

  const loadIncompleteProducts = async () => {
    if (!activeProject) return;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchIncompleteProducts(activeProject.id);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load incomplete products.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartUpload = (productId) => {
    setSelectedProductId(productId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    const productId = selectedProductId;
    event.target.value = '';
    setSelectedProductId(null);

    if (!file || !productId) {
      return;
    }

    const extension = String(file.name).split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_MODEL_EXTENSIONS.includes(extension)) {
      setUploadState((state) => ({
        ...state,
        [productId]: { status: 'error', message: 'Please upload a .glb file.' },
      }));
      return;
    }

    setUploadState((state) => ({
      ...state,
      [productId]: { status: 'uploading', message: 'Uploading model...' },
    }));

    try {
      const uploadResult = await uploadAsset(file);
      if (!uploadResult?.url) {
        throw new Error('Upload failed to return a storage URL.');
      }

      setUploadState((state) => ({
        ...state,
        [productId]: { status: 'attaching', message: 'Saving model reference...' },
      }));

      await attachProductModel(productId, uploadResult.url);

      setProducts((items) => items.filter((item) => item.id !== productId));

      if (activeProject?.id && fetchProductsForActiveProject) {
        fetchProductsForActiveProject(activeProject.id);
      }

      setUploadState((state) => ({
        ...state,
        [productId]: { status: 'success', message: 'Model attached successfully.' },
      }));
    } catch (err) {
      setUploadState((state) => ({
        ...state,
        [productId]: { status: 'error', message: err.message || 'Failed to attach model.' },
      }));
    }
  };

  const renderStatus = (productId) => {
    const status = uploadState[productId];
    if (!status) return null;
    const isError = status.status === 'error';
    const borderClass = isError ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';

    return (
      <div className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-semibold ${borderClass}`}>
        {isError ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
        <span>{status.message}</span>
      </div>
    );
  };

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-fade-in">
        <div className="w-16 h-16 bg-[#0c1324] border border-[#1d2d4a] rounded-2xl flex items-center justify-center mb-6">
          <FileText className="w-7 h-7 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Project Selected</h2>
        <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
          Select a project from the dashboard header before assigning models to draft products.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="animate-spin rounded-full border-[3px] border-slate-700 border-b-[#00F0FF] w-10 h-10" />
        <p className="mt-4 text-slate-400 text-sm font-medium">Loading incomplete products…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#00F0FF] font-bold">
            <UploadCloud className="w-4 h-4" />
            Incomplete Models
          </div>
          <h1 className="text-3xl font-black text-white">Draft products missing 3D models</h1>
          <p className="text-slate-400 max-w-2xl text-sm">
            Attach a GLB file to each draft product to enable the 3D viewer and publish workflow.
          </p>
        </div>
        <div className="rounded-3xl border border-[#1d2d4a] bg-[#0b101f] p-4 text-sm text-slate-300">
          <p className="font-semibold text-slate-100">Project</p>
          <p className="mt-2 text-sm font-bold text-white">{activeProject.name}</p>
          <p className="text-[11px] mt-2 text-slate-500">Only draft products without a model are shown here.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#1e2e4f] bg-[#0c1324] p-14 text-center">
          <CircleDashed className="mx-auto mb-5 w-12 h-12 text-slate-500" />
          <h2 className="text-xl font-bold text-white mb-2">No incomplete draft models</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            All draft products in this project already have an attached 3D model, or there are no drafts yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="rounded-3xl border border-[#1e2e4f] bg-[#0b101f] p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500 font-semibold mb-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#1d2d4a] bg-[#11192b] px-2 py-1">
                      <FileText className="w-3.5 h-3.5" /> Draft product
                    </span>
                    <span className="rounded-full border border-[#1d2d4a] bg-[#11192b] px-2 py-1">No 3D model</span>
                  </div>
                  <h2 className="text-xl font-black text-white truncate">{product.name}</h2>
                  <p className="text-slate-400 mt-2 text-sm max-w-2xl">
                    {product.category || 'Uncategorized'} · {product.brand || 'No brand'} · SKU: {product.sku || 'N/A'}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <button
                    type="button"
                    onClick={() => handleStartUpload(product.id)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#00F0FF] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#050b14] transition hover:bg-[#00d8e6]"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Upload GLB
                  </button>
                  <p className="text-[11px] text-slate-500 text-right max-w-[220px]">
                    Attach a GLB file and the product will be removed from this list automatically.
                  </p>
                </div>
              </div>
              {renderStatus(product.id)}
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".glb"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
