import { motion } from 'framer-motion';
import AccentPill from '../../storytelling/ui/AccentPill';

function Metric({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</p>
      <div className="mt-3">
        <AccentPill tone={tone}>{tone === 'oracle' ? 'Confianza' : tone === 'contracts' ? 'Transparencia' : 'Fricción mínima'}</AccentPill>
      </div>
    </div>
  );
}

export default function BuddyBetsPitchSlide() {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr,1.05fr] lg:items-start">
      <div className="min-w-0">
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          La porra que no depende de “confía en mí”.
        </motion.h2>

        <p className="mt-4 max-w-[72ch] text-pretty text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          BuddyBets convierte una dinámica social en un producto: invitación, predicción, bote y reparto. El valor está en la
          experiencia: clara, rápida y con una narrativa que hace que cualquiera entienda qué está pasando.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Por qué se siente “premium”
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--text-secondary)]">
            <li>
              <span className="font-semibold text-[var(--text-primary)]">Bote bloqueado</span>: el dinero está donde deben
              estar las reglas.
            </li>
            <li>
              <span className="font-semibold text-[var(--text-primary)]">Estados claros</span>: apuestas, cierre, resolución,
              cobro.
            </li>
            <li>
              <span className="font-semibold text-[var(--text-primary)]">Final feliz</span>: reparto automático, sin
              discusiones ni “mañana te pago”.
            </li>
          </ul>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Metric label="Motivo" value="Más emoción" tone="frontend" />
        <Metric label="Reglas" value="Inmutables" tone="contracts" />
        <div className="sm:col-span-2">
          <Metric label="Resolución" value="Verificable" tone="oracle" />
        </div>
        <div className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            En 15 segundos
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
            Crea una porra → comparte el link → tus amigos predicen → el resultado entra → el contrato paga.
          </p>
        </div>
      </div>
    </div>
  );
}

