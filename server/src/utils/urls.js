/**
 * Reject blob/data URLs — only persistent http(s) storage URLs belong in the DB.
 */
function isValidStoredUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function assertValidStoredUrl(url, fieldName) {
  if (!isValidStoredUrl(url)) {
    throw new Error(`${fieldName} must be a valid http(s) URL from storage upload`);
  }
}

module.exports = {
  isValidStoredUrl,
  assertValidStoredUrl,
};
