import { applyCors } from '../_lib/cors.mjs';
import { withPool } from '../_lib/db.mjs';
import {
  getResultByMatchIdHex,
  loadEnv,
  normalizeMatchIdHex,
  writeSetResultToChain,
} from '../_lib/oracle-core.mjs';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { matchIdBytes32 } = req.body ?? {};
  const id = normalizeMatchIdHex(matchIdBytes32);
  if (!id) {
    return res.status(400).json({ error: 'matchIdBytes32 inválido' });
  }
  const { oracleAddress, pk } = loadEnv();
  if (!oracleAddress || !pk) {
    return res.status(503).json({ error: 'Servidor sin ORACLE_ADDRESS / ORACLE_PRIVATE_KEY' });
  }

  try {
    await withPool(async (pool) => {
      const row = await getResultByMatchIdHex(pool, id);
      if (!row) {
        res.status(404).json({
          error:
            'No hay resultado en la API deportiva para este matchId. Publícalo antes en /oracle-mock.',
        });
        return;
      }
      let hash;
      try {
        hash = await writeSetResultToChain(id, row);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(500).json({ error: msg });
        return;
      }
      res.status(200).json({ ok: true, txHash: hash, outcome: row.outcome });
    });
  } catch (e) {
    const code = /** @type {{ code?: string }} */ (e).code;
    if (code === 'NO_DATABASE') {
      return res.status(500).json({ error: 'DATABASE_URL no configurada' });
    }
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[oracle-api] fulfill read:', msg);
    if (!res.headersSent) res.status(500).json({ error: 'No se pudo leer el resultado' });
  }
}
