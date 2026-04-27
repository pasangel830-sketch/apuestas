import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Tooltip from '../ui/Tooltip';

function StepDot({ active, done, tone }) {
  const base =
    tone === 'oracle'
      ? 'bg-emerald-400'
      : tone === 'frontend'
        ? 'bg-sky-400'
        : 'bg-purple-400';

  return (
    <span
      className={[
        'relative inline-flex h-4 w-4 items-center justify-center rounded-full',
        done || active ? base : 'bg-white/25',
      ].join(' ')}
      aria-hidden
    >
      {active ? <span className="absolute inset-0 rounded-full ring-4 ring-white/10" /> : null}
    </span>
  );
}

export default function PorraTimeline() {
  const [step, setStep] = useState(0);

  const steps = useMemo(
    () => [
      {
        title: 'Usuario crea o entra en una porra',
        tone: 'frontend',
        detail: 'El frontend navega a la dirección del juego o crea una nueva desde la Factory.',
        hint: 'Evento clave: PorraCreated (descubrir dirección on-chain).',
      },
      {
        title: 'Usuario realiza una predicción (tx)',
        tone: 'contracts',
        detail: 'Se firma una transacción al contrato (apuesta) con stake y outcome.',
        hint: 'El contrato valida whitelist y ventana temporal.',
      },
      {
        title: 'Se bloquean fondos / se registra apuesta',
        tone: 'contracts',
        detail: 'El contrato guarda la apuesta y acumula el bote. La UI refleja nuevo estado.',
        hint: 'Microinteracción: pending → confirmado → UI se actualiza.',
      },
      {
        title: 'Evento externo ocurre (partido)',
        tone: 'frontend',
        detail: 'En el mundo real se juega el partido; on-chain todavía no sabe el resultado.',
        hint: 'Aquí nace la necesidad del oráculo.',
      },
      {
        title: 'Oráculo recoge el resultado real',
        tone: 'oracle',
        detail: 'Sistema off-chain (mock o Chainlink-like) obtiene el resultado desde una fuente externa.',
        hint: 'Off-chain no es trustless: el diseño minimiza y audita ese riesgo.',
      },
      {
        title: 'Oráculo envía datos al smart contract',
        tone: 'oracle',
        detail: 'Se publica el resultado on-chain (setResult) asociado a matchId bytes32.',
        hint: 'El frontend puede mostrar txHash y estado del resultado.',
      },
      {
        title: 'Contrato resuelve la porra',
        tone: 'contracts',
        detail: 'PorraGame consulta el oráculo y fija ganadores / reparto.',
        hint: 'Transición de estado: Resolution → Resolved.',
      },
      {
        title: 'Distribución de premios',
        tone: 'contracts',
        detail: 'Los ganadores reclaman con `claimReward()` (pull-based).',
        hint: 'Patrón de seguridad: evita reentrancy y fallos por transfer masiva.',
      },
    ],
    [],
  );

  const current = steps[step];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Timeline</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Toca un paso o avanza con los botones.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-white/[0.04] disabled:opacity-50"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Atrás
          </button>
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-white/[0.04] disabled:opacity-50"
            onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={step === steps.length - 1}
          >
            Siguiente
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr] lg:items-start">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
          <div className="grid gap-3">
            {steps.map((s, idx) => {
              const active = idx === step;
              const done = idx < step;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setStep(idx)}
                  className={[
                    'group flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition',
                    'hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]',
                    active ? 'border-white/15 bg-white/[0.03]' : 'border-white/10 bg-transparent',
                  ].join(' ')}
                >
                  <StepDot active={active} done={done} tone={s.tone} />
                  <div className="min-w-0 flex-1">
                    <p className={['m-0 text-sm font-semibold', active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'].join(' ')}>
                      {idx + 1}. {s.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--text-secondary)]">{s.detail}</p>
                  </div>
                  <span className="mt-0.5 hidden text-xs font-semibold text-white/35 group-hover:text-white/55 sm:inline">
                    Ver
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                Paso {step + 1}
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{current.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{current.detail}</p>

              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Pista técnica
                </p>
                <Tooltip label="Esto resume qué mirar en el código/contrato en ese punto.">
                  <p className="mt-2 cursor-help text-sm leading-relaxed text-[var(--text-primary)]">{current.hint}</p>
                </Tooltip>
              </div>

              <div className="mt-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Capa protagonista
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={[
                      'rounded-full border px-3 py-1.5 text-xs font-semibold',
                      current.tone === 'oracle'
                        ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
                        : current.tone === 'frontend'
                          ? 'border-sky-400/25 bg-sky-500/10 text-sky-200'
                          : 'border-purple-400/25 bg-purple-500/10 text-purple-200',
                    ].join(' ')}
                  >
                    {current.tone === 'oracle' ? 'Oráculo' : current.tone === 'frontend' ? 'Frontend' : 'Smart contracts'}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

