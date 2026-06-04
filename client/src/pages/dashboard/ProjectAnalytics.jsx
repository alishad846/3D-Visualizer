import React, { useEffect, useState } from "react";
import { RefreshCw, BarChart2 } from "lucide-react";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { getProjectOverview } from "../../api/analytics";
import ProjectStatsRow from "../../components/analytics/ProjectStatsRow";
import TrendCard from "../../components/analytics/TrendCard";
import RealtimeCard from "../../components/analytics/RealtimeCard";
import GeoCard from "../../components/analytics/GeoCard";
import DeviceCard from "../../components/analytics/DeviceCard";
import SourceCard from "../../components/analytics/SourceCard";
import ProductBreakdownTable from "../../components/analytics/ProductBreakdownTable";

const SHIMMER_CSS = `
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  .shimmer {
    background: linear-gradient(
      90deg,
      rgba(255,255,255,0.04) 25%,
      rgba(255,255,255,0.10) 37%,
      rgba(255,255,255,0.04) 63%
    );
    background-size: 800px 100%;
    animation: shimmer 1.2s infinite linear;
  }
`;

function formatLastUpdated(ts) {
  if (!ts) return "";
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 5)  return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  return `${Math.floor(diffSec / 60)}m ago`;
}

export default function ProjectAnalytics() {
  const {
    projects,
    activeProject,
    loadingProjects,
    fetchProjects,
    setActiveProject,
  } = useWorkspaceStore();

  const [refreshTick, setRefreshTick] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [overview, setOverview] = useState({
    totalScans: 0,
    uniqueVisitors: 0,
    avgSessionSeconds: 0,
    arRate: 0,
  });
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Ensure projects are loaded
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Fetch project-level overview whenever the active project or refreshTick changes
  useEffect(() => {
    const projectId = activeProject?.id;
    if (!projectId) return;
    let cancelled = false;

    async function run() {
      setOverviewLoading(true);
      try {
        const data = await getProjectOverview(projectId);
        if (!cancelled) {
          setOverview(
            data || {
              totalScans: 0,
              uniqueVisitors: 0,
              avgSessionSeconds: 0,
              arRate: 0,
            }
          );
          setLastUpdated(Date.now());
        }
      } catch {
        if (!cancelled) {
          setOverview({
            totalScans: 0,
            uniqueVisitors: 0,
            avgSessionSeconds: 0,
            arRate: 0,
          });
        }
      } finally {
        if (!cancelled) setOverviewLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [activeProject?.id, refreshTick]);

  const handleRefresh = () => {
    setRefreshTick((v) => v + 1);
  };

  // ── Loading state ──
  if (loadingProjects) {
    return (
      <div className="min-h-full bg-[#071018] text-white px-4 md:px-6 py-5">
        <style>{SHIMMER_CSS}</style>
        <div className="h-8 w-48 shimmer rounded mb-6" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 shimmer rounded-xl" />
          ))}
        </div>
        <div className="h-64 shimmer rounded-xl" />
      </div>
    );
  }

  // ── No project selected ──
  if (!activeProject) {
    return (
      <div className="min-h-full bg-[#071018] text-white px-4 md:px-6 py-5 flex flex-col items-center justify-center gap-4">
        <style>{SHIMMER_CSS}</style>
        <BarChart2 className="w-12 h-12 text-[#00F0FF]/40" />
        <h2 className="text-xl font-bold text-white">No project selected</h2>
        <p className="text-[#A0A0A0] text-sm text-center max-w-xs">
          Select a project from the header to view project-wide analytics.
        </p>
      </div>
    );
  }

  // ── Main view ──
  return (
    <div className="min-h-full bg-[#071018] text-white px-4 md:px-6 py-5">
      <style>{SHIMMER_CSS}</style>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Project Analytics
          </h1>
          <p className="text-[#A0A0A0] text-sm mt-0.5">
            Aggregated across all products in&nbsp;
            <span className="text-[#00F0FF] font-semibold">{activeProject.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Project switcher */}
          <select
            id="project-analytics-project-select"
            className="bg-[#0c1324] border border-[#1d2d4a] rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
            value={activeProject.id}
            onChange={(e) => {
              const next = projects.find((p) => p.id === e.target.value) || null;
              setActiveProject(next);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <button
            type="button"
            id="project-analytics-refresh"
            onClick={handleRefresh}
            className="flex items-center gap-2 text-xs text-[#A0A0A0] hover:text-white transition-colors px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-[#0c1324]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {lastUpdated ? formatLastUpdated(lastUpdated) : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div className="mb-5">
        <ProjectStatsRow overview={overview} loading={overviewLoading} />
      </div>

      {/* ── Main charts grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Trend chart — col-span 3 */}
        <div className="order-2 lg:order-1 lg:col-span-3">
          <TrendCard
            mode="project"
            projectId={activeProject.id}
            refreshTick={refreshTick}
          />
        </div>

        {/* Realtime — col-span 2 */}
        <div className="order-1 lg:order-2 lg:col-span-2">
          <RealtimeCard
            mode="project"
            projectId={activeProject.id}
            refreshTick={refreshTick}
          />
        </div>

        {/* Geo map — full width */}
        <div className="order-3 lg:col-span-5">
          <GeoCard
            mode="project"
            projectId={activeProject.id}
            refreshTick={refreshTick}
          />
        </div>

        {/* Device breakdown */}
        <div className="order-4 lg:col-span-3 xl:col-span-2">
          <DeviceCard
            mode="project"
            projectId={activeProject.id}
            refreshTick={refreshTick}
          />
        </div>

        {/* Traffic sources */}
        <div className="order-5 lg:col-span-2 xl:col-span-3">
          <SourceCard
            mode="project"
            projectId={activeProject.id}
            refreshTick={refreshTick}
          />
        </div>

        {/* Product breakdown table — full width, last */}
        <div className="order-6 lg:col-span-5">
          <ProductBreakdownTable
            projectId={activeProject.id}
            refreshTick={refreshTick}
          />
        </div>
      </div>
    </div>
  );
}
