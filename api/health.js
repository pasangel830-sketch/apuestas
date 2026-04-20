import { applyCors } from './_lib/cors.mjs';

export default function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const payload = {
    status: 'ok',
    store: 'postgresql',
    timestamp: new Date().toISOString(),
  };

  return res.status(200).json(payload);
}

