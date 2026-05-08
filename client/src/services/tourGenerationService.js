import { getCachedTours, cacheTours } from './storageService';

export async function generateTours(city, country) {
  const cached = getCachedTours(city);
  if (cached) return { ...cached, fromCache: true };

  const res = await fetch('/api/tours/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ city, country }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate tours');
  }

  const data = await res.json();
  cacheTours(city, data);
  return data;
}
