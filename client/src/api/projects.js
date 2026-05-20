// ScanVista API Client for projects
import { BASE_URL } from './config';

export const fetchProjects = async () => {
  const response = await fetch(`${BASE_URL}/projects`);
  if (!response.ok) throw new Error('API fetch failed');
  return response.json();
};