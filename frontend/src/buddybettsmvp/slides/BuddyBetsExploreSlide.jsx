import { motion } from 'framer-motion';
import AccentPill from '../../storytelling/ui/AccentPill';

function HeroArt() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_80%_at_50%_0%,rgba(56,189,248,0.18),transparent_55%),radial-gradient(ellipse_70%_55%_at_0%_60%,rgba(16,185,129,0.12),transparent_55%),radial-gradient(ellipse_70%_55%_at_100%_70%,rgba(147,51,234,0.12),transparent_55%)]" />
      <div className="relative flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            🚀 BuddyBets App
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
            La porra que se siente como una app moderna y se comporta como un contrato serio. 🔒✨
          </p>
        </div>

        <svg
          className="hidden h-16 w-16 shrink-0 text-sky-200/90 sm:block"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M12 46c7-2 10-6 12-12 3-9 7-14 16-16 6-2 12 0 16 4"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M14 50c10 1 18-2 24-8 6-5 10-10 12-18"
            stroke="currentColor"
            strokeOpacity="0.6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M40 10l12 2-2 12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="22" r="3" fill="currentColor" fillOpacity="0.8" />
          <circle cx="22" cy="38" r="2.5" fill="currentColor" fillOpacity="0.55" />
          <circle cx="46" cy="30" r="2.5" fill="currentColor" fillOpacity="0.55" />
        </svg>
      </div>
    </div>
  );
}

function ExternalCtaCard({ href, tone, eyebrow, title, desc }) {
  const toneRing =
    tone === 'contracts'
      ? 'hover:border-purple-400/35 hover:shadow-[0_18px_46px_rgba(147,51,234,0.14)]'
      : tone === 'oracle'
        ? 'hover:border-emerald-400/35 hover:shadow-[0_18px_46px_rgba(16,185,129,0.12)]'
        : 'hover:border-sky-400/35 hover:shadow-[0_18px_46px_rgba(56,189,248,0.14)]';

  return (
    <a
      href={href}
      className={[
        'group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 no-underline transition',
        'hover:bg-white/[0.05]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]',
        toneRing,
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{eyebrow}</p>
          <p className="mt-2 line-clamp-2 font-display text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            {title}
          </p>
        </div>
        <AccentPill tone={tone}>Abrir</AccentPill>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">{desc}</p>
      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
        <span className="inline-flex h-2 w-2 rounded-full bg-white/30 transition group-hover:bg-white/45" aria-hidden />
        <span className="opacity-85 group-hover:opacity-100">Ver ahora</span>
      </div>
    </a>
  );
}

export default function BuddyBetsExploreSlide() {
  return (
    <div className="grid gap-6">
      <HeroArt />
      <motion.h2
        className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        Explora la presentación 👇
      </motion.h2>

      <p className="m-0 max-w-[80ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
        Abre cualquiera y entiende el valor en segundos: emoción entre amigos 😄, reglas claras 📜 y pagos automáticos 💸.
      </p>

      <div className="grid gap-3 lg:grid-cols-3">
        <ExternalCtaCard
          href="https://buddybets-mu.vercel.app/road_map.html"
          tone="frontend"
          eyebrow="Roadmap"
          title="Qué viene después 🧭"
          desc="La visión y los hitos para llevar BuddyBets de MVP a producto irresistible."
        />
        <ExternalCtaCard
          href="https://buddybets-mu.vercel.app/storytelling"
          tone="oracle"
          eyebrow="Storytelling"
          title="Entiende el flujo ⚡"
          desc="La demo guiada: en 2 minutos ya sabes cómo se crea, se apuesta y se paga."
        />
        <ExternalCtaCard
          href="https://buddybets-mu.vercel.app/smartcontracts"
          tone="contracts"
          eyebrow="Smartcontracts"
          title="Confianza por diseño 🔐"
          desc="Arquitectura on-chain, comunicación y tests para que el bote y las reglas sean incuestionables."
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Tip de demo</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
          ⏱️ 3 min: Roadmap → Storytelling → Smartcontracts. ⏱️ 30 s: Storytelling.
        </p>
      </div>
    </div>
  );
}

