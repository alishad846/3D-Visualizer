import React, { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { getProductGeo, getProjectGeo } from "../../api/analytics";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const RANGES = ["7d", "28d", "90d"];

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
  ES: "Spain",
  IT: "Italy",
  MX: "Mexico",
  NL: "Netherlands",
  SE: "Sweden",
  CH: "Switzerland",
  ZA: "South Africa",
  KR: "South Korea",
  ID: "Indonesia",
};

function countryCodeToFlag(code) {
  if (!code || code.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((c) => 127397 + c.charCodeAt())
  );
}

function getCountryName(code) {
  return COUNTRY_NAMES[code] || code || "Unknown";
}

function fillByValue(scans, max) {
  if (!max) return "#0b1622";
  const t = Math.min(1, scans / max);
  const from = { r: 11, g: 22, b: 34 };
  const to = { r: 0, g: 240, b: 255 };
  const r = Math.round(from.r + (to.r - from.r) * t);
  const g = Math.round(from.g + (to.g - from.g) * t);
  const b = Math.round(from.b + (to.b - from.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

export default function GeoCard({ mode, projectId, productId, refreshTick }) {
  const [range, setRange] = useState("28d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [countries, setCountries] = useState([]);
  const [tooltip, setTooltip] = useState(null);

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
            ? await getProductGeo(scopeId, range)
            : await getProjectGeo(scopeId, range);
        if (!cancelled) setCountries(data?.countries || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load geo data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [mode, projectId, productId, range, refreshTick]);

  const maxScans = useMemo(
    () => countries.reduce((max, c) => Math.max(max, Number(c.scans || 0)), 0),
    [countries]
  );

  const byCode = useMemo(() => {
    const map = {};
    countries.forEach((c) => {
      map[c.countryCode] = c;
    });
    return map;
  }, [countries]);

  const byName = useMemo(() => {
    const map = {};
    countries.forEach((c) => {
      const name = getCountryName(c.countryCode);
      map[String(name).toLowerCase()] = c;
    });
    return map;
  }, [countries]);

  return (
    <div className="bg-[#0b1622] border border-white/5 rounded-xl p-5 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[11px] uppercase tracking-widest text-[#A0A0A0] font-semibold">
          Scans by Country
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
      ) : countries.length === 0 ? (
        <div className="h-[260px] flex items-center justify-center text-[#A0A0A0] text-sm">
          No scans recorded in this period
        </div>
      ) : (
        <div className="grid md:grid-cols-[55%_45%] gap-4">
          <div className="hidden md:block bg-[#071018] rounded-lg border border-white/5 p-2">
            <ComposableMap
              projection="geoMercator"
              width={600}
              height={280}
              style={{ width: "100%", height: "280px", background: "#071018" }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const geoName = geo.properties?.name || "";
                    const code = geo.properties?.iso_a2 || "";
                    const item = byCode[code] || byName[String(geoName).toLowerCase()];
                    const scans = Number(item?.scans || 0);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillByValue(scans, maxScans)}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={0.5}
                        onMouseMove={(evt) => {
                          if (!item) return;
                          setTooltip({
                            x: evt.clientX + 12,
                            y: evt.clientY + 12,
                            code,
                            scans,
                            percentage: item.percentage || 0,
                          });
                        }}
                        onMouseEnter={(evt) => {
                          if (!item) return;
                          setTooltip({
                            x: evt.clientX + 12,
                            y: evt.clientY + 12,
                            code,
                            scans,
                            percentage: item.percentage || 0,
                          });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          default: { outline: "none" },
                          hover: { fill: "rgba(0,240,255,0.4)", outline: "none", cursor: "pointer" },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>

          <div className="border border-white/5 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto] px-3 py-2 text-[10px] uppercase tracking-wider text-[#A0A0A0] border-b border-white/5">
              <span>Region</span>
              <span>Scans</span>
              <span>% Total</span>
            </div>
            {countries.slice(0, 7).map((row, idx) => (
              <div
                key={row.countryCode}
                className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-2 border-b border-white/[0.04] last:border-b-0 text-sm items-center"
              >
                <span className="text-white truncate">
                  {countryCodeToFlag(row.countryCode)} {getCountryName(row.countryCode)}
                </span>
                <span className="text-white text-right">{row.scans}</span>
                <div className={`relative min-w-[84px] rounded px-2 py-0.5 text-right ${idx === 0 ? "text-[#00F0FF] bg-[rgba(0,240,255,0.2)]" : "text-[#A0A0A0]"}`}>
                  <div
                    className="absolute left-0 top-0 h-full bg-[rgba(0,240,255,0.15)] rounded"
                    style={{ width: `${Math.max(0, Math.min(100, row.percentage || 0))}%` }}
                  />
                  <span className="relative z-10">{row.percentage || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tooltip && (
        <div
          className="fixed z-50 bg-[#0b1622] border border-white/10 rounded-md px-3 py-2 text-xs pointer-events-none"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="text-white font-semibold">{getCountryName(tooltip.code)}</div>
          <div className="text-[#A0A0A0]">{tooltip.scans} scans · {tooltip.percentage}%</div>
        </div>
      )}
    </div>
  );
}

