/** Base URL del oracle-api (Railway). Vacío = mismo origen (proxy Vite en dev). */
export function oracleApiBase() {
  const raw = import.meta.env.VITE_ORACLE_API_URL;
  if (typeof raw !== 'string' || !raw.trim()) return '';
  return raw.replace(/\/$/, '');
}

/** @param {string} path ej. /api/sports/matches */
export function oracleApiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  const b = oracleApiBase();
  return b ? `${b}${p}` : p;
}
