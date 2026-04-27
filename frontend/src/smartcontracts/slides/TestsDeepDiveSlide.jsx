import { motion } from 'framer-motion';

function Card({ title, children, tone = 'contracts' }) {
  const s =
    tone === 'oracle'
      ? 'border-emerald-400/20 bg-emerald-500/5'
      : 'border-purple-400/20 bg-purple-500/5';
  return (
    <section className={['rounded-2xl border p-5', s].join(' ')}>
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{title}</p>
      <div className="mt-3 grid gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">{children}</div>
    </section>
  );
}

function TestName({ children }) {
  return <code className="rounded bg-white/5 px-1.5 py-0.5 text-[0.8125rem] text-[var(--text-primary)]">{children}</code>;
}

function Item({ children }) {
  return (
    <div className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export default function TestsDeepDiveSlide() {
  return (
    <div className="grid gap-6">
      <div>
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Tests (qué evalúan exactamente)
        </motion.h2>
        <p className="mt-3 max-w-[92ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          Los tests están en Foundry (`forge-std/Test.sol`) y cubren invariantes de seguridad (reverts), el flujo completo
          de resolución (oracle/manual) y la lógica de payouts.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="test/MockOracle.t.sol" tone="oracle">
          <Item>
            <TestName>test_SetAndGetResult</TestName>: verifica estado inicial (no resuelto), luego simula owner y valida
            que <TestName>setResult</TestName> persiste y marca resolved.
          </Item>
          <Item>
            <TestName>test_RevertInvalidResult</TestName>: asegura que valores fuera de 0..2 revierten con el mensaje
            exacto.
          </Item>
        </Card>

        <Card title="test/PorraGame.t.sol" tone="contracts">
          <Item>
            <TestName>test_PlaceBet</TestName>: apuesta válida (stake exacto, whitelisted) y valida mapping de bet, pot y
            lista de jugadores.
          </Item>
          <Item>
            <TestName>test_RevertWrongStake</TestName>: stake incorrecto debe revertir.
          </Item>
          <Item>
            <TestName>test_RevertNotWhitelisted</TestName>: dirección fuera de whitelist debe revertir.
          </Item>
          <Item>
            <TestName>test_RevertDoubleBet</TestName>: no permite apostar 2 veces.
          </Item>
        </Card>

        <Card title="Flujo completo (oráculo)" tone="contracts">
          <Item>
            <TestName>test_FullFlow_WinnersClaim</TestName>: 3 jugadores, 2 aciertan. WARP a fin de partido,{' '}
            <TestName>startResolution</TestName> → owner del oracle hace <TestName>setResult</TestName> →{' '}
            <TestName>resolveWithOracle</TestName>. Verifica claimable y que cada ganador recibe <TestName>totalPot/winners</TestName>.
          </Item>
          <Item>
            Verifica también el caso “perdedor reclama”: <TestName>nothing to claim</TestName>.
          </Item>
        </Card>

        <Card title="Edge cases (refund/manual/guards)" tone="contracts">
          <Item>
            <TestName>test_NoWinners_Refund</TestName>: si nadie acierta, cada uno recupera su stake (refund por jugador).
          </Item>
          <Item>
            <TestName>test_ManualResolution</TestName>: owner de game fija resultado sin oráculo y habilita claiming.
          </Item>
          <Item>
            <TestName>test_RevertClaimTwice</TestName>: evita doble claim.
          </Item>
          <Item>
            <TestName>test_RevertStartResolutionBeforeMatchEnd</TestName>: no permite resolver antes del fin del partido.
          </Item>
          <Item>
            <TestName>test_RevertMinPlayersToResolve</TestName>: exige mínimo 2 apuestas para entrar en Resolving.
          </Item>
          <Item>
            <TestName>test_PlaceBet_5Eth_SecondAccount_AtletiGana</TestName>: replica un caso “tipo frontend” con stake alto y
            asegura que el segundo usuario (bob) queda con predicción 0 y pot correcto.
          </Item>
        </Card>
      </div>
    </div>
  );
}

