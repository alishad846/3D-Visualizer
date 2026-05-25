import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ProductCanvas from "./canvas/ProductCanvas";
import ARLauncher from "../../ar/ARLauncher";
import { fetchProductById, logProductScan } from "../../../api/viewer";

const defaultProduct = {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise cancellation and premium audio experience.",
    modelUrl: "/models/headphone.glb",
    usdzUrl: null,
    specifications: [
        { key: "Bluetooth", value: "5.2" },
        { key: "Battery", value: "30 Hours" },
        { key: "Weight", value: "250g" },
    ],
};

export default function ProductViewer() {
    const { productId } = useParams();

    const [product, setProduct] = useState(defaultProduct);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch product from API when a productId is present in the route
    useEffect(() => {
        if (!productId) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchProductById(productId)
            .then((data) => {
                if (cancelled) return;
                setProduct({
                    name: data.name || defaultProduct.name,
                    description: data.description || defaultProduct.description,
                    modelUrl: data.model_url || defaultProduct.modelUrl,
                    // usdz_url is nullable — falls back to null gracefully
                    usdzUrl: data.usdz_url || null,
                    specifications: Array.isArray(data.specs)
                        ? data.specs
                        : defaultProduct.specifications,
                });
            })
            .catch((err) => {
                console.error(err);
                if (!cancelled) setError('Unable to load product.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [productId]);

    // Analytics: fires the existing logProductScan endpoint with ar_used=true
    // when the user successfully launches AR. This connects to the existing
    // qr_scans.ar_used column without adding any new infrastructure.
    const handleArLaunch = () => {
        if (!productId) return;
        logProductScan(productId, { ar_used: true }).catch((err) => {
            console.warn('[ProductViewer] AR analytics log failed:', err);
        });
    };

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

                {/* AR launcher — desktop renders nothing, mobile shows button or muted message */}
                <ARLauncher
                    modelUrl={product.modelUrl}
                    usdzUrl={product.usdzUrl}
                    onArLaunch={handleArLaunch}
                />
            </div>

            {/* MAIN LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-[24%_56%_20%] h-[calc(100vh-80px)]">

                {/* LEFT PANEL — Product Info */}
                <div className="border-r border-cyan-400/10 p-8 bg-black/20 backdrop-blur-xl overflow-y-auto">
                    <div className="inline-block px-4 py-1 rounded-full border border-cyan-400/20 text-cyan-400 text-sm mb-6">
                        PREMIUM PRODUCT
                    </div>

                    <h2 className="text-5xl font-bold leading-tight mb-6">{product.name}</h2>

                    <p className="text-slate-300 leading-relaxed mb-10">{product.description}</p>

                    {loading && (
                        <p className="text-slate-400 mb-6">Loading product...</p>
                    )}
                    {error && (
                        <p className="text-rose-400 mb-6">{error}</p>
                    )}

                    <div className="space-y-6">
                        {product.specifications.map((spec, index) => (
                            <div key={index} className="border-b border-white/10 pb-4 flex justify-between">
                                <span className="text-slate-400">{spec.key}</span>
                                <span>{spec.value}</span>
                            </div>
                        ))}
                    </div>

                    <button className="mt-12 w-full py-4 rounded-2xl bg-cyan-400 text-black font-bold text-lg hover:bg-cyan-300 transition shadow-[0_0_40px_rgba(34,211,238,0.35)]">
                        Buy Now
                    </button>
                </div>

                {/* CENTER PANEL — 3D Canvas (R3F, fully preserved) */}
                <div className="relative overflow-hidden bg-[radial-gradient(circle_at_center,#13254f_0%,#050816_70%)]">
                    <ProductCanvas modelUrl={product.modelUrl} />

                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_45%,rgba(0,0,0,0.45)_100%)]" />
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 text-sm tracking-widest uppercase select-none pointer-events-none">
                        Drag to Rotate
                    </div>
                </div>

                {/* RIGHT PANEL — AI Assistant (placeholder, untouched) */}
                <div className="border-l border-cyan-400/10 bg-black/20 backdrop-blur-xl p-8 flex flex-col">
                    <h3 className="text-3xl font-bold mb-8">AI Assistant</h3>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 leading-relaxed text-slate-200">
                        Ask anything about this product.
                        <br /><br />
                        • Specifications<br />
                        • Features<br />
                        • Comparison<br />
                        • Usage
                    </div>
                    <div className="mt-auto">
                        <button className="w-20 h-20 rounded-full bg-cyan-400 text-black text-3xl flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,211,238,0.35)] hover:scale-105 transition">
                            🎤
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
