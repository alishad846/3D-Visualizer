// ScanVista API Client for projects
import { authRequest } from './client';

export const fetchMyProjects = async () => {
  const res = await authRequest('/projects/my');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch projects');
  return data;
};

export const createProject = async ({ name, description }) => {
  const res = await authRequest('/projects', {
    method: 'POST',
    body: JSON.stringify({ name, description }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create project');
  return data;
};