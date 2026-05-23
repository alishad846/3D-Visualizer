// ScanVista API Client for auth
import { BASE_URL } from './config';

export const fetchAuth = async () => {
  const response = await fetch(`${BASE_URL}/auth`);
  if (!response.ok) throw new Error('API fetch failed');
  return response.json();
};