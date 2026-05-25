import { useState, useEffect } from 'react';

/**
 * Detects the device's AR capability and platform.
 *
 * Returns:
 *   platform: 'ios' | 'android' | 'desktop' | 'unsupported'
 *   arSupported: boolean
 *   loading: boolean  (true while async checks are in-flight)
 *
 * Platform logic:
 *  - desktop          → arSupported: false  (hide AR button entirely)
 *  - iOS Safari       → arSupported: true   (<model-viewer> bridges to Quick Look)
 *  - iOS Chrome       → arSupported: false  (UIWebView blocks Quick Look bridge)
 *  - Android Chrome   → arSupported: true   (<model-viewer> bridges to Scene Viewer / WebXR)
 *  - Other mobile     → arSupported: false  (graceful fallback message)
 */
export default function useARSession() {
  const [state, setState] = useState({ platform: 'desktop', arSupported: false, loading: true });

  useEffect(() => {
    const ua = navigator.userAgent;

    // 1. Detect desktop first — no AR on desktop
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    if (!isMobile) {
      setState({ platform: 'desktop', arSupported: false, loading: false });
      return;
    }

    // 2. Detect iOS devices
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    if (isIOS) {
      // iOS Safari supports AR Quick Look natively via model-viewer's ios-src attribute.
      // iOS Chrome (CriOS) runs inside WKWebView which blocks the Quick Look bridge.
      const isIOSChrome = /CriOS/i.test(ua);
      if (isIOSChrome) {
        setState({ platform: 'ios', arSupported: false, loading: false });
      } else {
        // Safari and other iOS browsers that support Quick Look
        setState({ platform: 'ios', arSupported: true, loading: false });
      }
      return;
    }

    // 3. Android — verify model-viewer Scene Viewer / WebXR can launch
    // model-viewer's activateAR() works on Chrome for Android with ARCore.
    // We probe via the WebXR API as a quality signal, but do NOT block on it
    // because model-viewer also supports the intent-based Scene Viewer fallback.
    const isAndroid = /Android/i.test(ua);
    if (isAndroid) {
      // Chrome for Android supports Scene Viewer as a fallback even without WebXR
      const isChrome = /Chrome/i.test(ua) && !/Edg/i.test(ua);
      if (!isChrome) {
        setState({ platform: 'android', arSupported: false, loading: false });
        return;
      }

      // Best-effort async WebXR check — does not block the button from showing
      const checkWebXR = async () => {
        try {
          if (navigator.xr && typeof navigator.xr.isSessionSupported === 'function') {
            // WebXR available — full AR support
            await navigator.xr.isSessionSupported('immersive-ar');
          }
          // Either WebXR confirmed OR we trust Scene Viewer fallback on Android Chrome
          setState({ platform: 'android', arSupported: true, loading: false });
        } catch {
          // Scene Viewer intent fallback still works even if WebXR query throws
          setState({ platform: 'android', arSupported: true, loading: false });
        }
      };

      checkWebXR();
      return;
    }

    // 4. Other mobile (Windows Phone, non-standard tablets) — unsupported
    setState({ platform: 'unsupported', arSupported: false, loading: false });
  }, []);

  return state;
}