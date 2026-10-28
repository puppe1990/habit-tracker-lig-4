export function isUnauthorizedResponse(response, data) {
  return response.status === 401 || (response.ok && !data?.user && data?.configured !== false);
}

export function createApiClient({ baseUrl, getToken }) {
  return async function apiRequest(pathname, options = {}) {
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${baseUrl}${pathname}`, { ...options, headers });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    return { response, data };
  };
}
