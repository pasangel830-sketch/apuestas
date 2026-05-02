import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroArt } from '../buddybettsmvp/slides/BuddyBetsExploreSlide';

const PAGE_TITLE = 'BuddyBets — Flujo PorraDetail';

function CodeBlock({ label, children }) {
  return (
    <div className="mt-3">
      {label ? (
        <p className="m-0 mb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]">{label}</p>
      ) : null}
      <pre className="m-0 max-h-[min(70vh,32rem)] overflow-auto rounded-xl border border-white/10 bg-black/50 p-4 text-left font-mono text-[11px] leading-relaxed text-slate-200 sm:text-xs">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function BuddyBetsPorraFlow() {
  useEffect(() => {
    const prev = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-var(--header-h))] overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_50%_0%,rgba(59,130,246,0.14),transparent_55%),radial-gradient(ellipse_55%_45%_at_0%_40%,rgba(236,72,153,0.10),transparent_55%),radial-gradient(ellipse_45%_35%_at_100%_65%,rgba(34,197,94,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,10,15,0.55),rgba(10,10,15,0.92))]" />
      </div>

      <div className="relative mx-auto w-full max-w-[var(--content-max)] px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <div className="min-h-[520px] rounded-2xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:p-6">
          <motion.div style={{ opacity: 1, filter: 'blur(0px)', transform: 'none' }}>
            <div className="grid gap-6">
              <HeroArt />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                  Ruta interna · documentación
                </p>
                <Link
                  to="/buddybettsmvp"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] no-underline transition hover:border-white/25 hover:bg-white/[0.07]"
                >
                  ← Volver a BuddyBets MVP
                </Link>
              </div>

              <motion.h2
                className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                Pantalla PorraDetail: qué hace cada botón
              </motion.h2>

              <p className="m-0 max-w-[85ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
                Flujo completo del MVP: la vista lee <code className="rounded border border-white/10 bg-black/35 px-1.5 py-0.5 font-mono text-[0.85em]">PorraGame</code>{' '}
                (wagmi) y ofrece acciones según la fase. Aquí va el detalle con los mismos fragmentos que en el código del repo.
              </p>

              <section
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
                aria-labelledby="phase-betting"
              >
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Fase 0 · Apuestas</p>
                <h3 id="phase-betting" className="mt-2 font-display text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                  Botones 1 / X / 2 · <code className="font-mono text-base text-emerald-200/95">placeBet</code>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Solo si tu dirección está en la whitelist del <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 font-mono text-[0.82em]">WhitelistManager</code>, antes del{' '}
                  <strong className="text-[var(--text-primary)]">deadline de apuestas</strong> en cadena. El contrato acumula el <strong className="text-[var(--text-primary)]">stake</strong> en el bote. La UI deshabilita
                  apostar cuando la hora estimada de la cadena supera el deadline (y muestra avisos si el saldo es insuficiente).
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  En paralelo, el bloque «Iniciar resolución» aparece en fase de apuestas, pero el botón solo se habilita cuando{' '}
                  <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 font-mono text-[0.82em]">chainTimeEst &gt;= matchEndTime</code> (fin estimado del partido en la porra).
                </p>
              </section>

              <section
                className="rounded-2xl border border-emerald-500/20 bg-white/[0.03] p-5 sm:p-6 shadow-[0_12px_36px_rgba(16,185,129,0.08)]"
                aria-labelledby="phase-start"
              >
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Fase 1 · Tras el partido (en cadena)</p>
                <h3 id="phase-start" className="mt-2 font-display text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                  «Iniciar resolución» · <code className="font-mono text-base text-emerald-200/95">startResolution()</code>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Transacción que pasa el juego a <strong className="text-[var(--text-primary)]">Resolving</strong> y llama al oráculo con el <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 font-mono text-[0.82em]">matchId</code> de la porra. En demo local, después confirma el fulfill HTTP para escribir el resultado en el MockOracle.
                </p>
                <CodeBlock label="Contrato — src/PorraGame.sol">
                  {`/// @notice Iniciar resolución: solo después de matchEndTime y con al menos 2 apuestas
function startResolution() external nonReentrant whenNotPaused {
    require(gameState == GameState.Betting, "PorraGame: not in betting phase");
    require(block.timestamp >= matchEndTime, "PorraGame: match not ended");
    require(_playersWhoBet.length >= MIN_PLAYERS_TO_RESOLVE, "PorraGame: min 2 players to resolve");

    gameState = GameState.Resolving;
    oracle.requestMatchResult(matchId);
    emit ResolutionRequested(matchId);
}`}
                </CodeBlock>
                <CodeBlock label="App — handler (frontend/src/pages/PorraDetail.jsx)">
                  {`const handleStartResolution = () => {
  if (!gameAddress) return;
  startResWrite({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'startResolution',
    gas: 200_000n,
  });
};`}
                </CodeBlock>
                <CodeBlock label="App — tras confirmar la tx: POST /api/oracle/fulfill (MockOracle)">
                  {`useEffect(() => {
  if (!startResSuccess || !startResHash || matchId == null) return;
  // ...
  const r = await fetch(oracleApiUrl('/api/oracle/fulfill'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ matchIdBytes32: matchId }),
  });
  // ...
}, [startResSuccess, startResHash, matchId]);`}
                </CodeBlock>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Si el fulfill falla, la UI muestra el error y recuerda configurar <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 font-mono text-[0.82em]">ORACLE_PRIVATE_KEY</code> y el servidor. Cuando va bien, indica que pulses «Resolver con oráculo».
                </p>
              </section>

              <section
                className="rounded-2xl border border-emerald-500/20 bg-white/[0.03] p-5 sm:p-6 shadow-[0_12px_36px_rgba(16,185,129,0.08)]"
                aria-labelledby="phase-resolve"
              >
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Fase 2 · Con resultado en oráculo</p>
                <h3 id="phase-resolve" className="mt-2 font-display text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                  «Resolver con oráculo» · <code className="font-mono text-base text-emerald-200/95">resolveWithOracle()</code>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Solo visible cuando el estado leído es <strong className="text-[var(--text-primary)]">Resolving</strong>. El contrato lee{' '}
                  <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 font-mono text-[0.82em]">oracle.getResult(matchId)</code>; si ya hay resultado (0 = 1, 1 = X, 2 = 2), fija <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 font-mono text-[0.82em]">finalResult</code> y pasa a{' '}
                  <strong className="text-[var(--text-primary)]">Claiming</strong>.
                </p>
                <CodeBlock label="Contrato — src/PorraGame.sol">
                  {`function resolveWithOracle() external nonReentrant whenNotPaused {
    require(gameState == GameState.Resolving, "PorraGame: not in resolving phase");
    (uint8 result, bool resolved) = oracle.getResult(matchId);
    require(resolved, "PorraGame: oracle has not responded");

    finalResult = result;
    gameState = GameState.Claiming;
    emit GameResolved(result);
}`}
                </CodeBlock>
                <CodeBlock label="App — handler">
                  {`const handleResolveWithOracle = () => {
  if (!gameAddress) return;
  resolveWrite({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'resolveWithOracle',
    gas: 150_000n,
  });
};`}
                </CodeBlock>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Alternativa de emergencia (no es botón en la UI estándar): el owner puede usar <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 font-mono text-[0.82em]">setManualResult</code> si el oráculo no responde.
                </p>
              </section>

              <section
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
                aria-labelledby="phase-claim"
              >
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Fase 3 · Cobro</p>
                <h3 id="phase-claim" className="mt-2 font-display text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                  «Reclamar» · <code className="font-mono text-base text-emerald-200/95">claimReward()</code>
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Pull-payment: cada ganador llama cuando quiera. Los acertantes reparten el bote a partes iguales. Si <strong className="text-[var(--text-primary)]">nadie acertó</strong>, cada participante puede recuperar su stake. La primera reclamación en fase{' '}
                  <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 font-mono text-[0.82em]">Claiming</code> pasa el estado a <strong className="text-[var(--text-primary)]">Finished</strong>.
                </p>
                <CodeBlock label="Contrato — claimReward y reparto (src/PorraGame.sol)">
                  {`function claimReward() external nonReentrant whenNotPaused {
    require(gameState == GameState.Claiming || gameState == GameState.Finished, "PorraGame: not in claiming phase");
    require(hasPlacedBet[msg.sender], "PorraGame: did not participate");
    require(!hasClaimed[msg.sender], "PorraGame: already claimed");

    hasClaimed[msg.sender] = true;

    uint256 amount = _claimableAmount(msg.sender);
    require(amount > 0, "PorraGame: nothing to claim");

    if (gameState == GameState.Claiming) {
        gameState = GameState.Finished;
    }

    (bool sent, ) = msg.sender.call{ value: amount }("");
    require(sent, "PorraGame: transfer failed");
    emit RewardClaimed(msg.sender, amount);
}

function _claimableAmount(address player) internal view returns (uint256) {
    uint256 winners = 0;
    for (uint256 i = 0; i < _playersWhoBet.length; i++) {
        if (bets[_playersWhoBet[i]] == finalResult) winners++;
    }
    if (winners == 0) {
        return hasPlacedBet[player] ? stake : 0;
    }
    uint8 prediction = bets[player];
    if (prediction != finalResult) return 0;
    return totalPot / winners;
}`}
                </CodeBlock>
                <CodeBlock label="App — handler">
                  {`const handleClaim = () => {
  if (!gameAddress) return;
  claimWrite({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'claimReward',
    gas: 100_000n,
  });
};`}
                </CodeBlock>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Resumen del pipeline</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
                  Apuestas → (tras <code className="rounded border border-white/10 bg-black/30 px-1 font-mono text-[0.85em]">matchEndTime</code>) <strong>Iniciar resolución</strong> → fulfill MockOracle →{' '}
                  <strong>Resolver con oráculo</strong> → <strong>Reclamar</strong>.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
