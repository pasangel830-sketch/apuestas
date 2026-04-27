import { motion } from 'framer-motion';

function Box({ title, subtitle, tone = 'contracts' }) {
  const s =
    tone === 'oracle'
      ? { border: 'border-emerald-400/20', bg: 'bg-emerald-500/10', text: 'text-emerald-200' }
      : tone === 'frontend'
        ? { border: 'border-sky-400/20', bg: 'bg-sky-500/10', text: 'text-sky-200' }
        : { border: 'border-purple-400/20', bg: 'bg-purple-500/10', text: 'text-purple-200' };
  return (
    <div className={['rounded-2xl border p-4', s.border, s.bg].join(' ')}>
      <p className={['m-0 text-sm font-semibold', s.text].join(' ')}>{title}</p>
      <p className={['mt-1 text-xs', s.text, 'opacity-80'].join(' ')}>{subtitle}</p>
    </div>
  );
}

function Arrow({ label, tone = 'contracts' }) {
  const stroke = tone === 'oracle' ? 'stroke-emerald-300/75' : tone === 'frontend' ? 'stroke-sky-300/75' : 'stroke-purple-300/75';
  return (
    <div className="relative">
      <svg className="h-12 w-full" viewBox="0 0 480 48" fill="none" aria-hidden>
        <path d="M12 24H440" className={stroke} strokeWidth="2" strokeLinecap="round" />
        <path d="M440 24l-10-8m10 8l-10 8" className={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/40 px-2 py-1 text-[11px] font-semibold text-[var(--text-secondary)]">
        {label}
      </span>
    </div>
  );
}

function CodeTag({ children }) {
  return <code className="rounded bg-white/5 px-1.5 py-0.5 text-[0.8125rem] text-[var(--text-primary)]">{children}</code>;
}

export default function ContractsCommunicationSlide() {
  return (
    <div className="grid gap-6">
      <div>
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Cómo se comunican (contratos ↔ módulos)
        </motion.h2>
        <p className="mt-3 max-w-[92ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          La comunicación es por llamadas on-chain + eventos. El frontend descubre porras leyendo el evento de creación y
          luego consulta estado/participantes/apuestas por funciones view.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
            Pipeline on-chain (core)
          </p>
          <div className="mt-4 grid gap-3">
            <Box title="PorraFactory" subtitle="deploy + evento PorraCreated" tone="contracts" />
            <Arrow label="createPorra(): deploy" tone="contracts" />
            <Box title="WhitelistManager" subtitle="whitelist + nicknames" tone="contracts" />
            <Arrow label="createPorra(): deploy" tone="contracts" />
            <Box title="PorraGame" subtitle="apuestas, resolución, payouts" tone="contracts" />
            <Arrow label="startResolution(): requestMatchResult" tone="oracle" />
            <Box title="MockOracle (dev)" subtitle="set/get result por matchId" tone="oracle" />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Discovery</p>
            <div className="mt-3 grid gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              <div>
                El frontend obtiene direcciones por:
                <ul className="mt-2 grid gap-1 pl-5">
                  <li>
                    evento <CodeTag>PorraCreated</CodeTag> (indexado) o
                  </li>
                  <li>
                    lecturas <CodeTag>getPorrasCount()</CodeTag> + <CodeTag>getPorraAt(i)</CodeTag> o
                  </li>
                  <li>
                    filtros <CodeTag>getPorrasByCreator(addr)</CodeTag> / <CodeTag>getPorrasByParticipant(addr)</CodeTag>.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Lecturas típicas de UI
            </p>
            <div className="mt-3 grid gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              <ul className="grid gap-1 pl-5">
                <li>
                  Estado/pot: <CodeTag>PorraGame.getContractState()</CodeTag> (state, pot, deadline, result, resolved).
                </li>
                <li>
                  Jugadores: <CodeTag>PorraGame.getPlayersWhoBet()</CodeTag>.
                </li>
                <li>
                  Apuestas: <CodeTag>PorraGame.getBets()</CodeTag> (paralelo al array de jugadores).
                </li>
                <li>
                  Recompensa estimada: <CodeTag>PorraGame.getClaimableAmount(addr)</CodeTag>.
                </li>
                <li>
                  UX labels: <CodeTag>WhitelistManager.getNicknames()</CodeTag> (mismo orden que participants).
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
              Escrituras típicas de UI
            </p>
            <div className="mt-3 grid gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">
              <ul className="grid gap-1 pl-5">
                <li>
                  Apostar: <CodeTag>PorraGame.placeBet(pred)</CodeTag> con <CodeTag>value = stake</CodeTag>.
                </li>
                <li>
                  Iniciar resolución: <CodeTag>PorraGame.startResolution()</CodeTag> (tras fin de partido).
                </li>
                <li>
                  Finalizar con oráculo: <CodeTag>PorraGame.resolveWithOracle()</CodeTag>.
                </li>
                <li>
                  Reclamar: <CodeTag>PorraGame.claimReward()</CodeTag>.
                </li>
              </ul>
            </div>
          </div>

          <Box
            title="Otros módulos"
            subtitle="Backend/oracle bots: escuchan ResultRequested y publican setResult (en dev: owner)."
            tone="frontend"
          />
        </div>
      </div>
    </div>
  );
}

