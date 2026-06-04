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

export const fetchRecommendedProducts = async (productId, limit = 8) => {
  const res = await publicRequest(
    `/recommendations/${encodeURIComponent(productId)}?limit=${encodeURIComponent(limit)}`
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to load recommended products');
  }
  return res.json();
};

export const fetchProductsForComparison = async (productIds) => {
  const ids = [...new Set((productIds || []).filter(Boolean))].slice(0, 4);
  const res = await publicRequest(
    `/viewer/compare?ids=${encodeURIComponent(ids.join(','))}`
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to load comparison products');
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
