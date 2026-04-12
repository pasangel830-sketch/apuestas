import { keccak256, toBytes } from 'viem';

/**
 * Encuentra el partido en `matches` cuyo keccak256(id UTF-8) coincide con el matchId del contrato.
 * @param {{ id: string, label: string }[] | undefined} matches
 * @param {import('viem').Hex | undefined} chainMatchId
 * @returns {{ id: string, label: string } | null}
 */
export function lookupRegisteredMatchByChainId(matches, chainMatchId) {
  if (!matches?.length || !chainMatchId || typeof chainMatchId !== 'string') return null;
  const target = chainMatchId.toLowerCase();
  for (const m of matches) {
    try {
      if (keccak256(toBytes(m.id)).toLowerCase() === target) {
        return m;
      }
    } catch {
      // id no representable en UTF-8 para toBytes; ignorar
    }
  }
  return null;
}

/** Texto legible: etiqueta si existe, si no el identificador en claro. */
export function displayMatchLabel(entry) {
  if (!entry) return null;
  const t = entry.label?.trim();
  if (t) return t;
  return entry.id?.trim() || null;
}
