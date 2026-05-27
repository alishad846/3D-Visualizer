import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { getProductOverview, getProjectOverview } from "../../api/analytics";
import TrendCard from "../../components/analytics/TrendCard";
import RealtimeCard from "../../components/analytics/RealtimeCard";
import GeoCard from "../../components/analytics/GeoCard";
import DeviceCard from "../../components/analytics/DeviceCard";
import SourceCard from "../../components/analytics/SourceCard";
import SessionCard from "../../components/analytics/SessionCard";
import ProductsTableCard from "../../components/analytics/ProductsTableCard";

export default function Analytics() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    projects,
    activeProject,
    products,
    loadingProjects,
    loadingProducts,
    fetchProjects,
    setActiveProject,
  } = useWorkspaceStore();

  const [selectedProductId, setSelectedProductId] = useState("all");
  const [refreshTick, setRefreshTick] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [overview, setOverview] = useState({
    totalScans: 0,
    uniqueVisitors: 0,
    avgSessionSeconds: 0,
    arRate: 0,
  });
  const [overviewLoading, setOverviewLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Apply ?productId= preselection once products are available
  useEffect(() => {
    const fromQuery = searchParams.get("productId");
    if (!fromQuery) return;
    if (products.some((p) => p.id === fromQuery)) {
      setSelectedProductId(fromQuery);
    }
  }, [searchParams, products]);

  // Keep URL in sync
  useEffect(() => {
    const currentParam = searchParams.get("productId");
    if (selectedProductId && selectedProductId !== "all") {
      if (currentParam !== selectedProductId) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("productId", selectedProductId);
        setSearchParams(nextParams, { replace: true });
      }
    } else {
      if (currentParam) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("productId");
        setSearchParams(nextParams, { replace: true });
      }
    }
  }, [selectedProductId, searchParams, setSearchParams]);

  const mode = selectedProductId === "all" ? "project" : "product";

  useEffect(() => {
    const projectId = activeProject?.id;
    if (!projectId) return;
    let cancelled = false;

    async function run() {
      setOverviewLoading(true);
      try {
        const data =
          mode === "product"
            ? await getProductOverview(selectedProductId)
            : await getProjectOverview(projectId);
        if (!cancelled) {
          setOverview(data || { totalScans: 0, uniqueVisitors: 0, avgSessionSeconds: 0, arRate: 0 });
          setLastUpdated(Date.now());
        }
      } catch {
        if (!cancelled) {
          setOverview({ totalScans: 0, uniqueVisitors: 0, avgSessionSeconds: 0, arRate: 0 });
        }
      } finally {
        if (!cancelled) setOverviewLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [mode, activeProject?.id, selectedProductId, refreshTick]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) || null,
    [products, selectedProductId]
  );

  const activeLabel =
    mode === "product"
      ? `Product Analytics · ${selectedProduct?.name || "Selected Product"}`
      : `Project Analytics · ${activeProject?.name || "All Products"}`;

  const onRefresh = () => {
    setRefreshTick((v) => v + 1);
    setLastUpdated(Date.now());
  };

  if (loadingProjects) {
    return <div className="p-6 text-[#A0A0A0]">Loading analytics…</div>;
  }

  if (!activeProject) {
    return <div className="p-6 text-[#A0A0A0]">Select a project to view analytics.</div>;
  }

  return (
    <div className="min-h-full bg-[#071018] text-white px-4 md:px-6 py-5">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.10) 37%, rgba(255,255,255,0.04) 63%);
          background-size: 800px 100%;
          animation: shimmer 1.2s infinite linear;
        }
      `}</style>

      <div className="mb-5">
        <h1 className="text-2xl font-black text-white">Analytics</h1>
      </div>

      {/* Switcher */}
      <div className="bg-[#0b1622] border border-white/5 rounded-xl p-4 mb-5">
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-[#A0A0A0]">Project</label>
            <select
              className="mt-1 w-full bg-[#071018] border border-white/10 rounded-md px-3 py-2 text-sm"
              value={activeProject?.id || ""}
              onChange={(e) => {
                const next = projects.find((p) => p.id === e.target.value) || null;
                setActiveProject(next);
                setSelectedProductId("all");
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-[10px] uppercase tracking-wider text-[#A0A0A0]">Product</label>
            <select
              className="mt-1 w-full bg-[#071018] border border-white/10 rounded-md px-3 py-2 text-sm"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              disabled={loadingProducts}
            >
              <option value="all">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:w-auto w-full flex items-center justify-between lg:justify-end gap-3">
            <div className="text-xs text-[#A0A0A0]">{activeLabel}</div>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex items-center gap-2 text-xs text-[#A0A0A0] hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Last updated: just now
            </button>
          </div>
        </div>
      </div>

      {/* Overview mini KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          ["Total Scans", overview.totalScans],
          ["Unique Visitors", overview.uniqueVisitors],
          ["Avg Session", `${Math.round(overview.avgSessionSeconds || 0)}s`],
          ["AR Rate", `${overview.arRate || 0}%`],
        ].map(([label, value]) => (
          <div key={label} className="bg-[#0b1622] border border-white/5 rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-[#A0A0A0]">{label}</div>
            <div className="text-xl font-black mt-1">
              {overviewLoading ? <span className="inline-block h-6 w-20 shimmer rounded" /> : value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="order-2 lg:order-1 lg:col-span-3">
          <TrendCard
            mode={mode}
            projectId={activeProject.id}
            productId={selectedProductId}
            refreshTick={refreshTick}
          />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-2">
          <RealtimeCard
            mode={mode}
            projectId={activeProject.id}
            productId={selectedProductId}
            refreshTick={refreshTick}
          />
        </div>

        <div className="order-3 lg:col-span-5">
          <GeoCard
            mode={mode}
            projectId={activeProject.id}
            productId={selectedProductId}
            refreshTick={refreshTick}
          />
        </div>

        <div className="order-4 lg:col-span-3 xl:col-span-2">
          <DeviceCard
            mode={mode}
            projectId={activeProject.id}
            productId={selectedProductId}
            refreshTick={refreshTick}
          />
        </div>
        <div className="order-5 lg:col-span-2 xl:col-span-3">
          <SourceCard
            mode={mode}
            projectId={activeProject.id}
            productId={selectedProductId}
            refreshTick={refreshTick}
          />
        </div>

        {mode === "product" ? (
          <div className="order-6 lg:col-span-5">
            <SessionCard productId={selectedProductId} refreshTick={refreshTick} />
          </div>
        ) : (
          <div className="order-6 lg:col-span-5">
            <ProductsTableCard projectId={activeProject.id} refreshTick={refreshTick} />
          </div>
        )}
      </div>
    </div>
  );
}

