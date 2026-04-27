import { motion } from 'framer-motion';
import AccentPill from '../../storytelling/ui/AccentPill';

export default function BuddyBetsIntroSlide() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr] lg:items-center">
      <div className="min-w-0">
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          BuddyBets App: predicciones entre amigos, reglas claras y premios automáticos.
        </motion.h2>

        <p className="mt-4 max-w-[70ch] text-pretty text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          Convierte cualquier partido en un reto social. Crea una porra, invita a tu grupo, bloquea el bote on-chain y deja
          que el sistema reparta de forma transparente cuando llegue el resultado.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <AccentPill tone="frontend">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-current/80" aria-hidden />
            <span>UX tipo app</span>
          </AccentPill>
          <AccentPill tone="contracts">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-current/80" aria-hidden />
            <span>Fondos y reglas</span>
          </AccentPill>
          <AccentPill tone="oracle">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-current/80" aria-hidden />
            <span>Resolución verificable</span>
          </AccentPill>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Promesa</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
              Más emoción, cero líos: el bote se gestiona solo y las reglas no se discuten.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Resultado
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
              Cuando el partido termina, se resuelve on-chain y los ganadores cobran.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Qué ver aquí</p>
        <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-sky-400/25 bg-sky-500/10 text-sky-200">
              1
            </span>
            <p className="m-0 leading-relaxed">
              Una <span className="font-semibold text-[var(--text-primary)]">intro</span> clara para entender el MVP.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-purple-400/25 bg-purple-500/10 text-purple-200">
              2
            </span>
            <p className="m-0 leading-relaxed">
              Por qué <span className="font-semibold text-[var(--text-primary)]">engancha</span> y cómo se vende.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-500/10 text-emerald-200">
              3
            </span>
            <p className="m-0 leading-relaxed">
              Accesos directos a{' '}
              <span className="font-semibold text-[var(--text-primary)]">Roadmap</span>,{' '}
              <span className="font-semibold text-[var(--text-primary)]">Storytelling</span> y{' '}
              <span className="font-semibold text-[var(--text-primary)]">Smartcontracts</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

