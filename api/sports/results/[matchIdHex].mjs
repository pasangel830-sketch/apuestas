import { applyCors } from '../../_lib/cors.mjs';
import { withPool } from '../../_lib/db.mjs';
import { getResultByMatchIdHex, normalizeMatchIdHex } from '../../_lib/oracle-core.mjs';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  // #region agent log
  fetch('http://127.0.0.1:7834/ingest/c35bd949-6ee1-4bfc-9b71-b3fecbcb1813', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '269f79' }, body: JSON.stringify({ sessionId: '269f79', runId: 'pre-fix', hypothesisId: 'A', location: 'api/sports/results/[matchIdHex].mjs:10', message: 'hit /api/sports/results/:matchIdHex', data: { method: req.method, matchIdHex: req.query?.matchIdHex }, timestamp: Date.now() }) }).catch(() => {});
  // #endregion

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const fromQuery = req.query?.matchIdHex;
  const param = Array.isArray(fromQuery) ? fromQuery[0] : fromQuery;
  const id = normalizeMatchIdHex(typeof param === 'string' ? param : '');
  if (!id) {
    return res.status(400).json({ error: 'matchIdHex inválido (bytes32 con 0x)' });
  }

  try {
    await withPool(async (pool) => {
      const row = await getResultByMatchIdHex(pool, id);
      if (!row) {
        res.status(404).json({ error: 'Sin resultado publicado para este partido' });
        return;
      }
      res.status(200).json(row);
    });
  } catch (e) {
    const code = /** @type {{ code?: string }} */ (e).code;
    if (code === 'NO_DATABASE') {
      return res.status(500).json({ error: 'DATABASE_URL no configurada' });
    }
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[api] read sports_results:', msg);
    if (!res.headersSent) res.status(500).json({ error: 'No se pudo leer el resultado' });
  }
}

