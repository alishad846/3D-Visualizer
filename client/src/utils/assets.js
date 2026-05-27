export function isPersistentUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

export function isTemporaryUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('blob:') || url.startsWith('data:');
}

/** Convert a data-URL (e.g. mobile handoff) into a File for Supabase upload. */
export async function dataUrlToFile(dataUrl, filename = 'model.glb') {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, {
    type: blob.type || 'model/gltf-binary',
  });
}
