/** Formatea segundos como "Xd HH:MM:SS" o "HH:MM:SS". */
export function formatCountdown(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (days > 0) {
    return `${days}d ${pad(h)}:${pad(m)}:${pad(sec)}`;
  }
  return `${pad(h)}:${pad(m)}:${pad(sec)}`;
}

/** Convierte Date a valor para input datetime-local (hora local). */
export function toDatetimeLocalValue(d) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
