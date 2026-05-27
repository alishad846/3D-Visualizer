import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Box,
  CheckCircle2,
  Layers,
  QrCode,
  ScanLine,
  Smartphone,
  Upload,
  View,
} from "lucide-react";

import { useAuthStore } from "../store/authStore";
import ProductCanvas from "../components/product/viewer/canvas/ProductCanvas";
import QRScanner from "../components/qr/QRScanner";

// ─── Static data ────────────────────────────────────────────────────────────

const STEPS = [
  {
    icon: Upload,
    label: "Upload your product",
    text: "Add a 3D model, a thumbnail, and your product details.",
  },
  {
    icon: QrCode,
    label: "Publish and print a QR",
    text: "Get a link and a QR code you can print on packaging or cards.",
  },
  {
    icon: Smartphone,
    label: "Customers scan and explore",
    text: "Your customers open a 3D page, view specs, and try AR on supported phones.",
  },
];

const FEATURE_CARDS = [
  {
    icon: Box,
    title: "3D product viewer",
    text: "Show a real model instead of a PDF or a static image.",
  },
  {
    icon: Smartphone,
    title: "AR on mobile",
    text: "Place your product on a table or floor in AR, where supported.",
  },
  {
    icon: QrCode,
    title: "QR codes and redirects",
    text: "Create shareable links and QR codes from each product you publish.",
  },
  {
    icon: BarChart3,
    title: "Analytics dashboard",
    text: "See scans, device types, and AR usage per product.",
  },
];

const SOCIAL_BRANDS = ["TECHNE", "LUMINA", "VERTEX", "NEXUS"];

const QUICK_STATS = [
  { k: "Products managed", v: "1,200+" },
  { k: "Scans per day", v: "25k+" },
  { k: "AR clicks", v: "18%" },
];

const EXAMPLE_PRODUCTS = [
  {
    name: "Wireless headphones",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Smart watch",
    category: "Wearables",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Desk lamp",
    category: "Home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
  },
];

const USE_CASES = [
  {
    icon: Layers,
    title: "Retail packaging",
    text: "Replace manual-heavy QR pages with a 3D product view and quick specs.",
  },
  {
    icon: Box,
    title: "D2C product pages",
    text: "Give customers a clearer model preview before checkout.",
  },
  {
    icon: ScanLine,
    title: "Manuals and support",
    text: "Turn instructions into a visual experience with AR where available.",
  },
];

const DASHBOARD_STATS = [
  { label: "Products", value: "12", icon: Layers },
  { label: "Published", value: "7", icon: Box },
  { label: "Scans (7d)", value: "2,481", icon: BarChart3 },
  { label: "AR used", value: "18%", icon: Smartphone },
];

const HERO_BADGES = [
  { label: "3D viewer", value: "Ready" },
  { label: "AR support", value: "iOS/Android" },
  { label: "QR links", value: "Publish" },
];

const PRODUCT_EXPERIENCE_BULLETS = [
  "Fast 3D viewer that works on modern browsers.",
  "AR support for iOS and Android where available.",
  "Plain-language specs and highlights pulled from your product data.",
];

const FOR_TEAMS_BULLETS = [
  "Projects: group products by campaign or client.",
  "Products: upload models and edit specs in one place.",
  "Publishing: create QR codes from your products.",
  "Analytics: see scans, device types, and AR usage per product.",
];

const AFTER_SCAN_STEPS = [
  "The page opens in your browser.",
  "You can rotate the 3D model and read the specs.",
  "If AR is supported, you'll see the AR option.",
];

const PRICING_BULLETS = [
  "No credit card needed to create your first product.",
  "Pay only when you publish more products or increase traffic.",
];

const PRICING_FEATURES = [
  "Add products with 3D models and specs.",
  "Upload thumbnails and gallery images.",
  "Publish QR codes for each product.",
  "Track scans and AR usage in your dashboard.",
];

const FOOTER_LINKS = [
  { label: "Product", onClick: (scrollToId) => scrollToId("what") },
  { label: "Docs", onClick: () => alert("Docs are not set up yet.") },
  { label: "Privacy", onClick: () => alert("Privacy page is a stub.") },
  { label: "Terms", onClick: () => alert("Terms page is a stub.") },
  { label: "Contact", onClick: () => alert("Contact is a stub.") },
];

// ─── Shared sub-components ───────────────────────────────────────────────────

function IconBox({ icon: Icon }) {
  return (
    <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/25 flex items-center justify-center text-[#00F0FF] mb-4">
      <Icon className="w-5 h-5" />
    </div>
  );
}

function FeatureCard({ icon, title, text, hover = false }) {
  return (
    <div
      className={`rounded-3xl bg-[#0c1324]/40 border border-white/10 p-7 ${
        hover ? "hover:border-[#00F0FF]/30 transition-colors" : ""
      }`}
    >
      <IconBox icon={icon} />
      <div className="font-bold text-lg mb-2">{title}</div>
      <div className="text-sm text-slate-400 leading-relaxed">{text}</div>
    </div>
  );
}

function CheckItem({ text }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/[0.03] border border-white/8 p-4">
      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
      <div className="text-sm text-slate-200 leading-relaxed">{text}</div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="text-center mb-10">
      <h2 className="text-3xl md:text-4xl font-bold mb-3">{title}</h2>
      {subtitle && <p className="text-slate-400 max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

function PrimaryBtn({ onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-3 bg-[#00F0FF] text-[#050b14] rounded-xl font-bold text-sm hover:bg-[#00D8E6] transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

function OutlineBtn({ onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-6 py-3 border border-white/15 rounded-xl font-semibold text-sm text-white hover:bg-white/5 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [scrolled, setScrolled] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    setTimeout(() => scrollToId(id), 60);
    if (id === "scan") setShowScanner(true);
  }, [location.hash]);

  const primaryCta = () => navigate(isAuthenticated ? "/dashboard" : "/register");

  const viewerCta = useMemo(
    () => (isAuthenticated ? "Open dashboard" : "Get started"),
    [isAuthenticated]
  );

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-sans selection:bg-cyan-400/30">

      {/* ── Header ── */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#02050a]/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 font-bold tracking-wide"
          >
            <View className="w-5 h-5 text-[#00F0FF]" />
            <span>Scan<span className="text-[#00F0FF]">Vista</span></span>
          </button>

          <nav className="hidden lg:flex items-center gap-8 text-sm text-slate-400">
            {[
              { label: "How it works", id: "how" },
              { label: "3D & AR", id: "product-experience" },
              { label: "For teams", id: "for-teams" },
              { label: "Pricing", id: "pricing" },
            ].map(({ label, id }) => (
              <button key={id} type="button" onClick={() => scrollToId(id)} className="hover:text-white">
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="hidden md:inline-flex text-sm font-semibold text-slate-300 hover:text-white"
              >
                Dashboard
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex text-sm font-semibold text-slate-400 hover:text-white"
              >
                Sign in
              </Link>
            )}
            <button
              type="button"
              onClick={primaryCta}
              className="px-4 py-2 bg-[#00F0FF] text-[#050b14] text-sm font-bold rounded-full hover:bg-[#00D8E6] transition-colors"
            >
              {viewerCta}
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="hero" className="relative pt-28 pb-16 px-5 overflow-hidden scroll-mt-24">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-20 left-0 w-64 h-64 bg-white/[0.03] rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center relative z-10">
          <div className="lg:pr-6">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 backdrop-blur-md mb-6">
                <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                Live 3D demo
              </div>

              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Turn product QR codes into a 3D page
              </h1>

              <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-2xl">
                Upload a model, publish a link, and let customers view and try your product in 3D.
                On supported phones, they can also try AR.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={primaryCta}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00F0FF] text-[#050b14] rounded-full font-bold text-sm hover:bg-[#00D8E6] transition-colors"
                >
                  {isAuthenticated ? "Open dashboard" : "Start free"}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowScanner(true); scrollToId("scan"); }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/15 rounded-full font-semibold text-sm text-white hover:bg-white/5 transition-colors"
                >
                  <ScanLine className="w-4 h-4" />
                  Scan a demo
                </button>
              </div>

              <div className="mt-6 text-sm text-slate-500">
                Fast setup. Simple publish. Clear results in your dashboard.
              </div>
            </motion.div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/10 bg-[#0c1324]/40 shadow-[0_0_40px_rgba(0,240,255,0.08)] overflow-hidden">
              <div className="absolute top-4 left-4 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs text-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
                  Demo product model
                </div>
              </div>
              <div className="h-[360px] md:h-[460px]">
                <ProductCanvas modelUrl="/models/headphone.glb" autoRotate enableZoom={false} enablePan={false} />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {HERO_BADGES.map((x) => (
                <div key={x.label} className="rounded-2xl bg-white/[0.03] border border-white/8 p-4">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{x.label}</div>
                  <div className="text-sm font-semibold text-white mt-1">{x.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof / quick stats ── */}
      <section className="py-10 px-5 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-wrap items-center gap-6 opacity-60">
              {SOCIAL_BRANDS.map((b) => (
                <span key={b} className="text-lg font-bold tracking-widest text-slate-200">{b}</span>
              ))}
            </div>
            <div className="flex gap-4">
              {QUICK_STATS.map((s) => (
                <div key={s.k} className="min-w-[170px] rounded-2xl bg-white/[0.03] border border-white/8 p-4">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.k}</div>
                  <div className="text-sm font-semibold text-white mt-1">{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What you get ── */}
      <section id="what" className="py-16 px-5 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="What you get with ScanVista"
            subtitle="Upload a model, publish a QR, and give customers a clear 3D view of your product."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURE_CARDS.map((c) => <FeatureCard key={c.title} {...c} hover />)}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-16 px-5 border-t border-white/5 bg-[#070d18] scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="How it works"
            subtitle="Three steps from upload to a page your customers can open by scanning."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-3xl bg-[#0c1324]/40 border border-white/10 p-7"
              >
                <IconBox icon={step.icon} />
                <div className="text-xs text-[#00F0FF] font-bold mb-2">Step {i + 1}</div>
                <div className="font-bold text-lg mb-2">{step.label}</div>
                <div className="text-sm text-slate-400 leading-relaxed">{step.text}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product experience ── */}
      <section id="product-experience" className="py-16 px-5 scroll-mt-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">A real product page</h2>
            <p className="text-slate-400 mb-6 max-w-xl leading-relaxed">
              Customers don't need to guess. They can spin the 3D model, read specs in plain
              language, and try AR on supported devices.
            </p>
            <div className="space-y-4">
              {PRODUCT_EXPERIENCE_BULLETS.map((t) => <CheckItem key={t} text={t} />)}
            </div>
          </div>

          <div>
            <div className="rounded-3xl border border-white/10 bg-[#0c1324]/40 p-3 overflow-hidden">
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="font-bold">3D viewer</div>
                <div className="text-xs text-slate-500">3D + specs</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-black/40 overflow-hidden">
                <div className="h-[300px]">
                  <ProductCanvas modelUrl="/models/headphone.glb" autoRotate enableZoom={false} enablePan={false} />
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 px-4 pt-4 pb-5">
                {["Spin", "Zoom", "Specs", "AR", "QR"].map((x) => (
                  <div key={x} className="col-span-1 rounded-xl bg-white/[0.03] border border-white/8 px-3 py-2">
                    <div className="text-[10px] text-slate-500">{x}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <div className="w-[220px] rounded-3xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs text-slate-500 mb-2">Phone AR preview</div>
                <div className="h-[220px] rounded-2xl bg-white/[0.03] border border-white/8 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/25 flex items-center justify-center mx-auto mb-3">
                      <Smartphone className="w-5 h-5 text-[#00F0FF]" />
                    </div>
                    <div className="text-sm font-bold mb-1">Try AR</div>
                    <div className="text-[11px] text-slate-500 leading-relaxed">One tap on supported phones</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── For teams ── */}
      <section id="for-teams" className="py-16 px-5 border-t border-white/5 bg-[#070d18] scroll-mt-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for product and marketing teams
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl leading-relaxed">
              Publish product pages without waiting for a developer. Organize products by project
              or client, and track how often customers scan your QR codes.
            </p>
            <div className="space-y-4">
              {FOR_TEAMS_BULLETS.map((t) => <CheckItem key={t} text={t} />)}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
              <PrimaryBtn onClick={() => navigate("/register")}>Start free</PrimaryBtn>
              <OutlineBtn onClick={() => navigate("/showcase")}>See example pages</OutlineBtn>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0c1324]/40 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
              <div className="font-bold">Creator dashboard</div>
              <div className="text-xs text-slate-500">Overview</div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                {DASHBOARD_STATS.map((s) => (
                  <div key={s.label} className="rounded-2xl bg-black/30 border border-white/8 p-4">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-lg font-bold text-white">{s.value}</div>
                      <s.icon className="w-5 h-5 text-[#00F0FF]" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-black/30 border border-white/8 p-4">
                <div className="text-sm font-bold mb-3">Recent products</div>
                <div className="space-y-2">
                  {EXAMPLE_PRODUCTS.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between gap-4 rounded-xl bg-white/[0.03] border border-white/8 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{p.name}</div>
                        <div className="text-[11px] text-slate-500 truncate">{p.category}</div>
                      </div>
                      <div className="text-xs text-[#00F0FF] font-bold">View</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Use cases ── */}
      <section className="py-16 px-5 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            title="Use cases"
            subtitle="Common ways teams use ScanVista to turn QR codes into helpful 3D experiences."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {USE_CASES.map((c) => <FeatureCard key={c.title} {...c} />)}
          </div>
        </div>
      </section>

      {/* ── QR scanner ── */}
      <section id="scan" className="py-16 px-5 border-t border-white/5 bg-[#070d18] scroll-mt-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-10 items-start">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Already have a ScanVista QR?</h2>
            <p className="text-slate-400 mb-8 leading-relaxed max-w-xl">
              Scan here and open the matching product page. On supported phones, you'll also see the AR option.
            </p>

            {!showScanner ? (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#00F0FF] text-[#050b14] rounded-2xl font-bold text-sm hover:bg-[#00D8E6] transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                  Open scanner
                </button>
                <div className="text-xs text-slate-500">Tip: use a phone for the best experience.</div>
              </div>
            ) : (
              <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/30">
                <QRScanner embedded />
              </div>
            )}

            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate("/p/demo")}
                className="text-cyan-400 hover:underline text-sm font-semibold"
              >
                Open sample product
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0c1324]/40 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/10 border border-[#00F0FF]/25 flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-[#00F0FF]" />
              </div>
              <div>
                <div className="font-bold text-lg">What happens after you scan</div>
                <div className="text-xs text-slate-500">Short, clear flow</div>
              </div>
            </div>

            <div className="space-y-3">
              {AFTER_SCAN_STEPS.map((s, i) => (
                <div key={s} className="rounded-2xl bg-white/[0.03] border border-white/8 px-4 py-3 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-[#00F0FF]/10 border border-[#00F0FF]/25 flex items-center justify-center text-[#00F0FF] font-bold text-xs mt-0.5">
                    {i + 1}
                  </div>
                  <div className="text-sm text-slate-200 leading-relaxed">{s}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {EXAMPLE_PRODUCTS.map((p) => (
                <div key={p.name} className="rounded-2xl overflow-hidden border border-white/8 bg-black/20">
                  <div className="aspect-[4/3] bg-black/20 overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{p.category}</div>
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-16 px-5 border-t border-white/5 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-3xl bg-[#0c1324]/40 border border-white/10 p-10">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">Pricing</div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Start free. Scale when you're ready.</h2>
                <ul className="space-y-3 mb-6">
                  {PRICING_BULLETS.map((t) => (
                    <li key={t} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5" />
                      <span className="text-sm text-slate-200 leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <PrimaryBtn onClick={() => alert("Sales contact is not set up yet.")}>Talk to us</PrimaryBtn>
                  <OutlineBtn onClick={() => alert("Pricing page is coming soon.")}>View pricing (coming soon)</OutlineBtn>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/25 p-6">
                <div className="font-bold text-lg mb-3">What you can do</div>
                <div className="space-y-3">
                  {PRICING_FEATURES.map((t) => (
                    <div key={t} className="rounded-2xl bg-white/[0.03] border border-white/8 px-4 py-3 text-sm text-slate-200 leading-relaxed">
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 px-5 border-t border-white/5 bg-[#02050a] scroll-mt-24">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to try ScanVista?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
            Start free, add one product, upload your model, and publish a QR code in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={primaryCta}
              className="px-10 py-4 bg-[#00F0FF] text-[#050b14] rounded-full font-bold text-sm hover:bg-[#00D8E6] transition-colors"
            >
              Start free
            </button>
            <button
              type="button"
              onClick={() => alert("Walkthrough booking is a stub for now.")}
              className="px-10 py-4 border border-white/15 rounded-full font-semibold text-sm text-white hover:bg-white/5 transition-colors"
            >
              Book a walkthrough
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-5 border-t border-white/5 text-center">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <View className="w-4 h-4 text-[#00F0FF]" />
              <div className="font-bold">Scan<span className="text-[#00F0FF]">Vista</span></div>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-6 gap-y-3 text-xs text-slate-500 font-semibold">
              {FOOTER_LINKS.map(({ label, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onClick(scrollToId)}
                  className="hover:text-slate-200"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} ScanVista
          </div>
        </div>
      </footer>

    </div>
  );
}