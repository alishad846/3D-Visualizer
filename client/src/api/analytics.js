import { authRequest } from "./client";
const inFlightGetRequests = new Map();

async function getJsonOrThrow(response, fallbackMessage) {
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }
  return data;
}

async function analyticsGet(path, fallbackMessage) {
  if (inFlightGetRequests.has(path)) {
    return inFlightGetRequests.get(path);
  }

  const requestPromise = (async () => {
    const res = await authRequest(path);
    return getJsonOrThrow(res, fallbackMessage);
  })().finally(() => {
    inFlightGetRequests.delete(path);
  });

  inFlightGetRequests.set(path, requestPromise);
  return requestPromise;
}

// Product scope
export const getProductOverview = (productId) =>
  analyticsGet(`/analytics/product/${encodeURIComponent(productId)}/overview`, "Failed to load product overview");

export const getProductRealtime = (productId) =>
  analyticsGet(`/analytics/product/${encodeURIComponent(productId)}/realtime`, "Failed to load realtime data");

export const getProductTrend = (productId, range = "28d") =>
  analyticsGet(
    `/analytics/product/${encodeURIComponent(productId)}/trend?range=${encodeURIComponent(range)}`,
    "Failed to load trend data"
  );

export const getProductGeo = (productId, range = "28d") =>
  analyticsGet(
    `/analytics/product/${encodeURIComponent(productId)}/geo?range=${encodeURIComponent(range)}`,
    "Failed to load geo data"
  );

export const getProductDevices = (productId, range = "28d") =>
  analyticsGet(
    `/analytics/product/${encodeURIComponent(productId)}/devices?range=${encodeURIComponent(range)}`,
    "Failed to load device data"
  );

export const getProductSources = (productId, range = "28d") =>
  analyticsGet(
    `/analytics/product/${encodeURIComponent(productId)}/sources?range=${encodeURIComponent(range)}`,
    "Failed to load traffic source data"
  );

export const getProductSessions = (productId, range = "28d") =>
  analyticsGet(
    `/analytics/product/${encodeURIComponent(productId)}/sessions?range=${encodeURIComponent(range)}`,
    "Failed to load session quality data"
  );

// Project scope
export const getProjectOverview = (projectId) =>
  analyticsGet(`/analytics/project/${encodeURIComponent(projectId)}/overview`, "Failed to load project overview");

export const getProjectRealtime = (projectId) =>
  analyticsGet(`/analytics/project/${encodeURIComponent(projectId)}/realtime`, "Failed to load realtime data");

export const getProjectTrend = (projectId, range = "28d") =>
  analyticsGet(
    `/analytics/project/${encodeURIComponent(projectId)}/trend?range=${encodeURIComponent(range)}`,
    "Failed to load trend data"
  );

export const getProjectGeo = (projectId, range = "28d") =>
  analyticsGet(
    `/analytics/project/${encodeURIComponent(projectId)}/geo?range=${encodeURIComponent(range)}`,
    "Failed to load geo data"
  );

export const getProjectDevices = (projectId, range = "28d") =>
  analyticsGet(
    `/analytics/project/${encodeURIComponent(projectId)}/devices?range=${encodeURIComponent(range)}`,
    "Failed to load device data"
  );

export const getProjectSources = (projectId, range = "28d") =>
  analyticsGet(
    `/analytics/project/${encodeURIComponent(projectId)}/sources?range=${encodeURIComponent(range)}`,
    "Failed to load traffic source data"
  );

export const getProjectProducts = (projectId, range = "28d", sort = "scans") =>
  analyticsGet(
    `/analytics/project/${encodeURIComponent(projectId)}/products?range=${encodeURIComponent(range)}&sort=${encodeURIComponent(sort)}`,
    "Failed to load project products"
  );