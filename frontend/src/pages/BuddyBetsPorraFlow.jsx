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

/** Explicación en castellano claro (sin tecnicismos primero). */
function PlainBox({ eyebrow, title, children }) {
  return (
    <div className="mt-4 rounded-xl border border-amber-400/25 bg-amber-500/[0.07] p-4 sm:p-5">
      <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-200/95">{eyebrow}</p>
      {title ? <p className="mt-1.5 font-display text-base font-semibold text-[var(--text-primary)] sm:text-lg">{title}</p> : null}
      <div className="mt-3 space-y-2.5 text-sm leading-relaxed text-[var(--text-primary)] [&_strong]:text-[var(--text-primary)] [&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-[var(--text-secondary)]">
        {children}
      </div>
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
                Abajo tienes la versión &quot;para humanos&quot; (qué estás haciendo en la vida real) y, debajo, el código que lo hace posible. Si solo te quedas con la caja amarilla de cada bloque, ya entiendes el 80 %.
              </p>

              <PlainBox
                eyebrow="Empieza aquí"
                title="Tres ideas antes de leer una línea de código"
              >
                <ul>
                  <li>
                    <strong className="text-[var(--text-primary)]">La porra vive en un contrato</strong> (un programita en la blockchain). Ese contrato guarda el dinero del bote y las reglas. La web solo habla con él: tú firmas, la red ejecuta.
                  </li>
                  <li>
                    <strong className="text-[var(--text-primary)]">Hay &quot;dos relojes&quot; importantes</strong>: hasta cuándo se puede apostar, y a partir de cuándo (en el reloj de la red) se puede decir &quot;el partido ya habría acabado&quot; para abrir el paso de resolución. No son lo mismo.
                  </li>
                  <li>
                    <strong className="text-[var(--text-primary)]">El oráculo en demo es un mock</strong>: alguien (en local, un script con clave) escribe en la blockchain &quot;el resultado del partido fue 1, X o 2&quot;. La app te guía: primero pides resolución, luego se rellena el mock, luego cierras con &quot;Resolver con oráculo&quot;.
                  </li>
                </ul>
              </PlainBox>

              <section
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
                aria-labelledby="phase-betting"
              >
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Fase 0 · Apuestas</p>
                <h3 id="phase-betting" className="mt-2 font-display text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                  Botones 1 / X / 2 · <code className="font-mono text-base text-emerald-200/95">placeBet</code>
                </h3>
                <PlainBox eyebrow="Versión fácil" title="Apostar es meter dinero en la hucha común y elegir resultado">
                  <p className="m-0 text-[var(--text-secondary)]">
                    Imagina una hucha transparente: cada persona autorizada mete la misma cantidad fija (eso es el <strong>stake</strong>). Tu botón 1, X o 2 solo dice &quot;yo creo que pasará esto&quot;. Si no estás en la lista del organizador (whitelist), la puerta ni se abre: el contrato ni te deja.
                  </p>
                  <ul>
                    <li>
                      <strong className="text-[var(--text-primary)]">Antes de qué</strong> — Tienes que apostar antes de la hora límite de apuestas. Pasada esa hora, aunque el partido no haya empezado en el mundo real, en la app ya no hay &quot;meter más dinero&quot;.
                    </li>
                    <li>
                      <strong className="text-[var(--text-primary)]">Mientras tanto abajo</strong> — Puedes ver el bloque &quot;Iniciar resolución&quot; en gris. No es un fallo: el reloj de la blockchain aún no ha llegado a la hora de &quot;fin de partido&quot; que se guardó al crear la porra. Hasta entonces, no pinta nada forzar el resultado.
                    </li>
                    <li>
                      <strong className="text-[var(--text-primary)]">Saldo</strong> — Si no tienes ETH suficiente en la red, el botón de apuesta se desactiva: no es la app caprichosa, es que la transacción no podría pagarse.
                    </li>
                  </ul>
                </PlainBox>
                <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Versión técnica corta: solo direcciones en el <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 font-mono text-[0.82em]">WhitelistManager</code>, antes del <strong className="text-[var(--text-primary)]">bettingDeadline</strong>. El contrato suma cada stake al bote. La UI usa una estimación del tiempo de cadena para saber si ya pasó el deadline y si ya llegó{' '}
                  <code className="rounded border border-white/10 bg-black/35 px-1 py-0.5 font-mono text-[0.82em]">matchEndTime</code> (para habilitar &quot;Iniciar resolución&quot;).
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
                <PlainBox eyebrow="Versión fácil" title="Dices: “ya se puede saber el resultado; pídeselo al árbitro (oráculo)”">
                  <p className="m-0 text-[var(--text-secondary)]">
                    Este botón no pone aún el 1-X-2 en la porra. Lo que hace es <strong>cerrar la fase de apuestas en el sentido de resolución</strong>: el partido, según el reloj de la red, ya &quot;habría terminado&quot;, y además hace falta mínimo gente (en el MVP, al menos dos apuestas) para que tenga gracia resolver. Luego el contrato llama al oráculo: básicamente, &quot;oye, para este partido, necesito el resultado&quot;.
                  </p>
                  <p className="m-0 text-[var(--text-secondary)]">
                    En la demo, el oráculo no lee el cielo: un servidor tuyo, tras la transacción, hace de mensajero y <strong>escribe</strong> en el contrato mock qué salió. Por eso verás un paso de &quot;fulfill&quot; y, si falla, mensajes de API o de clave.
                  </p>
                </PlainBox>
                <PlainBox eyebrow="Línea a línea (simplificado)" title="Qué mira el contrato antes de dejarte">
                  <ul>
                    <li>
                      <code className="rounded border border-white/10 bg-black/40 px-1 font-mono text-[0.8em]">gameState == Betting</code> — Aún estamos en &quot;se apuesta&quot;, no en &quot;estamos resolviendo&quot;. Si no, alguien podría liar la fase.
                    </li>
                    <li>
                      <code className="rounded border border-white/10 bg-black/40 px-1 font-mono text-[0.8em]">block.timestamp &gt;= matchEndTime</code> — En la blockchain &quot;ya es tarde&quot; respecto a la hora de fin que se fijó al crear la porra. Es el reloj de la red, no el de tu móvil.
                    </li>
                    <li>
                      <code className="rounded border border-white/10 bg-black/40 px-1 font-mono text-[0.8em]">mínimo 2 jugadores</code> — No tendría sentido un &quot;ganador único de bote compartido&quot; con una sola apuesta en las reglas actuales.
                    </li>
                  </ul>
                  <p className="m-0 text-[var(--text-secondary)]">
                    Si todo pasa, el estado pasa a <strong>Resolving</strong> y se emite <code className="rounded border border-white/10 bg-black/40 px-1 font-mono text-[0.8em]">requestMatchResult</code> con el id del partido. Eso es la &quot;petición al oráculo&quot; en serio.
                  </p>
                </PlainBox>
                <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  En el móvil, <code className="rounded border border-white/10 bg-black/35 px-1 font-mono text-[0.82em]">handleStartResolution</code> solo envía la transacción. El <code className="rounded border border-white/10 bg-black/35 px-1 font-mono text-[0.82em]">gas</code> es límite de computación que pagas; si te suena raro, piensa en comisión de procesamiento.
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
                <PlainBox eyebrow="Qué pasa cuando la transacción entra" title="El POST a /api/oracle/fulfill (sin miedo)">
                  <p className="m-0 text-[var(--text-secondary)]">
                    Cuando la red confirma que <code className="rounded border border-white/10 bg-black/40 px-1 font-mono text-[0.8em]">startResolution</code> quedó grabada, el navegador hace un pequeño aviso al <strong>backend</strong> con el identificador del partido. Ese backend usa una <strong>clave privada</strong> (como un PIN gordo) para firmar otra transacción: escribir en el <strong>MockOracle</strong> &quot;el resultado fue éste&quot;. Sin ese paso, el oráculo on-chain seguiría vacío y el siguiente botón no tendría nada que leer.
                  </p>
                </PlainBox>
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
                  Si falla: revisa que el servidor esté levantado, la ruta de la API y <code className="rounded border border-white/10 bg-black/35 px-1 font-mono text-[0.82em]">ORACLE_PRIVATE_KEY</code>. Si sale bien, la app te dirá que sigas con «Resolver con oráculo».
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
                <PlainBox eyebrow="Versión fácil" title="Ahora el contrato mira qué escribió el oráculo y fija el resultado oficial">
                  <p className="m-0 text-[var(--text-secondary)]">
                    Tú ya pediste el dato; el mock ya lo dejó escrito en la chain. Este botón es el <strong>“cerrar el acta”</strong>: el juego pasa de &quot;estamos resolviendo&quot; a &quot;ya sabemos el 1/X/2 y podemos repartir&quot;. Los números 0, 1 y 2 son solo código para victoria local, empate y visitante: en tu cabeza puedes seguir diciendo 1, X, 2.
                  </p>
                  <ul>
                    <li>
                      Si pulsas antes de que el oráculo tenga resultado, la red rechaza la transacción: no hay truco, literalmente no hay nada que leer.
                    </li>
                    <li>
                      El dueño del contrato puede tener un plan B llamado <code className="rounded border border-white/10 bg-black/40 px-1 font-mono text-[0.8em]">setManualResult</code> si el oráculo se queda mudo; en la app normal no lo ves como botón grande, es de emergencia.
                    </li>
                  </ul>
                </PlainBox>
                <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  Técnicamente: el contrato exige fase <strong>Resolving</strong>, lee <code className="rounded border border-white/10 bg-black/35 px-1 font-mono text-[0.82em]">getResult</code> y exige <code className="rounded border border-white/10 bg-black/35 px-1 font-mono text-[0.82em]">resolved</code>. Entonces guarda <code className="rounded border border-white/10 bg-black/35 px-1 font-mono text-[0.82em]">finalResult</code> y salta a <strong>Claiming</strong>.
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
              </section>

              <section
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
                aria-labelledby="phase-claim"
              >
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Fase 3 · Cobro</p>
                <h3 id="phase-claim" className="mt-2 font-display text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                  «Reclamar» · <code className="font-mono text-base text-emerald-200/95">claimReward()</code>
                </h3>
                <PlainBox eyebrow="Versión fácil" title="Cobrar no te lo envía la app: tú pides “dame lo que me toque” al contrato">
                  <p className="m-0 text-[var(--text-secondary)]">
                    Esto se llama <strong>pull</strong>: en vez de que el bote &quot;te busque&quot; a ti, tú abres el cajero (un clic) y el contrato te manda el ETH. Así no explota el gas si hubiera cien ganadores; cada uno cobra cuando quiera.
                  </p>
                  <ul>
                    <li>
                      <strong className="text-[var(--text-primary)]">Si acertaste</strong> — Te toca una porción del bote. Varios acertados se lo reparten a partes iguales (en el contrato: bote ÷ número de acertados).
                    </li>
                    <li>
                      <strong className="text-[var(--text-primary)]">Si nadie acertó</strong> — No hay ganadores; en ese caso el diseño te devuelve lo que apostaste (tu entrada a la hucha), para no quedarte a cero por un resultado raro.
                    </li>
                    <li>
                      <strong className="text-[var(--text-primary)]">El primero en cobrar</strong> — No se lo queda todo; lo que pasa es que, en cuanto alguien reclama con el juego aún en modo &quot;Reclamando&quot;, el contrato deja constancia de que el reparto ya está abierto y pasa a &quot;Terminado&quot; para el estado global. Los demás siguen pudiendo reclamar su parte.
                    </li>
                    <li>
                      <strong className="text-[var(--text-primary)]">No puedes cobrar dos veces</strong> — Internamente te marcan como &quot;ya cobrado&quot; y listo.
                    </li>
                  </ul>
                </PlainBox>
                <PlainBox eyebrow="Cómo calcula el contrato tu parte" title="Función _claimableAmount (en castellano)">
                  <ul>
                    <li>Cuenta cuántas apuestas coinciden con el resultado final. Ese número es <strong>winners</strong>.</li>
                    <li>Si <strong>winners = 0</strong> (nadie acertó), a los que apostaron les devuelve el <strong>stake</strong> a cada uno; a quien no apostó, cero.</li>
                    <li>Si hay ganadores, quien no acertó recibe 0. Quien acertó recibe <strong>bote ÷ winners</strong> (división entera de Solidity: ojo a redondeos mínimos en casos límite).</li>
                  </ul>
                </PlainBox>
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

              <section className="rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">Resumen de una sola frase</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-primary)]">
                  Apuestas (hucha) → cuando el reloj de la red pasa el fin de partido, <strong>Iniciar resolución</strong> (pedir dato al oráculo) → el servidor rellena el mock → <strong>Resolver con oráculo</strong> (fijar 1/X/2 en el contrato) → cada uno hace <strong>Reclamar</strong> y se lleva su parte o su devolución.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
