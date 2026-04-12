import { oracleApiUrl } from './oracleApi';

/** @typedef {{ id: string, label: string }} RegisteredMatch */

const JSON_HEADERS = { 'Content-Type': 'application/json' };

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
  const r = await fetch(oracleApiUrl('/api/sports/matches'));
  const j = await r.json().catch(() => ({}));
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
  const r = await fetch(oracleApiUrl('/api/sports/matches'), {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({
      id: trimmed,
      label: typeof label === 'string' ? label.trim() : '',
    }),
  });
  const j = await r.json().catch(() => ({}));
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
