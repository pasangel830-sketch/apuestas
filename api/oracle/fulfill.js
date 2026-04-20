import { ethers } from 'ethers';
import { applyCors } from '../_lib/cors.mjs';
import { withPool } from '../_lib/db.mjs';
import { getResultByMatchIdHex, normalizeMatchIdHex } from '../_lib/oracle-core.mjs';

const MOCK_ORACLE_ABI = ['function setResult(bytes32 matchId, uint8 result) external'];

export default async function handler(req, res) {
  applyCors(req, res);
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  /** @type {{ matchIdBytes32?: unknown }} */
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

  const id = normalizeMatchIdHex(body.matchIdBytes32);
  if (!id) {
    return res.status(400).json({ error: 'matchIdBytes32 inválido' });
  }

  const rpc = process.env.ORACLE_RPC_URL?.trim();
  const oracleAddress = process.env.ORACLE_ADDRESS?.trim();
  const pk = process.env.ORACLE_PRIVATE_KEY?.trim();
  if (!rpc || !oracleAddress || !pk) {
    return res.status(503).json({ error: 'Servidor sin ORACLE_RPC_URL / ORACLE_ADDRESS / ORACLE_PRIVATE_KEY' });
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

      const provider = new ethers.JsonRpcProvider(rpc);
      const wallet = new ethers.Wallet(pk, provider);
      const contract = new ethers.Contract(oracleAddress, MOCK_ORACLE_ABI, wallet);
      const tx = await contract.setResult(id, row.outcome);
      const receipt = await tx.wait();
      const txHash = receipt?.hash ?? tx.hash;
      res.status(200).json({ ok: true, txHash });
    });
  } catch (e) {
    const code = /** @type {{ code?: string }} */ (e).code;
    if (code === 'NO_DATABASE') {
      return res.status(500).json({ error: 'DATABASE_URL no configurada' });
    }
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[api] POST /oracle/fulfill:', msg);
    if (!res.headersSent) res.status(500).json({ error: msg });
  }
}
