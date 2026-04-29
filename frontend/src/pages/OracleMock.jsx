import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { keccak256, toBytes } from 'viem';
import { ORACLE_ADDRESS } from '../contracts/addresses';
import { PREDICTION_LABELS } from '../config';
import {
  fetchRegisteredMatches,
  addRegisteredMatch,
  removeRegisteredMatch,
} from '../utils/registeredMatches';
import { uiOutcomeToChain } from '../utils/oracleOutcome';
import { oracleApiUrl } from '../utils/oracleApi';

const OUTCOME_OPTIONS = [
  { ui: '1', title: 'Victoria local', hint: 'Gana el equipo que juega en casa.' },
  { ui: 'X', title: 'Empate', hint: 'El partido termina en empate.' },
  { ui: '2', title: 'Victoria visitante', hint: 'Gana el equipo que juega fuera.' },
];

function notifyMatchesChanged() {
  window.dispatchEvent(new CustomEvent('porra-matches-changed'));
}

function OracleMock() {
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [matchesError, setMatchesError] = useState(null);
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [addError, setAddError] = useState(null);
  const [removeError, setRemoveError] = useState(null);

  const [matchInputMode, setMatchInputMode] = useState('custom');
  const [selectedSavedId, setSelectedSavedId] = useState('');
  const [customMatchId, setCustomMatchId] = useState('');
  const [selectedUiOutcome, setSelectedUiOutcome] = useState('1');

  const [apiRow, setApiRow] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiPublishLoading, setApiPublishLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [apiFetchError, setApiFetchError] = useState(null);
  const [apiSuccess, setApiSuccess] = useState(false);

  const matchIdString = useMemo(() => {
    if (matchInputMode === 'saved' && selectedSavedId) return selectedSavedId;
    if (matchInputMode === 'custom') return customMatchId.trim();
    return '';
  }, [matchInputMode, selectedSavedId, customMatchId]);

  const matchIdBytes32 = useMemo(() => {
    if (!matchIdString) return null;
    try {
      return keccak256(toBytes(matchIdString));
    } catch {
      return null;
    }
  }, [matchIdString]);

  useEffect(() => {
    if (!matchIdBytes32) {
      setApiRow(null);
      setApiFetchError(null);
      return;
    }
    let cancelled = false;
    setApiLoading(true);
    setApiFetchError(null);
    fetch(oracleApiUrl(`/api/sports/results/${matchIdBytes32}`))
      .then(async (r) => {
        if (cancelled) return;
        if (r.status === 404) {
          setApiRow(null);
          return;
        }
        if (!r.ok) {
          setApiRow(null);
          if (r.status === 502 || r.status === 503) {
            setApiFetchError(
              'No hay servidor oracle-api en :8787. Desde la carpeta frontend ejecuta npm run dev (no solo vite).',
            );
            return;
          }
          const raw = await r.text();
          try {
            const j = JSON.parse(raw);
            if (j.error) setApiFetchError(j.error);
          } catch {
            setApiFetchError(r.statusText || 'Error al leer la API deportiva');
          }
          return;
        }
        setApiRow(await r.json());
      })
      .catch(() => {
        if (!cancelled) {
          setApiRow(null);
          if (!import.meta.env.PROD) {
            setApiFetchError(
              'No se pudo contactar la API deportiva. Usa npm run dev en frontend/ para levantar Vite + oracle-api, o revisa el proxy en vite.config.',
            );
          }
        }
      })
      .finally(() => {
        if (!cancelled) setApiLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [matchIdBytes32]);

  const reloadMatches = useCallback(async () => {
    try {
      setMatchesError(null);
      setMatchesLoading(true);
      const list = await fetchRegisteredMatches();
      setMatches(list);
      setSelectedSavedId((prev) => {
        if (prev && list.some((m) => m.id === prev)) return prev;
        return list[0]?.id ?? '';
      });
      setMatchInputMode((prev) => {
        if (list.length > 0) return 'saved';
        return prev === 'saved' ? 'custom' : prev;
      });
    } catch (e) {
      setMatches([]);
      setMatchesError(e instanceof Error ? e.message : String(e));
    } finally {
      setMatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadMatches();
  }, [reloadMatches]);

  const handleAddMatch = async (e) => {
    e.preventDefault();
    setAddError(null);
    setRemoveError(null);
    try {
      const res = await addRegisteredMatch(newId, newLabel);
      if (!res.ok) {
        setAddError(res.error);
        return;
      }
      setMatches(res.matches);
      setNewId('');
      setNewLabel('');
      notifyMatchesChanged();
      if (!selectedSavedId && res.matches.length > 0) {
        setSelectedSavedId(res.matches[0].id);
      }
      setMatchInputMode('saved');
    } catch (err) {
      setAddError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleRemove = async (id) => {
    setRemoveError(null);
    try {
      const next = await removeRegisteredMatch(id);
      setMatches(next);
      notifyMatchesChanged();
      setSelectedSavedId((prev) => (id === prev ? (next[0]?.id ?? '') : prev));
      if (next.length === 0) setMatchInputMode('custom');
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : String(err));
    }
  };

  const handlePublishToApi = async (e) => {
    e.preventDefault();
    if (!matchIdString) return;
    setApiError(null);
    setApiSuccess(false);
    setApiPublishLoading(true);
    try {
      const r = await fetch(oracleApiUrl('/api/sports/results'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchIdString,
          outcome: uiOutcomeToChain(selectedUiOutcome),
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(j.error || r.statusText);
      }
      setApiSuccess(true);
      setApiRow({
        outcome: j.outcome,
        matchIdString,
        updatedAt: new Date().toISOString(),
      });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : String(err));
    } finally {
      setApiPublishLoading(false);
    }
  };

  if (!ORACLE_ADDRESS) {
    return (
      <div className="page">
        <h1>API deportiva (mock)</h1>
        <p>
          Configura <code>VITE_ORACLE_ADDRESS</code> en <code>.env</code> con la dirección del MockOracle desplegado.
        </p>
        <p>
          <Link to="/create">Volver a crear porra</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="page form-page">
      <h1>API deportiva (mock)</h1>
      <p className="lead">
        Aquí publicas el <strong>resultado oficial simulado</strong> del partido (como si fuera la API de una liga).
        Cuando un participante pulse <strong>Iniciar resolución</strong> en la porra, el servidor actúa como{' '}
        <strong>nodo tipo Chainlink</strong>: lee este resultado y llama a <code>setResult</code> en el MockOracle
        (necesita <code>ORACLE_PRIVATE_KEY</code> del owner en <code>frontend/.env</code>).
      </p>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Contrato MockOracle (destino on-chain)</h2>
        <p>
          <strong>Dirección:</strong>{' '}
          <span className="address" style={{ wordBreak: 'break-all' }}>
            {ORACLE_ADDRESS}
          </span>
        </p>
        <p className="hint" style={{ marginTop: 0 }}>
          No hace falta conectar wallet aquí: la escritura en cadena la firma el proceso del servidor al cumplirse el
          flujo de resolución.
        </p>
      </section>

      <section className="card form" style={{ marginBottom: '1.5rem' }}>
        <h2>Partidos guardados (para «Crear porra»)</h2>
        <p className="hint" style={{ marginTop: 0 }}>
          El identificador en texto debe coincidir con el que uses al crear la porra (se hashea con keccak256 en cadena). Se guardan en PostgreSQL (
          <code>registered_matches</code>).
        </p>
        {matchesLoading && <p style={{ marginTop: '0.75rem' }}>Cargando lista…</p>}
        {matchesError && (
          <div className="error-box" role="alert" style={{ marginTop: '0.75rem' }}>
            {matchesError}
          </div>
        )}
        <form onSubmit={handleAddMatch} className="row" style={{ flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
          <label style={{ flex: '1 1 200px' }}>
            Identificador (texto)
            <input
              type="text"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="ej: barcelona-vs-girona-2026"
            />
          </label>
          <label style={{ flex: '1 1 180px' }}>
            Etiqueta (opcional)
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Nombre visible"
            />
          </label>
          <button type="submit" className="btn btn-outline" disabled={matchesLoading}>
            Añadir partido
          </button>
        </form>
        {addError && (
          <div className="error-box" role="alert" style={{ marginTop: '0.75rem' }}>
            {addError}
          </div>
        )}
        {removeError && (
          <div className="error-box" role="alert" style={{ marginTop: '0.75rem' }}>
            {removeError}
          </div>
        )}
        {matches.length === 0 ? (
          <p style={{ marginTop: '1rem' }}>No hay partidos guardados. Añade uno o escribe el identificador manualmente abajo.</p>
        ) : (
          <ul style={{ marginTop: '1rem', paddingLeft: '1.25rem' }}>
            {matches.map((m) => (
              <li key={m.id} style={{ marginBottom: '0.5rem' }}>
                <strong>{m.label || m.id}</strong>
                <span className="hint" style={{ marginLeft: '0.5rem' }}>
                  ({m.id})
                </span>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ marginLeft: '0.75rem', padding: '0.25em 0.6em', fontSize: '0.9rem' }}
                  onClick={() => handleRemove(m.id)}
                >
                  Quitar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card form">
        <h2>Publicar resultado en la API</h2>

        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          Partido
          <select
            value={matchInputMode === 'saved' ? 'saved' : 'custom'}
            onChange={(e) => setMatchInputMode(e.target.value === 'saved' ? 'saved' : 'custom')}
            style={{ marginTop: '0.35rem', width: '100%', maxWidth: 420 }}
          >
            <option value="saved">Elegir de la lista guardada</option>
            <option value="custom">Introducir identificador manualmente</option>
          </select>
        </label>

        {matchInputMode === 'saved' && (
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Partido guardado
            <select
              value={selectedSavedId}
              onChange={(e) => setSelectedSavedId(e.target.value)}
              disabled={matches.length === 0}
              style={{ marginTop: '0.35rem', width: '100%', maxWidth: 420 }}
            >
              {matches.length === 0 ? (
                <option value="">— Añade partidos arriba —</option>
              ) : (
                matches.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label ? `${m.label} (${m.id})` : m.id}
                  </option>
                ))
              )}
            </select>
          </label>
        )}

        {matchInputMode === 'custom' && (
          <label style={{ display: 'block', marginBottom: '0.75rem' }}>
            Identificador (mismo texto que en «Crear porra»)
            <input
              type="text"
              value={customMatchId}
              onChange={(e) => setCustomMatchId(e.target.value)}
              placeholder="ej: atleti-vs-real-2024"
              style={{ marginTop: '0.35rem' }}
            />
          </label>
        )}

        {matchIdBytes32 && (
          <p className="hint" style={{ fontSize: '0.9rem' }}>
            <strong>matchId (bytes32):</strong>{' '}
            <span className="address" style={{ wordBreak: 'break-all' }}>
              {matchIdBytes32}
            </span>
          </p>
        )}

        <fieldset style={{ marginTop: '1rem', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '1rem' }}>
          <legend>Resultado final</legend>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {OUTCOME_OPTIONS.map((o) => (
              <label
                key={o.ui}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="ui-outcome"
                  checked={selectedUiOutcome === o.ui}
                  onChange={() => setSelectedUiOutcome(o.ui)}
                />
                <span>
                  <strong>
                    {o.ui} — {o.title}
                  </strong>
                  <br />
                  <span className="hint" style={{ fontSize: '0.9rem' }}>
                    {o.hint} → en cadena: <code>{String(uiOutcomeToChain(o.ui))}</code> ({PREDICTION_LABELS[uiOutcomeToChain(o.ui)]})
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <p style={{ marginTop: '1rem' }}>
          <strong>Estado en la API deportiva:</strong>{' '}
          {apiLoading ? (
            'Cargando…'
          ) : apiRow ? (
            <>
              {PREDICTION_LABELS[apiRow.outcome] ?? apiRow.outcome} (uint8: {String(apiRow.outcome)})
              {apiRow.updatedAt && (
                <span className="hint" style={{ marginLeft: '0.5rem' }}>
                  · actualizado {apiRow.updatedAt}
                </span>
              )}
            </>
          ) : (
            <span className="hint">Sin publicar aún para este partido</span>
          )}
        </p>
        {apiFetchError && (
          <div className="error-box" role="alert" style={{ marginTop: '0.5rem' }}>
            {apiFetchError}
          </div>
        )}

        <form onSubmit={handlePublishToApi} style={{ marginTop: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              !matchIdBytes32 ||
              apiPublishLoading ||
              (matchInputMode === 'saved' && !selectedSavedId)
            }
          >
            {apiPublishLoading ? 'Publicando…' : 'Publicar resultado en la API'}
          </button>
        </form>

        {apiError && (
          <div className="error-box" role="alert" style={{ marginTop: '0.75rem' }}>
            {apiError}
          </div>
        )}
        {apiSuccess && (
          <div className="success" style={{ marginTop: '0.75rem' }}>
            Resultado guardado en la API. Tras «Iniciar resolución» en la porra, el servidor lo subirá al MockOracle.
          </div>
        )}
      </section>

      <p style={{ marginTop: '1.5rem' }}>
        <Link to="/create">Crear porra</Link>
        {' · '}
        <Link to="/">Inicio</Link>
      </p>
    </div>
  );
}

export default OracleMock;
