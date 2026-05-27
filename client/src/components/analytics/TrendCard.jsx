import React, { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getProductTrend, getProjectTrend } from "../../api/analytics";

const METRICS = [
  { key: "scans", label: "Total Scans", previousKey: "scans" },
  { key: "uniqueVisitors", label: "Unique Visitors", previousKey: null },
  { key: "avgSession", label: "Avg Session", previousKey: null },
  { key: "arRate", label: "AR Rate", previousKey: null },
];

const RANGES = ["7d", "28d", "90d"];

function formatDayLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CustomTooltip({ active, payload, label, metricKey }) {
  if (!active || !payload?.length) return null;
  const current = payload.find((p) => p.dataKey === "currentValue")?.value ?? 0;
  const previous = payload.find((p) => p.dataKey === "previousValue")?.value ?? 0;
  const suffix = metricKey === "arRate" ? "%" : "";
  return (
    <div className="bg-[#0b1622] border border-white/10 rounded-md px-3 py-2 text-xs">
      <div className="text-[#A0A0A0] mb-1">{formatDayLabel(label)}</div>
      <div className="text-white">Current: {current}{suffix}</div>
      <div className="text-[#A0A0A0]">Previous: {previous}{suffix}</div>
    </div>
  );
}

export default function TrendCard({ mode, projectId, productId, refreshTick }) {
  const [range, setRange] = useState("28d");
  const [metricKey, setMetricKey] = useState("scans");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trend, setTrend] = useState({ current: [], previous: [] });

  useEffect(() => {
    const scopeId = mode === "product" ? productId : projectId;
    if (!scopeId) return;
    let cancelled = false;

    async function run() {
      setLoading(true);
      setError("");
      try {
        const data =
          mode === "product"
            ? await getProductTrend(scopeId, range)
            : await getProjectTrend(scopeId, range);
        if (!cancelled) setTrend(data || { current: [], previous: [] });
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load trend data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [mode, projectId, productId, range, refreshTick]);

  const chartData = useMemo(() => {
    const previousMap = new Map((trend.previous || []).map((row) => [String(row.day), row]));
    const metric = METRICS.find((m) => m.key === metricKey);
    return (trend.current || []).map((row) => {
      const prev = previousMap.get(String(row.day));
      const previousValue = metric?.previousKey ? Number(prev?.[metric.previousKey] || 0) : 0;
      return {
        day: row.day,
        currentValue: Number(row?.[metricKey] || 0),
        previousValue,
      };
    });
  }, [trend, metricKey]);

  return (
    <div className="bg-[#0b1622] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-[11px] uppercase tracking-widest text-[#A0A0A0] font-semibold">
          Main Performance
        </h3>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
        {METRICS.map((metric) => {
          const active = metric.key === metricKey;
          return (
            <button
              key={metric.key}
              type="button"
              onClick={() => setMetricKey(metric.key)}
              className={`px-3 py-2 text-xs rounded-md border whitespace-nowrap transition-colors ${
                active
                  ? "text-[#00F0FF] border-[#00F0FF] bg-[rgba(0,240,255,0.08)]"
                  : "text-[#A0A0A0] border-white/10 hover:text-white"
              }`}
            >
              {metric.label}
            </button>
          );
        })}
      </div>

      <div className="h-[180px] md:h-[220px] rounded-lg border border-white/5 bg-[#071018]/40 p-2">
        {loading ? (
          <div className="h-full w-full shimmer rounded-md" />
        ) : error ? (
          <div className="h-full flex items-center justify-center text-red-300 text-sm">
            Failed to load data. Try refreshing.
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[#A0A0A0] text-sm">
            No scan data for this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(0,240,255,0.2)" />
                  <stop offset="100%" stopColor="rgba(0,240,255,0.02)" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="day"
                tickFormatter={formatDayLabel}
                tick={{ fill: "#A0A0A0", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#A0A0A0", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip metricKey={metricKey} />} />
              <Area
                type="monotone"
                dataKey="currentValue"
                stroke="#00F0FF"
                strokeWidth={2}
                fill="url(#trendFill)"
              />
              <Area
                type="monotone"
                dataKey="previousValue"
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="4 4"
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <select
          className="bg-[#071018] border border-white/10 rounded-md px-3 py-1.5 text-xs text-white"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        >
          {RANGES.map((r) => (
            <option key={r} value={r}>
              {r.toUpperCase()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

