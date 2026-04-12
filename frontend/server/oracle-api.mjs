/**
 * API deportiva mock + “nodo Chainlink”: lee resultados publicados y firma setResult en MockOracle.
 * Persistencia: solo PostgreSQL (DATABASE_URL obligatorio).
 * Ejecutar con: npm run dev:api (y en paralelo npm run dev:vite para el front).
 */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createWalletClient, http, keccak256, toBytes, isHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';
import pg from 'pg';

const { Pool } = pg;

/** @type {import('pg').Pool} */
let pool;

/** Cadena para transacciones del oráculo (31337 local, 11155111 Sepolia). */
function viemChainForOracleRpc(rpc) {
  const chainId = Number(process.env.ORACLE_CHAIN_ID || 31337);
  if (!Number.isFinite(chainId) || chainId <= 0) {
    throw new Error('ORACLE_CHAIN_ID inválido');
  }
  return defineChain({
    id: chainId,
    name: process.env.ORACLE_CHAIN_NAME || 'Oracle RPC',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: [rpc] } },
  });
}

function loadEnv() {
  const rpc = process.env.ORACLE_RPC_URL || 'http://127.0.0.1:8545';
  const oracleAddress = process.env.ORACLE_ADDRESS;
  const pk = process.env.ORACLE_PRIVATE_KEY;
  if (!oracleAddress || !pk) {
    console.warn(
      '[oracle-api] Falta ORACLE_ADDRESS u ORACLE_PRIVATE_KEY. El fulfill on-chain no funcionará hasta configurarlos.',
    );
  }
  return { rpc, oracleAddress, pk };
}

async function ensurePgSchema(clientPool) {
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

async function initDb() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error(
      '[oracle-api] DATABASE_URL es obligatorio. Ej.: docker compose up -d en frontend/ y DATABASE_URL en .env',
    );
    process.exit(1);
  }
  const newPool = new Pool({ connectionString: url });
  try {
    await ensurePgSchema(newPool);
    pool = newPool;
    console.log('[oracle-api] PostgreSQL conectado.');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[oracle-api] No se pudo conectar a PostgreSQL: ${msg}`);
    await newPool.end().catch(() => {});
    process.exit(1);
  }
}

async function listRegisteredMatches() {
  const r = await pool.query(
    `SELECT match_id_string AS id, label FROM registered_matches ORDER BY created_at ASC`,
  );
  return r.rows;
}

/**
 * @param {string} id lowercased bytes32 hex
 * @returns {Promise<{ outcome: number, matchIdString: string, updatedAt: string } | null>}
 */
async function getResultByMatchIdHex(id) {
  const r = await pool.query(
    `SELECT outcome, match_id_string AS "matchIdString", updated_at AS "updatedAt"
     FROM sports_results WHERE match_id_hex = $1`,
    [id],
  );
  if (r.rows.length === 0) return null;
  const row = r.rows[0];
  const u = row.updatedAt;
  return {
    outcome: row.outcome,
    matchIdString: row.matchIdString,
    updatedAt: u instanceof Date ? u.toISOString() : String(u),
  };
}

/**
 * @param {string} idHex
 * @param {number} outcome
 * @param {string} matchIdString
 */
async function upsertResult(idHex, outcome, matchIdString) {
  const updatedAt = new Date().toISOString();
  await pool.query(
    `INSERT INTO sports_results (match_id_hex, outcome, match_id_string, updated_at)
     VALUES ($1, $2, $3, $4::timestamptz)
     ON CONFLICT (match_id_hex) DO UPDATE SET
       outcome = EXCLUDED.outcome,
       match_id_string = EXCLUDED.match_id_string,
       updated_at = EXCLUDED.updated_at`,
    [idHex, outcome, matchIdString, updatedAt],
  );
}

function normalizeMatchIdHex(bytes32) {
  if (typeof bytes32 !== 'string' || !isHex(bytes32) || bytes32.length !== 66) {
    return null;
  }
  return bytes32.toLowerCase();
}

const mockOracleAbi = [
  {
    type: 'function',
    name: 'setResult',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'matchId', type: 'bytes32' },
      { name: 'result', type: 'uint8' },
    ],
    outputs: [],
  },
];

function appRouter() {
  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: '32kb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'sports-api-oracle', store: 'postgresql' });
  });

  /** Partidos registrados (lista para Crear porra / oracle-mock). */
  app.get('/api/sports/matches', async (_req, res) => {
    try {
      const matches = await listRegisteredMatches();
      return res.json({ matches });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[oracle-api] list registered_matches:', msg);
      return res.status(500).json({ error: 'No se pudieron listar los partidos' });
    }
  });

  app.post('/api/sports/matches', async (req, res) => {
    const { id, label } = req.body ?? {};
    if (typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({ error: 'id requerido (identificador de texto del partido)' });
    }
    const idTrim = id.trim();
    const labelTrim = typeof label === 'string' ? label.trim() : '';
    try {
      await pool.query(
        `INSERT INTO registered_matches (match_id_string, label) VALUES ($1, $2)`,
        [idTrim, labelTrim],
      );
    } catch (e) {
      const err = /** @type {{ code?: string }} */ (e);
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Ya existe un partido con ese identificador.' });
      }
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[oracle-api] insert registered_matches:', msg);
      return res.status(500).json({ error: 'No se pudo guardar el partido' });
    }
    try {
      const matches = await listRegisteredMatches();
      return res.json({ ok: true, matches });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[oracle-api] list after insert registered_matches:', msg);
      return res.status(500).json({ error: 'Partido guardado pero no se pudo devolver la lista' });
    }
  });

  app.delete('/api/sports/matches', async (req, res) => {
    const { id } = req.body ?? {};
    if (typeof id !== 'string' || !id.trim()) {
      return res.status(400).json({ error: 'id requerido' });
    }
    try {
      await pool.query(`DELETE FROM registered_matches WHERE match_id_string = $1`, [id.trim()]);
      const matches = await listRegisteredMatches();
      return res.json({ ok: true, matches });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[oracle-api] delete registered_matches:', msg);
      return res.status(500).json({ error: 'No se pudo eliminar el partido' });
    }
  });

  /** Publicar resultado (como lo haría la “API deportiva”). */
  app.post('/api/sports/results', async (req, res) => {
    const { matchIdString, outcome } = req.body ?? {};
    if (typeof matchIdString !== 'string' || !matchIdString.trim()) {
      return res.status(400).json({ error: 'matchIdString requerido (texto del partido, igual que en Crear porra)' });
    }
    const o = Number(outcome);
    if (!Number.isInteger(o) || o < 0 || o > 2) {
      return res.status(400).json({ error: 'outcome debe ser 0, 1 o 2' });
    }
    const idHex = keccak256(toBytes(matchIdString.trim())).toLowerCase();
    try {
      await upsertResult(idHex, o, matchIdString.trim());
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[oracle-api] upsert sports_results:', msg);
      return res.status(500).json({ error: 'No se pudo guardar el resultado' });
    }
    return res.json({ ok: true, matchIdBytes32: idHex, outcome: o });
  });

  app.get('/api/sports/results/:matchIdHex', async (req, res) => {
    const id = normalizeMatchIdHex(req.params.matchIdHex);
    if (!id) {
      return res.status(400).json({ error: 'matchIdHex inválido (bytes32 con 0x)' });
    }
    let row;
    try {
      row = await getResultByMatchIdHex(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[oracle-api] read sports_results:', msg);
      return res.status(500).json({ error: 'No se pudo leer el resultado' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Sin resultado publicado para este partido' });
    }
    return res.json(row);
  });

  /** Simula el nodo Chainlink: trae el resultado de la API y escribe en MockOracle. */
  app.post('/api/oracle/fulfill', async (req, res) => {
    const { matchIdBytes32 } = req.body ?? {};
    const id = normalizeMatchIdHex(matchIdBytes32);
    if (!id) {
      return res.status(400).json({ error: 'matchIdBytes32 inválido' });
    }
    const { rpc, oracleAddress, pk } = loadEnv();
    if (!oracleAddress || !pk) {
      return res.status(503).json({ error: 'Servidor sin ORACLE_ADDRESS / ORACLE_PRIVATE_KEY' });
    }
    let row;
    try {
      row = await getResultByMatchIdHex(id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[oracle-api] fulfill read:', msg);
      return res.status(500).json({ error: 'No se pudo leer el resultado' });
    }
    if (!row) {
      return res.status(404).json({
        error:
          'No hay resultado en la API deportiva para este matchId. Publícalo antes en /oracle-mock.',
      });
    }
    const account = privateKeyToAccount(pk);
    const chain = viemChainForOracleRpc(rpc);
    const wallet = createWalletClient({ account, chain, transport: http(rpc) });
    try {
      const hash = await wallet.writeContract({
        address: oracleAddress,
        abi: mockOracleAbi,
        functionName: 'setResult',
        args: [id, row.outcome],
      });
      return res.json({ ok: true, txHash: hash, outcome: row.outcome });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return res.status(500).json({ error: msg });
    }
  });

  return app;
}

const PORT = Number(process.env.PORT || process.env.ORACLE_API_PORT || 8787);
const LISTEN_HOST = process.env.ORACLE_API_HOST || '0.0.0.0';

/** Referencia fuerte al servidor HTTP (evita que el GC lo libere antes de tiempo en algunos runtimes). */
let httpServer;

async function main() {
  await initDb();
  const app = appRouter();
  httpServer = app.listen(PORT, LISTEN_HOST, () => {
    console.log(`[oracle-api] http://${LISTEN_HOST}:${PORT} (postgresql)`);
  });
  httpServer.on('error', (err) => {
    console.error('[oracle-api] Error en el puerto', PORT, err);
    process.exit(1);
  });
}

main().catch((e) => {
  console.error('[oracle-api]', e);
  process.exit(1);
});
