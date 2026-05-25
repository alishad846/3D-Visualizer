/**
 * @deprecated ARViewer.jsx — DEPRECATED as of V1 AR Architecture (2026-05)
 *
 * This component implemented a raw @react-three/xr WebXR canvas with custom
 * hit-testing math. It has been superseded by ARLauncher.jsx which uses
 * @google/model-viewer as a lightweight AR gateway.
 *
 * Reasons for replacement:
 *   - Completely fails on iOS Safari (WebXR not supported by iOS WebKit)
 *   - Brittle hit-test frame loop with Android fragmentation issues
 *   - Heavy GPU overhead from a second Three.js canvas instance
 *   - model-viewer handles Android WebXR, Scene Viewer, and iOS Quick Look natively
 *
 * This file is preserved for reference and is NOT imported anywhere in the app.
 * It can be safely removed in a future cleanup pass.
 */

import { useEffect, useMemo, useRef, useState } from "react";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ARButton, XR, createXRStore, useXR } from "@react-three/xr";
import * as THREE from "three";

import ProductModel from "../product/viewer/model/ProductModel";

function ARScene({ modelUrl }) {
    const groupRef = useRef(null);
    const reticleRef = useRef(null);
    const hitTestSource = useRef(null);
    const localReferenceSpace = useRef(null);
    const [hasHit, setHasHit] = useState(false);
    const { gl } = useThree();
    const session = useXR((state) => state.session);

    useEffect(() => {
        if (!session || !gl) return;

        let active = true;

        const initializeHitTest = async () => {
            try {
                const viewerSpace = await session.requestReferenceSpace('viewer');
                hitTestSource.current = await session.requestHitTestSource({ space: viewerSpace });
                localReferenceSpace.current = await session.requestReferenceSpace('local-floor');
            } catch (error) {
                console.warn('AR hit test initialization failed', error);
            }
        };

        initializeHitTest();

        const onSessionEnd = () => {
            if (!active) return;
            if (hitTestSource.current) {
                hitTestSource.current.cancel();
                hitTestSource.current = null;
            }
        };

        session.addEventListener('end', onSessionEnd);

        return () => {
            active = false;
            session.removeEventListener('end', onSessionEnd);
            if (hitTestSource.current) {
                hitTestSource.current.cancel();
                hitTestSource.current = null;
            }
        };
    }, [session, gl]);

    useFrame((state) => {
        if (!session || !hitTestSource.current || !localReferenceSpace.current) return;

        const frame = state.gl.xr.getFrame();
        if (!frame) return;

        const hitResults = frame.getHitTestResults(hitTestSource.current);
        if (hitResults.length > 0) {
            const hitPose = hitResults[0].getPose(localReferenceSpace.current);
            if (hitPose) {
                const { position, orientation } = hitPose.transform;
                if (groupRef.current) {
                    groupRef.current.position.set(position.x, position.y, position.z);
                    groupRef.current.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
                }
                if (reticleRef.current) {
                    reticleRef.current.position.set(position.x, position.y, position.z);
                    reticleRef.current.quaternion.set(orientation.x, orientation.y, orientation.z, orientation.w);
                    reticleRef.current.visible = true;
                }
                setHasHit(true);
            }
            return;
        }

        if (reticleRef.current) {
            reticleRef.current.visible = false;
        }
        setHasHit(false);
    });

    return (
        <>
            <ambientLight intensity={1} />
            <directionalLight position={[0.5, 1.5, 0.3]} intensity={1.2} />
            <group ref={groupRef} visible={hasHit}>
                <ProductModel modelUrl={modelUrl} />
            </group>
            <mesh ref={reticleRef} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
                <ringGeometry args={[0.08, 0.14, 32]} />
                <meshStandardMaterial color="#22d3ee" opacity={0.75} transparent side={THREE.DoubleSide} />
            </mesh>
        </>
    );
}

function ARViewerContent({ modelUrl, onClose, store }) {
    const session = useXR((state) => state.session);
    const [hasSession, setHasSession] = useState(false);

    useEffect(() => {
        setHasSession(Boolean(session));
    }, [session]);

    useEffect(() => {
        if (!session) return;

        const handleSessionEnd = () => {
            onClose();
        };

        session.addEventListener('end', handleSessionEnd);
        return () => {
            session.removeEventListener('end', handleSessionEnd);
        };
    }, [session, onClose]);

    return (
        <>
            <div className="absolute top-4 right-4 z-50 flex gap-3">
                <button
                    onClick={() => {
                        session?.end();
                        onClose();
                    }}
                    className="rounded-2xl bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow-lg"
                >
                    Close AR
                </button>
            </div>

            <div className="absolute inset-0">
                <Canvas
                    style={{ width: '100%', height: '100%' }}
                    gl={{ antialias: true, alpha: true }}
                    camera={{ position: [0, 0, 5], fov: 50 }}
                >
                    <XR store={store}>
                        <ARScene modelUrl={modelUrl} />
                    </XR>
                </Canvas>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-8 z-50 flex flex-col items-center gap-3 px-4 text-center text-white">
                <div className="rounded-3xl bg-slate-900/85 px-5 py-4 backdrop-blur-md text-sm">
                    {hasSession
                        ? 'Move your phone slowly until the product appears.'
                        : 'Tap Start AR to begin immersive placement.'}
                </div>
                <div className="pointer-events-auto">
                    <ARButton
                        store={store}
                        className="rounded-3xl bg-cyan-400 px-5 py-3 text-black font-semibold shadow-lg"
                    >
                        Start AR
                    </ARButton>
                </div>
            </div>
        </>
    );
}

export default function ARViewer({ modelUrl, onClose }) {
    const store = useMemo(() => createXRStore(), []);

    return (
        <div className="fixed inset-0 z-50 bg-black/95">
            <ARViewerContent modelUrl={modelUrl} onClose={onClose} store={store} />
        </div>
    );
}
