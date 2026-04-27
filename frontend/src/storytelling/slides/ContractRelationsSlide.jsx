import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Tooltip from '../ui/Tooltip';

const NODES = [
  { id: 'factory', label: 'PorraFactory', tone: 'contracts', hint: 'Crea porras y emite PorraCreated' },
  { id: 'whitelist', label: 'WhitelistManager', tone: 'contracts', hint: 'Restringe participantes + motes' },
  { id: 'game', label: 'PorraGame', tone: 'contracts', hint: 'Apuestas, estado, resolución, payouts' },
  { id: 'oracle', label: 'MockOracle', tone: 'oracle', hint: 'Resultado real por matchId (bytes32)' },
];

const EDGES = [
  { from: 'factory', to: 'whitelist', label: 'deploy' },
  { from: 'factory', to: 'game', label: 'deploy' },
  { from: 'game', to: 'whitelist', label: 'read' },
  { from: 'game', to: 'oracle', label: 'request/get' },
];

function toneStyles(tone) {
  if (tone === 'oracle') return { border: 'border-emerald-400/25', bg: 'bg-emerald-500/10', text: 'text-emerald-200' };
  return { border: 'border-purple-400/25', bg: 'bg-purple-500/10', text: 'text-purple-200' };
}

function Node({ node, active, onClick }) {
  const s = toneStyles(node.tone);
  return (
    <Tooltip label={node.hint}>
      <button
        type="button"
        onClick={onClick}
        className={[
          'w-full rounded-2xl border p-4 text-left transition',
          'hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]',
          s.border,
          active ? ['ring-2', node.tone === 'oracle' ? 'ring-emerald-400/30' : 'ring-purple-400/30'].join(' ') : '',
        ].join(' ')}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Nodo</p>
            <p className="mt-2 truncate font-display text-lg font-semibold text-[var(--text-primary)]">{node.label}</p>
          </div>
          <span className={['inline-flex h-9 w-9 items-center justify-center rounded-xl border', s.border, s.bg, s.text].join(' ')}>
            <span className="h-2 w-2 rounded-full bg-current/80" aria-hidden />
          </span>
        </div>
      </button>
    </Tooltip>
  );
}

function EdgeLine({ active, tone = 'contracts', label }) {
  const stroke = tone === 'oracle' ? 'stroke-emerald-300/75' : 'stroke-purple-300/75';
  return (
    <div className="relative">
      <svg className="h-12 w-full" viewBox="0 0 480 48" fill="none" aria-hidden>
        <motion.path
          d="M12 24H440"
          className={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: active ? 1 : 0.22 }}
          transition={{ duration: 0.25 }}
        />
        <motion.path
          d="M440 24l-10-8m10 8l-10 8"
          className={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ opacity: active ? 1 : 0.22, x: active ? 8 : 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
        {label}
      </span>
    </div>
  );
}

export default function ContractRelationsSlide() {
  const [focus, setFocus] = useState('game');

  const edges = useMemo(() => {
    return EDGES.map((e) => {
      const active = e.from === focus || e.to === focus;
      const toNode = NODES.find((n) => n.id === e.to);
      return { ...e, active, tone: toNode?.tone ?? 'contracts' };
    });
  }, [focus]);

  const focusNode = NODES.find((n) => n.id === focus);

  return (
    <div className="grid gap-6">
      <div>
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Relación entre contratos (flujo visual)
        </motion.h2>
        <p className="mt-3 max-w-[90ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          Selecciona un nodo para resaltar llamadas y dependencias. El objetivo es ver quién “crea”, quién “controla el
          estado” y quién “aporta el dato externo”.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,1.2fr] lg:items-start">
        <div className="grid gap-3">
          {NODES.map((n) => (
            <Node key={n.id} node={n} active={focus === n.id} onClick={() => setFocus(n.id)} />
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Pipeline</p>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
              <p className="m-0 text-sm font-semibold text-purple-200">PorraFactory</p>
              <p className="mt-1 text-xs text-purple-200/80">despliega y emite eventos</p>
            </div>

            <EdgeLine active={edges.find((e) => e.from === 'factory' && e.to === 'whitelist')?.active} tone="contracts" label="deploy Whitelist" />
            <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
              <p className="m-0 text-sm font-semibold text-purple-200">WhitelistManager</p>
              <p className="mt-1 text-xs text-purple-200/80">quién puede apostar + motes</p>
            </div>

            <EdgeLine active={edges.find((e) => e.from === 'factory' && e.to === 'game')?.active} tone="contracts" label="deploy Game" />
            <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
              <p className="m-0 text-sm font-semibold text-purple-200">PorraGame</p>
              <p className="mt-1 text-xs text-purple-200/80">apuestas, estados, payouts</p>
            </div>

            <EdgeLine active={edges.find((e) => e.from === 'game' && e.to === 'oracle')?.active} tone="oracle" label="request/get result" />
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
              <p className="m-0 text-sm font-semibold text-emerald-200">MockOracle</p>
              <p className="mt-1 text-xs text-emerald-200/80">resultado real on-chain</p>
            </div>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={focus}
              className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4"
              initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                Foco
              </p>
              <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">{focusNode?.label ?? '—'}</p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {focusNode?.hint ?? '—'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

