// ScanVista API Client for viewer
import {routes} from '../routes';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchViewer = async () => {
  const response = await fetch(`${BASE_URL}/viewer`);
  if (!response.ok) throw new Error('API fetch failed');
  return response.json();
};