// ScanVista API Client for analytics
import { BASE_URL } from './config';

export const fetchAnalytics = async () => {
  const response = await fetch(`${BASE_URL}/analytics`);
  if (!response.ok) throw new Error('API fetch failed');
  return response.json();
};