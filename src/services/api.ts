const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_URL is not defined");
}

export const apiFetch = async (
  url: string,
  options?: RequestInit
) => {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "API Error");
  }

  return res.json();
};
