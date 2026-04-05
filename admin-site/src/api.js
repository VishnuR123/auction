import { API_BASE } from "./config";

async function parseBody(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function apiGet(path) {
  const r = await fetch(`${API_BASE}${path}`);
  const data = await parseBody(r);
  if (!r.ok) throw new Error(data?.message || r.statusText);
  return data;
}

export async function apiSend(method, path, body) {
  const r = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await parseBody(r);
  if (!r.ok) throw new Error(data?.message || r.statusText);
  return data;
}

/** Multipart upload (e.g. Excel). Do not set Content-Type — browser sets boundary. */
export async function apiUpload(path, formData) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
  });
  const data = await parseBody(r);
  if (!r.ok) throw new Error(data?.message || r.statusText);
  return data;
}
