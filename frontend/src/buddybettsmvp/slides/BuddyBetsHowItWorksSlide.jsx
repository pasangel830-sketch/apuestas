import { motion } from 'framer-motion';
import AccentPill from '../../storytelling/ui/AccentPill';

function Step({ n, tone, title, desc }) {
  const toneClass =
    tone === 'contracts'
      ? 'border-purple-400/25 bg-purple-500/10 text-purple-200'
      : tone === 'oracle'
        ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
        : 'border-sky-400/25 bg-sky-500/10 text-sky-200';

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start gap-3">
        <span className={['mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border text-sm font-extrabold', toneClass].join(' ')}>
          {n}
        </span>
        <div className="min-w-0">
          <p className="m-0 font-display text-lg font-semibold tracking-tight text-[var(--text-primary)]">{title}</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function BuddyBetsHowItWorksSlide() {
  return (
    <div className="grid gap-6">
      <motion.h2
        className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        Cómo funciona el MVP
      </motion.h2>

      <div className="flex flex-wrap gap-2">
        <AccentPill tone="frontend">Experiencia</AccentPill>
        <AccentPill tone="contracts">Custodia</AccentPill>
        <AccentPill tone="oracle">Resultado</AccentPill>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Step
          n="1"
          tone="frontend"
          title="Crea + invita"
          desc="Generas la porra y compartes el link con tu grupo. La app guía el proceso y muestra el estado en tiempo real."
        />
        <Step
          n="2"
          tone="contracts"
          title="Apuestas + bote"
          desc="Las predicciones y los fondos quedan registrados. Las reglas viven en el contrato: sin interpretaciones."
        />
        <Step
          n="3"
          tone="oracle"
          title="Resultado + pago"
          desc="Cuando llega el resultado, se resuelve y el contrato reparte automáticamente a los ganadores."
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Lo importante</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
          El MVP está diseñado para que la primera impresión sea instantánea: entiendes el flujo en 1 minuto y ves credibilidad
          en 2.
        </p>
      </div>
    </div>
  );
}

