import { motion } from 'framer-motion';
import AccentPill from '../ui/AccentPill';
import Tooltip from '../ui/Tooltip';

function Tag({ tone, label, hint }) {
  return (
    <Tooltip label={hint}>
      <AccentPill tone={tone}>
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-current/80" aria-hidden />
        <span>{label}</span>
      </AccentPill>
    </Tooltip>
  );
}

export default function IntroSlide() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
      <div className="min-w-0">
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Una porra Web3 que se entiende tocando el sistema.
        </motion.h2>

        <p className="mt-4 max-w-[70ch] text-pretty text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          La app conecta un frontend React con smart contracts que gestionan apuestas y pagos. Cuando el evento real ocurre,
          un oráculo introduce el resultado on-chain para resolver el juego.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Tag tone="frontend" label="Frontend" hint="UI + wallet + llamadas read/write + eventos" />
          <Tag tone="contracts" label="Smart contracts" hint="Reglas, fondos, estados y distribución de premios" />
          <Tag tone="oracle" label="Oráculo" hint="Puente off-chain → on-chain: aporta el resultado real" />
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Problema
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
              Coordinar predicciones y fondos con reglas inmutables y resolución verificable.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Solución
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
              Contratos on-chain + oráculo para el resultado + UI que guía transacciones y estados.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Cómo navegar
        </p>
        <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10 text-sky-200">
              1
            </span>
            <p className="m-0 leading-relaxed">
              Usa <span className="font-semibold text-[var(--text-primary)]">scroll</span> o{' '}
              <span className="font-semibold text-[var(--text-primary)]">swipe</span> para avanzar/retroceder.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-purple-400/25 bg-purple-500/10 text-purple-200">
              2
            </span>
            <p className="m-0 leading-relaxed">
              Toca elementos: aparecen <span className="font-semibold text-[var(--text-primary)]">tooltips</span> y se
              resaltan flujos.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-200">
              3
            </span>
            <p className="m-0 leading-relaxed">
              Observa cómo cambia el estado: <span className="font-semibold text-[var(--text-primary)]">evento</span> →
              <span className="font-semibold text-[var(--text-primary)]"> oráculo</span> →
              <span className="font-semibold text-[var(--text-primary)]"> resolución</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

