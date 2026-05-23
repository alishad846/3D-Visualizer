// ScanVista API Client for viewer
import { BASE_URL } from './config';

export const fetchViewer = async () => {
  const response = await fetch(`${BASE_URL}/viewer`);
  if (!response.ok) throw new Error('API fetch failed');
  return response.json();
};