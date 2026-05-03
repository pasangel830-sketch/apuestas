import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroArt } from '../buddybettsmvp/slides/BuddyBetsExploreSlide';

const PAGE_TITLE = 'BuddyBets — Guía PorraGame';

function PageBreak({ n, total }) {
  return (
    <p className="my-6 border-t border-white/10 pt-4 text-center text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]">
      -- {n} of {total} --
    </p>
  );
}

function GuideTable({ headers, rows, compact }) {
  return (
    <div className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-black/25">
      <table className={`w-full border-collapse text-left ${compact ? 'text-[11px] sm:text-xs' : 'text-xs sm:text-sm'}`}>
        <thead>
          <tr className="border-b border-white/15 bg-white/[0.06]">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5 font-semibold text-[var(--text-primary)] sm:px-4">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-b border-white/[0.07] last:border-0">
              {cells.map((c, j) => (
                <td key={j} className="px-3 py-2.5 align-top text-[var(--text-secondary)] sm:px-4">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GuideSection({ eyebrow, title, id, children, variant }) {
  const border =
    variant === 'emerald'
      ? 'border-emerald-500/20 shadow-[0_12px_36px_rgba(16,185,129,0.08)]'
      : 'border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.2)]';
  return (
    <section
      className={`rounded-2xl border bg-white/[0.03] p-5 sm:p-6 ${border}`}
      aria-labelledby={id}
    >
      {eyebrow ? (
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{eyebrow}</p>
      ) : null}
      {title ? (
        <h2 id={id} className="mt-2 font-display text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
          {title}
        </h2>
      ) : null}
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--text-secondary)] [&_strong]:text-[var(--text-primary)]">
        {children}
      </div>
    </section>
  );
}

function PullQuote({ children }) {
  return (
    <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.07] p-4 text-sm leading-relaxed text-[var(--text-primary)] sm:p-5">
      {children}
    </div>
  );
}

export default function PorraGameGuia() {
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
                  documentación
                </p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/buddybettsmvp/flujo-porra"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] no-underline transition hover:border-white/25 hover:bg-white/[0.07]"
                  >
                    Flujo PorraDetail
                  </Link>
                  <Link
                    to="/buddybettsmvp"
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] no-underline transition hover:border-white/25 hover:bg-white/[0.07]"
                  >
                    ← BuddyBets MVP
                  </Link>
                </div>
              </div>

              <header className="text-center sm:text-left">
                <p className="m-0 text-4xl">⛓</p>
                <motion.h1
                  className="mt-2 font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  BuddyBets
                </motion.h1>
                <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">Guia completa</p>
                <p className="mt-2 max-w-[85ch] text-sm text-[var(--text-secondary)] sm:text-base">
                  Aprende como funciona un smart contract de apuestas en Ethereum
                </p>
              </header>

              <GuideSection id="sec-1" title="1 Cómo funciona la BuddyBets en dos palabras?">
                <p className="m-0 text-2xl">🤔</p>
                <p className="m-0">
                  La idea en una frase: Varios amigos apuestan ETH sobre el resultado de un partido del Atletico. El ganador
                  se lleva el bote. Todo automatico, sin intermediarios, sin trampa.
                </p>
                <p className="m-0">
                  Imaginate que quedáis con tus colegas antes del partido y cada uno tira un billete al centro de la mesa.
                  Quien acierte el resultado, se lleva todo. Pues exactamente eso, pero:
                </p>
                <ul className="m-0 list-disc space-y-1 pl-5">
                  <li>La &apos;mesa&apos; es la blockchain (publica, inmutable, nadie la controla)</li>
                  <li>Los &apos;billetes&apos; son ETH (criptomoneda de Ethereum)</li>
                  <li>El &apos;arbitro&apos; es un oráculo (robot que consulta el resultado real)</li>
                  <li>El reparto lo hace el codigo automáticamente... nadie puede hacer trampa</li>
                </ul>
                <p className="m-0 font-semibold text-[var(--text-primary)]">🎯Ejemplo:</p>
                <ul className="m-0 list-none space-y-2 pl-0">
                  <li>
                    <span className="text-[var(--text-primary)]">0⃣</span> Atletico GANA El Cholo hace magia y los colchoneros se llevan los 3 puntos
                  </li>
                  <li>
                    <span className="text-[var(--text-primary)]">1⃣</span> EMPATE Nadie da el brazo a torcer. Se reparten el punto.
                  </li>
                  <li>
                    <span className="text-[var(--text-primary)]">2⃣</span> Atletico PIERDE Dia negro en el Metropolitano... no hay mal que por bien no venga.
                  </li>
                </ul>
                <p className="m-0 font-semibold text-[var(--text-primary)]">📊 Vision global del sistema:</p>
                <pre className="m-0 overflow-x-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/40 p-4 font-sans text-xs leading-relaxed text-[var(--text-primary)] sm:text-sm">
{`👤 TU Apuestas ETH ➡📦 CONTRATO Guarda el bote 	⬅ 🤖 ORACULO Da el resultado 	➡ 🏆 COBRA Si acertaste`}
                </pre>
              </GuideSection>

              <PageBreak n={1} total={11} />

              <GuideSection id="sec-2" title="2 Los actores del juego 👥" variant="emerald">
                <h3 className="m-0 font-display text-base font-semibold text-[var(--text-primary)] sm:text-lg">2.1 Quien hace que?</h3>
                <GuideTable
                  headers={['ACTOR', 'ROL', 'PUEDE HACER']}
                  rows={[
                    ['👑 OWNER', 'El que despliega el contrato', 'Crear el contrato'],
                    [
                      '🙋 JUGADORES',
                      <span className="whitespace-pre-line">{`Los que estan en la
whitelist`}</span>,
                      'Apostar ETH una única vez, reclamar su premio si ganaron',
                    ],
                    [
                      <span className="whitespace-pre-line">{`📋 WHITELIST
MANAGER`}</span>,
                      'Contrato aparte de permisos',
                      'Confirmar si una dirección tiene permiso para jugar',
                    ],
                    [
                      '🤖 ORACULO',
                      <span className="whitespace-pre-line">{`Robot que sabe el
resultado`}</span>,
                      'Responder a peticiones de resultado con el marcador real',
                    ],
                  ]}
                />
                <PullQuote>
                  <p className="m-0">
                    💡 Dato clave: El owner NO puede robar la pasta. Solo el codigo decide a quien se paga. El owner puede
                    pausar el juego o meter el resultado, pero el contrato calcula y transfiere el dinero automaticamente.
                  </p>
                </PullQuote>
              </GuideSection>

              <PageBreak n={2} total={11} />

              <GuideSection id="sec-3" title="3 Las 4 fases del juego 🔄">
                <p className="m-0">
                  El contrato vive en exactamente 4 estados. Solo puede avanzar, nunca volver atrás. Es como un partido de
                  futbol: fase de calentamiento, el partido, los penaltis, y el final.
                </p>
                <ul className="m-0 list-none space-y-3 pl-0">
                  <li>
                    <strong className="text-emerald-300">🟢 BETTING</strong>
                    <br />
                    Las apuestas están abiertas. Los jugadores envían su ETH y eligen su prediccion (0, 1 o 2). Dura hasta
                    que pasa el bettingDeadline.
                  </li>
                  <li>
                    <strong className="text-amber-200">🟡 RESOLVING</strong>
                    <br />
                    Las apuestas han cerrado. Se ha pedido el resultado al oráculo. Estamos esperando que el robot responda
                    con el marcador real.
                  </li>
                  <li>
                    <strong className="text-sky-300">🔵 CLAIMING</strong> El resultado ya se conoce. Cada ganador puede
                    llamar a claimReward() para retirar su parte del bote.
                  </li>
                  <li>
                    <strong className="text-slate-400">⚫ FINISHED</strong> Al menos un jugador ha reclamado su premio. El
                    juego ha concluido oficialmente.
                  </li>
                </ul>
                <PullQuote>
                  <p className="m-0">
                    ⚠ Regla de oro: El estado sólo puede ir hacia adelante. Nunca hacia atrás. BETTING → RESOLVING →
                    CLAIMING → FINISHED. Si estás en FINISHED, no hay vuelta atras.
                  </p>
                </PullQuote>
              </GuideSection>

              <PageBreak n={3} total={11} />

              <GuideSection id="sec-4" title="4 Flujo completo paso a paso 🗺" variant="emerald">
                <p className="m-0 font-semibold text-[var(--text-primary)]">📦 PASO 0 — Creacion del contrato</p>
                <p className="m-0">
                  El owner despliega el contrato en la blockchain pasando estos datos de configuracion:
                </p>
                <GuideTable
                  headers={['Parametro', 'Que es', 'Ejemplo']}
                  rows={[
                    ['_whitelistManager', 'Direccion del contrato de lista blanca', '0xABC123...'],
                    ['_oracle', 'Direccion del contrato oraculo', '0xDEF456...'],
                    ['_matchId', 'ID unico del partido', '"ATM_vs_RMA_24"'],
                    ['_bettingDeadline', 'Hasta cuando se puede apostar (Unix timestamp)', '1710936000'],
                    ['_matchEndTime', 'Cuando acaba el partido', '1710943200'],
                    ['_stake', 'Cuanto ETH paga cada jugador (en wei)', '100000000000000000 (=0.1 ETH)'],
                  ]}
                />

                <p className="m-0 pt-2 font-semibold text-[var(--text-primary)]">🎯 PASO 1 — Los jugadores apuestan (placeBet)</p>
                <p className="m-0">
                  Cada jugador llama a placeBet(0/1/2) enviando ETH. El contrato hace 6 comprobaciones antes de aceptar:
                </p>               
                <GuideTable
                  headers={['', 'Condicion', 'Si falla...']}
                  rows={[
                    ['✅', '1 El juego esta en fase BETTING', "Error: 'not in betting phase'"],
                    ['✅', '2 El bettingDeadline no ha pasado', "Error: 'betting deadline passed'"],
                    ['✅', "3 Ha mandado exactamente 'stake' ETH (ni mas ni menos)", "Error: 'stake amount mismatch'"],
                    ['✅', '4 La predicción es 0, 1 o 2', "Error: 'prediction must be 0, 1 or 2'"],
                    ['✅', '5 El jugador esta en la whitelist', "Error: 'not whitelisted'"],
                  ]}
                  compact
                />
              </GuideSection>

              <PageBreak n={4} total={11} />

              <GuideSection id="sec-4b" title="" eyebrow="4 Flujo (continuación)">               
                <GuideTable
                  headers={['', 'Condicion', 'Si falla...']}
                  rows={[['✅', '6 El jugador NO había apostado antes', "Error: 'already bet'"]]}
                  compact
                />
                <p className="m-0">
                  Si todo OK, el contrato registra la apuesta, anota al jugador y suma su ETH al totalPot.
                </p>
                <p className="m-0 font-semibold text-[var(--text-primary)]">🔔 PASO 2 — Arrancar la resolucion (startResolution)</p>
                <p className="m-0">
                  Cuando el partido ha terminado, cualquiera puede llamar a startResolution() para pedir el resultado al
                  oráculo.
                </p>
                <ul className="m-0 list-disc pl-5">
                  <li>Necesita: Estar en BETTING + matchEndTime pasado + minimo 2 jugadores</li>
                  <li>
                    Que hace: Cambia a RESOLVING y llama a oracle.requestMatchResult(matchId) (como mandar un SMS al
                    oraculo)
                  </li>
                </ul>
                <p className="m-0">
                  🤔 Por que minimo 2 jugadores? Si solo apostara una persona, no habría &apos;porra&apos;. Seria
                  simplemente alguien enviando ETH a un contrato sin competencia. El contrato fuerza que haya al menos un
                  rival.
                </p>
                <p className="m-0 font-semibold text-[var(--text-primary)]">🤖 PASO 3A — Resolver con el oraculo (resolveWithOracle)</p>
                <p className="m-0">Una vez que el oraculo ha respondido, alguien llama a resolveWithOracle():</p>
                <ul className="m-0 list-disc pl-5">
                  <li>
                    El contrato pregunta al oraculo: oracle.getResult(matchId) devuelve (result, resolved)
                  </li>
                  <li>Si resolved == false: el oraculo aun no ha respondido → error</li>
                  <li>Si resolved == true: se guarda el resultado en finalResult y se pasa a CLAIMING</li>
                </ul>
                <p className="m-0 font-semibold text-[var(--text-primary)]">🆘 PASO 3B — Resolucion manual por el owner (setManualResult)</p>
                <p className="m-0">Plan B si el oraculo falla o tarda demasiado. Solo el owner puede usarlo.</p>
                <ul className="m-0 list-disc pl-5">
                  <li>Condición: Solo en fase RESOLVING, resultado entre 0-2, y llamado por el owner</li>
                  <li>Efecto: Igual que el oráculo: guarda finalResult y pasa a CLAIMING</li>
                </ul>
                <p className="m-0">
                  🔐 Importante: Este poder del owner existe para evitar que el contrato se quede bloqueado para siempre si
                  el oraculo falla. Pero NO puede cambiar el resultado una vez que ya se resolvio correctamente.
                </p>
                <p className="m-0 font-semibold text-[var(--text-primary)]">🏆 PASO 4 — Reclamar el premio (claimReward)</p>
                <p className="m-0">
                  Cada ganador llama a claimReward() para retirar su parte. El contrato calcula cuanto le corresponde:
                </p>
              </GuideSection>

              <PageBreak n={5} total={11} />

              <GuideSection id="sec-4c" title="" eyebrow="4 Flujo — reparto">
                <GuideTable
                  headers={['Situacion', 'Cuanto cobras?']}
                  rows={[
                    ['✅ Acertaste el resultado', 'totalPot / numero_de_ganadores'],
                    ['❌ No acertaste', '0 ETH. No puedes reclamar nada.'],
                    ['😱 Nadie acerto (0 ganadores)', 'Todos recuperan su stake original. Empate técnico.'],
                  ]}
                />
                <p className="m-0">
                  🔒 Patron Pull Payment: El contrato NO manda el dinero a todos automáticamente. Cada jugador tiene que
                  PEDIRLO llamando a claimReward(). Esto evita un bug clásico donde si una sola transferencia fallara,
                  bloquearía el pago de TODOS los demas.
                </p>
              </GuideSection>

              <PageBreak n={6} total={11} />

              <GuideSection id="sec-5" title="5 Seguridad: blindajes del contrato 🛡" variant="emerald">
                <p className="m-0">Este contrato tiene varias capas de seguridad. Aqui las mas importantes:</p>
                <p className="m-0 font-semibold text-[var(--text-primary)]">🔁 ReentrancyGuard — El cerrojo anti-hacker</p>
                <p className="m-0">Este es el ataque mas famoso en Ethereum. Asi funciona el hackeo:</p>
                <pre className="m-0 max-h-[min(70vh,32rem)] overflow-auto rounded-xl border border-white/10 bg-black/50 p-4 text-left font-mono text-[11px] leading-relaxed text-slate-200 sm:text-xs">
                  <code>{
					  `Sin proteccion:
					  1. Hacker llama claimReward()
					  2. El Contrato empieza a enviarle ETH...
					  3. Antes de terminar, el hacker vuelve a llamar claimReward()
					  4. El contrato envía ETH otra vez (y otra, y otra...)
					  5. El contrato queda vacio. DAO hack de 2016: 60 millones de $ robados.

					  Con nonReentrant:
					  1. Hacker llama claimReward()
					  2. El cerrojo se activa: 'estoy procesando'
					  3. Hacker intenta llamar claimReward() de nuevo
					  4. El cerrojo rechaza: 'ya hay una llamada activa'
					  5. Error. El hacker no puede entrar.`}
				 </code>
                </pre>
                <p className="m-0 font-semibold text-[var(--text-primary)]">⏸ Pausable — El boton de emergencia</p>
                <ul className="m-0 list-disc pl-5">
                  <li>Si se descubre un bug critico, el owner llama a pause()</li>
                  <li>El modificador whenNotPaused bloquea todas las funciones importantes</li>
                  <li>Nadie puede apostar, resolver ni cobrar hasta que el owner llame a unpause()</li>
                </ul>
                <p className="m-0 font-semibold text-[var(--text-primary)]">📋 Checks-Effects-Interactions — El orden correcto</p>
                <p className="m-0">En claimReward(), el contrato sigue un patron critico de seguridad:</p>
                <pre className="m-0 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-sans text-xs text-[var(--text-primary)] sm:text-sm">
{`1⃣ CHECK Comprueba que
tiene derecho a cobrar
2⃣ EFFECT Marca
hasClaimed = true (YA
ANTES de pagar)
3⃣ INTERACTION Envía el
ETH al jugador`}
                </pre>
                <p className="m-0">
                  Marcar primero evita que, incluso si hubiera reentrada, el hacker ya estaría marcado como &apos;reclamado&apos; y no
                  podría cobrar dos veces.
                </p>
              </GuideSection>

              <PageBreak n={7} total={11} />

              <GuideSection id="sec-6" title="6 Casos especiales 🚨">
                <GuideTable
                  headers={['CASO', 'Que ocurre', 'Como se resuelve']}
                  rows={[
                    ['🤖 El oraculo no responde', 'El juego se queda en RESOLVING indefinidamente', 'El owner usa setManualResult() para desbloquear'],
                    ['😲 Nadie acierta', 'winners = 0 en _claimableAmount', 'Todos recuperan su stake exacto. Nadie pierde.'],
                    [
                      '💸 Doble cobro',
                      'Alguien llama claimReward() dos veces',
                      'hasClaimed[player] == true → rechazado en la segunda llamada',
                    ],
                    [
                      '💰 Stake incorrecto',
                      'Alguien manda mas o menos ETH del requerido',
                      'require(msg.value == stake) → rechazado. ETH devuelto.',
                    ],
                    [
                      '🚫 No esta en la whitelist',
                      'Alguien intenta apostar sin permiso',
                      'isWhitelisted() devuelve false → rechazado',
                    ],
                    [
                      '👤 Solo 1 jugador',
                      'Nadie mas aposto cuando acaba el partido',
                      "startResolution() falla: 'min 2 players'. Juego bloqueado.",
                    ],
                  ]}
                  compact
                />
              </GuideSection>

              <PageBreak n={8} total={11} />

              <GuideSection id="sec-7" title="7 Ejemplo practico completo ⚽" variant="emerald">
                <p className="m-0">🏟 Escenario: Atlético vs Real Madrid. Cada jugador pone 0.1 ETH.</p>
                <p className="m-0 font-semibold text-[var(--text-primary)]">Apuestas realizadas:</p>
                <GuideTable
                  headers={['Jugador', 'Apuesta', 'Prediccion', 'ETH enviado']}
                  rows={[
                    ['👩 Maria', '0', 'Atletico gana', '0.1 ETH'],
                    ['👨 Juan', '0', 'Atletico gana', '0.1 ETH'],
                    ['🧑 Pedro', '1', 'Empate', '0.1 ETH'],
                    ['👩 Ana', '2', 'Atletico pierde', '0.1 ETH'],
                    ['TOTAL BOTE', '-', '-', '0.4 ETH'],
                  ]}
                />
                <p className="m-0">Resultado del partido: Atletico gana (resultado = 0) 🎉</p>
                <GuideTable
                  headers={['Jugador', 'Acierto?', 'Calculo', 'Cobra']}
                  rows={[
                    ['👩 Maria', '✅ Si (aposto 0)', '0.4 ETH / 2 ganadores', '0.2 ETH 🏆'],
                    ['👨 Juan', '✅ Si (aposto 0)', '0.4 ETH / 2 ganadores', '0.2 ETH 🏆'],
                    ['🧑 Pedro', '❌ No (aposto 1)', 'Perdedor, no cobra', '0 ETH 😢'],
                    ['👩 Ana', '❌ No (aposto 2)', 'Perdedora, no cobra', '0 ETH 😢'],
                  ]}
                />
                <p className="m-0">
                  📐 Calculo: totalPot (0.4 ETH) / winners (2) = 0.2 ETH por ganador. Maria y Juan ganan 0.1 ETH neto cada
                  uno (su stake era 0.1, cobran 0.2).
                </p>
                <p className="m-0 font-semibold text-[var(--text-primary)]">Caso alternativo: nadie acierta</p>
                <p className="m-0">
                  Si el resultado hubiera sido 1 (empate) pero Pedro es el único que apostó 1 y... bueno, pongamos que
                  result=1 pero winners=0 por algún motivo. En ese caso:
                </p>
                <ul className="m-0 list-disc pl-5">
                  <li>Maria recupera 0.1 ETH (su stake)</li>
                  <li>Juan recupera 0.1 ETH</li>
                  <li>Pedro recupera 0.1 ETH</li>
                  <li>Ana recupera 0.1 ETH</li>
                </ul>

                <PageBreak n={9} total={11} />

                <ul className="m-0 list-disc pl-5">
                  <li>Nadie pierde dinero. El contrato devuelve exactamente lo que entro.</li>
                </ul>
              </GuideSection>

              <GuideSection id="sec-8" title="8 Variables del contrato 📦">
                <p className="m-0 font-medium text-[var(--text-primary)]">Variables de configuracion (se fijan al crear)</p>
                <GuideTable
                  headers={['Variable', 'Tipo', 'Para que sirve']}
                  rows={[
                    ['stake', 'uint256', 'Cuanto ETH debe pagar cada jugador. No cambia.'],
                    ['matchId', 'bytes32', 'ID del partido para consultar al oráculo.'],
                    ['bettingDeadline', 'uint256', 'Timestamp: hasta cuando se puede apostar.'],
                    ['matchEndTime', 'uint256', 'Timestamp: cuando acaba el partido.'],
                  ]}
                />
                <p className="m-0 font-medium text-[var(--text-primary)]">Variables de estado (cambian durante el juego)</p>
                <GuideTable
                  headers={['Variable', 'Tipo', 'Para que sirve']}
                  rows={[
                    ['gameState', 'GameState', 'Fase actual: Betting / Resolving / Claiming / Finished'],
                    ['totalPot', 'uint256', 'Suma total de todos los ETH apostados.'],
                    ['finalResult', 'uint8', 'Resultado del partido: 0, 1 o 2. Solo valido tras resolver.'],
                    ['bets[address]', 'mapping', 'Tabla: jugador → su apuesta (0, 1 o 2).'],
                    [
                      <span className="whitespace-pre-line font-mono text-[0.85em]">
                        {`hasPlacedBet[addres
s]`}
                      </span>,
                      'mapping',
                      '¿Ha apostado este jugador? true/false.',
                    ],
                    ['hasClaimed[address]', 'mapping', 'Ha reclamado ya su premio? true/false.'],
                  ]}
                  compact
                />
              </GuideSection>

              <PageBreak n={10} total={11} />

              <GuideSection id="sec-9" title="9 Funciones de lectura (gratuitas) 👁">
                <p className="m-0">
                  Estas funciones no cuestan gas porque sólo leen datos. Cualquiera puede llamarlas en cualquier momento.
                </p>
                <GuideTable
                  headers={['Funcion', 'Devuelve']}
                  rows={[
                    [
                      <span className="whitespace-pre-line font-mono text-[0.85em]">
                        {`getClaimableAmount(addre
ss)`}
                      </span>,
                      'Cuanto ETH puede cobrar este jugador ahora mismo.',
                    ],
                    ['getPlayersWhoBet()', 'Lista de todas las direcciones que apostaron.'],
                    ['getBets()', 'Lista de todas las apuestas (mismo orden que getPlayersWhoBet).'],
                    ['getContractState()', 'Estado + bote + deadline + resultado + si está resuelto. Todo de una.'],
                  ]}
                />
                <p className="m-0 font-semibold text-[var(--text-primary)]">🎓 Resumen final</p>
                <p className="m-0">
                  Este contrato implementa una porra deportiva descentralizada con 4 fases (Betting → Resolving → Claiming
                  → Finished), protección anti-reentrada, sistema de emergencia (pause), resolucion manual de fallback y
                  un patron de pago pull para maxima seguridad. Cada linea de codigo tiene un propósito y una razón de ser.
                </p>
                <p className="m-0">
                  La magia esta en que nadie puede hacer trampa: ni el owner, ni los jugadores, ni el oráculo. El codigo ES
                  la regla del juego.
                </p>
              </GuideSection>

              <PageBreak n={11} total={11} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
