import React, { useEffect, useMemo, useState } from "react";
import { getProjectProducts } from "../../api/analytics";
import { timeAgo } from "../../utils/timeAgo";

const RANGES = ["7d", "28d", "90d"];
const SORT_OPTIONS = [
  { key: "scans", label: "scans" },
  { key: "unique_visitors", label: "unique visitors" },
  { key: "avg_session", label: "avg session" },
  { key: "ar_rate", label: "ar rate" },
  { key: "last_scanned", label: "last scanned" },
];

function MiniSparkline({ points }) {
  const values = Array.from({ length: 7 }).map((_, idx) => Number(points?.[idx]?.scans || 0));
  const max = Math.max(...values, 1);
  return (
    <svg width="56" height="24" viewBox="0 0 56 24">
      {values.map((v, idx) => {
        const h = Math.max(2, (v / max) * 20);
        return (
          <rect
            key={idx}
            x={idx * 8 + 1}
            y={24 - h}
            width="6"
            height={h}
            rx="1"
            fill="#00F0FF"
            opacity={0.9}
          />
        );
      })}
    </svg>
  );
}

export default function ProductsTableCard({ projectId, refreshTick }) {
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
        if (!cancelled) setError(err.message || "Failed to load product performance");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [projectId, range, sort, refreshTick]);

  const sortLabel = useMemo(
    () => SORT_OPTIONS.find((s) => s.key === sort)?.label || sort,
    [sort]
  );

  return (
    <div className="bg-[#0b1622] border border-white/5 rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Product Performance</h3>
          <p className="text-xs text-[#A0A0A0]">All products in this project</p>
        </div>
        <div className="flex items-center gap-2">
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
          <span className="text-xs text-[#A0A0A0] capitalize">Sort: {sortLabel}</span>
        </div>
      </div>

      {loading ? (
        <div className="h-[280px] shimmer rounded-md" />
      ) : error ? (
        <div className="h-[280px] flex items-center justify-center text-red-300 text-sm">
          Failed to load data. Try refreshing.
        </div>
      ) : products.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-[#A0A0A0] text-sm">
          No products found for this project
        </div>
      ) : (
        <>
          {/* Desktop/tablet table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-[#A0A0A0] border-b border-white/5">
                <tr>
                  <th className="text-left py-2">Product</th>
                  {[
                    ["Total Scans", "scans"],
                    ["Unique Visitors", "unique_visitors"],
                    ["Avg Session", "avg_session"],
                    ["AR%", "ar_rate"],
                    ["Last Scanned", "last_scanned"],
                  ].map(([label, key]) => (
                    <th
                      key={key}
                      className="text-right py-2 cursor-pointer"
                      onClick={() => setSort(key)}
                    >
                      <span className={sort === key ? "text-[#00F0FF]" : ""}>
                        {label} {sort === key ? "▼" : ""}
                      </span>
                    </th>
                  ))}
                  <th className="text-right py-2 hidden xl:table-cell">7D Trend</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-white/[0.04] ${p.isDead ? "opacity-50" : ""}`}
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {p.thumbnailUrl ? (
                          <img
                            src={p.thumbnailUrl}
                            alt={p.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-[rgba(0,240,255,0.1)] grid place-items-center text-xs">
                            ⬡
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">
                            {p.isDead ? <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-2" /> : null}
                            {p.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right text-white">{p.totalScans}</td>
                    <td className="py-3 text-right text-white">{p.uniqueVisitors}</td>
                    <td className="py-3 text-right text-white">{Math.round(p.avgSessionSeconds || 0)}s</td>
                    <td className="py-3 text-right text-white">{p.arRate}%</td>
                    <td className="py-3 text-right text-white">{timeAgo(p.lastScanned)}</td>
                    <td className="py-3 text-right hidden xl:table-cell">
                      <MiniSparkline points={p.sparkline} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile expandable rows */}
          <div className="md:hidden divide-y divide-white/5">
            {products.map((p) => (
              <div key={p.id}>
                <button
                  type="button"
                  className="w-full py-3 flex items-center justify-between text-left"
                  onClick={() => setOpenRow(openRow === p.id ? null : p.id)}
                >
                  <span className="text-white font-medium truncate">{p.name}</span>
                  <span className="text-white">{p.totalScans}</span>
                </button>
                {openRow === p.id && (
                  <div className="pb-3 text-xs text-[#A0A0A0] space-y-1">
                    <div>Unique Visitors: {p.uniqueVisitors}</div>
                    <div>Avg Session: {Math.round(p.avgSessionSeconds || 0)}s</div>
                    <div>AR Rate: {p.arRate}%</div>
                    <div>Last Scanned: {timeAgo(p.lastScanned)}</div>
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

