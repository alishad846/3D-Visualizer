import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Maximize2, Box, Bot, Scale } from "lucide-react";

import ProductCanvas from "./canvas/ProductCanvas";
import ARLauncher from "../../ar/ARLauncher";
import { fetchProductById, logProductScan } from "../../../api/viewer";
import ProductAssistantOverlay from "./ProductAssistantOverlay";

const DEMO_PRODUCT_ID = "demo";

const defaultProduct = {
    name: "",
    id: null,
    category: "",
    brand: "",
    tagline: "",
    description: "",
    modelUrl: null,
    usdzUrl: null,
    buyUrl: null,
    price: null,
    currency: "",
    aiSummary: "",
    aiUseCases: [],
    features: [],
    specifications: [],
    rawSpecs: [],
};

const demoProduct = {
    id: DEMO_PRODUCT_ID,
    name: "Wireless Headphones",
    category: "Audio",
    brand: "ScanVista Demo",
    tagline: "Explore the demo headphone experience",
    description: "A local test product that loads the built-in headphone GLB from the codebase.",
    modelUrl: "/models/headphone.glb",
    usdzUrl: null,
    buyUrl: null,
    price: null,
    currency: "USD",
    aiSummary: "A quick preview product used for the demo route.",
    aiUseCases: [],
    features: [
        "Sleek over-ear design",
        "Spatial audio-ready",
        "Responsive demo interaction"
    ],
    specifications: [
        { key: "Driver", value: "40mm dynamic" },
        { key: "Connectivity", value: "Bluetooth 5.3" },
        { key: "Battery", value: "30 hours" },
    ],
    rawSpecs: [],
};

export default function ProductViewer() {
    const { productId } = useParams();
    const canvasRef = useRef(null);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [zoomPercent, setZoomPercent] = useState(100);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const canvasPanelRef = useRef(null);
    const [layoutMode, setLayoutMode] = useState("ADAPTIVE"); // 'COMPACT' | 'ADAPTIVE' | 'EXPANDED'
    const [mode, setMode] = useState("viewer"); // 'viewer' | 'detail_sheet' | 'ar'
    const [assistantOpen, setAssistantOpen] = useState(false);
    const [assistantSessionId] = useState(() => {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return `viewer-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    });
    const [sheetState, setSheetState] = useState("peek"); // 'peek' | 'half' | 'full'
    const touchStartYRef = useRef(null);
    const sheetContentRef = useRef(null);
    const sheetBodyInnerRef = useRef(null);
    const [sheetSnapHeights, setSheetSnapHeights] = useState({
        peekPx: 140,
        halfPx: 360,
        fullPx: 520,
    });

    useEffect(() => {
        if (!productId) return;

        if (productId === DEMO_PRODUCT_ID) {
            setLoading(false);
            setError(null);
            setProduct(demoProduct);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);
        setProduct(null);

        fetchProductById(productId)
            .then((data) => {
                if (cancelled) return;
                const normalizedSpecs = Array.isArray(data.specs)
                    ? data.specs
                        .map((spec) => ({
                            key: spec?.key || spec?.name || "",
                            value: spec?.value ?? "",
                        }))
                        .filter((spec) => spec.key && spec.value !== "")
                        .slice(0, 10)
                    : defaultProduct.specifications;
                const normalizedFeatures = Array.isArray(data.features)
                    ? data.features.filter(Boolean).slice(0, 10)
                    : [];
                setProduct({
                    id: data.id || null,
                    name: data.name || "",
                    category: data.category || "",
                    brand: data.brand || "",
                    tagline: data.tagline || "",
                    description: data.description || "",
                    modelUrl: data.model_url || null,
                    usdzUrl: data.usdz_url || null,
                    buyUrl: data.buy_url || null,
                    price: data.price ?? null,
                    currency: data.currency || "",
                    aiSummary: data.ai_summary || "",
                    aiUseCases: Array.isArray(data.ai_use_cases) ? data.ai_use_cases.filter(Boolean) : [],
                    features: normalizedFeatures,
                    specifications: normalizedSpecs,
                    rawSpecs: Array.isArray(data.specs) ? data.specs : [],
                });
            })
            .catch((err) => {
                console.error(err);
                if (!cancelled) setError("Unable to load product.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [productId]);

    // Responsive layout mode based on size + pointer coarse detection
    useEffect(() => {
        const compute = () => {
            if (typeof window === "undefined") return;
            const width = window.innerWidth;
            const height = window.innerHeight;
            const isCoarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
            const shortEdge = Math.min(width, height);
            const longEdge = Math.max(width, height);

            let nextMode;
            if (shortEdge < 600) {
                nextMode = "COMPACT";
            } else if (longEdge <= 1024) {
                nextMode = "ADAPTIVE";
            } else {
                nextMode = "EXPANDED";
            }

            // Keep large touch devices in adaptive layout to preserve overlay UX.
            if (isCoarsePointer && nextMode === "EXPANDED" && shortEdge < 900) {
                nextMode = "ADAPTIVE";
            }

            setLayoutMode(nextMode);
        };
        compute();
        window.addEventListener("resize", compute);
        return () => window.removeEventListener("resize", compute);
    }, []);

    // Sync mode with sheet state (VIEWER vs DETAIL_SHEET)
    useEffect(() => {
        if (sheetState === "peek") {
            setMode((prev) => (prev === "ar" ? prev : "viewer"));
        } else {
            setMode((prev) => (prev === "ar" ? prev : "detail_sheet"));
        }
    }, [sheetState]);

    const handleArLaunch = () => {
        if (!productId) return;
        setMode("ar");
        if (productId === DEMO_PRODUCT_ID) return;
        logProductScan(productId, { ar_used: true }).catch((err) => {
            console.warn("[ProductViewer] AR analytics log failed:", err);
        });
    };

    // Fullscreen toggle on the canvas panel
    const handleFullscreen = () => {
        const el = canvasPanelRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    // Sync fullscreen state if user presses Escape
    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    // Section label style — subtle, muted, uppercase
    const sectionLabel = "text-[10px] font-semibold uppercase tracking-[0.1em] text-[#A0A0A0] mb-3";

    const cycleSheetStateUp = () => {
        setSheetState((prev) => {
            if (prev === "peek") return "half";
            if (prev === "half") return sheetSnapHeights.fullPx > sheetSnapHeights.halfPx + 8 ? "full" : "half";
            return "full";
        });
    };

    const cycleSheetStateDown = () => {
        setSheetState((prev) => (prev === "full" ? "half" : prev === "half" ? "peek" : "peek"));
    };

    const handleSheetTapHandle = () => {
        const canUseFull = sheetSnapHeights.fullPx > sheetSnapHeights.halfPx + 8;
        setSheetState((prev) => {
            if (prev === "peek") return "half";
            if (prev === "half") return canUseFull ? "full" : "peek";
            return "peek";
        });
    };

    const handleSheetTouchStart = (e) => {
        if (!e.touches || e.touches.length === 0) return;
        touchStartYRef.current = e.touches[0].clientY;
    };

    const handleSheetTouchEnd = (e) => {
        const startY = touchStartYRef.current;
        if (startY == null || !e.changedTouches || e.changedTouches.length === 0) return;
        const endY = e.changedTouches[0].clientY;
        const delta = endY - startY;
        const threshold = 40; // pixels
        if (Math.abs(delta) < threshold) return;
        if (delta < 0) {
            // swipe up
            cycleSheetStateUp();
        } else {
            // swipe down
            cycleSheetStateDown();
        }
        touchStartYRef.current = null;
    };

    const isImmersiveLayout = layoutMode !== "EXPANDED";
    const isCompact = layoutMode === "COMPACT";

    const updateSheetHeights = () => {
        if (!isImmersiveLayout) return;
        const viewportH = typeof window !== "undefined" ? window.innerHeight : 800;
        const basePeek = Math.round(viewportH * (isCompact ? 0.20 : 0.16));
        const baseHalf = Math.round(viewportH * (isCompact ? 0.50 : 0.44));
        const baseFull = Math.round(viewportH * (isCompact ? 0.88 : 0.82));
        const contentEl = sheetBodyInnerRef.current;
        const stickyBuyBarHeight = product?.buyUrl ? 88 : 0;
        const contentHeight = contentEl ? contentEl.scrollHeight + 48 + stickyBuyBarHeight : baseFull; // content + handle/top gap + sticky CTA bar

        const cappedFull = Math.min(baseFull, Math.max(basePeek, contentHeight));
        const cappedHalf = Math.min(baseHalf, cappedFull);

        setSheetSnapHeights({
            peekPx: basePeek,
            halfPx: cappedHalf,
            fullPx: cappedFull,
        });
    };

    // Keep snap heights aligned to viewport/content so sheet won't open into empty space.
    useEffect(() => {
        updateSheetHeights();
        if (!isImmersiveLayout || typeof window === "undefined") return undefined;
        const onResize = () => updateSheetHeights();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [isImmersiveLayout, isCompact, product, loading, error]);

    useEffect(() => {
        if (!isImmersiveLayout) return undefined;
        const el = sheetBodyInnerRef.current;
        if (!el || typeof ResizeObserver === "undefined") return undefined;
        const ro = new ResizeObserver(() => updateSheetHeights());
        ro.observe(el);
        return () => ro.disconnect();
    }, [isImmersiveLayout, isCompact, product?.buyUrl]);

    useEffect(() => {
        if (sheetState === "full" && sheetSnapHeights.fullPx <= sheetSnapHeights.halfPx + 8) {
            setSheetState("half");
        }
    }, [sheetSnapHeights, sheetState]);

    if (!product) {
        if (loading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-[#050816] text-slate-200 p-4">
                    <div className="text-center max-w-md">
                        <div className="mb-4 text-4xl">⏳</div>
                        <h1 className="text-xl font-semibold text-white mb-2">Loading product...</h1>
                        <p className="text-sm text-slate-400">Fetching the selected product details. Please wait a moment.</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050816] text-slate-200 p-4">
                <div className="text-center max-w-md">
                    <div className="mb-4 text-4xl">⚠️</div>
                    <h1 className="text-xl font-semibold text-white mb-2">Unable to load product</h1>
                    <p className="text-sm text-slate-400">{error || 'Product data is unavailable.'}</p>
                </div>
            </div>
        );
    }

    // COMPACT + ADAPTIVE immersive layout: full-screen 3D canvas with bottom sheet overlays
    if (isImmersiveLayout) {
        const sheetHeightPx =
            sheetState === "peek"
                ? sheetSnapHeights.peekPx
                : sheetState === "half"
                ? sheetSnapHeights.halfPx
                : sheetSnapHeights.fullPx;

        return (
            <div className="relative min-h-screen bg-[#050816] text-white overflow-hidden">
                {/* Fullscreen 3D canvas as permanent background */}
                <div className="absolute inset-0">
                    <ProductCanvas
                        ref={canvasRef}
                        modelUrl={product.modelUrl}
                        onZoomPercentChange={setZoomPercent}
                    />
                </div>

                {/* Subtle vignette */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_45%,rgba(0,0,0,0.55)_100%)]" />

                {/* Top overlay: brand + small title */}
                <div className={`absolute ${isCompact ? "top-4 left-4 right-4" : "top-4 left-5 right-5"} flex items-center justify-between gap-3 z-20`}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 text-sm font-bold">
                            S
                        </div>
                        <div>
                            <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                ScanVista Viewer
                            </div>
                            {product.name ? (
                                <div className={`${isCompact ? "text-sm" : "text-base"} font-semibold text-white`}>
                                    {product.name}
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {productId ? (
                            <Link
                                to={`/compare/${encodeURIComponent(productId)}`}
                                className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100 backdrop-blur-md transition hover:border-cyan-300/45 hover:bg-cyan-300/10"
                            >
                                <Scale size={14} />
                                Compare
                            </Link>
                        ) : null}
                        <button
                            type="button"
                            onClick={() => setAssistantOpen((value) => !value)}
                            className="flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-100 backdrop-blur-md transition hover:border-cyan-300/45 hover:bg-cyan-300/10"
                        >
                            <Bot size={14} />
                            AI
                        </button>
                        <div className="px-2 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] text-cyan-200 font-semibold">
                            {zoomPercent}%
                        </div>
                    </div>
                </div>

                {/* AR button — floats above canvas, bottom-right */}
                <div className={`absolute ${isCompact ? "bottom-28 right-4" : "bottom-24 right-5"} z-30 flex flex-col items-end gap-2`}>
                    {productId ? (
                        <Link
                            to={`/compare/${encodeURIComponent(productId)}`}
                            className="flex h-11 items-center gap-2 rounded-full border border-white/15 bg-black/55 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100 shadow-lg backdrop-blur-md transition hover:border-cyan-300/50 hover:bg-cyan-300/15"
                        >
                            <Scale size={15} />
                            Compare
                        </Link>
                    ) : null}
                    <ARLauncher
                        modelUrl={product.modelUrl}
                        usdzUrl={product.usdzUrl}
                        onArLaunch={handleArLaunch}
                    />
                </div>

                {/* Drag hint for 3D */}
                <div className={`absolute ${isCompact ? "bottom-20" : "bottom-[72px]"} left-1/2 -translate-x-1/2 text-slate-400 text-[10px] tracking-[0.25em] uppercase select-none pointer-events-none`}>
                    Drag to Rotate
                </div>

                {/* Bottom sheet — overlays canvas without moving it */}
                <div
                    className="absolute left-0 right-0 bottom-0 z-40 transition-[height] duration-250"
                    style={{ height: `${sheetHeightPx}px` }}
                    onTouchStart={handleSheetTouchStart}
                    onTouchEnd={handleSheetTouchEnd}
                >
                    <div className="relative h-full rounded-t-3xl bg-[#020617]/95 border-t border-white/10 shadow-[0_-18px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                        {/* Handle */}
                        <button
                            type="button"
                            onClick={handleSheetTapHandle}
                            className="absolute left-1/2 -translate-x-1/2 top-2 w-10 h-6 flex flex-col items-center justify-center"
                            aria-label="Expand product details"
                        >
                            <span className="w-8 h-[3px] rounded-full bg-white/25" />
                        </button>

                        {/* Content */}
                        <div
                            ref={sheetContentRef}
                            className="pt-7 h-full flex flex-col"
                        >
                            <div className={`${isCompact ? "px-4" : "px-5"} flex-1 overflow-y-auto`}>
                                <div ref={sheetBodyInnerRef} className="pb-4">
                                    {/* Title + tagline (repeated here so sheet can stand alone when expanded) */}
                                    <div className="mb-3">
                                {product.category ? (
                                    <div className="inline-block px-3 py-1 rounded-full border border-cyan-400/25 text-cyan-300 text-[10px] font-semibold tracking-[0.16em] uppercase mb-2">
                                        {product.category}
                                    </div>
                                ) : null}
                                {product.name ? (
                                    <div className={`${isCompact ? "text-lg" : "text-xl"} font-semibold leading-tight`}>
                                        {product.name}
                                    </div>
                                ) : null}
                                {product.tagline ? (
                                    <p className="text-xs text-slate-400 mt-1">
                                        {product.tagline}
                                    </p>
                                ) : null}
                                    </div>

                                    {/* Description */}
                                    {product.description ? (
                                        <p className={`${isCompact ? "text-[13px]" : "text-sm"} text-slate-300 leading-relaxed mb-4`}>
                                            {product.description}
                                        </p>
                                    ) : null}

                                    {/* Highlights */}
                                    {Array.isArray(product.features) && product.features.length > 0 ? (
                                        <div className="mb-4">
                                            <h3 className={sectionLabel}>Highlights</h3>
                                            <ul className="space-y-1.5">
                                                {product.features.map((feature, index) => (
                                                    <li
                                                        key={`${feature}-${index}`}
                                                        className={`flex items-start gap-2 ${isCompact ? "text-[13px]" : "text-sm"} text-slate-200`}
                                                    >
                                                        <span className="text-[#00F0FF] mt-0.5 text-xs">●</span>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}

                                    {/* Specifications */}
                                    {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                                        <div className="mb-4">
                                            <h3 className={sectionLabel}>Specifications</h3>
                                            <div className="space-y-1">
                                                {product.specifications.map((spec, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex justify-between gap-4 border-b border-white/[0.05] py-2"
                                                    >
                                                        <span className={`${isCompact ? "text-[12px]" : "text-sm"} text-[#94a3b8]`}>
                                                            {spec.key}
                                                        </span>
                                                        <span className={`${isCompact ? "text-[13px]" : "text-sm"} text-white font-medium text-right`}>
                                                            {spec.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* AI Overview */}
                                    {product.aiSummary ? (
                                        <div className="mb-4 rounded-xl border border-cyan-400/15 bg-gradient-to-br from-cyan-950/40 to-slate-900/60 p-3.5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-cyan-400 text-sm">✦</span>
                                                <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-400">AI Overview</h3>
                                            </div>
                                            <p className={`${isCompact ? "text-[12px]" : "text-[13px]"} text-slate-300 leading-relaxed`}>
                                                {product.aiSummary}
                                            </p>
                                        </div>
                                    ) : null}

                                    {/* AI Use Cases */}
                                    {Array.isArray(product.aiUseCases) && product.aiUseCases.length > 0 ? (
                                        <div className="mb-4 rounded-xl border border-violet-500/15 bg-gradient-to-br from-violet-950/35 to-slate-900/60 p-3.5">
                                            <div className="flex items-center gap-2 mb-2.5">
                                                <span className="text-violet-400 text-sm">◆</span>
                                                <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-400">Recommended Use Cases</h3>
                                            </div>
                                            <ul className="space-y-1.5">
                                                {product.aiUseCases.map((uc, index) => (
                                                    <li key={index} className={`flex items-start gap-2 ${isCompact ? "text-[12px]" : "text-[13px]"} text-slate-300`}>
                                                        <span className="text-violet-400 mt-0.5 text-[10px] shrink-0">▸</span>
                                                        <span>{uc}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* Buy CTA — sticky at sheet bottom when available */}
                            {product.buyUrl ? (
                                <div className={`border-t border-white/10 ${isCompact ? "p-3" : "p-4"} bg-[#020617]/95`}>
                                    <a
                                        href={product.buyUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className={`block w-full ${isCompact ? "py-3 text-sm" : "py-3.5 text-base"} rounded-2xl bg-[#00F0FF] text-black font-semibold text-center hover:bg-cyan-300 transition shadow-[0_0_24px_rgba(0,240,255,0.35)]`}
                                    >
                                        Buy Now
                                    </a>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="pointer-events-none absolute bottom-4 right-4 top-20 z-50 flex justify-end">
                    <ProductAssistantOverlay
                        open={assistantOpen}
                        onClose={() => setAssistantOpen(false)}
                        product={product}
                        sessionId={assistantSessionId}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050816] text-white overflow-hidden">

            {/* HEADER */}
            <div className="h-20 border-b border-cyan-400/10 flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-400/20 border border-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold">
                        S
                    </div>
                    <h1 className="text-2xl font-semibold">ScanVista Viewer</h1>
                </div>

                {/* AR launcher — desktop renders nothing, mobile shows button */}
                <div className="flex items-center gap-2">
                    {productId ? (
                        <Link
                            to={`/compare/${encodeURIComponent(productId)}`}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/45 hover:bg-cyan-300/10 hover:text-white"
                        >
                            <Scale size={16} />
                            Compare
                        </Link>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => setAssistantOpen((value) => !value)}
                        className="inline-flex items-center gap-2 rounded-lg bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"
                    >
                        <Bot size={16} />
                        AI Assistant
                    </button>
                    <ARLauncher
                        modelUrl={product.modelUrl}
                        usdzUrl={product.usdzUrl}
                        onArLaunch={handleArLaunch}
                    />
                </div>
            </div>

            {/* EXPANDED layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[38%_62%] h-[calc(100vh-80px)]">

                {/* LEFT PANEL — flat, no card border, no background card */}
                <div className="p-8 pl-10 overflow-y-auto">

                    {/* Category badge */}
                    {product.category ? (
                        <div className="inline-block px-4 py-1 rounded-full border border-cyan-400/20 text-cyan-400 text-xs font-semibold tracking-wider mb-5">
                            {product.category.toUpperCase()}
                        </div>
                    ) : null}

                    {/* Name */}
                    {product.name ? (
                        <h2 className="text-5xl font-bold leading-tight mb-2">
                            {product.name}
                        </h2>
                    ) : null}

                    {/* Tagline */}
                    {product.tagline ? (
                        <p className="text-slate-400 text-base mb-5">
                            {product.tagline}
                        </p>
                    ) : null}

                    {/* Description */}
                    {product.description ? (
                        <p className="text-slate-300 text-sm leading-relaxed mb-7">
                            {product.description}
                        </p>
                    ) : null}

                    {/* Loading / error */}
                    {loading && (
                        <p className="text-slate-400 text-sm mb-6">Loading product...</p>
                    )}
                    {error && (
                        <p className="text-rose-400 text-sm mb-6">{error}</p>
                    )}

                    {/* Highlights */}
                    {Array.isArray(product.features) && product.features.length > 0 ? (
                        <div className="mb-7">
                            <h3 className={sectionLabel}>Highlights</h3>
                            <ul className="space-y-2">
                                {product.features.map((feature, index) => (
                                    <li
                                        key={`${feature}-${index}`}
                                        className="text-slate-200 text-sm flex items-start gap-2"
                                    >
                                        <span className="text-[#00F0FF] mt-0.5 text-xs">●</span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {/* Specifications */}
                    {Array.isArray(product.specifications) && product.specifications.length > 0 ? (
                        <div className="mb-8">
                            <h3 className={sectionLabel}>Specifications</h3>
                            <div className="space-y-0">
                                {product.specifications.map((spec, index) => (
                                    <div
                                        key={index}
                                        className="border-b border-white/[0.06] py-3 flex justify-between gap-4"
                                    >
                                        {/* Key — readable but secondary */}
                                        <span className="text-[#94a3b8] text-sm">
                                            {spec.key}
                                        </span>
                                        {/* Value — primary */}
                                        <span className="text-white text-sm text-right font-medium">
                                            {spec.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* AI Overview */}
                    {product.aiSummary ? (
                        <div className="mb-6 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950/50 to-slate-900/70 p-5 shadow-[0_0_20px_rgba(0,240,255,0.05)]">
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="text-cyan-400">✦</span>
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-400">AI Overview</h3>
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                {product.aiSummary}
                            </p>
                        </div>
                    ) : null}

                    {/* AI Use Cases */}
                    {Array.isArray(product.aiUseCases) && product.aiUseCases.length > 0 ? (
                        <div className="mb-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/40 to-slate-900/70 p-5 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
                            <div className="flex items-center gap-2.5 mb-3">
                                <span className="text-violet-400">◆</span>
                                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-400">Recommended Use Cases</h3>
                            </div>
                            <ul className="space-y-2">
                                {product.aiUseCases.map((uc, index) => (
                                    <li key={index} className="flex items-start gap-2.5 text-sm text-slate-300">
                                        <span className="text-violet-400 mt-0.5 text-xs shrink-0">▸</span>
                                        <span>{uc}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}

                    {/* Buy Now */}
                    {product.buyUrl ? (
                        <a
                            href={product.buyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="block mt-8 w-full py-4 rounded-2xl bg-[#00F0FF] text-black font-bold text-base text-center hover:bg-cyan-300 transition shadow-[0_0_24px_rgba(0,240,255,0.3)]"
                        >
                            Buy Now
                        </a>
                    ) : null}
                </div>

                {/* RIGHT PANEL — 3D Canvas */}
                <div
                    ref={canvasPanelRef}
                    className="relative overflow-hidden bg-[radial-gradient(circle_at_center,#13254f_0%,#050816_70%)]"
                >
                    <ProductCanvas
                        ref={canvasRef}
                        modelUrl={product.modelUrl}
                        onZoomPercentChange={setZoomPercent}
                        maxZoom={1000}
                    />

                    {/* Vignette overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_45%,rgba(0,0,0,0.45)_100%)]" />

                    {/* Drag hint */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 text-xs tracking-widest uppercase select-none pointer-events-none">
                        Drag to Rotate
                    </div>

                    {/* Three icon buttons — top right */}
                    <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
                        {/* Exploded view — Phase 2, stubbed */}
                        <button
                            type="button"
                            title="Exploded view (coming soon)"
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 cursor-not-allowed opacity-50"
                            style={{
                                background: "rgba(255,255,255,0.08)",
                                backdropFilter: "blur(8px)",
                                border: "1px solid rgba(255,255,255,0.12)",
                            }}
                        >
                            <Box size={16} />
                        </button>

                        {productId ? (
                            <Link
                                to={`/compare/${encodeURIComponent(productId)}`}
                                title="Compare products"
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                                style={{
                                    background: "rgba(255,255,255,0.08)",
                                    backdropFilter: "blur(8px)",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                }}
                            >
                                <Scale size={16} />
                            </Link>
                        ) : null}

                        {/* Voice / mic — Phase 2, stubbed */}
                        <button
                            type="button"
                            title="AI assistant"
                            onClick={() => setAssistantOpen((value) => !value)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                            style={{
                                background: "rgba(255,255,255,0.08)",
                                backdropFilter: "blur(8px)",
                                border: "1px solid rgba(255,255,255,0.12)",
                            }}
                        >
                            <Bot size={16} />
                        </button>

                        {/* Fullscreen — functional */}
                        <button
                            type="button"
                            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                            onClick={handleFullscreen}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                            style={{
                                background: "rgba(255,255,255,0.08)",
                                backdropFilter: "blur(8px)",
                                border: "1px solid rgba(255,255,255,0.12)",
                            }}
                        >
                            <Maximize2 size={16} />
                        </button>
                    </div>

                    {/* Zoom controls — bottom right */}
                    <div className="pointer-events-none absolute bottom-6 right-6 top-16 z-30 flex justify-end">
                        <ProductAssistantOverlay
                            open={assistantOpen}
                            onClose={() => setAssistantOpen(false)}
                            product={product}
                            sessionId={assistantSessionId}
                        />
                    </div>

                    <div className={`absolute bottom-6 ${assistantOpen ? "left-6 right-auto" : "right-6"} z-20 flex items-center gap-2 bg-[#0a1224]/80 border border-cyan-400/20 rounded-xl px-2 py-1.5 backdrop-blur-md`}>
                        <button
                            type="button"
                            onClick={() => canvasRef.current?.zoomOut?.()}
                            className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 text-cyan-300 font-bold text-lg leading-none"
                            aria-label="Zoom out model"
                        >
                            -
                        </button>
                        <span className="min-w-[52px] text-center text-xs text-cyan-200 font-semibold">
                            {zoomPercent}%
                        </span>
                        <button
                            type="button"
                            onClick={() => canvasRef.current?.zoomIn?.()}
                            className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 text-cyan-300 font-bold text-lg leading-none"
                            aria-label="Zoom in model"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
