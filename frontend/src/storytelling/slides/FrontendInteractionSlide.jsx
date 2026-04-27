import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Tooltip from '../ui/Tooltip';

function TabButton({ active, tone, label, onClick }) {
  const c =
    tone === 'contracts'
      ? 'border-purple-400/25 bg-purple-500/10 text-purple-200'
      : tone === 'oracle'
        ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
        : 'border-sky-400/25 bg-sky-500/10 text-sky-200';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full border px-3 py-2 text-xs font-semibold transition',
        'hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]',
        active ? c : 'border-white/10 bg-white/[0.02] text-[var(--text-secondary)]',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

function Step({ i, title, body, tone }) {
  const ring =
    tone === 'contracts' ? 'border-purple-400/25 bg-purple-500/10 text-purple-200' : 'border-sky-400/25 bg-sky-500/10 text-sky-200';
  return (
    <div className="flex items-start gap-3">
      <span className={['mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border text-sm font-semibold', ring].join(' ')}>
        {i}
      </span>
      <div className="min-w-0">
        <p className="m-0 text-sm font-semibold text-[var(--text-primary)]">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{body}</p>
      </div>
    </div>
  );
}

export default function FrontendInteractionSlide() {
  const [mode, setMode] = useState('write');

  const content = useMemo(
    () => ({
      write: {
        title: 'Write (transacciones)',
        subtitle: 'Cambian el estado on-chain. UX: confirmación, pending, y error handling.',
        steps: [
          {
            i: 1,
            tone: 'frontend',
            title: 'Usuario firma en su wallet',
            body: 'La UI prepara parámetros (matchId bytes32, stake, predicción) y abre MetaMask.',
          },
          {
            i: 2,
            tone: 'contracts',
            title: 'Se mina la transacción',
            body: 'El contrato valida reglas (whitelist, tiempo, stake) y emite eventos.',
          },
          {
            i: 3,
            tone: 'frontend',
            title: 'La UI actualiza el estado',
            body: 'Se refrescan lecturas (cache) y se muestra feedback: éxito, recibo y nuevo estado.',
          },
        ],
        callouts: [
          { k: 'Microinteracción', v: 'botón: loading + tx hash + retry' },
          { k: 'Seguridad UX', v: 'deshabilitar acciones fuera de ventana temporal' },
        ],
      },
      read: {
        title: 'Read (lecturas)',
        subtitle: 'No cuestan gas. UX: skeletons, cache y consistencia.',
        steps: [
          {
            i: 1,
            tone: 'frontend',
            title: 'Query a la chain',
            body: 'La UI lee estado del juego (fase, bote, deadlines, apuestas) y renderiza.',
          },
          {
            i: 2,
            tone: 'contracts',
            title: 'Derivación de estado',
            body: 'Con datos on-chain se construyen componentes: countdowns, leaderboard, acciones posibles.',
          },
          {
            i: 3,
            tone: 'frontend',
            title: 'Cache + revalidación',
            body: 'Se vuelve a leer en eventos / cambios de bloque para evitar UI obsoleta.',
          },
        ],
        callouts: [
          { k: 'Performance', v: 'agrupar lecturas y memoizar' },
          { k: 'Resiliencia', v: 'fallbacks si no hay label del matchId' },
        ],
      },
      events: {
        title: 'Eventos (escucha)',
        subtitle: 'La UI no “adivina”: reacciona a eventos y a los bloques.',
        steps: [
          {
            i: 1,
            tone: 'contracts',
            title: 'El contrato emite un evento',
            body: 'Ej: PorraCreated, BetPlaced, ResolutionStarted, Resolved.',
          },
          {
            i: 2,
            tone: 'frontend',
            title: 'El frontend lo detecta',
            body: 'Decodifica logs o reconsulta estado tras confirmación para mantener UI consistente.',
          },
          {
            i: 3,
            tone: 'frontend',
            title: 'Feedback inmediato',
            body: 'Toasts/alerts, highlight del nuevo estado y next-steps sugeridos.',
          },
        ],
        callouts: [
          { k: 'Consistencia', v: 'evento → invalidar queries' },
          { k: 'UX', v: 'animar transición de estado' },
        ],
      },
    }),
    [],
  );

  const active = content[mode];

  return (
    <div className="grid gap-6">
      <div>
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Interacción con el frontend
        </motion.h2>
        <p className="mt-3 max-w-[90ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          La dApp alterna tres modos: leer estado, firmar transacciones y reaccionar a eventos. Cambia de pestaña para
          ver el flujo de UX en cada caso.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <TabButton active={mode === 'write'} tone="frontend" label="Write (tx)" onClick={() => setMode('write')} />
        <TabButton active={mode === 'read'} tone="contracts" label="Read (calls)" onClick={() => setMode('read')} />
        <TabButton active={mode === 'events'} tone="frontend" label="Eventos" onClick={() => setMode('events')} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr,0.85fr] lg:items-start">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                {active.title}
              </p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{active.subtitle}</p>

              <div className="mt-4 space-y-4">
                {active.steps.map((s) => (
                  <Step key={s.i} i={s.i} title={s.title} body={s.body} tone={s.tone} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Claves UX</p>
          <div className="mt-4 grid gap-3">
            {active.callouts.map((c) => (
              <div key={c.k} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="m-0 text-sm font-semibold text-[var(--text-primary)]">{c.k}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{c.v}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="m-0 text-sm font-semibold text-[var(--text-primary)]">Tooltips técnicos</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              <Tooltip label="Transacción que cambia estado y requiere firma + gas.">
                <span className="cursor-help text-sky-200">tx</span>
              </Tooltip>
              <span className="text-[var(--text-secondary)]"> · </span>
              <Tooltip label="Lectura sin gas: devuelve datos del contrato sin modificar estado.">
                <span className="cursor-help text-purple-200">call</span>
              </Tooltip>
              <span className="text-[var(--text-secondary)]"> · </span>
              <Tooltip label="Logs emitidos por el contrato: disparan updates en UI o revalidación.">
                <span className="cursor-help text-emerald-200">event</span>
              </Tooltip>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

