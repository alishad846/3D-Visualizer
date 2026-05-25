import { authRequest } from './client';
import { BASE_URL } from './config';

export const fetchProducts = async () => {
  const res = await authRequest('/products');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
  return data;
};

export const fetchProductsByProject = async (projectId) => {
  const res = await authRequest(`/products?projectId=${encodeURIComponent(projectId)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
  return data;
};

export const fetchProductById = async (id) => {
  const res = await authRequest(`/products/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch product details');
  return data;
};

export const createProduct = async (productData) => {
  const res = await authRequest('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create product');
  return data;
};

export const updateProduct = async (id, productData) => {
  const res = await authRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update product');
  return data;
};

export const publishProduct = async (id) => {
  const res = await authRequest(`/products/${id}/publish`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to publish product');
  return data;
};

export const uploadAsset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const store = await import('../store/authStore').then((m) => m.useAuthStore);
  const { accessToken } = store.getState();

  const response = await fetch(`${BASE_URL}/products/upload-asset`, {
    method: 'POST',
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to upload asset');
  return data;
};