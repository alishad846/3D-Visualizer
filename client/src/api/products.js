// ScanVista API Client for products
import { BASE_URL } from './config';

export const fetchProducts = async () => {
  const response = await fetch(`${BASE_URL}/products`);
  if (!response.ok) throw new Error('API fetch failed');
  return response.json();
};