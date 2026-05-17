// ScanVista API Client for products
import {routes} from '../routes';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchProducts = async () => {
  const response = await fetch(`${BASE_URL}/products`);
  if (!response.ok) throw new Error('API fetch failed');
  return response.json();
};