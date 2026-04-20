/** @param {string} path ej. /api/sports/matches */
export function oracleApiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return p;
}
