import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import Tooltip from '../ui/Tooltip';

function NodeCard({ tone, title, subtitle, active, onClick }) {
  const toneStyle =
    tone === 'contracts'
      ? {
          ring: 'ring-purple-400/30',
          border: 'border-purple-400/20',
          bg: 'bg-purple-500/10',
          text: 'text-purple-200',
        }
      : tone === 'oracle'
        ? {
            ring: 'ring-emerald-400/30',
            border: 'border-emerald-400/20',
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-200',
          }
        : {
            ring: 'ring-sky-400/30',
            border: 'border-sky-400/20',
            bg: 'bg-sky-500/10',
            text: 'text-sky-200',
          };

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'group relative w-full rounded-2xl border p-4 text-left transition',
        'hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]',
        active ? ['ring-2', toneStyle.ring].join(' ') : '',
        toneStyle.border,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={['m-0 text-xs font-semibold uppercase tracking-[0.14em]', 'text-[var(--text-secondary)]'].join(' ')}>
            {subtitle}
          </p>
          <p className="mt-2 line-clamp-2 text-base font-semibold text-[var(--text-primary)]">{title}</p>
        </div>
        <span className={['inline-flex h-9 w-9 items-center justify-center rounded-xl border', toneStyle.border, toneStyle.bg, toneStyle.text].join(' ')}>
          <span className="h-2 w-2 rounded-full bg-current/80" aria-hidden />
        </span>
      </div>
    </button>
  );
}

function Arrow({ active, tone = 'frontend' }) {
  const c = tone === 'contracts' ? 'stroke-purple-300/75' : tone === 'oracle' ? 'stroke-emerald-300/75' : 'stroke-sky-300/75';
  return (
    <svg className="h-10 w-full" viewBox="0 0 400 50" fill="none" aria-hidden>
      <motion.path
        d="M10 25H365"
        className={c}
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{ opacity: active ? 1 : 0.35 }}
      />
      <motion.path
        d="M365 25l-10-8m10 8l-10 8"
        className={c}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ opacity: active ? 1 : 0.35, x: active ? 6 : 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}

export default function ArchitectureMap() {
  const [focus, setFocus] = useState('frontend');

  const copy = useMemo(
    () => ({
      frontend: {
        title: 'Frontend (React + wagmi)',
        subtitle: 'Interfaz',
        hint:
          'Conecta wallet, ejecuta lecturas/escrituras y refleja eventos/estados on-chain en la UI.',
      },
      contracts: {
        title: 'Smart contracts (Factory + Game + Whitelist)',
        subtitle: 'On-chain',
        hint: 'Reglas, fondos, ventanas temporales, resolución y distribución de premios.',
      },
      oracle: {
        title: 'Oráculo (Mock / Chainlink-like)',
        subtitle: 'Off-chain → On-chain',
        hint:
          'Recoge el resultado real y lo publica al contrato para desbloquear la resolución.',
      },
    }),
    [],
  );

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <Tooltip label={copy.frontend.hint}>
          <NodeCard
            tone="frontend"
            title={copy.frontend.title}
            subtitle={copy.frontend.subtitle}
            active={focus === 'frontend'}
            onClick={() => setFocus('frontend')}
          />
        </Tooltip>
        <Tooltip label={copy.contracts.hint}>
          <NodeCard
            tone="contracts"
            title={copy.contracts.title}
            subtitle={copy.contracts.subtitle}
            active={focus === 'contracts'}
            onClick={() => setFocus('contracts')}
          />
        </Tooltip>
        <Tooltip label={copy.oracle.hint}>
          <NodeCard
            tone="oracle"
            title={copy.oracle.title}
            subtitle={copy.oracle.subtitle}
            active={focus === 'oracle'}
            onClick={() => setFocus('oracle')}
          />
        </Tooltip>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Flujo principal
        </p>

        <div className="mt-4 grid items-center gap-2 md:grid-cols-[1fr,140px,1fr,140px,1fr]">
          <div className="rounded-2xl border border-sky-400/20 bg-sky-500/10 p-4">
            <p className="m-0 text-sm font-semibold text-sky-200">Frontend</p>
            <p className="mt-1 text-xs text-sky-200/80">calls + eventos + estado UI</p>
          </div>
          <Arrow active={focus !== 'oracle'} tone="frontend" />
          <div className="rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4">
            <p className="m-0 text-sm font-semibold text-purple-200">Smart contracts</p>
            <p className="mt-1 text-xs text-purple-200/80">apuestas + reglas + payouts</p>
          </div>
          <Arrow active={focus !== 'frontend'} tone="oracle" />
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
            <p className="m-0 text-sm font-semibold text-emerald-200">Oráculo</p>
            <p className="mt-1 text-xs text-emerald-200/80">resultado real → on-chain</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Señales
            </p>
            <p className="mt-2 text-sm text-[var(--text-primary)]">Eventos on-chain y estados derivados.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Confianza
            </p>
            <p className="mt-2 text-sm text-[var(--text-primary)]">Reglas inmutables + oracle para datos externos.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              UX
            </p>
            <p className="mt-2 text-sm text-[var(--text-primary)]">Feedback de transacción + loading + errores claros.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

