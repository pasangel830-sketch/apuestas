import { motion } from 'framer-motion';

function Section({ title, children, tone = 'contracts' }) {
  const ring =
    tone === 'oracle'
      ? 'border-emerald-400/20 bg-emerald-500/5'
      : tone === 'frontend'
        ? 'border-sky-400/20 bg-sky-500/5'
        : 'border-purple-400/20 bg-purple-500/5';
  return (
    <section className={['rounded-2xl border p-5', ring].join(' ')}>
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{title}</p>
      <div className="mt-3 grid gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">{children}</div>
    </section>
  );
}

function CodeTag({ children }) {
  return <code className="rounded bg-white/5 px-1.5 py-0.5 text-[0.8125rem] text-[var(--text-primary)]">{children}</code>;
}

function Bullet({ children }) {
  return (
    <div className="flex gap-3">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" aria-hidden />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function SubTitle({ children }) {
  return <p className="m-0 mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-secondary)]">{children}</p>;
}

function Steps({ items }) {
  return (
    <ol className="m-0 grid gap-2 pl-5 text-sm leading-relaxed text-[var(--text-secondary)]">
      {items.map((it, i) => (
        <li key={i} className="min-w-0">
          {it}
        </li>
      ))}
    </ol>
  );
}

export default function ContractsDeepDiveSlide() {
  return (
    <div className="grid gap-6">
      <div>
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Contratos (detalle por archivo)
        </motion.h2>
        <p className="mt-3 max-w-[92ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          Aquí se desglosa qué guarda cada contrato (storage), qué valida en cada función y qué eventos expone al exterior.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="src/PorraFactory.sol (deploy + indexación)" tone="contracts">
          <SubTitle>Storage / índices</SubTitle>
          <Bullet>
            Guarda la dirección del oráculo en <CodeTag>oracle</CodeTag> (configurable con <CodeTag>setOracle()</CodeTag>,{' '}
            solo owner).
          </Bullet>
          <Bullet>
            Índices para discovery/listados:
            <div className="mt-2 grid gap-1">
              <div>
                <CodeTag>porras</CodeTag>: array con todas las porras creadas (direcciones de <CodeTag>PorraGame</CodeTag>).
              </div>
              <div>
                <CodeTag>porrasByCreator[creator]</CodeTag>: porras que ha desplegado un creador.
              </div>
              <div>
                <CodeTag>porrasByParticipant[p]</CodeTag>: porras donde una dirección estaba en la whitelist inicial.
              </div>
            </div>
          </Bullet>

          <SubTitle>Flujo paso a paso: createPorra()</SubTitle>
          <Steps
            items={[
              <>
                Recibe <CodeTag>participants</CodeTag> + <CodeTag>nicknames</CodeTag> + <CodeTag>matchId</CodeTag> + tiempos{' '}
                (<CodeTag>bettingDeadline</CodeTag>, <CodeTag>matchEndTime</CodeTag>) + <CodeTag>stakeAmount</CodeTag>.
              </>,
              <>
                Despliega <CodeTag>WhitelistManager</CodeTag> con participants/nicknames (aquí se validan tamaños, duplicados y
                nickname).
              </>,
              <>
                Despliega <CodeTag>PorraGame</CodeTag> pasando la dirección de whitelist, el <CodeTag>oracle</CodeTag> actual y
                parámetros del partido.
              </>,
              <>
                Registra la porra en <CodeTag>porras</CodeTag> y en <CodeTag>porrasByCreator[msg.sender]</CodeTag>.
              </>,
              <>
                Para cada participante, añade la porra a <CodeTag>porrasByParticipant[participants[i]]</CodeTag> (esto permite
                listados por “invitado”, pero es un snapshot inicial: si luego se modifica la whitelist, este índice no se
                actualiza).
              </>,
              <>
                Emite <CodeTag>PorraCreated</CodeTag> para que el frontend (o un indexador) detecte: <CodeTag>game</CodeTag>,{' '}
                <CodeTag>whitelist</CodeTag>, creador, <CodeTag>matchId</CodeTag> y deadline.
              </>,
            ]}
          />
        </Section>

        <Section title="src/PorraGame.sol (reglas + dinero)" tone="contracts">
          <SubTitle>Storage / estados</SubTitle>
          <Bullet>
            Máquina de estados (<CodeTag>gameState</CodeTag>): <CodeTag>Betting</CodeTag> → <CodeTag>Resolving</CodeTag> →{' '}
            <CodeTag>Claiming</CodeTag> → <CodeTag>Finished</CodeTag>.
          </Bullet>
          <Bullet>
            Parámetros fijos del juego: <CodeTag>matchId</CodeTag>, <CodeTag>bettingDeadline</CodeTag>, <CodeTag>matchEndTime</CodeTag>
            , <CodeTag>stake</CodeTag>, referencias a <CodeTag>whitelistManager</CodeTag> y <CodeTag>oracle</CodeTag>.
          </Bullet>
          <Bullet>
            Datos de apuestas: <CodeTag>bets[player]</CodeTag>, <CodeTag>hasPlacedBet[player]</CodeTag>,{' '}
            <CodeTag>_playersWhoBet</CodeTag>, <CodeTag>totalPot</CodeTag>.
          </Bullet>
          <Bullet>
            Datos de payout: <CodeTag>finalResult</CodeTag> (0..2) y <CodeTag>hasClaimed[player]</CodeTag>.
          </Bullet>

          <SubTitle>Flujo paso a paso: placeBet(prediction)</SubTitle>
          <Steps
            items={[
              <>
                Rechaza si no está en <CodeTag>Betting</CodeTag> o si <CodeTag>block.timestamp</CodeTag> superó{' '}
                <CodeTag>bettingDeadline</CodeTag>.
              </>,
              <>
                Requiere que el ETH enviado sea exacto: <CodeTag>msg.value == stake</CodeTag>.
              </>,
              <>
                Valida el dominio de predicción: <CodeTag>prediction &lt;= 2</CodeTag>.
              </>,
              <>
                Consulta whitelist: <CodeTag>whitelistManager.isWhitelisted(msg.sender)</CodeTag>.
              </>,
              <>
                Impide doble apuesta: <CodeTag>!hasPlacedBet[msg.sender]</CodeTag>.
              </>,
              <>
                Efectos: marca <CodeTag>hasPlacedBet</CodeTag>, guarda <CodeTag>bets</CodeTag>, añade a{' '}
                <CodeTag>_playersWhoBet</CodeTag> y suma a <CodeTag>totalPot</CodeTag>.
              </>,
              <>
                Emite <CodeTag>BetPlaced(player,prediction)</CodeTag>.
              </>,
            ]}
          />

          <SubTitle>Flujo paso a paso: startResolution()</SubTitle>
          <Steps
            items={[
              <>
                Requiere estar en <CodeTag>Betting</CodeTag>.
              </>,
              <>
                Requiere que el partido haya terminado: <CodeTag>block.timestamp &gt;= matchEndTime</CodeTag>.
              </>,
              <>
                Requiere mínimo de participantes que apostaron: <CodeTag>_playersWhoBet.length &gt;= 2</CodeTag>.
              </>,
              <>
                Cambia estado a <CodeTag>Resolving</CodeTag>.
              </>,
              <>
                Llama al oráculo: <CodeTag>oracle.requestMatchResult(matchId)</CodeTag> y emite <CodeTag>ResolutionRequested</CodeTag>.
              </>,
            ]}
          />

          <SubTitle>Flujo paso a paso: resolveWithOracle()</SubTitle>
          <Steps
            items={[
              <>
                Requiere estar en <CodeTag>Resolving</CodeTag>.
              </>,
              <>
                Lee <CodeTag>oracle.getResult(matchId)</CodeTag> y exige <CodeTag>resolved == true</CodeTag>.
              </>,
              <>
                Fija <CodeTag>finalResult</CodeTag> y cambia estado a <CodeTag>Claiming</CodeTag>.
              </>,
              <>
                Emite <CodeTag>GameResolved(result)</CodeTag>.
              </>,
            ]}
          />

          <SubTitle>Flujo paso a paso: setManualResult(result)</SubTitle>
          <Steps
            items={[
              <>
                Solo owner del juego (<CodeTag>onlyOwner</CodeTag>) y requiere estar en <CodeTag>Resolving</CodeTag>.
              </>,
              <>
                Valida <CodeTag>result &lt;= 2</CodeTag>.
              </>,
              <>
                Fija <CodeTag>finalResult</CodeTag>, cambia a <CodeTag>Claiming</CodeTag> y emite <CodeTag>ManualResolutionSet</CodeTag>.
              </>,
            ]}
          />

          <SubTitle>Flujo paso a paso: claimReward()</SubTitle>
          <Steps
            items={[
              <>
                Requiere estar en <CodeTag>Claiming</CodeTag> o <CodeTag>Finished</CodeTag>.
              </>,
              <>
                Requiere haber apostado: <CodeTag>hasPlacedBet[msg.sender]</CodeTag> y no haber reclamado antes:{' '}
                <CodeTag>!hasClaimed[msg.sender]</CodeTag>.
              </>,
              <>
                Marca <CodeTag>hasClaimed[msg.sender] = true</CodeTag> antes de transferir (evita reentradas).
              </>,
              <>
                Calcula <CodeTag>amount</CodeTag>:
                <div className="mt-1 grid gap-1">
                  <div>
                    Cuenta ganadores recorriendo <CodeTag>_playersWhoBet</CodeTag> y comparando <CodeTag>bets[player]</CodeTag> vs{' '}
                    <CodeTag>finalResult</CodeTag>.
                  </div>
                  <div>Si winners == 0: cada participante recupera <CodeTag>stake</CodeTag>.</div>
                  <div>Si winners &gt; 0: solo ganadores cobran <CodeTag>totalPot / winners</CodeTag>.</div>
                </div>
              </>,
              <>
                Si <CodeTag>amount == 0</CodeTag> revierte (<CodeTag>nothing to claim</CodeTag>).
              </>,
              <>
                Si está en <CodeTag>Claiming</CodeTag>, cambia a <CodeTag>Finished</CodeTag> en el primer claim.
              </>,
              <>
                Transfiere con <CodeTag>call</CodeTag> y emite <CodeTag>RewardClaimed</CodeTag>.
              </>,
            ]}
          />
        </Section>

        <Section title="src/WhitelistManager.sol (quién puede participar)" tone="contracts">
          <SubTitle>Constructor (setup inicial)</SubTitle>
          <Steps
            items={[
              <>
                Valida número de participantes en rango <CodeTag>[2..20]</CodeTag>.
              </>,
              <>
                Exige igualdad de longitudes: <CodeTag>participants.length == nicknames.length</CodeTag>.
              </>,
              <>
                Por cada entrada: no cero, no duplicado (<CodeTag>_isWhitelisted[p] == false</CodeTag>), nickname no vacío y con
                tamaño máximo.
              </>,
              <>
                Efectos: marca mapping, empuja en <CodeTag>_participants</CodeTag> y <CodeTag>_nicknames</CodeTag>, emite{' '}
                <CodeTag>ParticipantAdded</CodeTag>.
              </>,
            ]}
          />

          <SubTitle>Mutaciones (solo owner)</SubTitle>
          <Bullet>
            <CodeTag>addParticipant</CodeTag>: revalida constraints, marca mapping, añade a arrays y emite evento.
          </Bullet>
          <Bullet>
            <CodeTag>removeParticipant</CodeTag>: desmarca mapping y elimina del array con “swap &amp; pop” (copia el último al
            hueco, luego <CodeTag>pop()</CodeTag>). Mantiene arrays compactos.
          </Bullet>

          <SubTitle>Lecturas (consumo típico)</SubTitle>
          <Bullet>
            <CodeTag>isWhitelisted(addr)</CodeTag> se usa en <CodeTag>PorraGame.placeBet</CodeTag> para autorización.
          </Bullet>
          <Bullet>
            <CodeTag>getParticipants()</CodeTag> y <CodeTag>getNicknames()</CodeTag> dan “listado + etiquetas” para UI (mismo
            orden lógico).
          </Bullet>
        </Section>

        <Section title="src/MockOracle.sol + interfaces/IPorraOracle.sol (dato externo)" tone="oracle">
          <SubTitle>Interfaz (lo que PorraGame espera)</SubTitle>
          <Bullet>
            <CodeTag>requestMatchResult(matchId)</CodeTag>: señal de “inicia el proceso de obtención del resultado”.
          </Bullet>
          <Bullet>
            <CodeTag>getResult(matchId)</CodeTag> → <CodeTag>(uint8 result, bool resolved)</CodeTag>: lectura idempotente para
            comprobar si ya hay respuesta.
          </Bullet>

          <SubTitle>Implementación dev: MockOracle</SubTitle>
          <Bullet>
            Storage:
            <span className="ml-2">
              <CodeTag>
                mapping(matchId =&gt; Result{'{'}value,resolved{'}'})
              </CodeTag>
            </span>
          </Bullet>

          <SubTitle>Flujo paso a paso</SubTitle>
          <Steps
            items={[
              <>
                <CodeTag>PorraGame.startResolution</CodeTag> llama a <CodeTag>requestMatchResult(matchId)</CodeTag>.
              </>,
              <>
                En <CodeTag>MockOracle</CodeTag>, esa función solo emite <CodeTag>ResultRequested</CodeTag> (no cambia estado).
              </>,
              <>
                El “actor oráculo” (en dev: owner) ejecuta <CodeTag>setResult(matchId,result)</CodeTag> con 0..2, persiste y
                marca <CodeTag>resolved=true</CodeTag>.
              </>,
              <>
                <CodeTag>PorraGame.resolveWithOracle</CodeTag> lee <CodeTag>getResult</CodeTag> y avanza a Claiming.
              </>,
            ]}
          />
        </Section>
      </div>

      <Section title="src/utils/* (seguridad y control)" tone="frontend">
        <Bullet>
          Estos helpers no “añaden lógica de negocio” de la porra: añaden <span className="text-[var(--text-primary)] font-semibold">controles de acceso</span>,{' '}
          <span className="text-[var(--text-primary)] font-semibold">parada de emergencia</span> y{' '}
          <span className="text-[var(--text-primary)] font-semibold">protección contra reentrancy</span>. Son la capa que hace
          que funciones críticas (mover ETH, cambiar estados) sean más seguras.
        </Bullet>

        <SubTitle>utils/Ownable.sol</SubTitle>
        <Bullet>
          Storage: guarda <CodeTag>_owner</CodeTag> (address) como única fuente de verdad del “admin” del contrato.
        </Bullet>
        <Bullet>
          Constructor: exige <CodeTag>initialOwner</CodeTag> (en tus contratos suele ser <CodeTag>msg.sender</CodeTag>) y emite{' '}
          <CodeTag>OwnershipTransferred(address(0), initialOwner)</CodeTag>. Esto crea una pista on-chain de quién fue el owner inicial.
        </Bullet>
        <Bullet>
          Modifier <CodeTag>onlyOwner</CodeTag>: gate simple con <CodeTag>require(owner() == msg.sender)</CodeTag>. En EVM esto
          se ejecuta antes del cuerpo de la función, así que si falla no hay efectos.
        </Bullet>
        <Bullet>
          <CodeTag>transferOwnership(newOwner)</CodeTag>:
          <div className="mt-2 grid gap-1">
            <div>
              Rechaza <CodeTag>address(0)</CodeTag> (evita perder el control del contrato por accidente).
            </div>
            <div>
              Actualiza <CodeTag>_owner</CodeTag> y emite <CodeTag>OwnershipTransferred(oldOwner, newOwner)</CodeTag> para auditoría/indexación.
            </div>
          </div>
        </Bullet>
        <Bullet>
          Dónde se usa:
          <div className="mt-2 grid gap-1">
            <div>
              <CodeTag>PorraFactory</CodeTag>: <CodeTag>setOracle()</CodeTag> es <CodeTag>onlyOwner</CodeTag> (control del oráculo global).
            </div>
            <div>
              <CodeTag>WhitelistManager</CodeTag>: <CodeTag>addParticipant/removeParticipant</CodeTag> son <CodeTag>onlyOwner</CodeTag>.
            </div>
            <div>
              <CodeTag>PorraGame</CodeTag>: <CodeTag>pause/unpause</CodeTag> y <CodeTag>setManualResult</CodeTag> son <CodeTag>onlyOwner</CodeTag>.
            </div>
            <div>
              <CodeTag>MockOracle</CodeTag>: <CodeTag>setResult</CodeTag> es <CodeTag>onlyOwner</CodeTag> (en dev/test simula el firmante del oráculo).
            </div>
          </div>
        </Bullet>

        <SubTitle>utils/Pausable.sol</SubTitle>
        <Bullet>
          Objetivo: tener un “interruptor” global para bloquear funciones sensibles sin destruir el contrato ni migrar.
        </Bullet>
        <Bullet>
          Storage: flag booleano <CodeTag>_paused</CodeTag> (privado). Estado inicial en constructor: <CodeTag>false</CodeTag>.
        </Bullet>
        <Bullet>
          Modifiers:
          <div className="mt-2 grid gap-1">
            <div>
              <CodeTag>whenNotPaused</CodeTag>: <CodeTag>require(!_paused)</CodeTag> (protege rutas de ejecución críticas).
            </div>
            <div>
              <CodeTag>whenPaused</CodeTag>: <CodeTag>require(_paused)</CodeTag> (evita unpause/pause inválidos).
            </div>
          </div>
        </Bullet>
        <Bullet>
          Hooks internos:
          <div className="mt-2 grid gap-1">
            <div>
              <CodeTag>_pause()</CodeTag>: cambia <CodeTag>_paused = true</CodeTag> y emite <CodeTag>Paused(msg.sender)</CodeTag>.
            </div>
            <div>
              <CodeTag>_unpause()</CodeTag>: cambia <CodeTag>_paused = false</CodeTag> y emite <CodeTag>Unpaused(msg.sender)</CodeTag>.
            </div>
          </div>
        </Bullet>
        <Bullet>
          Dónde se usa en <CodeTag>PorraGame</CodeTag>:
          <div className="mt-2 grid gap-1">
            <div>
              <CodeTag>placeBet</CodeTag>, <CodeTag>startResolution</CodeTag>, <CodeTag>resolveWithOracle</CodeTag>,{' '}
              <CodeTag>setManualResult</CodeTag> y <CodeTag>claimReward</CodeTag> están protegidas con <CodeTag>whenNotPaused</CodeTag>.
            </div>
            <div>
              Si algo va mal (por ejemplo un bug o un ataque), el owner puede llamar <CodeTag>pause()</CodeTag> y la porra queda congelada.
            </div>
          </div>
        </Bullet>

        <SubTitle>utils/ReentrancyGuard.sol</SubTitle>
        <Bullet>
          Amenaza que mitiga: reentrancy en funciones que envían ETH (o llaman a contratos externos) antes de terminar sus efectos.
        </Bullet>
        <Bullet>
          Storage: <CodeTag>_status</CodeTag> con dos constantes:
          <span className="ml-2">
            <CodeTag>_NOT_ENTERED = 1</CodeTag>
          </span>
          <span className="ml-2">
            <CodeTag>_ENTERED = 2</CodeTag>
          </span>
          . Se inicializa en <CodeTag>_NOT_ENTERED</CodeTag>.
        </Bullet>
        <Bullet>
          Modifier <CodeTag>nonReentrant</CodeTag> (flujo exacto):
          <Steps
            items={[
              <>
                Antes del cuerpo: <CodeTag>require(_status != _ENTERED)</CodeTag>.
              </>,
              <>
                Marca lock: <CodeTag>_status = _ENTERED</CodeTag>.
              </>,
              <>
                Ejecuta el cuerpo de la función.
              </>,
              <>
                Al final, desbloquea: <CodeTag>_status = _NOT_ENTERED</CodeTag>.
              </>,
            ]}
          />
        </Bullet>
        <Bullet>
          Dónde se usa en <CodeTag>PorraGame</CodeTag> y por qué:
          <div className="mt-2 grid gap-1">
            <div>
              <CodeTag>placeBet</CodeTag>: aunque no envía ETH hacia fuera, toca estado y pot; el guard añade defensa por defecto.
            </div>
            <div>
              <CodeTag>startResolution</CodeTag>/<CodeTag>resolveWithOracle</CodeTag>: coordinan estados y llamada externa al oráculo (request/get).
            </div>
            <div>
              <CodeTag>claimReward</CodeTag>: es la más crítica porque hace <CodeTag>msg.sender.call{`{`}value: amount{`}`}</CodeTag>.
              El guard evita que un contrato malicioso reentre a <CodeTag>claimReward</CodeTag> en mitad del pago.
            </div>
          </div>
        </Bullet>

        <SubTitle>Composición de defensas (cómo encajan entre sí)</SubTitle>
        <Bullet>
          En <CodeTag>PorraGame.claimReward</CodeTag> coinciden varias defensas:
          <div className="mt-2 grid gap-1">
            <div>
              <CodeTag>whenNotPaused</CodeTag>: parada de emergencia.
            </div>
            <div>
              <CodeTag>nonReentrant</CodeTag>: bloquea reentradas.
            </div>
            <div>
              Efecto antes de interacción: marca <CodeTag>hasClaimed = true</CodeTag> antes del <CodeTag>call</CodeTag> (patrón checks-effects-interactions).
            </div>
          </div>
        </Bullet>
      </Section>
    </div>
  );
}

