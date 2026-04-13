import { applyCors } from '../_lib/cors.mjs';
import { withPool } from '../_lib/db.mjs';
import { listRegisteredMatches } from '../_lib/oracle-core.mjs';

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'GET') {
    try {
      await withPool(async (pool) => {
        const matches = await listRegisteredMatches(pool);
        res.status(200).json({ matches });
      });
    } catch (e) {
      const code = /** @type {{ code?: string }} */ (e).code;
      if (code === 'NO_DATABASE') {
        return res.status(500).json({ error: 'DATABASE_URL no configurada' });
      }
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[oracle-api] list registered_matches:', msg);
      if (!res.headersSent) res.status(500).json({ error: 'No se pudieron listar los partidos' });
    }
    return;
  }

  if (req.method === 'POST') {
    const { id, label } = req.body ?? {};
    if (typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({ error: 'id requerido (identificador de texto del partido)' });
    }
    const idTrim = id.trim();
    const labelTrim = typeof label === 'string' ? label.trim() : '';
    try {
      await withPool(async (pool) => {
        try {
          await pool.query(
            `INSERT INTO registered_matches (match_id_string, label) VALUES ($1, $2)`,
            [idTrim, labelTrim],
          );
        } catch (e) {
          const err = /** @type {{ code?: string }} */ (e);
          if (err.code === '23505') {
            res.status(409).json({ error: 'Ya existe un partido con ese identificador.' });
            return;
          }
          throw e;
        }
        const matches = await listRegisteredMatches(pool);
        res.status(200).json({ ok: true, matches });
      });
    } catch (e) {
      const code = /** @type {{ code?: string }} */ (e).code;
      if (code === 'NO_DATABASE') {
        return res.status(500).json({ error: 'DATABASE_URL no configurada' });
      }
      if (res.headersSent) return;
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[oracle-api] insert registered_matches:', msg);
      res.status(500).json({ error: 'No se pudo guardar el partido' });
    }
    return;
  }

  if (req.method === 'DELETE') {
    const { id } = req.body ?? {};
    if (typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({ error: 'id requerido' });
    }
    try {
      await withPool(async (pool) => {
        await pool.query(`DELETE FROM registered_matches WHERE match_id_string = $1`, [id.trim()]);
        const matches = await listRegisteredMatches(pool);
        res.status(200).json({ ok: true, matches });
      });
    } catch (e) {
      const code = /** @type {{ code?: string }} */ (e).code;
      if (code === 'NO_DATABASE') {
        return res.status(500).json({ error: 'DATABASE_URL no configurada' });
      }
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[oracle-api] delete registered_matches:', msg);
      if (!res.headersSent) res.status(500).json({ error: 'No se pudo eliminar el partido' });
    }
    return;
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
