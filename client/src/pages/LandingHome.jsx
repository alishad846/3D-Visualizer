import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Box,
  CheckCircle2,
  Eye,
  Layers,
  Mail,
  Mic,
  MousePointer2,
  QrCode,
  ScanLine,
  Smartphone,
  Sparkles,
  View,
  X,
} from "lucide-react";

import { useAuthStore } from "../store/authStore";
import ProductCanvas from "../components/product/viewer/canvas/ProductCanvas";

const NAV_ITEMS = [
  { label: "Product", id: "demo" },
  { label: "Features", id: "features" },
  { label: "Use cases", id: "use-cases" },
  { label: "Contact", id: "contact" },
];

const FLOW_STEPS = [
  "Upload a GLB model and product details",
  "Publish a QR or direct product link",
  "Customers open a fast 3D viewer",
  "AR, AI guidance, and analytics support the journey",
];

const PROBLEMS = [
  {
    title: "QR codes often lead to flat pages",
    text: "Customers scan packaging expecting clarity, then land on static images, PDFs, or long descriptions.",
  },
  {
    title: "Product context is hard to explain",
    text: "Size, usage, parts, and material details are difficult to understand from photos alone.",
  },
  {
    title: "Teams need a repeatable workflow",
    text: "A good 3D experience should not require a custom build every time a product launches.",
  },
];

const FEATURES = [
  {
    id: "viewer",
    icon: Box,
    title: "Interactive 3D Viewer",
    eyebrow: "Model viewing",
    text: "Let customers rotate, inspect, and understand products directly in the browser.",
    modalTitle: "A focused product stage for every model",
    modalText:
      "The viewer gives the product the center of attention, with clean controls and enough surrounding context for specs, highlights, and purchase intent.",
    stat: "Browser-first",
    tone: "cyan",
  },
  {
    id: "ar",
    icon: Smartphone,
    title: "AR Product Placement",
    eyebrow: "Mobile experience",
    text: "Open supported products in AR so customers can check scale and fit in their own space.",
    modalTitle: "AR entry built into the product experience",
    modalText:
      "The AR flow belongs beside the viewer, not hidden behind a separate campaign. Customers can move from scan to spatial preview naturally.",
    stat: "iOS / Android ready",
    tone: "green",
  },
  {
    id: "qr",
    icon: QrCode,
    title: "QR Publishing",
    eyebrow: "Physical to digital",
    text: "Turn packaging, catalogs, booths, and sales material into product-specific 3D entry points.",
    modalTitle: "Each product gets a durable scan path",
    modalText:
      "A QR should be more than a redirect. ScanVista connects each code to a product viewer that can evolve with content, analytics, and campaign needs.",
    stat: "Scan to viewer",
    tone: "amber",
  },
  {
    id: "assistant",
    icon: Mic,
    title: "AI Product Assistant",
    eyebrow: "Guided understanding",
    text: "Answer product questions using verified product details, specs, and comparison context.",
    modalTitle: "Product guidance without sending users away",
    modalText:
      "The assistant helps customers understand specs, usage, and buying questions while staying inside the product experience.",
    stat: "Context aware",
    tone: "violet",
  },
  {
    id: "compare",
    icon: Layers,
    title: "Product Comparison",
    eyebrow: "Decision support",
    text: "Compare specs, features, and nearby options when customers need help choosing.",
    modalTitle: "Comparison that supports the buying moment",
    modalText:
      "Side-by-side product context helps users move from curiosity to confidence without digging through separate product pages.",
    stat: "Spec led",
    tone: "blue",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics Dashboard",
    eyebrow: "Team insight",
    text: "Track scans, device behavior, AR engagement, and product-level performance.",
    modalTitle: "A feedback loop for physical product journeys",
    modalText:
      "Teams can see which products get scanned, which devices are used, and where immersive interactions create interest.",
    stat: "Product signals",
    tone: "rose",
  },
];

const USE_CASES = [
  {
    title: "Retail packaging",
    text: "Add a QR that opens the exact product in 3D instead of a generic landing page.",
  },
  {
    title: "D2C product pages",
    text: "Give shoppers a clearer view of shape, scale, details, and product value before checkout.",
  },
  {
    title: "Sales demos",
    text: "Let teams present products from a browser without carrying every sample or model variant.",
  },
  {
    title: "Product education",
    text: "Explain features, components, and usage with guided visual context after the scan.",
  },
];

const TRUST_POINTS = [
  "Fast browser-based product viewer",
  "Mobile-first scan and AR journey",
  "Works around product data, specs, and GLB model workflows",
  "AI service designed with prompt isolation and mock fallback",
];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function BrandMark() {
  return (
    <div className="flex items-center gap-2 font-display font-bold tracking-wide text-white">
      <View className="h-5 w-5 text-cyan-300" />
      <span>
        Scan<span className="text-cyan-300">Vista</span>
      </span>
    </div>
  );
}

function PrimaryButton({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-200/50 ${className}`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/20 ${className}`}
    >
      {children}
    </button>
  );
}

function SectionIntro({ eyebrow, title, text, align = "center" }) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
        {eyebrow}
      </div>
      <h2 className="font-display text-3xl font-semibold leading-tight text-white md:text-5xl">
        {title}
      </h2>
      {text ? (
        <p className="mt-5 text-sm leading-7 text-slate-400 md:text-base">{text}</p>
      ) : null}
    </div>
  );
}

function GenericHeroModel() {
  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[28px] border border-white/10 bg-[#07111d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,240,255,0.18),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
      <div className="absolute inset-x-8 top-8 flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-md">
        <span className="text-xs font-semibold text-slate-200">Universal product scene</span>
        <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-[11px] font-bold text-cyan-200">
          3D ready
        </span>
      </div>

      <div className="absolute left-1/2 top-[52%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20" />
      <div className="absolute left-1/2 top-[52%] h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />

      <motion.div
        className="absolute left-1/2 top-[53%] h-64 w-64 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotateY: [0, 360] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-cyan-200/40 bg-cyan-300/10 shadow-[0_0_50px_rgba(0,240,255,0.18)]" />
        <div className="absolute left-8 top-16 h-20 w-20 rounded-full border border-emerald-200/30 bg-emerald-300/10 shadow-[0_0_35px_rgba(16,185,129,0.18)]" />
        <div className="absolute right-6 top-24 h-28 w-16 rounded-[40px] border border-amber-200/30 bg-amber-300/10 shadow-[0_0_35px_rgba(245,158,11,0.16)]" />
        <div className="absolute bottom-5 left-24 h-12 w-28 rounded-full border border-sky-200/30 bg-sky-300/10 shadow-[0_0_35px_rgba(56,189,248,0.14)]" />
      </motion.div>

      <div className="absolute bottom-7 left-7 right-7 grid grid-cols-3 gap-3">
        {["Model", "AR", "AI"].map((item) => (
          <div key={item} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 backdrop-blur">
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Layer</div>
            <div className="mt-1 text-sm font-semibold text-white">{item}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniProductViewer() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#07111d]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-300">
            Sample product viewer
          </div>
          <div className="mt-1 text-sm font-semibold text-white">ScanVista preview</div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-slate-300">
          /p/demo
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_1.25fr]">
        <div className="space-y-4 p-5">
          {FLOW_STEPS.map((step, index) => (
            <div key={step} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-xs font-bold text-cyan-200">
                {index + 1}
              </div>
              <div className="text-sm leading-6 text-slate-300">{step}</div>
            </div>
          ))}
        </div>
        <div className="relative min-h-[360px] bg-[radial-gradient(circle_at_center,rgba(0,85,255,0.22),rgba(5,8,22,0.88)_62%)]">
          <ProductCanvas modelUrl="/models/headphone.glb" autoRotate enableZoom={false} enablePan={false} />
          <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/40 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300 backdrop-blur">
            Demo model preview
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureStage({ feature }) {
  const Icon = feature.icon;

  return (
    <div className="relative h-full min-h-[300px] overflow-hidden rounded-[24px] border border-white/10 bg-[#050b14]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,240,255,0.16),transparent_42%)]" />
      <div className="absolute left-1/2 top-[48%] h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
      <div className="absolute left-1/2 top-[48%] h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20" />

      <motion.div
        className="absolute left-1/2 top-[48%] h-44 w-44 -translate-x-1/2 -translate-y-1/2"
        animate={{ rotateY: [0, 360], rotateX: [8, 8] }}
        transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-8 rounded-[22px] border border-cyan-200/40 bg-cyan-300/10 shadow-[0_0_44px_rgba(0,240,255,0.18)]" />
        <div className="absolute left-2 top-14 h-16 w-16 rounded-2xl border border-white/20 bg-white/[0.06]" />
        <div className="absolute right-2 top-20 h-24 w-12 rounded-full border border-white/20 bg-white/[0.05]" />
      </motion.div>

      {feature.id === "qr" ? (
        <div className="absolute left-8 top-8 grid h-24 w-24 grid-cols-3 gap-1 rounded-2xl border border-amber-200/30 bg-amber-300/10 p-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className={i % 2 === 0 ? "rounded bg-amber-200/80" : "rounded bg-white/10"} />
          ))}
        </div>
      ) : null}

      {feature.id === "analytics" ? (
        <div className="absolute bottom-8 left-8 right-8 flex h-28 items-end gap-2 rounded-2xl border border-rose-200/20 bg-rose-300/10 p-4">
          {[46, 72, 38, 86, 61, 95].map((height) => (
            <span
              key={height}
              className="flex-1 rounded-t bg-rose-200/70"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      ) : null}

      {feature.id === "assistant" ? (
        <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-violet-200/20 bg-violet-300/10 p-4">
          <div className="mb-2 h-2 w-2 rounded-full bg-violet-200" />
          <div className="h-2 w-4/5 rounded bg-white/30" />
          <div className="mt-2 h-2 w-2/3 rounded bg-white/15" />
        </div>
      ) : null}

      <div className="absolute right-8 top-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/30 text-cyan-200 backdrop-blur">
        <Icon className="h-7 w-7" />
      </div>
    </div>
  );
}

function FeatureModal({ feature, onClose, onEnter, onLeave }) {
  return (
    <AnimatePresence>
      {feature ? (
        <motion.div
          className="fixed inset-0 z-[80] hidden items-center justify-center bg-black/55 p-6 backdrop-blur-sm md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="grid h-[70vh] w-[70vw] max-w-6xl grid-cols-[0.95fr_1.15fr] gap-5 rounded-[28px] border border-white/12 bg-[#07111d]/95 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
          >
            <FeatureStage feature={feature} />
            <div className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-white/[0.03] p-8">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-cyan-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  {feature.eyebrow}
                </div>
                <h3 className="font-display text-4xl font-semibold leading-tight text-white">
                  {feature.modalTitle}
                </h3>
                <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">{feature.modalText}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Signal</div>
                  <div className="mt-1 text-lg font-semibold text-white">{feature.stat}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Role</div>
                  <div className="mt-1 text-lg font-semibold text-white">Product clarity</div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function MobileFeatureSheet({ feature, onClose }) {
  return (
    <AnimatePresence>
      {feature ? (
        <motion.div
          className="fixed inset-0 z-[90] bg-black/65 p-4 backdrop-blur-sm md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex h-full flex-col rounded-[28px] border border-white/12 bg-[#07111d] p-4"
            initial={{ y: 28 }}
            animate={{ y: 0 }}
            exit={{ y: 28 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-300">
                {feature.eyebrow}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]"
                aria-label="Close feature preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="min-h-[280px] flex-1">
              <FeatureStage feature={feature} />
            </div>
            <div className="pt-5">
              <h3 className="font-display text-2xl font-semibold text-white">{feature.modalTitle}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">{feature.modalText}</p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function LandingHome() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [scrolled, setScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [mobileFeature, setMobileFeature] = useState(null);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  const primaryLabel = useMemo(
    () => (isAuthenticated ? "Open dashboard" : "Start creating"),
    [isAuthenticated]
  );

  const openPrimary = () => {
    navigate(isAuthenticated ? "/dashboard" : "/register");
  };

  const openDemo = () => {
    navigate("/p/demo");
  };

  const showFeature = (feature) => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setActiveFeature(feature);
  };

  const scheduleCloseFeature = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => setActiveFeature(null), 180);
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-white selection:bg-cyan-300/30">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/8 bg-[#050b14]/92 backdrop-blur-xl" : "bg-transparent"
          }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Go to top"
          >
            <BrandMark />
          </button>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-400 lg:flex">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToId(item.id)}
                className="transition hover:text-white"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-semibold text-slate-400 transition hover:text-white sm:inline">
              Sign in
            </Link>
            <PrimaryButton onClick={openPrimary} className="px-4 py-2">
              {primaryLabel}
            </PrimaryButton>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-16 pt-28 md:pb-24 md:pt-32">
          <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_50%_0%,rgba(0,240,255,0.16),transparent_56%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur">
                <ScanLine className="h-4 w-4 text-cyan-300" />
                QR to 3D product experience
              </div>
              <h1 className="max-w-4xl font-display text-4xl font-semibold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
                Turn every product scan into an interactive 3D experience.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                ScanVista helps teams publish product-specific 3D viewers with AR access,
                AI-guided answers, comparison context, and scan analytics from one clean workflow.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton onClick={openPrimary}>
                  {primaryLabel}
                  <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
                <SecondaryButton onClick={openDemo}>
                  <Eye className="h-4 w-4" />
                  View demo
                </SecondaryButton>
              </div>
              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
                {["For packaging QR", "For product pages", "For guided demos"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <GenericHeroModel />
            </motion.div>
          </div>
        </section>

        <section id="problem" className="border-y border-white/8 bg-[#07111d] px-5 py-18 md:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="The problem"
              title="A scan should explain the product, not just open a page."
              text="Customers scan because they want clarity. The homepage, product viewer, and AI layer should all help them understand the product faster."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {PROBLEMS.map((problem) => (
                <div key={problem.title} className="rounded-[24px] border border-white/10 bg-[#0a1523] p-6">
                  <h3 className="font-display text-xl font-semibold text-white">{problem.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{problem.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="px-5 py-18 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
              <SectionIntro
                align="left"
                eyebrow="Product showcase"
                title="From model upload to a product viewer customers can actually use."
                text="The `/p/demo` route opens the current viewer experience. The homepage should prepare users for that flow instead of showing unrelated mock pages."
              />
              <MiniProductViewer />
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <SecondaryButton onClick={() => scrollToId("features")}>
                See platform features
              </SecondaryButton>
              <PrimaryButton onClick={openDemo}>
                Open /p/demo
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-white/8 bg-[#07111d] px-5 py-18 md:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionIntro
              eyebrow="Core features"
              title="Six product layers, each designed around the scan experience."
              text="Hover a feature card on desktop to open its 3D-style preview. Tap a card on mobile to inspect the same concept."
            />
            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={feature.id}
                    type="button"
                    onMouseEnter={() => showFeature(feature)}
                    onMouseLeave={scheduleCloseFeature}
                    onFocus={() => showFeature(feature)}
                    onBlur={scheduleCloseFeature}
                    onClick={() => setMobileFeature(feature)}
                    className="group min-h-[260px] rounded-[24px] border border-white/10 bg-[#0a1523] p-6 text-left transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-[#0d1a2b] focus:outline-none focus:ring-2 focus:ring-cyan-300/35"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-cyan-200 transition group-hover:border-cyan-300/30 group-hover:bg-cyan-300/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <MousePointer2 className="h-4 w-4 text-slate-600 transition group-hover:text-cyan-300" />
                    </div>
                    <div className="mt-8 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                      {feature.eyebrow}
                    </div>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-white">{feature.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-400">{feature.text}</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200">
                      Preview feature
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section id="use-cases" className="px-5 py-18 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <SectionIntro
                align="left"
                eyebrow="Use cases"
                title="Built for places where product clarity matters."
                text="ScanVista is not a generic marketing page builder. It is for teams that need a repeatable 3D product experience around real product data."
              />
              <div className="grid gap-5 sm:grid-cols-2">
                {USE_CASES.map((useCase) => (
                  <div key={useCase.title} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6">
                    <h3 className="font-display text-xl font-semibold text-white">{useCase.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-slate-400">{useCase.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="trust" className="border-y border-white/8 bg-[#07111d] px-5 py-18 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <SectionIntro
              align="left"
              eyebrow="Trust and performance"
              title="Designed to feel premium without making the page heavy."
              text="The homepage should load quickly, tell the story clearly, and reserve heavier 3D work for the hero/demo and opened feature previews."
            />
            <div className="rounded-[28px] border border-white/10 bg-[#0a1523] p-6">
              <div className="grid gap-3">
                {TRUST_POINTS.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                    <span className="text-sm leading-6 text-slate-300">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="px-5 py-18 md:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 rounded-[30px] border border-white/10 bg-[#07111d] p-6 md:p-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                Contact us
              </div>
              <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">
                Planning a product launch or 3D catalog?
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-400">
                Share what you want to publish, how many products you manage, and where customers will scan from.
              </p>
              <a
                href="mailto:hello@scanvista.app"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 hover:text-cyan-100"
              >
                <Mail className="h-4 w-4" />
                hello@scanvista.app
              </a>
            </div>
            <form className="grid gap-4" onSubmit={(event) => event.preventDefault()}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40" placeholder="Name" />
                <input className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40" placeholder="Work email" />
              </div>
              <input className="h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40" placeholder="Company or product category" />
              <textarea className="min-h-32 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/40" placeholder="Tell us what you want to build" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-6 text-slate-500">This form is a frontend placeholder until backend contact handling is added.</p>
                <PrimaryButton onClick={() => { }}>
                  Send message
                </PrimaryButton>
              </div>
            </form>
          </div>
        </section>

        <section className="border-t border-white/8 bg-[#02050a] px-5 py-18 text-center md:py-24">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-display text-3xl font-semibold leading-tight text-white md:text-5xl">
              Ready to turn your next product scan into something customers can explore?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 md:text-base">
              Start with one product, one model, and one viewer. Then scale the workflow across your catalog.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <PrimaryButton onClick={openPrimary}>
                {primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </PrimaryButton>
              <SecondaryButton onClick={openDemo}>
                View demo
              </SecondaryButton>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/8 bg-[#02050a] px-5 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
          <BrandMark />
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-semibold text-slate-500">
            {NAV_ITEMS.map((item) => (
              <button key={item.id} type="button" onClick={() => scrollToId(item.id)} className="hover:text-slate-300">
                {item.label}
              </button>
            ))}
            <span>© {new Date().getFullYear()} ScanVista</span>
          </div>
        </div>
      </footer>

      <FeatureModal
        feature={activeFeature}
        onEnter={() => {
          if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
        }}
        onLeave={scheduleCloseFeature}
      />
      <MobileFeatureSheet feature={mobileFeature} onClose={() => setMobileFeature(null)} />
    </div>
  );
}
