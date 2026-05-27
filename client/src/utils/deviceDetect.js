// ScanVista utility deviceDetect
const getUserAgent = () => {
  if (typeof navigator === "undefined") return "";
  return navigator.userAgent || navigator.vendor || "";
};

export const isAppleDevice = () => {
  const ua = getUserAgent();
  const isApplePlatform = /iPad|iPhone|Macintosh/.test(ua) && !/Android|Windows|CrOS/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|Chromium|Android/.test(ua);
  return isApplePlatform && isSafari;
};

export const getHeroModelSource = (baseModelPath) => {
  const base = baseModelPath.replace(/\.(glb|usdz)$/i, "");
  return {
    src: `${base}.glb`,
    iosSrc: `${base}.usdz`,
    useUsdz: isAppleDevice(),
  };
};