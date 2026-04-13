import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useReadContract,
  useBlockNumber,
} from 'wagmi';
import { keccak256, toBytes, decodeEventLog, parseEther, isAddress, getAddress } from 'viem';
import { FACTORY_ADDRESS } from '../contracts/addresses';
import PorraFactoryAbi from '../contracts/abi/PorraFactory.json';
import PorraGameAbi from '../contracts/abi/PorraGame.json';
import BettingCountdownCard from '../components/BettingCountdownCard';
import { useChainTimeEstimate } from '../hooks/useChainTimeEstimate';
import { toDatetimeLocalValue } from '../utils/time';
import { fetchRegisteredMatches } from '../utils/registeredMatches';

const MIN_PARTICIPANTS = 2;
const MAX_PARTICIPANTS = 20;
const MAX_NICKNAME_BYTES = 128;
const DEFAULT_STAKE_ETH = '0.001';
const MAX_STAKE_ETH = 10;
/** Límite de gas para crear porra (despliega 2 contratos). Aumenta si la tx revierte por "unknown reason". */
const GAS_LIMIT_CREATE_PORRA = 8_000_000n;

function utf8ByteLength(str) {
  return new TextEncoder().encode(str).length;
}
/** Si el RPC público no responde a tiempo, no dejamos el botón en «Enviando…» sin diagnóstico. */
const ESTIMATE_GAS_TIMEOUT_MS = 60_000;
/**
 * Si el monedero no abre el popup o no responde (otra solicitud pendiente, extensión bloqueada, etc.),
 * liberamos la mutación de wagmi para poder reintentar.
 */
const WALLET_PROMPT_TIMEOUT_MS = 180_000;

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

function withTimeout(promise, ms, phase) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${phase}_timeout`)), ms);
    }),
  ]);
}

function defaultMatchEndLocal() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  d.setHours(21, 0, 0, 0);
  return toDatetimeLocalValue(d);
}

function CreatePorra() {
  const location = useLocation();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [participants, setParticipants] = useState([
    { address: '', nickname: '' },
    { address: '', nickname: '' },
  ]);
  const [savedMatches, setSavedMatches] = useState([]);
  const [savedMatchesLoading, setSavedMatchesLoading] = useState(true);
  const [savedMatchesError, setSavedMatchesError] = useState(null);
  const [matchIdInput, setMatchIdInput] = useState('');
  /** Minutos desde ahora hasta el cierre de apuestas (1440 ≈ 1 día, equivalente al valor por defecto anterior). */
  const [bettingDeadlineMinutes, setBettingDeadlineMinutes] = useState(1440);
  const [matchEndLocal, setMatchEndLocal] = useState(defaultMatchEndLocal);
  const [stakeEth, setStakeEth] = useState(DEFAULT_STAKE_ETH);
  const [createdGameAddress, setCreatedGameAddress] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [revertReason, setRevertReason] = useState(null); // motivo del revert obtenido al reproducir la tx
  /** Cubre estimateGas + espera del monedero (antes de que wagmi tenga hash; wagmi no expone «simulando»). */
  const [localWorking, setLocalWorking] = useState(false);
  const publicClient = usePublicClient();

  const loadSavedMatches = useCallback(async () => {
    try {
      setSavedMatchesError(null);
      setSavedMatchesLoading(true);
      const list = await fetchRegisteredMatches();
      setSavedMatches(list);
    } catch (e) {
      setSavedMatches([]);
      setSavedMatchesError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavedMatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSavedMatches();
  }, [loadSavedMatches, location.pathname]);

  useEffect(() => {
    const handler = () => {
      void loadSavedMatches();
    };
    window.addEventListener('porra-matches-changed', handler);
    window.addEventListener('focus', handler);
    return () => {
      window.removeEventListener('porra-matches-changed', handler);
      window.removeEventListener('focus', handler);
    };
  }, [loadSavedMatches]);

  useEffect(() => {
    if (!savedMatches.length) return;
    if (!savedMatches.some((m) => m.id === matchIdInput)) {
      setMatchIdInput(savedMatches[0].id);
    }
  }, [savedMatches, matchIdInput]);

  const { data: hash, writeContractAsync, isPending, error, reset: resetWrite } = useWriteContract();

  useEffect(() => {
    resetWrite();
  }, [resetWrite]);

  const cancelSubmission = () => {
    resetWrite();
    setLocalWorking(false);
  };
  const {
    isLoading: isConfirming,
    isFetching: isReceiptFetching,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
    /** Evita «Enviando…» indefinido si la tx no se mina (cola, gas, red). */
    timeout: 180_000,
    query: {
      /** Un refetch en segundo plano puede dejar isFetching en true con isSuccess ya true y bloquear la UI. */
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  const { data: blockNumber } = useBlockNumber({ watch: true });
  const chainTimeEst = useChainTimeEstimate(blockNumber, [hash]);
  const { data: createdBettingDeadline } = useReadContract({
    address: createdGameAddress,
    abi: PorraGameAbi,
    functionName: 'bettingDeadline',
    query: { enabled: Boolean(createdGameAddress) },
  });

  const hasTxFailure = Boolean(error || receiptError);
  /** Si ya sabemos que falló la wallet o el recibo, no bloqueamos la UI como “enviando”. */
  const showSending =
    (localWorking ||
      isPending ||
      isConfirming ||
      (Boolean(hash) && isReceiptFetching && !isSuccess)) &&
    !hasTxFailure;

  const addParticipant = () => {
    if (participants.length < MAX_PARTICIPANTS) {
      setParticipants([...participants, { address: '', nickname: '' }]);
    }
  };

  const removeParticipant = (i) => {
    if (participants.length > MIN_PARTICIPANTS) {
      setParticipants(participants.filter((_, idx) => idx !== i));
    }
  };

  const setParticipantAddress = (i, value) => {
    const next = [...participants];
    next[i] = { ...next[i], address: value };
    setParticipants(next);
  };

  const setParticipantNickname = (i, value) => {
    const next = [...participants];
    next[i] = { ...next[i], nickname: value };
    setParticipants(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    setRevertReason(null);
    if (!FACTORY_ADDRESS || !address || !publicClient) return;
    const pairs = [];
    for (let i = 0; i < participants.length; i++) {
      const addrRaw = participants[i].address.trim();
      const nickRaw = participants[i].nickname.trim();
      if (!addrRaw && !nickRaw) continue;
      if (addrRaw && !nickRaw) {
        setSubmitError('Cada dirección debe tener un mote (fila con wallet sin nombre).');
        return;
      }
      if (!addrRaw && nickRaw) {
        setSubmitError('Hay un mote sin dirección de wallet; complétalo o bórralo.');
        return;
      }
      if (utf8ByteLength(nickRaw) > MAX_NICKNAME_BYTES) {
        setSubmitError(`El mote no puede superar ${MAX_NICKNAME_BYTES} bytes en UTF-8 (fila ${i + 1}).`);
        return;
      }
      pairs.push({ address: addrRaw, nickname: nickRaw });
    }
    const addrs = pairs.map((p) => p.address);
    if (addrs.length < MIN_PARTICIPANTS || addrs.length > MAX_PARTICIPANTS) {
      setSubmitError(`Debe haber entre ${MIN_PARTICIPANTS} y ${MAX_PARTICIPANTS} participantes con dirección y mote.`);
      return;
    }
    const invalidAddr = addrs.find((a) => !isAddress(a));
    if (invalidAddr) {
      setSubmitError(`Dirección inválida: "${invalidAddr}". Debe ser una dirección Ethereum (0x seguido de 40 caracteres hexadecimales).`);
      return;
    }
    const seen = new Set();
    const duplicate = addrs.find((a) => {
      const lower = a.toLowerCase();
      if (seen.has(lower)) return true;
      seen.add(lower);
      return false;
    });
    if (duplicate) {
      setSubmitError('No puede haber participantes repetidos. Revisa las direcciones.');
      return;
    }
    let normalizedAddrs;
    try {
      normalizedAddrs = addrs.map((a) => getAddress(a));
    } catch (err) {
      setSubmitError(`Dirección inválida (revisa que cada una sea 0x + 40 caracteres hex): ${err?.message ?? err}`);
      return;
    }
    const normalizedNicknames = pairs.map((p) => p.nickname.trim());
    const seenNorm = new Set();
    const dupNorm = normalizedAddrs.find((a) => {
      const lower = a.toLowerCase();
      if (seenNorm.has(lower)) return true;
      seenNorm.add(lower);
      return false;
    });
    if (dupNorm) {
      setSubmitError(`Tras normalizar, hay direcciones repetidas (ej. 0xB41... y 0x0B41... son la misma). Quita duplicados.`);
      return;
    }
    const stakeNum = Number(stakeEth);
    const stakeValid = !Number.isNaN(stakeNum) && stakeNum > 0 && stakeNum <= MAX_STAKE_ETH;
    if (!stakeValid) {
      setSubmitError(`El importe debe ser un número entre 0 y ${MAX_STAKE_ETH} ETH.`);
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    if (
      !Number.isFinite(bettingDeadlineMinutes) ||
      bettingDeadlineMinutes < 1 ||
      bettingDeadlineMinutes !== Math.floor(bettingDeadlineMinutes)
    ) {
      setSubmitError('Los minutos hasta el fin de apuestas deben ser un entero mayor o igual a 1.');
      return;
    }
    const bettingDeadline = BigInt(now + bettingDeadlineMinutes * 60);
    const matchEndUserSec = Math.floor(new Date(matchEndLocal).getTime() / 1000);
    if (Number.isNaN(matchEndUserSec)) {
      setSubmitError('Indica una fecha y hora válidas para el fin del partido.');
      return;
    }
    const matchEndTime = BigInt(matchEndUserSec);
    if (matchEndUserSec <= now) {
      setSubmitError('El fin estimado del partido debe ser posterior al momento actual.');
      return;
    }
    if (bettingDeadline >= BigInt(matchEndUserSec)) {
      setSubmitError('El cierre de apuestas debe ser anterior al fin estimado del partido (revisa los minutos o la fecha del partido).');
      return;
    }
    if (savedMatchesLoading) {
      setSubmitError('Espera a que carguen los partidos desde la API.');
      return;
    }
    if (!savedMatches.length || !matchIdInput.trim()) {
      setSubmitError('No hay partidos guardados. Añádelos en API deportiva (mock).');
      return;
    }
    const matchIdBytes32 = keccak256(toBytes(matchIdInput));
    const stakeWei = parseEther(String(stakeEth));

    const args = [normalizedAddrs, normalizedNicknames, matchIdBytes32, bettingDeadline, matchEndTime, stakeWei];
    setCreatedGameAddress(null);

    setLocalWorking(true);
    try {
      const estimatedGas = await withTimeout(
        publicClient.estimateContractGas({
          address: FACTORY_ADDRESS,
          abi: PorraFactoryAbi,
          functionName: 'createPorra',
          args,
          account: address,
        }),
        ESTIMATE_GAS_TIMEOUT_MS,
        'estimateGas',
      );
      const gasWithMargin = (estimatedGas * 130n) / 100n;
      const gasToUse = gasWithMargin > GAS_LIMIT_CREATE_PORRA ? gasWithMargin : GAS_LIMIT_CREATE_PORRA;

      let feeFields = {};
      try {
        const fees = await withTimeout(
          publicClient.estimateFeesPerGas(),
          ESTIMATE_GAS_TIMEOUT_MS,
          'estimateFees',
        );
        if (fees.maxFeePerGas != null && fees.maxPriorityFeePerGas != null) {
          feeFields = {
            maxFeePerGas: fees.maxFeePerGas,
            maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
          };
        }
      } catch {
        /* MetaMask puede rellenar gas si el RPC falla aquí */
      }

      await withTimeout(
        writeContractAsync({
          address: FACTORY_ADDRESS,
          abi: PorraFactoryAbi,
          functionName: 'createPorra',
          args,
          gas: gasToUse,
          chainId,
          ...feeFields,
        }),
        WALLET_PROMPT_TIMEOUT_MS,
        'wallet',
      );
    } catch (err) {
      const raw = err?.message ?? String(err);
      const msg = err?.shortMessage ?? err?.message ?? err?.cause?.message ?? String(err);
      if (raw === 'estimateGas_timeout' || raw === 'estimateFees_timeout') {
        setSubmitError(
          'La red tardó demasiado en responder al simular la transacción. Revisa la conexión, el RPC o cambia de red en MetaMask si no coincide con la de esta dapp.',
        );
        console.error('[Crear porra] Timeout en simulación / fees:', err);
      } else if (raw === 'wallet_timeout') {
        setSubmitError(
          'No hubo respuesta del monedero a tiempo. Comprueba que MetaMask esté desbloqueado, que no haya otra ventana de confirmación abierta y que el navegador no bloquee ventanas emergentes. Luego pulsa «Cancelar envío» o vuelve a intentar.',
        );
        resetWrite();
        console.error('[Crear porra] Timeout esperando al monedero:', err);
      } else if (
        err?.name === 'UserRejectedRequestError' ||
        /user rejected|denied transaction|rejected the request/i.test(msg)
      ) {
        setSubmitError('Firma cancelada o rechazada en el monedero.');
        resetWrite();
        console.error('[Crear porra] Rechazo del usuario:', err);
      } else {
        const data = err?.data ?? err?.cause?.data;
        const reason = data?.args && data.args[0] ? String(data.args[0]) : msg;
        setSubmitError(`El contrato rechaza la llamada (simulación): ${reason}`);
        setRevertReason(reason);
        console.error('[Crear porra] Error en crear porra / simulación:', err);
      }
    } finally {
      setLocalWorking(false);
    }
  };

  // Log completo del error en consola para depuración
  useEffect(() => {
    if (error) {
      console.error('[Crear porra] Error (wallet/simulación):', error);
      console.error('[Crear porra] Error detalles:', {
        name: error?.name,
        message: error?.message,
        shortMessage: error?.shortMessage,
        cause: error?.cause,
        details: error?.details,
      });
    }
  }, [error]);
  useEffect(() => {
    if (receiptError) {
      console.error('[Crear porra] Error (tx minada pero revertida):', receiptError);
      console.error('[Crear porra] Receipt error detalles:', {
        name: receiptError?.name,
        message: receiptError?.message,
        shortMessage: receiptError?.shortMessage,
        cause: receiptError?.cause,
      });
    }
  }, [receiptError]);

  // Obtener el motivo del revert reproduciendo la tx en el mismo bloque
  useEffect(() => {
    if (!isReceiptError || !hash || !publicClient) {
      setRevertReason(null);
      return;
    }
    let cancelled = false;
    setRevertReason(null);
    (async () => {
      try {
        const [tx, receipt] = await Promise.all([
          publicClient.getTransaction({ hash }),
          publicClient.getTransactionReceipt({ hash }),
        ]);
        if (cancelled || !tx || !receipt || receipt.status !== 'reverted') return;
        // Reproducir la llamada en el bloque donde falló para obtener el revert reason
        await publicClient.call({
          to: tx.to,
          data: tx.input,
          account: tx.from,
          blockNumber: receipt.blockNumber,
        });
      } catch (err) {
        if (cancelled) return;
        const msg = err?.shortMessage ?? err?.message ?? err?.cause?.message ?? String(err);
        const data = err?.data ?? err?.cause?.data;
        if (data && typeof data === 'object' && data.args) {
          setRevertReason(data.args[0] ?? msg);
        } else {
          setRevertReason(msg);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [isReceiptError, hash, publicClient]);

  // Cuando la tx se confirma, obtener la dirección de la porra creada desde el evento
  useEffect(() => {
    if (!isSuccess || !hash || createdGameAddress) return;
    const client = publicClient;
    if (!client) return;
    client.getTransactionReceipt({ hash }).then((receipt) => {
      if (receipt?.logs) {
        for (const log of receipt.logs) {
          try {
            const d = decodeEventLog({
              abi: PorraFactoryAbi,
              data: log.data,
              topics: log.topics,
            });
            if (d.eventName === 'PorraCreated' && d.args?.game) {
              setCreatedGameAddress(d.args.game);
              break;
            }
          } catch {
            /* log no decodificable con esta ABI */
          }
        }
      }
    });
  }, [isSuccess, hash, createdGameAddress, publicClient]);

  if (!isConnected) {
    return (
      <div className="page">
        <p>Conecta tu wallet para crear una porra.</p>
      </div>
    );
  }

  if (!FACTORY_ADDRESS) {
    return (
      <div className="page">
        <p>Configura VITE_FACTORY_ADDRESS en .env con la dirección del contrato PorraFactory desplegado.</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="page home create-porra-page">
        <motion.section
          className="home-hero"
          aria-labelledby="create-success-hero-title"
          variants={heroContainer}
          initial="hidden"
          animate="show"
        >
          <motion.p className="home-hero__badge" variants={heroItem}>
            ON CHAIN
          </motion.p>
          <motion.h1 id="create-success-hero-title" className="home-hero__title" variants={heroItem}>
            BuddyBets
          </motion.h1>
          <motion.p className="home-hero__subtitle" variants={heroItem}>
            La porra se ha desplegado correctamente en la red. Comparte el enlace con tu grupo o ábrela para seguir el
            partido.
          </motion.p>
        </motion.section>

        {createdGameAddress && (
          <BettingCountdownCard
            deadlineUnixSec={createdBettingDeadline != null ? Number(createdBettingDeadline) : null}
            chainTimeEst={chainTimeEst}
            expectDeadline
          />
        )}

        {createdGameAddress && (
          <section className="card acceder-porra home-acceder" aria-labelledby="create-success-contract-title">
            <p className="home-hero__badge">Contrato</p>
            <h2 id="create-success-contract-title" className="home-hero__title">
              Dirección del contrato
            </h2>
            <p className="home-hero__subtitle">
              Pégala en el chat o en Inicio → Acceder a una porra por dirección.
            </p>
            <p className="address create-success-contract-address">{createdGameAddress}</p>
          </section>
        )}

        <section className="home-cta" aria-labelledby="create-success-cta-title">
          <div className="home-cta__inner">
            <h2 id="create-success-cta-title" className="home-cta__headline">
              Siguiente paso
            </h2>
            <p className="home-cta__text">
              Abre la porra para apostar o envía la dirección del contrato a quien juegue contigo.
            </p>
            {createdGameAddress ? (
              <Link to={`/porra/${createdGameAddress}`} className="btn btn-primary home-cta__button">
                Abrir esta porra
              </Link>
            ) : (
              <p className="home-cta__hint">Obteniendo la dirección del contrato…</p>
            )}
          </div>
        </section>

        <div className="home-secondary-actions">
          <Link to="/" className="btn btn-outline">
            Volver al inicio
          </Link>
          <Link to="/my-porras" className="btn btn-outline">
            Ver mis porras
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page form-page create-porra-page">
      <h1>Crear porra</h1>
      <form onSubmit={handleSubmit} className="card form">
        {savedMatchesLoading ? (
          <p className="hint">Cargando partidos desde la base de datos…</p>
        ) : savedMatchesError ? (
          <div className="error-box" role="alert">
            <strong>No se pudieron cargar los partidos:</strong> {savedMatchesError}
          </div>
        ) : savedMatches.length > 0 ? (
          <label>
            Partidos disponibles
            <select
              className="create-porra-match-select"
              value={matchIdInput}
              onChange={(e) => setMatchIdInput(e.target.value)}
            >
              {savedMatches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label ? `${m.label} (${m.id})` : m.id}
                </option>
              ))}
            </select>
            <small>
              Los partidos se gestionan en{' '}
              <Link to="/oracle-mock">API deportiva (mock)</Link>
              ; el mismo texto se hashea (keccak256) que al fijar el resultado.
            </small>
          </label>
        ) : (
          <p className="hint">
            No hay partidos guardados. Añádelos en <Link to="/oracle-mock">API deportiva (mock)</Link>.
          </p>
        )}
        <label>
          Minutos hasta fin de apuestas
          <input
            type="number"
            min="1"
            step="1"
            value={bettingDeadlineMinutes}
            onChange={(e) => setBettingDeadlineMinutes(Number(e.target.value))}
          />
          <small>Desde ahora; las apuestas se cierran en ese instante (en cadena).</small>
        </label>
        <label>
          Fin estimado del partido (fecha y hora local)
          <input
            type="datetime-local"
            value={matchEndLocal}
            onChange={(e) => setMatchEndLocal(e.target.value)}
          />
          <small>Esa fecha y hora es la que se guarda en el contrato; hasta entonces no se podrá iniciar la resolución del oráculo.</small>
        </label>
        <label>
          Importe por participante (ETH)
          <input
            type="text"
            inputMode="decimal"
            min="0"
            step="any"
            value={stakeEth}
            onChange={(e) => setStakeEth(e.target.value)}
            placeholder="0.001"
            title={`Cantidad de ETH que cada participante debe apostar (entre 0 y ${MAX_STAKE_ETH})`}
          />
          <small>Entre 0 y {MAX_STAKE_ETH} ETH. Los participantes deberán enviar exactamente esta cantidad para apostar.</small>
        </label>
        <fieldset>
          <legend>Participantes (entre {MIN_PARTICIPANTS} y {MAX_PARTICIPANTS})</legend>
          <small className="create-porra-participants-hint">
            Usa las direcciones de las cuentas de MetaMask que van a apostar (Account 1, Account 2, etc.). Solo esas cuentas podrán hacer placeBet. El mote es el nombre que verás en la pantalla de la porra, junto a la dirección.
          </small>
          {participants.map((row, i) => (
            <div key={i} className="row" style={{ alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ flex: '1 1 220px', margin: 0 }}>
                <input
                  type="text"
                  value={row.address}
                  onChange={(e) => setParticipantAddress(i, e.target.value)}
                  placeholder="Wallet 0x..."
                  aria-label={`Dirección participante ${i + 1}`}
                />
              </label>
              <label style={{ flex: '1 1 160px', margin: 0 }}>
                <input
                  type="text"
                  value={row.nickname}
                  onChange={(e) => setParticipantNickname(i, e.target.value)}
                  placeholder="Mote"
                  maxLength={200}
                  aria-label={`Mote participante ${i + 1}`}
                />
              </label>
              <button type="button" onClick={() => removeParticipant(i)} disabled={participants.length <= MIN_PARTICIPANTS}>
                Quitar
              </button>
            </div>
          ))}
          <button type="button" onClick={addParticipant} disabled={participants.length >= MAX_PARTICIPANTS}>
            Añadir participante
          </button>
        </fieldset>
        <div className="row" style={{ flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={
              showSending ||
              savedMatchesLoading ||
              Boolean(savedMatchesError) ||
              savedMatches.length === 0 ||
              !(Number(stakeEth) > 0 && Number(stakeEth) <= MAX_STAKE_ETH)
            }
          >
            {showSending ? 'Enviando...' : 'Crear porra'}
          </button>
          {(localWorking || isPending || isConfirming || Boolean(hash)) && !isSuccess && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={cancelSubmission}
            >
              Cancelar envío
            </button>
          )}
        </div>
        {hasTxFailure && (
          <p className="hint" style={{ marginTop: '0.5rem' }}>
            Si el mensaje de error ya está aclarado, puedes corregir el formulario y volver a enviar, o usar «Cancelar envío» para limpiar el estado del monedero.
          </p>
        )}
        {submitError && (
          <div className="error-box" role="alert">
            <strong>Validación:</strong> {submitError}
          </div>
        )}
        {(error || receiptError) && (
          <div className="error-box" role="alert" style={{ marginTop: '1rem' }}>
            <strong>Transacción fallida</strong>
            {error && (
              <p style={{ margin: '0.5rem 0 0 0' }}>
                <strong>Dónde:</strong> Wallet o simulación (antes de minar).
                <br />
                <strong>Mensaje:</strong> {error.shortMessage ?? error.message}
              </p>
            )}
            {receiptError && (
              <p style={{ margin: '0.5rem 0 0 0' }}>
                <strong>Dónde:</strong> Contrato (transacción minada pero revertida).
                <br />
                <strong>Mensaje:</strong> {receiptError.shortMessage ?? receiptError.message}
                {revertReason && (
                  <>
                    <br />
                    <strong>Motivo del contrato:</strong> {revertReason}
                  </>
                )}
              </p>
            )}
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9em', opacity: 0.9 }}>
              Revisa: 1) Factory desplegada con la ABI actual (createPorra con array de motes) y VITE_FACTORY_ADDRESS actualizado tras redesplegar.
              2) Direcciones válidas (0x + 40 hex) y sin repetir; un mote por participante.
              3) Si el motivo es "unknown reason", suele ser falta de gas: la app ya envía 5M de gas; si sigue fallando, en MetaMask revisa que no esté limitando el gas.
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

export default CreatePorra;
