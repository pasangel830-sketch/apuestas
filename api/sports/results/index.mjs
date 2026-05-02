import { applyCors } from '../../_lib/cors.mjs';
import { withPool } from '../../_lib/db.mjs';
import { resultIdFromMatchIdString, upsertResult } from '../../_lib/oracle-core.mjs';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  /** @type {{ matchIdString?: unknown, outcome?: unknown }} */
  const body =
    req.body && typeof req.body === 'string'
      ? (() => {
          try {
            return JSON.parse(req.body);
          } catch {
            return {};
          }
        })()
      : req.body ?? {};

  const { matchIdString, outcome } = body;
  if (typeof matchIdString !== 'string' || !matchIdString.trim()) {
    return res
      .status(400)
      .json({ error: 'matchIdString requerido (texto del partido, igual que en Crear porra)' });
  }
  const o = Number(outcome);
  if (!Number.isInteger(o) || o < 0 || o > 2) {
    return res.status(400).json({ error: 'outcome debe ser 0, 1 o 2' });
  }

  const trimmed = matchIdString.trim();
  const idHex = resultIdFromMatchIdString(trimmed);

  try {
    await withPool(async (pool) => {
      await upsertResult(pool, idHex, o, trimmed);
      res.status(200).json({ ok: true, matchIdBytes32: idHex, outcome: o });
    });
  } catch (e) {
    const code = /** @type {{ code?: string }} */ (e).code;
    if (code === 'NO_DATABASE') {
      return res.status(500).json({ error: 'DATABASE_URL no configurada' });
    }
    if (res.headersSent) return;
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[api] upsert sports_results:', msg);
    res.status(500).json({ error: 'No se pudo guardar el resultado' });
  }
}

