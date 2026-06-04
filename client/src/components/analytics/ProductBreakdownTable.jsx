import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { getProjectProducts } from "../../api/analytics";
import { timeAgo } from "../../utils/timeAgo";

const RANGES = ["7d", "28d", "90d"];

const COLUMNS = [
  { key: "scans",           label: "Total Scans" },
  { key: "unique_visitors", label: "Unique Visitors" },
  { key: "avg_session",     label: "Avg Session" },
  { key: "ar_rate",         label: "AR%" },
  { key: "last_scanned",    label: "Last Scanned" },
];

function MiniSparkline({ points }) {
  const values = Array.from({ length: 7 }).map(
    (_, i) => Number(points?.[i]?.scans || 0)
  );
  const max = Math.max(...values, 1);
  return (
    <svg width="56" height="24" viewBox="0 0 56 24" aria-hidden="true">
      {values.map((v, i) => {
        const h = Math.max(2, (v / max) * 20);
        return (
          <rect
            key={i}
            x={i * 8 + 1}
            y={24 - h}
            width="6"
            height={h}
            rx="1"
            fill="#00F0FF"
            opacity={0.85}
          />
        );
      })}
    </svg>
  );
}

function RankBadge({ rank }) {
  if (rank === 1)
    return (
      <span className="w-5 h-5 flex-shrink-0 rounded-full bg-[#00F0FF] text-[#050b14] text-[10px] font-black flex items-center justify-center shadow-[0_0_8px_rgba(0,240,255,0.6)]">
        1
      </span>
    );
  if (rank <= 3)
    return (
      <span className="w-5 h-5 flex-shrink-0 rounded-full bg-[#00F0FF]/20 text-[#00F0FF] text-[10px] font-bold flex items-center justify-center">
        {rank}
      </span>
    );
  return (
    <span className="w-5 h-5 flex-shrink-0 rounded-full bg-white/5 text-[#A0A0A0] text-[10px] font-semibold flex items-center justify-center">
      {rank}
    </span>
  );
}

/**
 * ProductBreakdownTable
 * Props:
 *   projectId: string — active project UUID
 *   refreshTick: number — bump to force refetch
 *   onProductClick: (productId) => void — optional deep-link handler
 */
export default function ProductBreakdownTable({ projectId, refreshTick, onProductClick }) {
  const navigate = useNavigate();
  const [range, setRange] = useState("28d");
  const [sort, setSort] = useState("scans");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [products, setProducts] = useState([]);
  const [openRow, setOpenRow] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const data = await getProjectProducts(projectId, range, sort);
        if (!cancelled) setProducts(data?.products || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load product data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [projectId, range, sort, refreshTick]);

  const handleRowClick = (p) => {
    if (onProductClick) {
      onProductClick(p.id);
    } else {
      navigate(`/dashboard/analytics?productId=${encodeURIComponent(p.id)}`);
    }
  };

  return (
    <div className="bg-[#0b1622] border border-white/5 rounded-xl p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-white">Product Breakdown</h3>
          <p className="text-xs text-[#A0A0A0] mt-0.5">
            All products within this project — sorted by highest {COLUMNS.find(c => c.key === sort)?.label.toLowerCase() || sort}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            id="product-breakdown-range"
            className="bg-[#071018] border border-white/10 rounded-md px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            {RANGES.map((r) => (
              <option key={r} value={r}>{r.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* States */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 shimmer rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <div className="h-[220px] flex items-center justify-center text-red-300 text-sm">
          Failed to load data. Try refreshing.
        </div>
      ) : products.length === 0 ? (
        <div className="h-[200px] flex flex-col items-center justify-center gap-2 text-[#A0A0A0]">
          <span className="text-3xl">⬡</span>
          <p className="text-sm">No products found for this project</p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[#A0A0A0] border-b border-white/5">
                  <th className="text-left pb-3 pr-4 font-semibold w-8">#</th>
                  <th className="text-left pb-3 font-semibold">Product</th>
                  {COLUMNS.map(({ key, label }) => (
                    <th
                      key={key}
                      className="text-right pb-3 pl-4 font-semibold cursor-pointer select-none group whitespace-nowrap"
                      onClick={() => setSort(key)}
                    >
                      <span
                        className={`inline-flex items-center gap-1 transition-colors ${
                          sort === key
                            ? "text-[#00F0FF]"
                            : "text-[#A0A0A0] group-hover:text-white"
                        }`}
                      >
                        {label}
                        {/* ▼ only shown on the active sort column */}
                        {sort === key && (
                          <span className="text-[#00F0FF] text-[10px] leading-none">▼</span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="text-right pb-3 pl-4 font-semibold hidden xl:table-cell">
                    7D Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p, idx) => (
                  <tr
                    key={p.id}
                    onClick={() => handleRowClick(p)}
                    className={`border-b border-white/[0.04] last:border-b-0 cursor-pointer transition-colors hover:bg-[#00F0FF]/[0.03] group ${
                      p.isDead ? "opacity-50" : ""
                    }`}
                  >
                    <td className="py-3.5 pr-4">
                      <RankBadge rank={idx + 1} />
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3 min-w-0">
                        {p.thumbnailUrl ? (
                          <img
                            src={p.thumbnailUrl}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-white/10"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-[rgba(0,240,255,0.08)] border border-[#00F0FF]/10 grid place-items-center text-sm flex-shrink-0">
                            ⬡
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-white font-semibold truncate flex items-center gap-2">
                            {p.isDead && (
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"
                                title="No scans in selected period"
                              />
                            )}
                            {p.name}
                          </div>
                          {p.isDead && (
                            <div className="text-[10px] text-amber-400/70 mt-0.5">
                              No recent activity
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <span className={`font-semibold ${sort === "scans" ? "text-[#00F0FF]" : "text-white"}`}>
                        {Number(p.totalScans || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <span className={`font-semibold ${sort === "unique_visitors" ? "text-[#00F0FF]" : "text-white"}`}>
                        {Number(p.uniqueVisitors || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <span className={`font-semibold ${sort === "avg_session" ? "text-[#00F0FF]" : "text-white"}`}>
                        {Math.round(p.avgSessionSeconds || 0)}s
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <span className={`font-semibold ${sort === "ar_rate" ? "text-[#00F0FF]" : "text-white"}`}>
                        {p.arRate}%
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right text-[#A0A0A0] text-xs">
                      {timeAgo(p.lastScanned)}
                    </td>
                    <td className="py-3.5 pl-4 text-right hidden xl:table-cell">
                      <MiniSparkline points={p.sparkline} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile expandable rows ── */}
          <div className="md:hidden divide-y divide-white/5">
            {products.map((p, idx) => (
              <div key={p.id}>
                <button
                  type="button"
                  className="w-full py-3.5 flex items-center gap-3 text-left"
                  onClick={() => setOpenRow(openRow === p.id ? null : p.id)}
                >
                  <RankBadge rank={idx + 1} />
                  {p.thumbnailUrl ? (
                    <img
                      src={p.thumbnailUrl}
                      alt={p.name}
                      className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[rgba(0,240,255,0.08)] grid place-items-center text-xs flex-shrink-0">⬡</div>
                  )}
                  <span className="text-white font-semibold flex-1 truncate">{p.name}</span>
                  <span className="text-[#00F0FF] font-bold text-sm">
                    {Number(p.totalScans || 0).toLocaleString()}
                  </span>
                </button>

                {openRow === p.id && (
                  <div className="pb-4 pl-8 grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-[#A0A0A0]">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-0.5">Unique Visitors</div>
                      <div className="text-white font-semibold">{Number(p.uniqueVisitors || 0).toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-0.5">Avg Session</div>
                      <div className="text-white font-semibold">{Math.round(p.avgSessionSeconds || 0)}s</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-0.5">AR Rate</div>
                      <div className="text-white font-semibold">{p.arRate}%</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider mb-0.5">Last Scanned</div>
                      <div className="text-white font-semibold">{timeAgo(p.lastScanned)}</div>
                    </div>
                    <div className="col-span-2 mt-1">
                      <button
                        type="button"
                        onClick={() => handleRowClick(p)}
                        className="text-[#00F0FF] text-xs font-semibold flex items-center gap-1 hover:underline"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        View Product Analytics
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
