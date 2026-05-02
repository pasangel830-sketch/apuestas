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
          title="Arquetipo de la App 🧭"
          desc="Recorre el Arquetipo de la app visualiza los detalles de cada fichero."
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

      <section
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
        aria-labelledby="porra-flow-heading"
      >
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
          Pantalla de la porra
        </p>
        <h3
          id="porra-flow-heading"
          className="mt-2 font-display text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl"
        >
          Qué hace cada botón (por orden)
        </h3>
        <p className="mt-2 max-w-[85ch] text-sm leading-relaxed text-[var(--text-secondary)]">
          Flujo real del MVP: apuestas → resolución con oráculo mock → reparto. Los textos reflejan el contrato{' '}
          <code className="rounded border border-white/10 bg-black/30 px-1.5 py-0.5 text-[0.85em] text-emerald-200/95">
            PorraGame
          </code>{' '}
          y la app.
        </p>

        <ol className="mt-6 grid gap-5 text-sm leading-relaxed sm:gap-6">
          <li className="relative border-l border-emerald-500/25 pl-5 sm:pl-6">
            <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400/80 ring-4 ring-[rgba(16,185,129,0.12)]" />
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Fase 1 · Apuestas
            </p>
            <p className="mt-1.5 font-semibold text-[var(--text-primary)]">Apostar (1 / X / 2)</p>
            <p className="mt-1.5 m-0 text-[var(--text-secondary)]">
              Solo direcciones en whitelist. Hay que apostar antes del <strong className="font-semibold text-[var(--text-primary)]">deadline de apuestas</strong>. El
              bote sube con cada apuesta correcta.
            </p>
          </li>
          <li className="relative border-l border-emerald-500/25 pl-5 sm:pl-6">
            <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400/70 ring-4 ring-[rgba(16,185,129,0.10)]" />
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Fase 2 · Iniciar resolución
            </p>
            <p className="mt-1.5 font-semibold text-[var(--text-primary)]">Botón «Iniciar resolución»</p>
            <p className="mt-1.5 m-0 text-[var(--text-secondary)]">
              Llama a <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 text-[0.82em]">startResolution()</code>. El
              contrato exige seguir en fase de apuestas, que el tiempo de cadena haya llegado al{' '}
              <strong className="font-semibold text-[var(--text-primary)]">fin estimado del partido</strong> (
              <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 text-[0.82em]">matchEndTime</code>) y al
              menos <strong className="font-semibold text-[var(--text-primary)]">dos apostadores</strong>. Entonces pasa a resolución y el contrato{' '}
              <strong className="font-semibold text-[var(--text-primary)]">pide el resultado al oráculo</strong> (
              <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 text-[0.82em]">requestMatchResult</code>).
            </p>
            <p className="mt-2 m-0 text-[var(--text-secondary)]">
              Cuando esa transacción confirma, la app llama al backend{' '}
              <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 text-[0.82em]">/api/oracle/fulfill</code> para que el
              servidor escriba el resultado en el <strong className="font-semibold text-[var(--text-primary)]">MockOracle</strong> (demo local).
            </p>
          </li>
          <li className="relative border-l border-emerald-500/25 pl-5 sm:pl-6">
            <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-400/60 ring-4 ring-[rgba(16,185,129,0.08)]" />
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Fase 3 · Cerrar resultado
            </p>
            <p className="mt-1.5 font-semibold text-[var(--text-primary)]">Botón «Resolver con oráculo»</p>
            <p className="mt-1.5 m-0 text-[var(--text-secondary)]">
              Llama a <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 text-[0.82em]">resolveWithOracle()</code>. El contrato comprueba que el oráculo ya tiene resultado on-chain; fija el{' '}
              <strong className="font-semibold text-[var(--text-primary)]">resultado final</strong> (1, X o 2 como 0/1/2) y pasa a la fase de{' '}
              <strong className="font-semibold text-[var(--text-primary)]">reclamación</strong>.
            </p>
          </li>
          <li className="relative pl-5 sm:pl-6">
            <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-white/35 ring-4 ring-white/10" />
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              Fase 4 · Cobro
            </p>
            <p className="mt-1.5 font-semibold text-[var(--text-primary)]">Botón «Reclamar»</p>
            <p className="mt-1.5 m-0 text-[var(--text-secondary)]">
              Llama a <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 text-[0.82em]">claimReward()</code>: envía ETH a tu wallet. Los que acertaron el resultado se{' '}
              <strong className="font-semibold text-[var(--text-primary)]">reparten el bote a partes iguales</strong>. Si{' '}
              <strong className="font-semibold text-[var(--text-primary)]">nadie acertó</strong>, cada participante puede recuperar su{' '}
              <strong className="font-semibold text-[var(--text-primary)]">stake</strong>. La primera reclamación puede pasar el juego de «reclamando» a{' '}
              <strong className="font-semibold text-[var(--text-primary)]">finalizado</strong>.
            </p>
          </li>
        </ol>
      </section>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Tip de demo</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
          ⏱️ 3 min: Roadmap → Storytelling → Smartcontracts. ⏱️ 30 s: Storytelling.
        </p>
      </div>
    </div>
  );
}

