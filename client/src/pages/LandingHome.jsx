import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Box, CheckCircle2, Layers, QrCode, ScanLine, Smartphone, View } from "lucide-react";
import "@google/model-viewer";

import { useAuthStore } from "../store/authStore";
import { getHeroModelSource, isAppleDevice } from "../utils/deviceDetect";

const PROBLEM_CARDS = [
  {
    icon: QrCode,
    title: "Static QR codes",
    text: "A QR link is just a URL until it becomes a product experience.",
  },
  {
    icon: Box,
    title: "Flat product pages",
    text: "Customers see a photo and a list, not the product in context.",
  },
  {
    icon: ScanLine,
    title: "Slow decisions",
    text: "People leave before they understand what makes the product real.",
  },
];

const FEATURE_CARDS = [
  {
    icon: View,
    title: "Interactive preview",
    text: "3D product pages that feel like the real thing.",
  },
  {
    icon: Smartphone,
    title: "AR on mobile",
    text: "Ready to open in supported phones with one tap.",
  },
  {
    icon: CheckCircle2,
    title: "Easy publishing",
    text: "Upload once, generate a link, and share a product page.",
  },
  {
    icon: Layers,
    title: "Rich product layers",
    text: "Show specs, materials, videos, and interactive hotspots.",
  },
];

const USE_CASES = [
  {
    title: "Retail packaging",
    text: "Give shoppers a product they can explore before they buy.",
  },
  {
    title: "Direct-to-consumer",
    text: "Turn product listings into confident, immersive previews.",
  },
  {
    title: "Instructions & manuals",
    text: "Make how-to content feel easier with spatial product context.",
  },
];

const BRAND_NAMES = ["ARCANE", "SOLENA", "RIVET", "HARBOR"];

const HEADER_LINKS = [
  { label: "Problem", id: "problem" },
  { label: "Features", id: "features" },
  { label: "Use Cases", id: "use-cases" },
  { label: "Demo", id: "demo" },
  { label: "Pricing", id: "pricing" },
];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Landing() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const modelSource = useMemo(() => getHeroModelSource("/models/headphone"), []);
  const isApple = useMemo(() => isAppleDevice(), []);
  const secondaryLabel = isAuthenticated ? "Open dashboard" : "Explore platform";

  const openDemo = () => {
    window.open("/p/demo", "_blank", "noopener,noreferrer");
  };

  const goPlatform = () => {
    if (isAuthenticated) navigate("/dashboard");
    else navigate("/register");
  };

  return (
    <div className="min-h-screen bg-[#050c16] text-white selection:bg-cyan-400/30">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#060d17]/95 backdrop-blur-md border-b border-white/10" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-sm font-semibold tracking-[0.1em] text-white"
          >
            <View className="h-5 w-5 text-cyan-300" />
            ScanVista
          </button>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 lg:flex">
            {HEADER_LINKS.map((item) => (
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
            <Link
              to="/login"
              className="hidden rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:border-white/20 hover:text-white md:inline-flex"
            >
              Sign in
            </Link>
            <button
              type="button"
              onClick={goPlatform}
              className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              {secondaryLabel}
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24">
        <section className="relative overflow-hidden px-5 pb-24 pt-10 sm:pb-28">
          <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="relative z-10">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300" />
                Product experiences, not pages
              </div>

              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Turn products into interactive experiences.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                ScanVista makes physical products feel immersive online. Customers can explore, compare, and open AR from a single product preview.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={openDemo}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  View Live Demo
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={goPlatform}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
                >
                  Explore Platform
                </button>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {BRAND_NAMES.map((brand) => (
                  <div key={brand} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-xs uppercase tracking-[0.22em] text-slate-300 shadow-[0_0_30px_rgba(0,0,0,0.15)]">
                    {brand}
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="relative rounded-[2rem] border border-white/10 bg-[#09121e]/80 p-5 shadow-[0_40px_120px_rgba(0,240,255,0.12)]"
            >
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#07111c]">
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-cyan-500/15 to-transparent" />
                <model-viewer
                  src={modelSource.src}
                  ios-src={modelSource.iosSrc}
                  ar
                  camera-controls
                  auto-rotate
                  auto-rotate-delay="1000"
                  exposure="1"
                  interaction-prompt="none"
                  shadow-intensity="0.35"
                  style={{ width: "100%", minHeight: "520px" }}
                  className="w-full"
                >
                  <div className="absolute inset-x-0 bottom-4 flex items-center justify-between px-5 text-xs text-slate-300">
                    <span>{isApple ? "Apple AR preview available" : "GLB preview on all devices"}</span>
                    <span className="rounded-full bg-white/5 px-3 py-1">Light, fast, interactive</span>
                  </div>
                </model-viewer>
              </div>

              <div className="absolute left-4 top-4 rounded-2xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-slate-200 backdrop-blur-md">
                Universal product composition
              </div>

              <div className="absolute right-4 top-24 hidden flex-col gap-3 sm:flex">
                {[
                  "Packaging",
                  "Wearable",
                  "Container",
                ].map((label) => (
                  <div key={label} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-200">
                    {label}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section id="problem" className="border-t border-white/10 px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <div className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-300">The problem</div>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Static product experiences miss the product.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-slate-400 leading-8">
                When product pages stay flat, customers don’t feel the shape, size, or value. That is where ScanVista changes the experience.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {PROBLEM_CARDS.map((card, index) => (
                <motion.div
                  key={card.title}
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-[2rem] border border-white/10 bg-[#08111f]/85 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
                >
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{card.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="bg-[#060d17] px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
              <div>
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-300">What ScanVista does</div>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">A more meaningful product preview.</h2>
                <p className="mt-4 max-w-xl text-slate-400 leading-8">
                  Keep the homepage light and let the product speak for itself. ScanVista combines interactive 3D, guided hotspots, and mobile AR in one simple flow.
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {FEATURE_CARDS.map((card) => (
                  <motion.div
                    key={card.title}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-[2rem] border border-white/10 bg-[#09131e]/80 p-6"
                  >
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-cyan-500/10 text-cyan-300">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{card.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="use-cases" className="px-5 py-20">
          <div className="mx-auto max-w-6xl text-center">
            <div className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-300">Use cases</div>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Works for any product type.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400 leading-8">
              From packaging and wearables to electronics and support guides, ScanVista works wherever product clarity matters.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {USE_CASES.map((item) => (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-[2rem] border border-white/10 bg-[#08101c]/80 p-8"
                >
                  <div className="text-xl font-semibold text-white">{item.title}</div>
                  <p className="mt-4 text-sm leading-7 text-slate-400">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="border-t border-white/10 px-5 py-20 bg-[#070f18]">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-[#09121e]/80 p-10 shadow-[0_40px_90px_rgba(0,0,0,0.2)]">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 text-xs uppercase tracking-[0.2em] text-cyan-300">Live demo</div>
                <h2 className="text-3xl font-semibold text-white sm:text-4xl">Open the product preview in a new tab.</h2>
                <p className="mt-4 text-slate-400 leading-8">
                  The homepage stays light. The full immersive viewer opens separately, so the preview stays fast and focused.
                </p>
              </div>

              <button
                type="button"
                onClick={openDemo}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Open demo in new tab
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        <section id="pricing" className="px-5 pb-24 pt-20">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-[#08121e]/80 p-10 text-slate-300 shadow-[0_40px_90px_rgba(0,0,0,0.2)]">
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Pricing</p>
                <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Start with one product, scale from there.</h2>
                <p className="mt-4 max-w-xl leading-8 text-slate-400">
                  Build immersive product experiences without a heavy setup. Pay as you publish, not per page view.
                </p>
              </div>

              <div className="space-y-4 rounded-[1.75rem] border border-white/10 bg-[#07111c]/80 p-6">
                <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm font-semibold text-white">No credit card required</div>
                <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-slate-300">Publish one product and share with customers immediately.</div>
                <button
                  type="button"
                  onClick={goPlatform}
                  className="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Get started
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
