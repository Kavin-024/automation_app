"use client"

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "https://app.bpoautoaccept.online/api").replace(/\/$/, "")
export function getToken(): string | null {
  return localStorage.getItem("auth_token")
}

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getToken()
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.message || "Request failed")
  }

  return data
}
