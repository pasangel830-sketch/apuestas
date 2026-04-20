import { applyCors } from './_lib/cors.mjs';
import { appendFile } from 'node:fs/promises';

async function dbg(data) {
  // #region agent log
  try {
    await appendFile(
      'debug-d91ab8.log',
      `${JSON.stringify({ sessionId: 'd91ab8', ...data, timestamp: Date.now() })}\n`,
      'utf8',
    );
  } catch {}
  // #endregion
}

export default function handler(req, res) {
  void dbg({
    runId: process.env.VERCEL ? 'vercel' : 'local',
    hypothesisId: 'H2',
    location: 'api/health.js:18',
    message: 'health handler hit',
    data: {
      method: req.method,
      hasOrigin: !!req.headers?.origin,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
  });

  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const payload = {
    status: 'ok',
    store: 'postgresql',
    timestamp: new Date().toISOString(),
  };

  void dbg({
    runId: process.env.VERCEL ? 'vercel' : 'local',
    hypothesisId: 'H2',
    location: 'api/health.js:47',
    message: 'health response',
    data: { status: 200, payloadKeys: Object.keys(payload) },
  });

  return res.status(200).json(payload);
}

