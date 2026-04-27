import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import AccentPill from '../ui/AccentPill';
import Tooltip from '../ui/Tooltip';

function KeyFn({ name, hint }) {
  return (
    <Tooltip label={hint}>
      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-semibold text-[var(--text-primary)]">
        <span className="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-purple-300/80" aria-hidden />
        {name}
      </span>
    </Tooltip>
  );
}

export default function ContractCard({ contract }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Contrato</p>
          <p className="mt-2 line-clamp-2 font-display text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            {contract.name}
          </p>
        </div>
        <AccentPill tone="contracts">{contract.role}</AccentPill>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">{contract.responsibility}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {contract.keyFunctions.map((f) => (
          <KeyFn key={f.name} name={f.name} hint={f.hint} />
        ))}
      </div>

      <div className="mt-5">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-[var(--text-primary)] transition hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="inline-flex h-2 w-2 rounded-full bg-white/35" aria-hidden />
          {open ? 'Ocultar' : 'Ver relaciones'}
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-[var(--text-secondary)]"
              initial={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 8, filter: 'blur(8px)' }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                Conecta con
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {contract.relations.map((r) => (
                  <li key={r} className="leading-relaxed">
                    {r}
                  </li>
                ))}
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

