import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Tooltip from '../ui/Tooltip';

function Card({ title, body }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="m-0 text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{body}</p>
    </div>
  );
}

export default function OracleSlide() {
  const [mode, setMode] = useState('mock');

  const modes = useMemo(
    () => ({
      mock: {
        title: 'MockOracle (desarrollo)',
        body:
          'Ideal para demos y pruebas: una cuenta “oracle signer” publica resultados on-chain y el juego puede resolverse sin infra compleja.',
        steps: [
          { k: '1', v: 'El juego emite request (o se inicia resolución).' },
          { k: '2', v: 'El backend consulta/guarda resultado off-chain (DB).' },
          { k: '3', v: 'El backend firma `setResult(matchId,outcome)`.' },
          { k: '4', v: 'PorraGame llama a `getResult` y resuelve.' },
        ],
      },
      chainlink: {
        title: 'Chainlink-like (producción)',
        body:
          'Para producción, un oráculo descentralizado reduce confianza en un operador único. El contrato consume una respuesta verificable para resolver.',
        steps: [
          { k: '1', v: 'Request on-chain (evento / petición) con jobId/params.' },
          { k: '2', v: 'Nodos off-chain obtienen el resultado (fuentes).' },
          { k: '3', v: 'Consenso + agregación + callback on-chain.' },
          { k: '4', v: 'Contrato valida y fija outcome para resolver.' },
        ],
      },
    }),
    [],
  );

  const active = modes[mode];

  return (
    <div className="grid gap-6">
      <div>
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Oráculo: el puente off-chain → on-chain
        </motion.h2>
        <p className="mt-3 max-w-[90ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          Sin oráculo, la cadena no puede saber quién ganó el partido. El oráculo introduce ese dato de forma controlada
          y observable.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card
          title="Qué es"
          body="Un componente que trae datos externos (resultado real) y los publica on-chain para que el contrato pueda aplicar reglas."
        />
        <Card
          title="Por qué es necesario"
          body="La EVM no puede “consultar internet”. Cualquier dato del mundo real debe entrar mediante una transacción."
        />
        <Card
          title="Riesgo y mitigación"
          body="Off-chain implica confianza. Se mitiga con oráculos descentralizados, auditoría de fuentes y validaciones en contrato."
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Integración</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Cambia de modo para ver el flujo de datos.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className={[
                'rounded-full border px-3 py-2 text-xs font-semibold transition',
                mode === 'mock'
                  ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
                  : 'border-white/10 bg-white/[0.02] text-[var(--text-secondary)] hover:bg-white/[0.05]',
              ].join(' ')}
              onClick={() => setMode('mock')}
            >
              Mock
            </button>
            <button
              type="button"
              className={[
                'rounded-full border px-3 py-2 text-xs font-semibold transition',
                mode === 'chainlink'
                  ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
                  : 'border-white/10 bg-white/[0.02] text-[var(--text-secondary)] hover:bg-white/[0.05]',
              ].join(' ')}
              onClick={() => setMode('chainlink')}
            >
              Chainlink-like
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            className="mt-4 grid gap-4 lg:grid-cols-[1fr,1fr]"
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <p className="m-0 text-sm font-semibold text-emerald-200">{active.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-emerald-100/80">{active.body}</p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Off-chain → On-chain
                </p>
                <div className="mt-3 space-y-2">
                  {active.steps.map((s) => (
                    <div key={s.k} className="flex items-start gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-xs font-semibold text-emerald-200">
                        {s.k}
                      </span>
                      <p className="m-0 text-sm leading-relaxed text-[var(--text-secondary)]">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="m-0 text-sm font-semibold text-[var(--text-primary)]">Conceptos clave</p>
              <div className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
                <p className="m-0">
                  <Tooltip label="Identificador bytes32 del partido: debe ser consistente entre UI, backend y contrato.">
                    <span className="cursor-help font-semibold text-emerald-200">matchId</span>
                  </Tooltip>{' '}
                  es la llave.
                </p>
                <p className="m-0">
                  <Tooltip label="El outcome suele ser 0/1/2 (local) y se mapea desde UI (1/X/2).">
                    <span className="cursor-help font-semibold text-emerald-200">outcome</span>
                  </Tooltip>{' '}
                  es el resultado.
                </p>
                <p className="m-0">
                  <Tooltip label="El oráculo publica un resultado mediante una transacción firmada.">
                    <span className="cursor-help font-semibold text-emerald-200">fulfill</span>
                  </Tooltip>{' '}
                  es el “entregar respuesta”.
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Señal de éxito UX
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  La UI debe mostrar cuándo el resultado ya está on-chain y habilitar la acción de resolver/reclamar sin
                  dudas.
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

