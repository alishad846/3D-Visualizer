import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function StatCard({ label, value, delta, unit, loading }) {
  const hasDelta = delta !== null && delta !== undefined;
  const positive = hasDelta && delta >= 0;
  const zero = hasDelta && delta === 0;
  
  return (
    <div className="bg-[#0b1622] border border-white/5 rounded-xl p-5 flex flex-col gap-2 relative overflow-hidden group hover:border-[#00F0FF]/20 transition-all duration-300">
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-[#00F0FF]/[0.03] to-transparent" />

      <div className="text-[10px] uppercase tracking-widest text-[#A0A0A0] font-semibold">
        {label}
      </div>

      {loading ? (
        <>
          <div className="h-8 w-28 shimmer rounded mt-1" />
          <div className="h-4 w-16 shimmer rounded" />
        </>
      ) : (
        <>
          <div className="text-3xl font-black text-white tracking-tight">
            {value}
            {unit && (
              <span className="text-lg font-semibold text-[#A0A0A0] ml-0.5">
                {unit}
              </span>
            )}
          </div>

          {hasDelta ? (
            <div
              className="flex items-center gap-1 text-xs font-semibold"
              style={{ color: zero ? "#A0A0A0" : positive ? "#10b981" : "#f59e0b" }}
            >
              {zero ? (
                <Minus className="w-3 h-3" />
              ) : positive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {zero ? "No change" : `${positive ? "+" : ""}${delta}% vs prev period`}
            </div>
          ) : (
            <div className="h-4" />
          )}
        </>
      )}
    </div>
  );
}

/**
 * ProjectStatsRow
 * Props:
 *   overview: { totalScans, uniqueVisitors, avgSessionSeconds, arRate }
 *   loading: boolean
 */
export default function ProjectStatsRow({ overview = {}, loading = false }) {
  const scans = Number(overview.totalScans || 0).toLocaleString();
  const visitors = Number(overview.uniqueVisitors || 0).toLocaleString();
  const session = `${Math.round(overview.avgSessionSeconds || 0)}`;
  const arRate = Number(overview.arRate || 0).toFixed(1);

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      <StatCard
        label="Total Scans"
        value={scans}
        delta={null}
        loading={loading}
      />
      <StatCard
        label="Unique Visitors"
        value={visitors}
        delta={null}
        loading={loading}
      />
      <StatCard
        label="Avg Session"
        value={session}
        unit="s"
        delta={null}
        loading={loading}
      />
      <StatCard
        label="AR Engagement Rate"
        value={arRate}
        unit="%"
        delta={null}
        loading={loading}
      />
    </div>
  );
}
