// ScanVista API Client for analytics
import {routes} from '../routes';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchAnalytics = async () => {
  const response = await fetch(`${BASE_URL}/analytics`);
  if (!response.ok) throw new Error('API fetch failed');
  return response.json();
};