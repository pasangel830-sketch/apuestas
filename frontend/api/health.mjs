import { applyCors } from './_lib/cors.mjs';

export default function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  return res.json({ ok: true, service: 'sports-api-oracle', store: 'postgresql' });
}
