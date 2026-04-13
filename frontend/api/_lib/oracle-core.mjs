import { createWalletClient, http, keccak256, toBytes, isHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';

/** @param {import('pg').Pool} pool */
export async function listRegisteredMatches(pool) {
  const r = await pool.query(
    `SELECT match_id_string AS id, label FROM registered_matches ORDER BY created_at ASC`,
  );
  return r.rows;
}

/**
 * @param {import('pg').Pool} pool
 * @param {string} id lowercased bytes32 hex
 * @returns {Promise<{ outcome: number, matchIdString: string, updatedAt: string } | null>}
 */
export async function getResultByMatchIdHex(pool, id) {
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
 * @param {import('pg').Pool} pool
 * @param {string} idHex
 * @param {number} outcome
 * @param {string} matchIdString
 */
export async function upsertResult(pool, idHex, outcome, matchIdString) {
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

export function normalizeMatchIdHex(bytes32) {
  if (typeof bytes32 !== 'string' || !isHex(bytes32) || bytes32.length !== 66) {
    return null;
  }
  return bytes32.toLowerCase();
}

export const mockOracleAbi = [
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

/** Cadena para transacciones del oráculo (31337 local, 11155111 Sepolia). */
export function viemChainForOracleRpc(rpc) {
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

export function loadEnv() {
  const rpc = process.env.ORACLE_RPC_URL || 'http://127.0.0.1:8545';
  const oracleAddress = process.env.ORACLE_ADDRESS;
  const pk = process.env.ORACLE_PRIVATE_KEY;
  return { rpc, oracleAddress, pk };
}

/**
 * @param {string} id lowercased bytes32 hex
 * @param {{ outcome: number }} row
 */
export async function writeSetResultToChain(id, row) {
  const { rpc, oracleAddress, pk } = loadEnv();
  if (!oracleAddress || !pk) {
    const err = new Error('Servidor sin ORACLE_ADDRESS / ORACLE_PRIVATE_KEY');
    /** @type {Error & { status?: number }} */ (err).status = 503;
    throw err;
  }
  const account = privateKeyToAccount(pk);
  const chain = viemChainForOracleRpc(rpc);
  const wallet = createWalletClient({ account, chain, transport: http(rpc) });
  const hash = await wallet.writeContract({
    address: oracleAddress,
    abi: mockOracleAbi,
    functionName: 'setResult',
    args: [id, row.outcome],
  });
  return hash;
}

export function resultIdFromMatchIdString(matchIdString) {
  return keccak256(toBytes(matchIdString.trim())).toLowerCase();
}
