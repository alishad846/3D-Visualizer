/**
 * Refresh-token cookie options for ScanVista auth.
 * Production uses SameSite=None + Secure so cookies work when the
 * frontend (scanvista.onrender.com) and API (scanvista-api.onrender.com)
 * are on different origins.
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

function refreshCookieOptions() {
  const production = isProduction();
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

function clearRefreshCookieOptions() {
  const production = isProduction();
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
  };
}

module.exports = {
  refreshCookieOptions,
  clearRefreshCookieOptions,
};
