// ScanVista API Client for viewer — routed through unified client
// credentials: 'include' is applied automatically by publicRequest
import { publicRequest } from './client';

export const fetchViewer = async () => {
  const res = await publicRequest('/viewer');
  if (!res.ok) throw new Error('API fetch failed');
  return res.json();
};

export const fetchProductById = async (productId) => {
  const res = await publicRequest(`/viewer/${encodeURIComponent(productId)}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to load product');
  }
  return res.json();
};

export const logProductScan = async (productId, payload = {}) => {
  const res = await publicRequest(
    `/viewer/${encodeURIComponent(productId)}/scan`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to log scan');
  }
  return res.json();
};