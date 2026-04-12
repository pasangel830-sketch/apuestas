import { describe, it, expect } from 'vitest';
import {
  uiOutcomeToChain,
  chainOutcomeToUi,
  OUTCOME_UI_TO_CHAIN,
} from './oracleOutcome';

describe('oracleOutcome', () => {
  it('mapea 1/X/2 a 0/1/2 del contrato', () => {
    expect(uiOutcomeToChain('1')).toBe(0);
    expect(uiOutcomeToChain('X')).toBe(1);
    expect(uiOutcomeToChain('2')).toBe(2);
  });

  it('revierte si el resultado UI no es válido', () => {
    expect(() => uiOutcomeToChain('0')).toThrow(/no válido/);
  });

  it('OUTCOME_UI_TO_CHAIN tiene las tres claves', () => {
    expect(OUTCOME_UI_TO_CHAIN).toEqual({ 1: 0, X: 1, 2: 2 });
  });

  it('chainOutcomeToUi es la inversa', () => {
    expect(chainOutcomeToUi(0)).toBe('1');
    expect(chainOutcomeToUi(1)).toBe('X');
    expect(chainOutcomeToUi(2)).toBe('2');
  });
});
