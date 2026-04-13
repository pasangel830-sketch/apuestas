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

/**
 * @returns {Promise<RegisteredMatch[]>}
 */
function matchesApiError(status, j, statusText) {
  if (status === 404) {
    return (
      j.error ||
      'El servidor en :8787 no tiene la ruta de partidos (suele ser un oracle-api antiguo en memoria). ' +
        'Cierra el proceso que usa el puerto 8787 y ejecuta desde frontend/: npm run dev (api + vite). ' +
        'Comprueba GET /api/health: debe mostrar store "postgresql".'
    );
  }
  return j.error || statusText || 'No se pudieron cargar los partidos';
}

export async function fetchRegisteredMatches() {
  const url = oracleApiUrl('/api/sports/matches');
  // #region agent log
  fetch('http://127.0.0.1:7834/ingest/c35bd949-6ee1-4bfc-9b71-b3fecbcb1813', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'c2a728' },
    body: JSON.stringify({
      sessionId: 'c2a728',
      runId: 'pre-fix',
      hypothesisId: 'H2',
      location: 'registeredMatches.js:fetchRegisteredMatches:pre',
      message: 'GET /api/sports/matches',
      data: { url, apiBase: oracleApiBase() || '(same-origin)' },
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
  // #region agent log
  fetch('http://127.0.0.1:7834/ingest/c35bd949-6ee1-4bfc-9b71-b3fecbcb1813', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'c2a728' },
    body: JSON.stringify({
      sessionId: 'c2a728',
      runId: 'pre-fix',
      hypothesisId: 'H1',
      location: 'registeredMatches.js:fetchRegisteredMatches:post',
      message: 'GET response',
      data: {
        status: r.status,
        ok: r.ok,
        contentType: r.headers?.get?.('content-type'),
        bodySnippet: rawText.slice(0, 320),
        looksLikeHtml: rawText.trimStart().startsWith('<'),
        jError: typeof j.error === 'string' ? j.error : undefined,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!r.ok) {
    throw new Error(matchesApiError(r.status, j, r.statusText));
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
  // #region agent log
  fetch('http://127.0.0.1:7834/ingest/c35bd949-6ee1-4bfc-9b71-b3fecbcb1813', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'c2a728' },
    body: JSON.stringify({
      sessionId: 'c2a728',
      runId: 'pre-fix',
      hypothesisId: 'H2',
      location: 'registeredMatches.js:addRegisteredMatch:pre',
      message: 'POST /api/sports/matches',
      data: { url, apiBase: oracleApiBase() || '(same-origin)', idLen: trimmed.length },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7834/ingest/c35bd949-6ee1-4bfc-9b71-b3fecbcb1813', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'c2a728' },
    body: JSON.stringify({
      sessionId: 'c2a728',
      runId: 'pre-fix',
      hypothesisId: 'H1',
      location: 'registeredMatches.js:addRegisteredMatch:post',
      message: 'POST response',
      data: {
        status: r.status,
        ok: r.ok,
        contentType: r.headers?.get?.('content-type'),
        bodySnippet: rawText.slice(0, 320),
        looksLikeHtml: rawText.trimStart().startsWith('<'),
        jError: typeof j.error === 'string' ? j.error : undefined,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (r.status === 409) {
    return { ok: false, error: j.error || 'Ya existe un partido con ese identificador.' };
  }
  if (!r.ok) {
    return { ok: false, error: matchesApiError(r.status, j, r.statusText) };
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
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error(matchesApiError(r.status, j, r.statusText));
  }
  return Array.isArray(j.matches) ? j.matches : [];
}
