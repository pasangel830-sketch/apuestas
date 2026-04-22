import { useMemo, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueries } from '@tanstack/react-query';
import { useAccount, useChainId, usePublicClient, useReadContract } from 'wagmi';
import { getAddress, parseAbiItem } from 'viem';
import { FACTORY_ADDRESS, FACTORY_DEPLOY_BLOCK } from '../contracts/addresses';
import PorraFactoryAbi from '../contracts/abi/PorraFactory.json';
import PorraGameAbi from '../contracts/abi/PorraGame.json';
import { GAME_STATE_LABELS } from '../config';
import { lookupRegisteredMatchByChainId, displayMatchLabel } from '../utils/matchIdLookup';
import { fetchRegisteredMatches } from '../utils/registeredMatches';

const PHASE_CLASS = {
  0: 'betting',
  1: 'resolving',
  2: 'claiming',
  3: 'finished',
};

const PORRA_CREATED_EVENT = parseAbiItem(
  'event PorraCreated(address indexed game, address indexed whitelistManager, address indexed creator, bytes32 matchId, uint256 bettingDeadline)'
);

const heroContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
};

function formatCreatedAt(ms) {
  if (ms == null) return null;
  try {
    return new Intl.DateTimeFormat('es', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ms));
  } catch {
    return null;
  }
}

function PorraListItem({ gameAddress, createdAtMs, datePending, registryMatches, registryLoading }) {
  const { data: gameStateRaw, isPending: phasePending } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'gameState',
  });
  const phaseIdx = gameStateRaw != null ? Number(gameStateRaw) : null;
  const phaseLabel =
    phaseIdx != null && GAME_STATE_LABELS[phaseIdx] != null
      ? GAME_STATE_LABELS[phaseIdx]
      : null;
  const phaseMod = phaseIdx != null ? PHASE_CLASS[phaseIdx] : null;

  const { data: matchId } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'matchId',
  });
  const matchEntry =
    matchId != null ? lookupRegisteredMatchByChainId(registryMatches, matchId) : null;
  const resolvedTitle =
    matchId == null
      ? null
      : matchEntry
        ? displayMatchLabel(matchEntry)
        : registryLoading
          ? null
          : `${String(matchId).slice(0, 10)}…${String(matchId).slice(-4)}`;
  const label = formatCreatedAt(createdAtMs);
  const iso =
    createdAtMs != null ? new Date(createdAtMs).toISOString() : undefined;

  return (
    <Link to={`/porra/${gameAddress}`} className="my-porras-entry-link">
      <div className="my-porras-entry-link__main">
        {matchId != null && resolvedTitle ? (
          <span className="porra-list-match-title">{resolvedTitle}</span>
        ) : (
          <span className="porra-list-match-title porra-list-match-title--muted">
            Cargando partido…
          </span>
        )}
        <span className="porra-list-contract">
          {gameAddress.slice(0, 10)}…{gameAddress.slice(-8)}
        </span>
      </div>
      <div className="my-porras-entry-link__meta">
        <div className="my-porras-entry-link__phase">
          {phasePending ? (
            <span className="porra-list-phase porra-list-phase--pending" aria-label="Cargando fase">
              …
            </span>
          ) : phaseLabel && phaseMod ? (
            <span
              className={`porra-list-phase porra-list-phase--${phaseMod}`}
              title="Fase actual de la porra"
            >
              {phaseLabel}
            </span>
          ) : (
            <span className="porra-list-phase porra-list-phase--pending">—</span>
          )}
        </div>
        {datePending && label == null ? (
          <span className="porra-list-created porra-list-created--pending">…</span>
        ) : label ? (
          <time className="porra-list-created" dateTime={iso}>
            {label}
          </time>
        ) : (
          <span className="porra-list-created porra-list-created--na">—</span>
        )}
      </div>
    </Link>
  );
}

function usePorraCreationTimes(addresses) {
  const publicClient = usePublicClient();
  const chainId = useChainId();

  const results = useQueries({
    queries: addresses.map((addr) => ({
      queryKey: ['porraCreated', chainId, FACTORY_ADDRESS, addr],
      queryFn: async () => {
        try {
          const debug =
            typeof window !== 'undefined' &&
            window?.localStorage?.getItem?.('debugPorraDates') === '1';
          const game = getAddress(addr);
          const factory = getAddress(FACTORY_ADDRESS);
          const latest = await publicClient.getBlockNumber();
          const start =
            FACTORY_DEPLOY_BLOCK && FACTORY_DEPLOY_BLOCK > 0
              ? BigInt(FACTORY_DEPLOY_BLOCK)
              : 0n;

          if (debug) {
            // eslint-disable-next-line no-console
            console.log('[porraDates] start', {
              chainId,
              factory,
              game,
              start: start.toString(),
              latest: latest.toString(),
            });
          }

          const scan = async (chunkSize) => {
            // Primero, con filtro args.
            for (let from = start; from <= latest; from += chunkSize) {
              const to = from + chunkSize - 1n > latest ? latest : from + chunkSize - 1n;
              const chunk = await publicClient.getLogs({
                address: factory,
                event: PORRA_CREATED_EVENT,
                args: { game },
                fromBlock: from,
                toBlock: to,
              });
              if (chunk.length) return chunk[0];
            }
            // Fallback: sin args y filtrar en JS.
            for (let from = start; from <= latest; from += chunkSize) {
              const to = from + chunkSize - 1n > latest ? latest : from + chunkSize - 1n;
              const chunk = await publicClient.getLogs({
                address: factory,
                event: PORRA_CREATED_EVENT,
                fromBlock: from,
                toBlock: to,
              });
              const match = chunk.find(
                (l) => (l.args?.game || '').toLowerCase() === game.toLowerCase()
              );
              if (match) return match;
            }
            return null;
          };

          let foundLog = null;
          try {
            foundLog = await scan(10_000n);
          } catch (e) {
            // Alchemy Free: eth_getLogs max 10 blocks.
            const detailsJson = (() => {
              try {
                return typeof e?.details === 'string' ? e.details : JSON.stringify(e?.details);
              } catch {
                return undefined;
              }
            })();
            const msg = [
              e?.details?.message,
              e?.shortMessage,
              e?.message,
              detailsJson,
              String(e),
            ]
              .filter(Boolean)
              .join(' | ');

            if (/up to a 10 block range/i.test(msg)) {
              if (debug) {
                // eslint-disable-next-line no-console
                console.warn('[porraDates] rpc log range too large; retrying with 10 blocks', msg);
              }
              foundLog = await scan(10n);
            } else {
              throw e;
            }
          }

          if (!foundLog) return { createdAtMs: null };
          const block = await publicClient.getBlock({
            blockNumber: foundLog.blockNumber,
          });
          if (debug) {
            // eslint-disable-next-line no-console
            console.log('[porraDates] resolved', {
              blockNumber: foundLog.blockNumber?.toString?.() ?? String(foundLog.blockNumber),
              timestamp: block.timestamp?.toString?.() ?? String(block.timestamp),
            });
          }
          return { createdAtMs: Number(block.timestamp) * 1000 };
        } catch (e) {
          const debug =
            typeof window !== 'undefined' &&
            window?.localStorage?.getItem?.('debugPorraDates') === '1';
          if (debug) {
            // eslint-disable-next-line no-console
            console.error('[porraDates] failed', e);
          }
          return { createdAtMs: null };
        }
      },
      enabled: Boolean(publicClient && FACTORY_ADDRESS && addr),
      staleTime: 60 * 60 * 1000,
    })),
  });

  const timesByAddress = {};
  addresses.forEach((addr, i) => {
    timesByAddress[addr.toLowerCase()] = results[i]?.data?.createdAtMs ?? null;
  });

  const isLoading = results.some((r) => r.isPending || r.isFetching);

  return { timesByAddress, isLoading };
}

function mergePorraAddresses(creatorList, participantList) {
  const byLower = new Map();
  for (const a of creatorList || []) {
    if (!a) continue;
    const k = a.toLowerCase();
    if (!byLower.has(k)) byLower.set(k, a);
  }
  for (const a of participantList || []) {
    if (!a) continue;
    const k = a.toLowerCase();
    if (!byLower.has(k)) byLower.set(k, a);
  }
  return [...byLower.values()];
}

function MyPorras() {
  const [registryMatches, setRegistryMatches] = useState([]);
  const [registryLoading, setRegistryLoading] = useState(true);
  const loadRegistryMatches = useCallback(async () => {
    try {
      setRegistryLoading(true);
      const list = await fetchRegisteredMatches();
      setRegistryMatches(list);
    } catch {
      setRegistryMatches([]);
    } finally {
      setRegistryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRegistryMatches();
  }, [loadRegistryMatches]);

  useEffect(() => {
    const h = () => {
      void loadRegistryMatches();
    };
    window.addEventListener('porra-matches-changed', h);
    window.addEventListener('focus', h);
    return () => {
      window.removeEventListener('porra-matches-changed', h);
      window.removeEventListener('focus', h);
    };
  }, [loadRegistryMatches]);

  const { address, isConnected } = useAccount();
  const { data: asCreator, isLoading: loadingCreator } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: PorraFactoryAbi,
    functionName: 'getPorrasByCreator',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && FACTORY_ADDRESS) },
  });
  const { data: asParticipant, isLoading: loadingParticipant } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: PorraFactoryAbi,
    functionName: 'getPorrasByParticipant',
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address && FACTORY_ADDRESS) },
  });

  const porraAddresses = useMemo(
    () => mergePorraAddresses(asCreator, asParticipant),
    [asCreator, asParticipant]
  );
  const loadingLists = loadingCreator || loadingParticipant;
  const { timesByAddress, isLoading: loadingCreationTimes } =
    usePorraCreationTimes(porraAddresses);

  const sortedAddresses = [...porraAddresses].sort((a, b) => {
    const ta = timesByAddress[a.toLowerCase()];
    const tb = timesByAddress[b.toLowerCase()];
    if (ta == null && tb == null) return 0;
    if (ta == null) return 1;
    if (tb == null) return -1;
    return tb - ta;
  });

  if (!isConnected) {
    return (
      <div className="page home my-porras">
        <motion.section
          className="home-hero"
          aria-labelledby="my-porras-title"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <motion.p className="home-hero__badge" variants={heroItem}>
            Tus apuestas
          </motion.p>
          <motion.h1 id="my-porras-title" className="home-hero__title" variants={heroItem}>
            Mis porras
          </motion.h1>
          <motion.p className="home-hero__subtitle" variants={heroItem}>
            Conecta tu wallet para ver las porras en las que participas o que has creado.
          </motion.p>
        </motion.section>
        <section className="card my-porras-empty-card">
          <p className="my-porras-empty-card__text">
            Conecta tu wallet para ver tus porras (como creador o participante).
          </p>
        </section>
      </div>
    );
  }

  if (!FACTORY_ADDRESS) {
    return (
      <div className="page home my-porras">
        <motion.section className="home-hero" variants={heroContainer} initial="hidden" animate="show">
          <motion.p className="home-hero__badge" variants={heroItem}>
            Tus apuestas
          </motion.p>
          <motion.h1 className="home-hero__title" variants={heroItem}>
            Mis porras
          </motion.h1>
          <motion.p className="home-hero__subtitle" variants={heroItem}>
            Configura el contrato factory en el entorno para listar porras.
          </motion.p>
        </motion.section>
        <section className="card my-porras-empty-card">
          <p className="my-porras-empty-card__text">Configura VITE_FACTORY_ADDRESS en .env.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page home my-porras">
      <motion.section
        className="home-hero"
        aria-labelledby="my-porras-title"
        variants={heroContainer}
        initial="hidden"
        animate="show"
      >
        <motion.p className="home-hero__badge" variants={heroItem}>
          Tus apuestas
        </motion.p>
        <motion.h1 id="my-porras-title" className="home-hero__title" variants={heroItem}>
          Mis porras
        </motion.h1>
        <motion.p className="home-hero__subtitle" variants={heroItem}>
          Porras en las que participas o que has creado. La fecha es la del bloque en el que se desplegó el
          contrato.
        </motion.p>
      </motion.section>

      {loadingLists && (
        <section className="my-porras-status">
          <p className="my-porras-status__text">Cargando lista…</p>
        </section>
      )}

      {!loadingLists && sortedAddresses.length === 0 && (
        <section className="card my-porras-empty-card">
          <p className="my-porras-empty-card__text">
            No apareces en ninguna porra como creador o participante.{' '}
            <Link to="/create">Crear una</Link> o pide al organizador el enlace o la dirección del
            contrato.
          </p>
        </section>
      )}

      {!loadingLists && sortedAddresses.length > 0 && (
        <section className="my-porras-entries" aria-label="Lista de porras">
          {loadingCreationTimes && (
            <p className="my-porras-dates-hint">Obteniendo fechas de creación…</p>
          )}
          <motion.ul
            className="porra-list my-porras-list"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.03 } },
            }}
          >
            {sortedAddresses.map((gameAddress) => (
              <motion.li
                key={gameAddress}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
              >
                <PorraListItem
                  gameAddress={gameAddress}
                  createdAtMs={timesByAddress[gameAddress.toLowerCase()]}
                  datePending={loadingCreationTimes}
                  registryMatches={registryMatches}
                  registryLoading={registryLoading}
                />
              </motion.li>
            ))}
          </motion.ul>
        </section>
      )}
    </div>
  );
}

export default MyPorras;
