import React, { useEffect, useMemo, useState } from "react";
import { getProductSessions } from "../../api/analytics";

const RANGES = ["7d", "28d", "90d"];
const META = {
  "0-10s": { color: "#f59e0b", desc: "Bounced or quick scans" },
  "10-30s": { color: "rgba(0,240,255,0.6)", desc: "Standard navigation" },
  "30-60s": { color: "rgba(0,240,255,0.85)", desc: "Deep content review" },
  "60s+": { color: "#10b981", desc: "High intent interaction" },
};

export default function SessionCard({ productId, refreshTick }) {
  const [range, setRange] = useState("28d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState({ buckets: [], avgSessionSeconds: 0 });

  useEffect(() => {
    if (!productId) return;
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const data = await getProductSessions(productId, range);
        if (!cancelled) setPayload(data || { buckets: [], avgSessionSeconds: 0 });
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load session quality");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [productId, range, refreshTick]);

  const buckets = useMemo(() => {
    const source = payload.buckets || [];
    return ["0-10s", "10-30s", "30-60s", "60s+"].map((label) => {
      const row = source.find((r) => r.label === label) || { percentage: 0 };
      return { label, percentage: Number(row.percentage || 0), ...META[label] };
    });
  }, [payload.buckets]);

  const maxPct = Math.max(...buckets.map((b) => b.percentage), 1);

  return (
    <div className="bg-[#0b1622] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Session Quality</h3>
          <p className="text-xs text-[#A0A0A0]">How long viewers spent with this product</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white">
            Avg: {Math.round(payload.avgSessionSeconds || 0)}s
          </span>
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

      {loading ? (
        <div className="h-[230px] shimmer rounded-md" />
      ) : error ? (
        <div className="h-[230px] flex items-center justify-center text-red-300 text-sm">
          Failed to load data. Try refreshing.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {buckets.map((bucket) => {
            const height = Math.max(8, Math.round((bucket.percentage / maxPct) * 120));
            return (
              <div
                key={bucket.label}
                className="rounded-lg border border-white/5 bg-[#071018]/40 p-3 flex flex-col"
              >
                <div className="text-2xl font-bold" style={{ color: bucket.color }}>
                  {bucket.percentage}%
                </div>
                <div className="text-xs text-[#A0A0A0] mb-3">{bucket.label}</div>
                <div className="flex-1 flex items-end">
                  <div
                    className="w-full rounded"
                    style={{ height: `${height}px`, background: bucket.color }}
                  />
                </div>
                <div className="text-[10px] text-[#A0A0A0] mt-3">{bucket.desc}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

