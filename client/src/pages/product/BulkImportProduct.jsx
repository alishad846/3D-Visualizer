import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { bulkUploadProducts } from '../../api/products';
import { ArrowLeft, UploadCloud, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function BulkImportProduct() {
  const activeProject = useWorkspaceStore((state) => state.activeProject);
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const sampleCsvUrl = '/sample-product-import.csv';
  const sampleExcelUrl = '/sample-product-import.xlsx';

  const handleFileChange = (event) => {
    setResult(null);
    setError(null);
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!activeProject) return;
    if (!file) {
      setError('Please select a .csv or .xlsx file to upload.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const data = await bulkUploadProducts(activeProject.id, file);
      setResult(data);
      setFile(null);
      event.target.reset?.();
    } catch (err) {
      setError(err.message || 'Bulk upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!activeProject) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center text-slate-300">
        <h2 className="text-2xl font-bold text-white mb-4">No active project selected</h2>
        <p className="text-sm text-slate-400 mb-6">
          Select a project from the workspace panel before importing products.
        </p>
        <button
          onClick={() => navigate('/dashboard/products')}
          className="inline-flex items-center gap-2 bg-[#00F0FF] text-[#050b14] font-black py-2.5 px-5 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Back to products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-16 px-4 space-y-8">
      <button
        onClick={() => navigate('/dashboard/products')}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to products
      </button>

      <div className="bg-[#0c1324] border border-[#1e2e4f] rounded-3xl p-8 space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Bulk Product Import</h1>
            <p className="text-slate-400 mt-2 max-w-2xl">
                Upload a CSV or XLSX file with one product per row. Any extra columns beyond the supported schema will be ignored.
              </p>
            </div>
            <div className="rounded-3xl bg-[#11192b] border border-[#1d2e4a] p-5 text-sm text-slate-300">
              <p className="font-semibold text-white">Project</p>
              <p className="mt-2">{activeProject.name}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-3xl border border-[#1d2e4a] bg-[#11192b] p-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Import steps</p>
              <ol className="mt-4 space-y-3 text-slate-300 list-decimal list-inside">
                <li>Download the sample CSV or Excel template.</li>
                <li>Fill one product per row using the supported columns below.</li>
                <li>Save your changes and upload the file here.</li>
                <li>Review the import summary for inserted and skipped rows.</li>
              </ol>
            </div>
            <div className="rounded-3xl border border-[#1d2e4a] bg-[#11192b] p-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Supported schema</p>
              <div className="mt-4 space-y-3 text-slate-300 text-sm">
                <div>
                  <p className="font-semibold text-white">Required columns</p>
                  <p>name, category</p>
                </div>
                <div>
                  <p className="font-semibold text-white">Optional columns</p>
                  <p>brand, sku, tagline, description, price, currency, buy_url, qr_label, usdz_url, thumbnail_url, gallery_urls</p>
                </div>
                <p className="text-slate-500 text-xs">Additional columns such as serial no. will be ignored during import. thumbnail_url and gallery_urls require pre-uploaded Supabase storage URLs.</p>
              </div>
              <div className="mt-6 grid gap-3">
                <a
                  href={sampleCsvUrl}
                  download="sample-product-import.csv"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#00F0FF]/25 bg-[#0f172a] px-4 py-3 text-sm font-semibold text-[#00F0FF] transition hover:bg-[#0d1a2f]"
                >
                  Download sample CSV
                </a>
                <a
                  href={sampleExcelUrl}
                  download="sample-product-import.xlsx"
                  className="inline-flex items-center justify-center rounded-2xl border border-[#00F0FF]/25 bg-[#0f172a] px-4 py-3 text-sm font-semibold text-[#00F0FF] transition hover:bg-[#0d1a2f]"
                >
                  Download sample Excel
                </a>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <label className="block">
              <span className="text-sm font-semibold text-slate-300">File</span>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className="mt-3 block w-full text-sm text-slate-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#00F0FF] file:text-[#050b14] file:font-semibold bg-[#11192b] border border-[#1d2d4a] rounded-2xl px-4 py-3 text-slate-100 focus:outline-none"
              />
            </label>

            <div className="rounded-3xl border border-[#1d2d4a] bg-[#11192b] p-6">
              <div className="flex items-start gap-3">
                <UploadCloud className="w-5 h-5 text-[#00F0FF] mt-1" />
                <div className="text-sm text-slate-300 leading-relaxed">
                  <p className="font-semibold text-white">Upload rules</p>
                  <ul className="mt-3 space-y-2 list-disc list-inside text-slate-400">
                    <li>Only <strong>.csv</strong> and <strong>.xlsx</strong> files.</li>
                    <li>Maximum 100 rows, excluding the header.</li>
                    <li>Columns outside the supported schema will be ignored.</li>
                    <li>Products are imported as drafts with generated slugs and QR records.</li>
                  </ul>
                </div>
              </div>
            </div>

            {error && (
            <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              <AlertTriangle className="inline-block w-4 h-4 mr-2 align-text-bottom" />
              {error}
            </div>
          )}

          {result && (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-semibold">Upload summary</span>
              </div>
              <p>{result.insertedCount} products imported successfully.</p>
              {result.skippedRows?.length > 0 && (
                <div className="mt-3 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                  <p className="font-semibold text-white">Rows skipped:</p>
                  <ul className="list-disc list-inside space-y-2 text-rose-100 mt-3">
                    {result.skippedRows.map((row, index) => (
                      <li key={`${row.row}-${row.field || index}`}>
                        <span className="font-semibold">Row {row.row}</span>
                        {row.field ? ` (${row.field})` : ''}: {row.error || 'Unknown error'}
                        {row.solution ? ` ${row.solution}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.warnings?.length > 0 && (
                <div className="mt-3 rounded-3xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                  <p className="font-semibold text-white">Warnings</p>
                  <ul className="list-disc list-inside space-y-2 text-amber-100 mt-3">
                    {result.warnings.map((warning, index) => (
                      <li key={`${warning.row}-${warning.field}-${index}`}>
                        <span className="font-semibold">Row {warning.row}</span>
                        {warning.field ? ` (${warning.field})` : ''}: {warning.warning}
                        {warning.solution ? ` ${warning.solution}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00F0FF] px-6 py-3 text-sm font-black uppercase tracking-wider text-[#050b14] transition hover:bg-[#00d8e6] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Importing…' : 'Start Bulk Import'}
          </button>
        </form>
      </div>
    </div>
  );
}
