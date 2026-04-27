import { motion } from 'framer-motion';

function Pill({ tone, children }) {
  const s =
    tone === 'oracle'
      ? 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200'
      : tone === 'frontend'
        ? 'border-sky-400/25 bg-sky-500/10 text-sky-200'
        : 'border-purple-400/25 bg-purple-500/10 text-purple-200';
  return (
    <span className={['inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold', s].join(' ')}>
      {children}
    </span>
  );
}

export default function SmartcontractsIntroSlide() {
  return (
    <div className="grid gap-6">
      <div>
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Qué hay en `src/`, `src/utils/` y `test/`
        </motion.h2>
        <p className="mt-3 max-w-[92ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          Este módulo explica el comportamiento exacto de los smart contracts de la porra y cómo se conectan con el resto
          del sistema (factory → game → oracle/whitelist), además de detallar qué valida cada test.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Contratos</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill tone="contracts">PorraFactory.sol</Pill>
            <Pill tone="contracts">PorraGame.sol</Pill>
            <Pill tone="contracts">WhitelistManager.sol</Pill>
            <Pill tone="oracle">MockOracle.sol</Pill>
            <Pill tone="contracts">interfaces/IPorraOracle.sol</Pill>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            API on-chain + reglas de negocio (apuestas, estados, resolución y payouts).
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Utils</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill tone="contracts">utils/Ownable.sol</Pill>
            <Pill tone="contracts">utils/Pausable.sol</Pill>
            <Pill tone="contracts">utils/ReentrancyGuard.sol</Pill>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            Primitivas de seguridad/control usadas por los contratos principales.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Tests</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill tone="oracle">test/MockOracle.t.sol</Pill>
            <Pill tone="contracts">test/PorraGame.t.sol</Pill>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            Casos felices + reverts esperados + flujos completos de resolución y claim.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Mapa mental</p>
        <ul className="mt-3 grid gap-2 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
          <li>
            <span className="font-semibold text-[var(--text-primary)]">Factory</span>: despliega whitelist + game y emite
            `PorraCreated`.
          </li>
          <li>
            <span className="font-semibold text-[var(--text-primary)]">Game</span>: recibe apuestas, bloquea stake,
            resuelve y reparte.
          </li>
          <li>
            <span className="font-semibold text-[var(--text-primary)]">Whitelist</span>: quién participa + motes.
          </li>
          <li>
            <span className="font-semibold text-[var(--text-primary)]">Oracle</span>: publica resultado para un `matchId`.
          </li>
        </ul>
      </div>
    </div>
  );
}

