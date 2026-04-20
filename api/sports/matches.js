import { applyCors } from '../_lib/cors.mjs';
import { withPool } from '../_lib/db.mjs';
import { listRegisteredMatches } from '../_lib/oracle-core.mjs';
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

export default async function handler(req, res) {
  void dbg({
    runId: process.env.VERCEL ? 'vercel' : 'local',
    hypothesisId: 'H1',
    location: 'api/sports/matches.js:23',
    message: 'matches handler hit',
    data: { method: req.method, hasDatabaseUrl: !!process.env.DATABASE_URL },
  });

  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    try {
      await withPool(async (pool) => {
        const matches = await listRegisteredMatches(pool);
        void dbg({
          runId: process.env.VERCEL ? 'vercel' : 'local',
          hypothesisId: 'H3',
          location: 'api/sports/matches.js:40',
          message: 'matches query ok',
          data: { count: Array.isArray(matches) ? matches.length : null },
        });
        return res.status(200).json({ matches });
      });
    } catch (e) {
      const code = /** @type {{ code?: string }} */ (e).code;
      if (code === 'NO_DATABASE') {
        void dbg({
          runId: process.env.VERCEL ? 'vercel' : 'local',
          hypothesisId: 'H3',
          location: 'api/sports/matches.js:52',
          message: 'missing DATABASE_URL',
          data: { status: 500 },
        });
        return res.status(500).json({ error: 'DATABASE_URL no configurada' });
      }
      const msg = e instanceof Error ? e.message : String(e);
      void dbg({
        runId: process.env.VERCEL ? 'vercel' : 'local',
        hypothesisId: 'H3',
        location: 'api/sports/matches.js:63',
        message: 'matches error',
        data: { status: 500, error: msg.slice(0, 200) },
      });
      if (!res.headersSent) res.status(500).json({ error: 'No se pudieron listar los partidos' });
    }
    return;
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

