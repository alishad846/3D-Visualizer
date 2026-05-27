import React, { useEffect, useMemo, useState } from "react";
import { getProductRealtime, getProjectRealtime } from "../../api/analytics";

const COUNTRY_NAMES = {
  US: "United States",
  IN: "India",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  BR: "Brazil",
  JP: "Japan",
  SG: "Singapore",
  AE: "United Arab Emirates",
};

function countryCodeToFlag(code) {
  if (!code || code.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((c) => 127397 + c.charCodeAt())
  );
}

function normalizeLast30(perMinute = []) {
  const now = new Date();
  const map = new Map(
    perMinute.map((row) => [new Date(row.minute).toISOString().slice(0, 16), Number(row.count || 0)])
  );
  const result = [];
  for (let i = 29; i >= 0; i -= 1) {
    const t = new Date(now.getTime() - i * 60_000);
    const key = t.toISOString().slice(0, 16);
    result.push(map.get(key) || 0);
  }
  return result;
}

export default function RealtimeCard({ mode, projectId, productId, refreshTick }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({ activeNow: 0, perMinute: [], byCountry: [] });

  useEffect(() => {
    const scopeId = mode === "product" ? productId : projectId;
    if (!scopeId) return;
    let cancelled = false;
    let intervalId;

    const run = async (isInitial = false) => {
      if (isInitial) setLoading(true);
      if (isInitial) setError("");
      try {
        const payload =
          mode === "product"
            ? await getProductRealtime(scopeId)
            : await getProjectRealtime(scopeId);
        if (!cancelled) setData(payload || { activeNow: 0, perMinute: [], byCountry: [] });
      } catch (err) {
        if (!cancelled && isInitial) setError(err.message || "Failed to load realtime data");
      } finally {
        if (!cancelled && isInitial) setLoading(false);
      }
    };

    run(true);
    intervalId = setInterval(() => run(false), 60_000);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [mode, projectId, productId, refreshTick]);

  const bars = useMemo(() => normalizeLast30(data.perMinute), [data.perMinute]);
  const maxBar = Math.max(...bars, 1);

  return (
    <div className="bg-[#0b1622] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] uppercase tracking-widest text-[#A0A0A0] font-semibold">
          Active right now
        </h3>
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10b981]" />
        </span>
      </div>

      {loading ? (
        <div className="h-[240px] shimmer rounded-md" />
      ) : error ? (
        <div className="h-[240px] flex items-center justify-center text-red-300 text-sm">
          Failed to load data. Try refreshing.
        </div>
      ) : (
        <>
          <div className="text-5xl font-black text-white">{data.activeNow || 0}</div>
          <div className="text-xs text-[#A0A0A0] mt-1 mb-4">viewers in the last 30 minutes</div>

          <div className="h-[60px] flex items-end gap-[2px] mb-4">
            {bars.map((count, idx) => {
              const height = Math.max(4, Math.round((count / maxBar) * 60));
              const alpha = Math.max(0.25, Math.min(1, count / maxBar));
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-sm bg-[#10b981]"
                  style={{ height: `${height}px`, opacity: alpha }}
                />
              );
            })}
          </div>

          <div className="border border-white/5 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_auto] px-3 py-2 text-[10px] uppercase tracking-wider text-[#A0A0A0] border-b border-white/5">
              <span>Country</span>
              <span>Active now</span>
            </div>
            {data.byCountry?.length ? (
              data.byCountry.slice(0, 5).map((row) => (
                <div
                  key={row.countryCode}
                  className="grid grid-cols-[1fr_auto] px-3 py-2 border-b border-white/5 last:border-b-0 text-sm"
                >
                  <span className="text-white">
                    {countryCodeToFlag(row.countryCode)}{" "}
                    {COUNTRY_NAMES[row.countryCode] || row.countryCode || "Unknown"}
                  </span>
                  <span className="text-[#00F0FF] font-semibold">{row.activeCount || 0}</span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-[#A0A0A0]">No active viewers</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

