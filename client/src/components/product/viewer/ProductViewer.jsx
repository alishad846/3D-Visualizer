import { Canvas } from "@react-three/fiber";
import { useState } from "react";

import ARModal from "../../ar/ARModal";
import {
    OrbitControls,
    Environment,
    ContactShadows,
} from "@react-three/drei";

import ProductModel from "./model/ProductModel";

export default function ProductViewer() {

    // DYNAMIC PRODUCT OBJECT
    // LATER THIS COMES FROM BACKEND

    const product = {
        name: "Sony WH-1000XM5",

        description:
            "Industry-leading noise cancellation and premium audio experience.",

        modelUrl: "/models/headphone.glb",

        specifications: [
            {
                key: "Bluetooth",
                value: "5.2",
            },

            {
                key: "Battery",
                value: "30 Hours",
            },

            {
                key: "Weight",
                value: "250g",
            },
        ],
    };

    return (
        <div className="min-h-screen bg-[#050816] text-white overflow-hidden">

            {/* TOP BAR */}

            <div className="h-20 border-b border-cyan-400/10 flex items-center justify-between px-8">

                <div className="flex items-center gap-4">

                    <div className="w-10 h-10 rounded-xl bg-cyan-400/20 border border-cyan-400/20 flex items-center justify-center text-cyan-400 font-bold">

                        S

                    </div>

                    <h1 className="text-2xl font-semibold">
                        ScanVista Viewer
                    </h1>

                </div>

                <button className="px-5 py-2 rounded-xl bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition">

                    AR Mode

                </button>

            </div>

            {/* MAIN */}

            <div className="grid grid-cols-1 lg:grid-cols-[24%_56%_20%] h-[calc(100vh-80px)]">

                {/* LEFT PANEL */}

                <div className="border-r border-cyan-400/10 p-8 bg-black/20 backdrop-blur-xl">

                    <div className="inline-block px-4 py-1 rounded-full border border-cyan-400/20 text-cyan-400 text-sm mb-6">

                        PREMIUM PRODUCT

                    </div>

                    <h2 className="text-5xl font-bold leading-tight mb-6">

                        {product.name}

                    </h2>

                    <p className="text-slate-300 leading-relaxed mb-10">

                        {product.description}

                    </p>

                    <div className="space-y-6">

                        {product.specifications.map((spec, index) => (

                            <div
                                key={index}
                                className="border-b border-white/10 pb-4 flex justify-between"
                            >

                                <span className="text-slate-400">
                                    {spec.key}
                                </span>

                                <span>
                                    {spec.value}
                                </span>

                            </div>

                        ))}

                    </div>

                    <button className="mt-12 w-full py-4 rounded-2xl bg-cyan-400 text-black font-bold text-lg hover:bg-cyan-300 transition shadow-[0_0_40px_rgba(34,211,238,0.35)]">

                        Buy Now

                    </button>

                </div>

                {/* CENTER VIEWER */}

                <div className="relative overflow-hidden bg-[radial-gradient(circle_at_center,#13254f_0%,#050816_70%)]">

                    <Canvas
                        camera={{
                            position: [0, 0, 14],
                            fov: 40,
                        }}

                        gl={{
                            antialias: true,
                            alpha: true,
                        }}
                    >

                        {/* LIGHTS */}

                        <ambientLight intensity={1.3} />

                        <directionalLight
                            position={[5, 5, 5]}
                            intensity={2}
                        />

                        <directionalLight
                            position={[-5, 2, -5]}
                            intensity={1.2}
                        />

                        <spotLight
                            position={[0, 6, 4]}
                            intensity={2.5}
                            angle={0.35}
                            penumbra={1}
                        />

                        {/* MODEL */}

                        <ProductModel
                            modelUrl={product.modelUrl}
                        />

                        {/* ENV */}

                        <Environment preset="studio" />

                        {/* SHADOW */}

                        <ContactShadows
                            position={[0, -1.4, 0]}
                            opacity={0.45}
                            scale={10}
                            blur={2.5}
                            far={5}
                        />

                        {/* CONTROLS */}

                        <OrbitControls
                            enablePan={false}

                            enableZoom={true}

                            rotateSpeed={0.8}
                            zoomSpeed={0.6}

                            minDistance={8}
                            maxDistance={18}

                            enableDamping
                            dampingFactor={0.08}

                            target={[0, 0, 0]}
                        />

                    </Canvas>

                    {/* EDGE FADE */}

                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,transparent_45%,rgba(0,0,0,0.45)_100%)]" />

                    {/* ROTATE HINT */}

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-400 text-lg tracking-wide">

                        DRAG TO ROTATE

                    </div>

                </div>

                {/* RIGHT PANEL */}

                <div className="border-l border-cyan-400/10 bg-black/20 backdrop-blur-xl p-8 flex flex-col">

                    <h3 className="text-3xl font-bold mb-8">
                        AI Assistant
                    </h3>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 leading-relaxed text-slate-200">

                        Ask anything about this product.

                        <br />
                        <br />

                        • Specifications

                        <br />

                        • Features

                        <br />

                        • Comparison

                        <br />

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