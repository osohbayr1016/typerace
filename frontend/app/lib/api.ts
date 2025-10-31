'use client';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  signup(data: { email: string; username: string; password: string }) {
    return request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  login(data: { email: string; password: string }) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  me() {
    return request('/api/auth/me');
  },
  logout() {
    return request('/api/auth/logout', { method: 'POST' });
  },
  equip(data: { carSku?: string; skinSku?: string }) {
    return request('/api/equip', { method: 'POST', body: JSON.stringify(data) });
  },
  catalog() {
    return request('/api/shop/catalog');
  },
  purchase(itemId: string) {
    return request('/api/shop/purchase', { method: 'POST', body: JSON.stringify({ itemId }) });
  },
  inventory() {
    return request('/api/inventory');
  },
};


