import React, { useEffect, useMemo, useState } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { getProductDevices, getProjectDevices } from "../../api/analytics";

const RANGES = ["7d", "28d", "90d"];
const DEVICE_COLORS = {
  mobile: "#00F0FF",
  desktop: "rgba(0,240,255,0.5)",
  tablet: "rgba(0,240,255,0.25)",
};

function pct(value, total) {
  if (!total) return 0;
  return Number(((value * 100) / total).toFixed(1));
}

function RowList({ title, rows, keyLabel }) {
  const total = rows.reduce((s, r) => s + Number(r.scans || 0), 0);
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-[#A0A0A0] mb-2">{title}</div>
      <div className="space-y-2">
        {rows.slice(0, title === "BROWSERS" ? 4 : 5).map((row, idx) => {
          const percentage = pct(Number(row.scans || 0), total);
          return (
            <div key={`${row[keyLabel]}-${idx}`} className="text-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white truncate">{row[keyLabel]}</span>
                <span className="text-[#A0A0A0]">{row.scans} ({percentage}%)</span>
              </div>
              <div className="h-1.5 rounded bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded bg-[#00F0FF]"
                  style={{ width: `${Math.max(1, percentage)}%`, opacity: 1 - idx * 0.12 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function DeviceCard({ mode, projectId, productId, refreshTick }) {
  const [range, setRange] = useState("28d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    deviceTypes: [],
    operatingSystems: [],
    browsers: [],
  });

  useEffect(() => {
    const scopeId = mode === "product" ? productId : projectId;
    if (!scopeId) return;
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const payload =
          mode === "product"
            ? await getProductDevices(scopeId, range)
            : await getProjectDevices(scopeId, range);
        if (!cancelled) setData(payload || { deviceTypes: [], operatingSystems: [], browsers: [] });
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load device data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [mode, projectId, productId, range, refreshTick]);

  const normalizedDevices = useMemo(() => {
    const map = { mobile: 0, desktop: 0, tablet: 0 };
    data.deviceTypes.forEach((d) => {
      const key = String(d.deviceType || "").toLowerCase();
      if (key in map) map[key] += Number(d.scans || 0);
    });
    return [
      { deviceType: "mobile", scans: map.mobile },
      { deviceType: "desktop", scans: map.desktop },
      { deviceType: "tablet", scans: map.tablet },
    ];
  }, [data.deviceTypes]);

  const totalScans = normalizedDevices.reduce((s, d) => s + d.scans, 0);

  return (
    <div className="bg-[#0b1622] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] uppercase tracking-widest text-[#A0A0A0] font-semibold">
          Device and Browser
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
        <div className="space-y-4">
          {/* Mobile stacked bar fallback */}
          <div className="md:hidden">
            <div className="h-3 rounded bg-white/5 overflow-hidden flex">
              {normalizedDevices.map((d) => (
                <div
                  key={d.deviceType}
                  style={{
                    width: `${pct(d.scans, totalScans)}%`,
                    background: DEVICE_COLORS[d.deviceType],
                  }}
                />
              ))}
            </div>
            <div className="mt-2 space-y-1">
              {normalizedDevices.map((d) => (
                <div key={d.deviceType} className="flex justify-between text-xs">
                  <span className="text-[#A0A0A0] capitalize">{d.deviceType}</span>
                  <span className="text-white">{d.scans} ({pct(d.scans, totalScans)}%)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:grid md:grid-cols-2 gap-5">
            <div className="h-[230px] flex justify-center">
              <PieChart width={280} height={220}>
                <Pie
                  data={normalizedDevices}
                  dataKey="scans"
                  nameKey="deviceType"
                  innerRadius={55}
                  outerRadius={80}
                  cx="50%"
                  cy="45%"
                >
                  {normalizedDevices.map((entry) => (
                    <Cell key={entry.deviceType} fill={DEVICE_COLORS[entry.deviceType]} />
                  ))}
                </Pie>
                <text x="50%" y="44%" textAnchor="middle" fill="#fff" fontSize="20" fontWeight="700">
                  {totalScans}
                </text>
                <text x="50%" y="53%" textAnchor="middle" fill="#A0A0A0" fontSize="11">
                  Total Scans
                </text>
              </PieChart>
              <div className="mt-2 space-y-1">
                {normalizedDevices.map((d) => (
                  <div key={d.deviceType} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#A0A0A0] capitalize">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: DEVICE_COLORS[d.deviceType] }}
                      />
                      {d.deviceType}
                    </div>
                    <span className="text-white">{d.scans} ({pct(d.scans, totalScans)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <RowList title="OPERATING SYSTEMS" rows={data.operatingSystems} keyLabel="os" />
              <RowList title="BROWSERS" rows={data.browsers} keyLabel="browser" />
            </div>
          </div>

          <div className="md:hidden space-y-5">
            <RowList title="OPERATING SYSTEMS" rows={data.operatingSystems} keyLabel="os" />
            <RowList title="BROWSERS" rows={data.browsers} keyLabel="browser" />
          </div>
        </div>
      )}
    </div>
  );
}

