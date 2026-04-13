/**
 * Dev local: mismo comportamiento que las Vercel Functions en api/*.mjs (pool por request).
 * Producción Vercel: despliega frontend/; las rutas /api/* las sirven los archivos en api/.
 */
import 'dotenv/config';
import express from 'express';
import { withPool } from '../api/_lib/db.mjs';
import healthHandler from '../api/health.mjs';
import matchesHandler from '../api/sports/matches.mjs';
import resultsHandler from '../api/sports/results/index.mjs';
import resultByHexHandler from '../api/sports/results/[matchIdHex].mjs';
import fulfillHandler from '../api/oracle/fulfill.mjs';

const app = express();
app.use(express.json({ limit: '32kb' }));

app.all('/api/health', healthHandler);
app.all('/api/sports/matches', matchesHandler);
app.all('/api/sports/results', resultsHandler);
app.all('/api/sports/results/:matchIdHex', resultByHexHandler);
app.all('/api/oracle/fulfill', fulfillHandler);

const PORT = Number(process.env.PORT || process.env.ORACLE_API_PORT || 8787);
const LISTEN_HOST = process.env.ORACLE_API_HOST || '0.0.0.0';

/** @type {import('http').Server | undefined} */
let httpServer;

async function main() {
  try {
    await withPool(async () => {});
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(
      `[oracle-api] DATABASE_URL es obligatorio. ${msg}`,
    );
    process.exit(1);
  }
  httpServer = app.listen(PORT, LISTEN_HOST, () => {
    console.log(`[oracle-api] http://${LISTEN_HOST}:${PORT} (postgresql, pool por request)`);
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
