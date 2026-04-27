import { motion } from 'framer-motion';
import ContractCard from '../components/ContractCard';

const CONTRACTS = [
  {
    name: 'PorraFactory',
    role: 'Factory',
    responsibility:
      'Despliega nuevas porras (juegos) y registra las direcciones para que el frontend pueda descubrirlas y listarlas.',
    keyFunctions: [
      { name: 'createPorra(...)', hint: 'Crea Whitelist + PorraGame y emite evento de creación.' },
      { name: 'getPorrasByUser(...)', hint: 'Permite listar porras asociadas a un usuario.' },
      { name: 'PorraCreated', hint: 'Evento que el frontend decodifica para obtener la dirección del juego.' },
    ],
    relations: ['Despliega: WhitelistManager', 'Despliega: PorraGame', 'Configura/usa: Oracle (por referencia)'],
  },
  {
    name: 'PorraGame',
    role: 'Game',
    responsibility:
      'Contrato principal: gestiona apuestas, ventanas temporales, estados del juego, resolución y reparto de premios.',
    keyFunctions: [
      { name: 'placeBet(...)', hint: 'Registra predicción y bloquea fondos (stake) on-chain.' },
      { name: 'startResolution()', hint: 'Inicia el proceso de resolución y pide el resultado al oráculo.' },
      { name: 'resolveWithOracle()', hint: 'Resuelve usando el resultado publicado por el oráculo.' },
      { name: 'claimReward()', hint: 'Distribución pull-based: cada ganador reclama su premio.' },
    ],
    relations: ['Lee: WhitelistManager', 'Consulta: IPorraOracle (MockOracle)', 'Emite: eventos de apuestas y resolución'],
  },
  {
    name: 'WhitelistManager',
    role: 'Access',
    responsibility:
      'Gestiona whitelist de participantes y “motes”. Restringe quién puede apostar y aporta labels legibles en UI.',
    keyFunctions: [
      { name: 'isWhitelisted(addr)', hint: 'Permite validar participantes autorizados.' },
      { name: 'getNick(addr)', hint: 'Devuelve el mote asociado a una dirección para UX.' },
      { name: 'add/remove', hint: 'Gestión administrativa (owner) para ajustar participantes.' },
    ],
    relations: ['Usado por: PorraGame', 'Desplegado por: PorraFactory'],
  },
  {
    name: 'MockOracle',
    role: 'Oracle',
    responsibility:
      'Oráculo de desarrollo: almacena resultados por matchId (bytes32) y permite publicar el outcome para resolver.',
    keyFunctions: [
      { name: 'requestResult(id)', hint: 'Emite un evento para pedir el resultado del partido.' },
      { name: 'setResult(id,outcome)', hint: 'Publica el resultado on-chain (owner/oracle signer).' },
      { name: 'getResult(id)', hint: 'Lectura del resultado para que PorraGame lo use en la resolución.' },
    ],
    relations: ['Implementa: IPorraOracle', 'Consumido por: PorraGame', 'Invocado por: backend/oracle fulfill'],
  },
];

export default function SmartContractsSlide() {
  return (
    <div className="grid gap-6">
      <div>
        <motion.h2
          className="m-0 text-balance font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          Smart contracts (roles y API)
        </motion.h2>
        <p className="mt-3 max-w-[90ch] text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          Cada contrato cumple una pieza del puzzle. La Factory despliega, el Game gobierna el dinero y reglas, la
          Whitelist mejora seguridad/UX, y el Oráculo conecta el mundo real con la cadena.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {CONTRACTS.map((c) => (
          <ContractCard key={c.name} contract={c} />
        ))}
      </div>
    </div>
  );
}

