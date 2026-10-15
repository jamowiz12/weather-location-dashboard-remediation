export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getXsrfToken() {
  if (typeof document === "undefined") {
    return "";
  }

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));

  return token ? decodeURIComponent(token.split("=")[1]) : "";
}

export async function getCsrfCookie() {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    method: "GET",
    credentials: "include",
    mode: "cors",
  });
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();

  if (method !== "GET") {
    await getCsrfCookie();
  }

  const xsrfToken = getXsrfToken();

  const response = await fetch(`${API_URL}/api${path}`, {
    credentials: "include",
    mode: "cors",
    ...options,
    headers: {
      Accept: "application/json",
      ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(response.status, data.message || "Request failed.");
  }

  return data;
}
