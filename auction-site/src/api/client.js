import { API_BASE } from "../config.js";

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
