/**
 * El contrato usa uint8: 0 = victoria local, 1 = empate, 2 = victoria visitante.
 * En la UI mostramos el estilo porra 1 / X / 2.
 */
export const OUTCOME_UI_TO_CHAIN = Object.freeze({
  1: 0,
  X: 1,
  2: 2,
});

export const OUTCOME_CHAIN_TO_UI = Object.freeze({
  0: '1',
  1: 'X',
  2: '2',
});

/** @param {'1'|'X'|'2'} ui */
export function uiOutcomeToChain(ui) {
  const v = OUTCOME_UI_TO_CHAIN[ui];
  if (v === undefined) {
    throw new Error(`Resultado UI no válido: ${ui}`);
  }
  return v;
}

/** @param {number} chain */
export function chainOutcomeToUi(chain) {
  const u = OUTCOME_CHAIN_TO_UI[chain];
  if (u === undefined) {
    throw new Error(`Resultado en cadena no válido: ${chain}`);
  }
  return u;
}
