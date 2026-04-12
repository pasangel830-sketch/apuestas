import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchRegisteredMatches, addRegisteredMatch, removeRegisteredMatch } from './registeredMatches';

/** @type {{ id: string, label: string }[]} */
let store = [];

function mockFetch() {
  vi.stubGlobal(
    'fetch',
    /** @param {string} url @param {RequestInit} [opts] */
    async (url, opts) => {
      const path = String(url);
      const method = opts?.method ?? 'GET';
      if (path.includes('/api/sports/matches') && method === 'GET') {
        return {
          ok: true,
          json: async () => ({ matches: [...store] }),
        };
      }
      if (path.includes('/api/sports/matches') && method === 'POST') {
        const body = JSON.parse(String(opts?.body ?? '{}'));
        const id = typeof body.id === 'string' ? body.id.trim() : '';
        if (!id) {
          return { ok: false, status: 400, json: async () => ({ error: 'bad' }) };
        }
        if (store.some((m) => m.id === id)) {
          return { ok: false, status: 409, json: async () => ({ error: 'dup' }) };
        }
        store.push({ id, label: typeof body.label === 'string' ? body.label.trim() : '' });
        return { ok: true, status: 200, json: async () => ({ ok: true, matches: [...store] }) };
      }
      if (path.includes('/api/sports/matches') && method === 'DELETE') {
        const body = JSON.parse(String(opts?.body ?? '{}'));
        const id = typeof body.id === 'string' ? body.id : '';
        store = store.filter((m) => m.id !== id);
        return { ok: true, json: async () => ({ ok: true, matches: [...store] }) };
      }
      return { ok: false, status: 404, json: async () => ({}) };
    },
  );
}

describe('registeredMatches (API)', () => {
  beforeEach(() => {
    store = [];
    mockFetch();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('lista vacía al inicio', async () => {
    expect(await fetchRegisteredMatches()).toEqual([]);
  });

  it('añade partidos', async () => {
    const r = await addRegisteredMatch('liga-a-vs-b', 'Partido A');
    expect(r.ok).toBe(true);
    expect(r.matches).toEqual([{ id: 'liga-a-vs-b', label: 'Partido A' }]);
    expect(await fetchRegisteredMatches()).toEqual([{ id: 'liga-a-vs-b', label: 'Partido A' }]);
  });

  it('rechaza duplicados e ids vacíos', async () => {
    await addRegisteredMatch('x');
    expect((await addRegisteredMatch('x')).ok).toBe(false);
    expect((await addRegisteredMatch('  ')).ok).toBe(false);
  });

  it('elimina por id', async () => {
    await addRegisteredMatch('a');
    await addRegisteredMatch('b');
    const next = await removeRegisteredMatch('a');
    expect(next.map((m) => m.id)).toEqual(['b']);
  });
});
