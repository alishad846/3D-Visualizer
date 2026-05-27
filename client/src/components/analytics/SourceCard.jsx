import React, { useEffect, useMemo, useState } from "react";
import { Link, QrCode, Share2 } from "lucide-react";
import { getProductSources, getProjectSources } from "../../api/analytics";

const RANGES = ["7d", "28d", "90d"];

const SOURCE_META = {
  qr_scan: {
    label: "QR Scan",
    description: "Direct physical interaction",
    Icon: QrCode,
  },
  direct_link: {
    label: "Direct Link",
    description: "Typed or bookmarked URL",
    Icon: Link,
  },
  shared_link: {
    label: "Shared Link",
    description: "Opened from shared messages",
    Icon: Share2,
  },
};

const SOURCE_ORDER = ["qr_scan", "direct_link", "shared_link"];

export default function SourceCard({ mode, projectId, productId, refreshTick }) {
  const [range, setRange] = useState("28d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sources, setSources] = useState([]);

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
            ? await getProductSources(scopeId, range)
            : await getProjectSources(scopeId, range);
        if (!cancelled) setSources(data?.sources || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load source data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [mode, projectId, productId, range, refreshTick]);

  const normalized = useMemo(() => {
    const map = Object.fromEntries(sources.map((s) => [s.referrerType, s]));
    return SOURCE_ORDER.map((key) => ({
      referrerType: key,
      scans: Number(map[key]?.scans || 0),
      percentage: Number(map[key]?.percentage || 0),
      trend: map[key]?.trend ?? null,
    }));
  }, [sources]);

  return (
    <div className="bg-[#0b1622] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] uppercase tracking-widest text-[#A0A0A0] font-semibold">
          Traffic Source
        </h3>
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

      {loading ? (
        <div className="h-[260px] shimmer rounded-md" />
      ) : error ? (
        <div className="h-[260px] flex items-center justify-center text-red-300 text-sm">
          Failed to load data. Try refreshing.
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {normalized.map((row) => {
            const meta = SOURCE_META[row.referrerType];
            const trendUp = row.trend !== null && row.trend >= 0;
            const trendColor = trendUp ? "#10b981" : "#f59e0b";
            return (
              <div key={row.referrerType} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <meta.Icon className="w-4 h-4 mt-0.5 text-[#00F0FF]" />
                    <div>
                      <div className="text-sm font-semibold text-white">{meta.label}</div>
                      <div className="text-xs text-[#A0A0A0]">{meta.description}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">{row.scans}</div>
                    {row.trend !== null ? (
                      <div className="text-xs" style={{ color: trendColor }}>
                        {trendUp ? "↑" : "↓"} {Math.abs(row.trend)}%
                      </div>
                    ) : (
                      <div className="text-xs text-transparent">—</div>
                    )}
                  </div>
                </div>
                <div className="mt-2 h-[3px] w-full rounded bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded bg-[#00F0FF]"
                    style={{
                      width: `${Math.max(0, Math.min(100, row.percentage))}%`,
                      opacity: Math.max(0.35, row.percentage / 100),
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

