import { useRef, useState } from 'react';
import useARSession from '../../hooks/useARSession';

/**
 * ARLauncher — model-viewer AR gateway for ScanVista
 *
 * Architecture:
 *   - A visually hidden <model-viewer> element acts as the AR bridge.
 *   - The visible "View in AR" button calls modelViewerRef.current.activateAR().
 *   - model-viewer internally routes to:
 *       Android Chrome → WebXR / Google Scene Viewer (intent)
 *       iOS Safari     → Apple AR Quick Look (via ios-src if USDZ provided)
 *   - The existing R3F ProductCanvas is completely untouched by this component.
 *   - Model scale is NOT normalized here — model-viewer uses raw model dimensions
 *     for real-world AR placement.
 *
 * Props:
 *   modelUrl    (string)  — GLB model URL (raw, unmodified)
 *   usdzUrl     (string)  — optional USDZ URL for iOS Quick Look
 *   onArLaunch  (fn)      — optional callback fired on successful AR activation
 */
export default function ARLauncher({ modelUrl, usdzUrl, onArLaunch }) {
    const mvRef = useRef(null);
    const { platform, arSupported, loading } = useARSession();
    const [arError, setArError] = useState(null);

    // Desktop → render nothing at all
    if (platform === 'desktop') return null;

    // Still probing capability
    if (loading) return null;

    const handleLaunchAR = () => {
        setArError(null);

        if (!mvRef.current) {
            setArError('AR is not available on this device.');
            return;
        }

        try {
            mvRef.current.activateAR();
            if (onArLaunch) onArLaunch();
        } catch (err) {
            console.error('[ARLauncher] activateAR() failed:', err);
            setArError('Could not start AR. Please try again.');
        }
    };

    return (
        <>
            {/*
             * Visually hidden model-viewer — exists only to bridge to native AR.
             * It is NOT a visible 3D viewer. The R3F ProductCanvas handles 3D display.
             *
             * Key attributes:
             *   ar                   — enables AR activation
             *   ar-modes             — WebXR first, Scene Viewer intent as fallback
             *   ios-src              — USDZ asset for Apple AR Quick Look (nullable)
             *   camera-controls      — disabled (not a viewer)
             *   auto-rotate          — disabled
             *   style:visibility     — hidden; takes no visual space
             */}
            <model-viewer
                ref={mvRef}
                src={modelUrl}
                ios-src={usdzUrl || undefined}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls={false}
                auto-rotate={false}
                style={{ position: 'absolute', width: 0, height: 0, visibility: 'hidden', pointerEvents: 'none' }}
            />

            {/* AR BUTTON — shown only on supported mobile devices */}
            {arSupported ? (
                <button
                    id="ar-launch-button"
                    onClick={handleLaunchAR}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-400 text-black font-semibold text-sm hover:bg-cyan-300 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                    aria-label="View product in augmented reality"
                >
                    {/* AR cube icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                    </svg>
                    View in AR
                </button>
            ) : (
                /* Graceful muted message for unsupported mobile browsers */
                <p className="text-sm text-slate-500 text-center px-4">
                    {platform === 'ios'
                        ? 'AR requires Safari on iPhone or iPad.'
                        : 'AR not supported on this browser.'}
                </p>
            )}

            {/* Inline error — lightweight, non-modal */}
            {arError && (
                <p className="text-xs text-rose-400 text-center mt-1">{arError}</p>
            )}
        </>
    );
}
