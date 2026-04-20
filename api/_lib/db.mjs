import pg from 'pg';

const { Pool } = pg;

export async function ensurePgSchema(clientPool) {
  await clientPool.query(`
    CREATE TABLE IF NOT EXISTS sports_results (
      match_id_hex TEXT PRIMARY KEY,
      outcome SMALLINT NOT NULL CHECK (outcome >= 0 AND outcome <= 2),
      match_id_string TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
  await clientPool.query(`
    CREATE TABLE IF NOT EXISTS registered_matches (
      match_id_string TEXT PRIMARY KEY,
      label TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

/**
 * Un pool corto (max 1) por invocación; siempre se cierra en finally.
 * Adecuado para Vercel Serverless + Neon.
 */
export async function withPool(fn) {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    const err = new Error('DATABASE_URL es obligatorio');
    /** @type {Error & { code?: string }} */ (err).code = 'NO_DATABASE';
    throw err;
  }
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    await ensurePgSchema(pool);
    return await fn(pool);
  } finally {
    await pool.end().catch(() => {});
  }
}

