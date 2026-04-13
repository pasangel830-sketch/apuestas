import { oracleApiUrl, oracleApiBase } from './oracleApi';

/** @typedef {{ id: string, label: string }} RegisteredMatch */

const JSON_HEADERS = { 'Content-Type': 'application/json' };

/** @param {Response | { json?: () => Promise<unknown>, text?: () => Promise<string>, clone?: () => unknown }} r */
async function responseBodyText(r) {
  if (typeof r.clone === 'function') {
    const c = r.clone();
    if (c && typeof c.text === 'function') return c.text();
  }
  if (typeof r.text === 'function') return r.text();
  if (typeof r.json === 'function') return r.json().then((o) => JSON.stringify(o));
  return '';
}

function looksLikeHtmlBody(rawText) {
  const t = String(rawText).trimStart();
  return t.startsWith('<!') || t.startsWith('<html') || (t.startsWith('<') && !t.startsWith('{'));
}

function isLocalHostname() {
  if (typeof globalThis.location?.hostname !== 'string') return false;
  const h = globalThis.location.hostname;
  return h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
}

/**
 * @param {number} status
 * @param {object} j
 * @param {string} statusText
 * @param {string} [rawText]
 */
function matchesApiError(status, j, statusText, rawText = '') {
  if (status === 404) {
    if (typeof j?.error === 'string' && j.error.trim()) return j.error;
    const html = looksLikeHtmlBody(rawText);
    const parseFailed = Boolean(j?.__parseError);
    const local = isLocalHostname();
    if (local && (html || parseFailed)) {
      return (
        'El servidor en :8787 no tiene la ruta de partidos (suele ser un oracle-api antiguo en memoria). ' +
        'Cierra el proceso que usa el puerto 8787 y ejecuta desde frontend/: npm run dev (api + vite). ' +
        'Comprueba GET /api/health: debe mostrar store "postgresql".'
      );
    }
    if (!local) {
      return (
        'No se encuentra la API de partidos (404). En Vercel: raíz del proyecto con vercel.json (installCommand que copia frontend/api → api/), ' +
        'no ignores la carpeta api/ en .gitignore, y define DATABASE_URL. /api/health debe devolver JSON con store "postgresql". ' +
        'Si usas VITE_ORACLE_API_URL, la base debe ser el backend que expone /api/sports/matches.'
      );
    }
    return j.error || statusText || 'Ruta de partidos no encontrada (404).';
  }
  return j.error || statusText || 'No se pudieron cargar los partidos';
}

/**
 * @returns {Promise<RegisteredMatch[]>}
 */
export async function fetchRegisteredMatches() {
  const url = oracleApiUrl('/api/sports/matches');
  const viteOracle =
    typeof import.meta.env.VITE_ORACLE_API_URL === 'string'
      ? String(import.meta.env.VITE_ORACLE_API_URL).trim() || '(empty-string)'
      : '(undefined)';
  // #region agent log
  fetch('http://127.0.0.1:7834/ingest/c35bd949-6ee1-4bfc-9b71-b3fecbcb1813', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8f1e6c' },
    body: JSON.stringify({
      sessionId: '8f1e6c',
      runId: 'pre',
      hypothesisId: 'H1-H2',
      location: 'registeredMatches.js:fetchRegisteredMatches:pre',
      message: 'before GET /api/sports/matches',
      data: {
        matchesUrl: url,
        oracleApiBase: oracleApiBase() || '(same-origin)',
        viteOracleApiUrl: viteOracle,
        pageHost: typeof globalThis.location?.hostname === 'string' ? globalThis.location.hostname : '(no-window)',
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  const r = await fetch(url);
  const rawText = await responseBodyText(r);
  let j = {};
  try {
    j = JSON.parse(rawText);
  } catch {
    j = { __parseError: true };
  }
  if (!r.ok) {
    /** @type {Record<string, unknown>} */
    let healthProbe = { skipped: true };
    try {
      const hr = await fetch(oracleApiUrl('/api/health'));
      const ht = await hr.text();
      healthProbe = {
        status: hr.status,
        ok: hr.ok,
        bodyStart: ht.slice(0, 160),
      };
    } catch (e) {
      healthProbe = { error: e instanceof Error ? e.message : String(e) };
    }
    // #region agent log
    fetch('http://127.0.0.1:7834/ingest/c35bd949-6ee1-4bfc-9b71-b3fecbcb1813', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '8f1e6c' },
      body: JSON.stringify({
        sessionId: '8f1e6c',
        runId: 'pre',
        hypothesisId: 'H3-H5',
        location: 'registeredMatches.js:fetchRegisteredMatches:error',
        message: 'GET matches failed; probed /api/health',
        data: {
          matchesStatus: r.status,
          matchesResponseUrl: r.url,
          matchesRedirected: r.redirected,
          contentType: r.headers.get('content-type'),
          bodyStart: rawText.slice(0, 200),
          looksLikeHtml: looksLikeHtmlBody(rawText),
          healthProbe,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw new Error(matchesApiError(r.status, j, r.statusText, rawText));
  }
  return Array.isArray(j.matches) ? j.matches : [];
}

/**
 * @param {string} id
 * @param {string} [label]
 * @returns {Promise<{ ok: true, matches: RegisteredMatch[] } | { ok: false, error: string }>}
 */
export async function addRegisteredMatch(id, label = '') {
  const trimmed = id.trim();
  if (!trimmed) {
    return { ok: false, error: 'El identificador no puede estar vacío.' };
  }
  const url = oracleApiUrl('/api/sports/matches');
  const r = await fetch(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      id: trimmed,
      label: typeof label === 'string' ? label.trim() : '',
    }),
  });
  const rawText = await responseBodyText(r);
  let j = {};
  try {
    j = JSON.parse(rawText);
  } catch {
    j = { __parseError: true };
  }
  if (r.status === 409) {
    return { ok: false, error: j.error || 'Ya existe un partido con ese identificador.' };
  }
  if (!r.ok) {
    return { ok: false, error: matchesApiError(r.status, j, r.statusText, rawText) };
  }
  return { ok: true, matches: Array.isArray(j.matches) ? j.matches : [] };
}

/**
 * @param {string} id
 * @returns {Promise<RegisteredMatch[]>}
 */
export async function removeRegisteredMatch(id) {
  const r = await fetch(oracleApiUrl('/api/sports/matches'), {
    method: 'DELETE',
    headers: JSON_HEADERS,
    body: JSON.stringify({ id }),
  });
  const rawText = await responseBodyText(r);
  let j = {};
  try {
    j = JSON.parse(rawText);
  } catch {
    j = { __parseError: true };
  }
  if (!r.ok) {
    throw new Error(matchesApiError(r.status, j, r.statusText, rawText));
  }
  return Array.isArray(j.matches) ? j.matches : [];
}
