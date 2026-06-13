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

export const deleteProject = async (id) => {
  const res = await authRequest(`/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete project');
  return data;
};

export const fetchDeletedProjects = async () => {
  const res = await authRequest('/projects/trash');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch deleted projects');
  return data;
};

export const restoreProject = async (id, includeProducts = false) => {
  const query = includeProducts ? '?includeProducts=true' : '';
  const res = await authRequest(`/projects/${encodeURIComponent(id)}/restore${query}`, {
    method: 'POST',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to restore project');
  return data;
};

export const fetchRestorePreflight = async (id) => {
  const res = await authRequest(`/projects/${encodeURIComponent(id)}/restore-preflight`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch restore preflight info');
  return data;
};
