const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function getToken() {
  return localStorage.getItem("agrimindToken") || "";
}

export function getCurrentUser() {
  try {
    return JSON.parse(
      localStorage.getItem("agrimindCurrentUser") || "null"
    );
  } catch {
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem("agrimindToken", token);
  localStorage.setItem(
    "agrimindCurrentUser",
    JSON.stringify(user)
  );
}

export function clearSession() {
  localStorage.removeItem("agrimindToken");
  localStorage.removeItem("agrimindCurrentUser");
}

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to AgriMind backend. Make sure the server is running on port 5000."
    );
  }

  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      message: text || "Unexpected server response.",
    };
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }

    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data;
}

export const get = (path) => api(path);

export const post = (path, body) =>
  api(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const put = (path, body) =>
  api(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const del = (path) =>
  api(path, {
    method: "DELETE",
  });
