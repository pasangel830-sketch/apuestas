import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount, useBalance, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient, useBlockNumber } from 'wagmi';
import { formatEther } from 'viem';
import PorraGameAbi from '../contracts/abi/PorraGame.json';
import WhitelistManagerAbi from '../contracts/abi/WhitelistManager.json';
import { ORACLE_ADDRESS } from '../contracts/addresses';
import { PREDICTION_LABELS, GAME_STATE_LABELS } from '../config';
import { buildWhitelistEntries, playerDisplayLabel } from '../utils/participantLabels';
import { lookupRegisteredMatchByChainId, displayMatchLabel } from '../utils/matchIdLookup';
import { fetchRegisteredMatches } from '../utils/registeredMatches';
import { oracleApiUrl } from '../utils/oracleApi';
import { useChainTimeEstimate } from '../hooks/useChainTimeEstimate';
import BettingCountdownCard from '../components/BettingCountdownCard';
import MatchEndCountdownCard from '../components/MatchEndCountdownCard';

/** 0 local, 1 empate, 2 visitante — alineado con contrato y PREDICTION_LABELS */
const OUTCOME_CHOICES = [
  { prediction: 0, code: '1', line: 'Victoria local' },
  { prediction: 1, code: 'X', line: 'Empate' },
  { prediction: 2, code: '2', line: 'Victoria visitante' },
];

function PorraDetail() {
  const { gameAddress } = useParams();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({ address });
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const readScopeKey = gameAddress;

  const { data: gameState } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'getContractState',
    args: [],
    scopeKey: readScopeKey,
  });
  const { data: totalPot } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'totalPot',
    args: [],
    scopeKey: readScopeKey,
  });
  const { data: whitelistManagerAddr } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'whitelistManager',
    args: [],
  });
  const { data: players } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'getPlayersWhoBet',
    args: [],
    scopeKey: readScopeKey,
  });
  const { data: bets } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'getBets',
    args: [],
    scopeKey: readScopeKey,
  });
  const { data: isWhitelisted } = useReadContract({
    address: whitelistManagerAddr,
    abi: WhitelistManagerAbi,
    functionName: 'isWhitelisted',
    args: address ? [address] : undefined,
  });
  const { data: whitelistedParticipants } = useReadContract({
    address: whitelistManagerAddr,
    abi: WhitelistManagerAbi,
    functionName: 'getParticipants',
    args: [],
  });
  const { data: whitelistedNicknames, isError: nicknamesReadError } = useReadContract({
    address: whitelistManagerAddr,
    abi: WhitelistManagerAbi,
    functionName: 'getNicknames',
    args: [],
    query: {
      enabled: Boolean(whitelistManagerAddr),
      retry: false,
    },
  });
  const { data: hasPlacedBet } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'hasPlacedBet',
    args: address ? [address] : undefined,
    scopeKey: readScopeKey,
  });
  const { data: claimableAmount } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'getClaimableAmount',
    args: address ? [address] : undefined,
    scopeKey: readScopeKey,
  });
  const { data: bettingDeadline } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'bettingDeadline',
    args: [],
  });
  const { data: matchEndTime } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'matchEndTime',
    args: [],
  });
  const { data: finalResult } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'finalResult',
    args: [],
    scopeKey: readScopeKey,
  });
  const { data: matchId } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'matchId',
    args: [],
    scopeKey: readScopeKey,
  });
  const { data: stakeWei } = useReadContract({
    address: gameAddress,
    abi: PorraGameAbi,
    functionName: 'stake',
    args: [],
    scopeKey: readScopeKey,
  });
  const { data: placeBetHash, writeContract: placeBetWrite, isPending: placeBetPending, error: placeBetError } = useWriteContract();
  const { isError: placeBetReceiptError, isSuccess: placeBetSuccess, error: placeBetReceiptErr } = useWaitForTransactionReceipt({ hash: placeBetHash });
  const { data: startResHash, writeContract: startResWrite, isPending: startResPending } = useWriteContract();
  const { data: resolveHash, writeContract: resolveWrite, isPending: resolvePending } = useWriteContract();
  const { data: claimHash, writeContract: claimWrite, isPending: claimPending } = useWriteContract();
  const { isLoading: startResConfirming, isSuccess: startResSuccess } = useWaitForTransactionReceipt({
    hash: startResHash,
  });
  const { isLoading: resolveConfirming, isSuccess: resolveSuccess } = useWaitForTransactionReceipt({ hash: resolveHash });
  const { isLoading: claimConfirming, isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  const queryClient = useQueryClient();
  const publicClient = usePublicClient();
  const lastKnownStateRef = useRef(null);
  const deadlinePassedLatchedRef = useRef(false);
  const lastInvalidatedTxRef = useRef({ placeBet: null, startRes: null, resolve: null, claim: null });
  const fulfillOnceRef = useRef(null);
  const [fulfillMsg, setFulfillMsg] = useState(null);
  const [fulfillErr, setFulfillErr] = useState(null);

  useEffect(() => {
    fulfillOnceRef.current = null;
    lastKnownStateRef.current = null;
    deadlinePassedLatchedRef.current = false;
    lastInvalidatedTxRef.current = { placeBet: null, startRes: null, resolve: null, claim: null };
    setFulfillMsg(null);
    setFulfillErr(null);
  }, [gameAddress]);

  const invalidatePorraContractReads = useCallback(() => {
    if (!gameAddress) return;
    queryClient.invalidateQueries({
      predicate: (q) => {
        const key = q.queryKey;
        if (!Array.isArray(key) || key[0] !== 'readContract' || typeof key[1] !== 'object' || !key[1]) return false;
        const a = key[1].address;
        return a != null && String(a).toLowerCase() === String(gameAddress).toLowerCase();
      },
    });
  }, [gameAddress, queryClient]);

  useEffect(() => {
    if (!gameAddress) return;
    const markAndInvalidate = (slot, success, hash) => {
      if (!success || !hash) return;
      const h = String(hash);
      if (lastInvalidatedTxRef.current[slot] === h) return;
      lastInvalidatedTxRef.current[slot] = h;
      invalidatePorraContractReads();
    };
    markAndInvalidate('placeBet', placeBetSuccess, placeBetHash);
    markAndInvalidate('startRes', startResSuccess, startResHash);
    markAndInvalidate('resolve', resolveSuccess, resolveHash);
    markAndInvalidate('claim', claimSuccess, claimHash);
  }, [
    gameAddress,
    placeBetSuccess,
    placeBetHash,
    startResSuccess,
    startResHash,
    resolveSuccess,
    resolveHash,
    claimSuccess,
    claimHash,
    invalidatePorraContractReads,
  ]);

  useEffect(() => {
    if (!startResSuccess || !startResHash || matchId == null) return;
    const key = `${startResHash}-${String(matchId)}`;
    if (fulfillOnceRef.current === key) return;
    fulfillOnceRef.current = key;
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(oracleApiUrl('/api/oracle/fulfill'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matchIdBytes32: matchId }),
        });
        const j = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (!r.ok) {
          setFulfillErr(j.error || r.statusText);
          return;
        }
        setFulfillMsg(
          'El oráculo mock ha recogido el resultado de la API deportiva. Pulsa «Resolver con oráculo» para cerrar la porra.',
        );
      } catch (e) {
        if (!cancelled) setFulfillErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [startResSuccess, startResHash, matchId]);
  const [registryMatches, setRegistryMatches] = useState([]);
  const loadRegistryMatches = useCallback(async () => {
    try {
      const list = await fetchRegisteredMatches();
      setRegistryMatches(list);
    } catch {
      setRegistryMatches([]);
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

  const registeredMatch = useMemo(
    () => lookupRegisteredMatchByChainId(registryMatches, matchId),
    [registryMatches, matchId],
  );
  const matchLabelText = displayMatchLabel(registeredMatch);

  const chainTimeEst = useChainTimeEstimate(blockNumber, [placeBetHash, startResHash, resolveHash, claimHash]);

  const rawState = gameState ? Number(gameState[0]) : null;
  if (rawState != null && !Number.isNaN(rawState)) lastKnownStateRef.current = rawState;
  const state = rawState ?? lastKnownStateRef.current;
  const isBetting = state === 0;
  const isResolving = state === 1;
  const isClaiming = state === 2 || state === 3;

  const balanceWei = balanceData?.value ?? 0n;
  const stakeWeiBig = stakeWei != null ? (typeof stakeWei === 'bigint' ? stakeWei : BigInt(stakeWei)) : 0n;
  // Solo bloquear por saldo cuando hemos cargado el balance; si balanceData es undefined (p. ej. otra red), no bloquear
  const insufficientBalance = stakeWeiBig > 0n && balanceData != null && balanceWei < stakeWeiBig;
  const deadlinePassed = bettingDeadline != null && chainTimeEst != null && chainTimeEst > Number(bettingDeadline);
  if (deadlinePassed) deadlinePassedLatchedRef.current = true;
  const deadlinePassedLatched = deadlinePassedLatchedRef.current;
  const matchEndTs = matchEndTime != null ? Number(matchEndTime) : null;
  const resolutionAvailable = matchEndTs != null && chainTimeEst != null && chainTimeEst >= matchEndTs;
  const placeBetFailedMessage = placeBetError?.shortMessage ?? placeBetError?.message ?? placeBetReceiptErr?.shortMessage ?? placeBetReceiptErr?.message;

  const nicknameByLower = useMemo(() => {
    if (
      nicknamesReadError ||
      !whitelistedParticipants?.length ||
      !whitelistedNicknames?.length ||
      whitelistedNicknames.length !== whitelistedParticipants.length
    ) {
      return null;
    }
    const m = {};
    whitelistedParticipants.forEach((a, i) => {
      m[String(a).toLowerCase()] = whitelistedNicknames[i];
    });
    return m;
  }, [nicknamesReadError, whitelistedParticipants, whitelistedNicknames]);

  const viewerMote = useMemo(() => {
    if (!address || !nicknameByLower) return null;
    const raw = nicknameByLower[address.toLowerCase()];
    if (raw == null) return null;
    const s = String(raw).trim();
    return s.length ? s : null;
  }, [address, nicknameByLower]);

  const whitelistEntries = useMemo(
    () => buildWhitelistEntries(whitelistedParticipants, whitelistedNicknames, nicknamesReadError),
    [whitelistedParticipants, whitelistedNicknames, nicknamesReadError],
  );
  const whitelistLines = useMemo(
    () =>
      whitelistEntries.map(({ address, nickname }) => (nickname ? `${nickname} (${address})` : address)),
    [whitelistEntries],
  );

  const isFinished = state === 3;
  const winnerAddressesWhenFinished = useMemo(() => {
    if (!isFinished || finalResult === undefined || finalResult === null) return null;
    if (!players?.length || !bets?.length || players.length !== bets.length) return null;
    const fr = Number(finalResult);
    if (Number.isNaN(fr)) return null;
    return players.filter((_, i) => Number(bets[i]) === fr);
  }, [isFinished, finalResult, players, bets]);

  const handlePlaceBet = (prediction) => {
    if (!gameAddress || prediction === undefined || stakeWei == null || stakeWei === undefined) return;
    if (insufficientBalance || deadlinePassedLatched) return;
    const valueWei = typeof stakeWei === 'bigint' ? stakeWei : BigInt(stakeWei);
    if (valueWei <= 0n) return;
    placeBetWrite({
      address: gameAddress,
      abi: PorraGameAbi,
      functionName: 'placeBet',
      args: [prediction],
      value: valueWei,
      gas: 300_000n,
    });
  };

  const handleStartResolution = () => {
    if (!gameAddress) return;
    startResWrite({
      address: gameAddress,
      abi: PorraGameAbi,
      functionName: 'startResolution',
      gas: 200_000n,
    });
  };

  const handleResolveWithOracle = () => {
    if (!gameAddress) return;
    resolveWrite({
      address: gameAddress,
      abi: PorraGameAbi,
      functionName: 'resolveWithOracle',
      gas: 150_000n,
    });
  };

  const handleClaim = () => {
    if (!gameAddress) return;
    claimWrite({
      address: gameAddress,
      abi: PorraGameAbi,
      functionName: 'claimReward',
      gas: 100_000n,
    });
  };

  if (!gameAddress) return <div className="page"><p>Dirección de porra no válida.</p></div>;

  const claimable = claimableAmount !== undefined ? claimableAmount : 0n;
  const canClaim = isClaiming && claimable > 0n;

  return (
    <div className="page home porra-detail">
      <section className="porra-detail-welcome" aria-label="Bienvenida">
        <p className="porra-detail-welcome__text">
          {viewerMote ? (
            <>
              ¡Hola, <span className="porra-detail-welcome__name">{viewerMote}</span>! Te damos la bienvenida. Aquí
              podrás ver todos los detalles de esta porra — partido, fase, bote y participantes — e ir actuando según
              corresponda en cada momento: apostar mientras esté abierta la fase de apuestas, colaborar en la resolución
              o reclamar premios cuando toque.
            </>
          ) : (
            <>
              ¡Hola! Te damos la bienvenida. Aquí podrás ver el detalle de la porra e ir actuando según las distintas
              fases del juego.
              {!isConnected && (
                <>
                  {' '}
                  Conecta tu wallet para que te saludemos por tu mote, el asociado a tu dirección en la lista de esta
                  porra.
                </>
              )}
            </>
          )}
        </p>
      </section>
      <h1>Porra</h1>
      {matchLabelText && (
        <p className="porra-detail-match-label">{matchLabelText}</p>
      )}
      <div className="porra-detail-contract-block">
        <p className="porra-detail-contract-label">Dirección de la porra</p>
        <p className="address porra-detail-contract-address">{gameAddress}</p>
      </div>

      <div className="porra-detail-dashboard" aria-label="Cuadro de mandos de la porra">
        <section className="card porra-detail-summary">
          <header className="porra-detail-summary__head">
            <p className="home-hero__badge">Resumen</p>
            <h2 className="home-hero__title">Estado</h2>
          </header>
          <div
            className="porra-detail-summary__stats"
            role="group"
            aria-label="Fase, bote e importe por apuesta"
          >
            <div className="porra-detail-summary__stat">
              <span className="porra-detail-summary__stat-label">Fase</span>
              <span className="porra-detail-summary__stat-value">
                {state == null ? '—' : (GAME_STATE_LABELS[state] ?? state)}
              </span>
            </div>
            <div className="porra-detail-summary__stat">
              <span className="porra-detail-summary__stat-label">Bote</span>
              <span className="porra-detail-summary__stat-value porra-detail-summary__stat-value--mono">
                {totalPot != null ? `${(Number(totalPot) / 1e18).toFixed(4)} ETH` : '—'}
              </span>
            </div>
            <div className="porra-detail-summary__stat">
              <span className="porra-detail-summary__stat-label">Importe por apuesta</span>
              <span className="porra-detail-summary__stat-value porra-detail-summary__stat-value--mono">
                {stakeWei != null ? `${formatEther(stakeWei)} ETH` : '—'}
              </span>
            </div>
          </div>
          {matchEndTs != null && !isBetting && (
            <>
              <p><strong>Resolución del oráculo (cadena):</strong> desde {new Date(matchEndTs * 1000).toLocaleString()}</p>
              <p className="hint">
                Es el fin estimado del partido que se indicó al crear la porra; hasta entonces no se puede llamar a «Iniciar resolución».
              </p>
            </>
          )}
          {(state === 2 || state === 3) && finalResult !== undefined && (
            <p><strong>Resultado:</strong> {PREDICTION_LABELS[finalResult] ?? finalResult}</p>
          )}
        </section>

        <BettingCountdownCard
          deadlineUnixSec={bettingDeadline != null ? Number(bettingDeadline) : null}
          chainTimeEst={chainTimeEst}
        />
        {(isBetting || isResolving || isClaiming) && matchEndTs != null && (
          <MatchEndCountdownCard
            matchEndUnixSec={matchEndTs}
            chainTimeEst={chainTimeEst}
            showPostMatchHint={isBetting}
          />
        )}

      {isConnected && (
        <section className="card actions">
          <p className="home-hero__badge">ON CHAIN</p>
          <h2 className="home-hero__title">{isFinished ? 'Apuesta finalizada' : 'Apostar y resolver'}</h2>
          {isBetting && isWhitelisted && !hasPlacedBet && (
            <div className="porra-actions-bet">
              <div className="porra-actions-phase-head">
                <span className="porra-actions-phase-label">Tu apuesta</span>
                <h3 className="porra-actions-phase-title">Elige el resultado final</h3>
                <p className="porra-actions-phase-desc">
                  Se enviará una transacción con el importe fijo de la porra por la opción que elijas.
                </p>
              </div>
              <div className="porra-actions-stake" role="status">
                <span className="porra-actions-stake__label">Importe por apuesta</span>
                <span className="porra-actions-stake__value">
                  {stakeWei != null ? `${formatEther(stakeWei)} ETH` : '—'}
                </span>
              </div>
              {deadlinePassedLatched && (
                <div className="error-box" style={{ padding: '0.75rem', marginBottom: '0.75rem' }}>
                  <strong>Ya no puedes apostar en esta porra.</strong> El plazo para hacerlo ha terminado. Si quieres seguir jugando, crea una nueva porra con tiempo de sobra.
                </div>
              )}
              {insufficientBalance && (
                <div className="error-box" style={{ padding: '0.75rem', marginBottom: '0.75rem' }}>
                  <strong>Saldo insuficiente.</strong> Necesitas al menos {stakeWei != null ? formatEther(stakeWei) : '—'} ETH para apostar. Tu saldo: {formatEther(balanceWei)} ETH.
                  <span className="block" style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                    En Anvil: <code>cast send &lt;TU_DIRECCIÓN&gt; --value 5ether --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --rpc-url http://127.0.0.1:8545</code>
                  </span>
                </div>
              )}
              <div className="porra-outcome-grid" role="group" aria-label="Resultado del partido">
                {OUTCOME_CHOICES.map(({ prediction, code, line }) => (
                  <button
                    key={prediction}
                    type="button"
                    className="btn btn-outline porra-outcome-btn"
                    disabled={placeBetPending || stakeWei == null || insufficientBalance || deadlinePassedLatched}
                    onClick={() => handlePlaceBet(prediction)}
                  >
                    <span className="porra-outcome-btn__code">{code}</span>
                    <span className="porra-outcome-btn__line">{line}</span>
                  </button>
                ))}
              </div>
              {(placeBetError || placeBetReceiptError) && placeBetFailedMessage && (
                <div className="error-box" style={{ marginTop: '0.75rem', padding: '0.75rem' }}>
                  <strong>Apuesta fallida:</strong> {placeBetFailedMessage}
                  {(placeBetFailedMessage.includes('deadline') || placeBetFailedMessage.includes('deadline passed')) && (
                    <span className="block" style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                      El periodo de apuestas ya terminó. Crea una nueva porra con fechas futuras o en Anvil retrocede el tiempo con <code>evm_increaseTime</code> negativo.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          {isBetting && isWhitelisted && hasPlacedBet && (
            <p className="porra-actions-notice porra-actions-notice--done">Ya has apostado en esta porra.</p>
          )}
          {isBetting && isWhitelisted === false && (
            <p className="error-box" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
              No estás en la whitelist de esta porra. Solo pueden apostar las direcciones que el creador incluyó al crear la porra.
              {whitelistLines.length > 0 && (
                <span className="block" style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                  Participantes autorizados: {whitelistLines.map((line) => (line.length > 48 ? `${line.slice(0, 48)}…` : line)).join(', ')}
                </span>
              )}
            </p>
          )}

          {isResolving && (
            <div>
              {fulfillErr && (
                <div className="error-box" role="alert" style={{ marginBottom: '0.75rem' }}>
                  <strong>Oráculo (fulfill):</strong> {fulfillErr}
                  <span className="block" style={{ marginTop: '0.5rem', fontSize: '0.9em' }}>
                    Asegúrate de haber publicado el resultado en API deportiva (mock), de tener el servidor{' '}
                    <code>npm run dev</code> con <code>ORACLE_PRIVATE_KEY</code> en <code>frontend/.env</code>, y de que la
                    API responda en <code>/api/oracle/fulfill</code>.
                  </span>
                </div>
              )}
              {fulfillMsg && !fulfillErr && (
                <div className="success" style={{ marginBottom: '0.75rem', padding: '0.75rem' }}>
                  {fulfillMsg}
                </div>
              )}
              <button
                type="button"
                className="btn btn-primary"
                disabled={resolvePending || resolveConfirming}
                onClick={handleResolveWithOracle}
              >
                {resolvePending || resolveConfirming ? 'Resolviendo...' : 'Resolver con oráculo'}
              </button>
            </div>
          )}

          {isBetting && (
            <div className="porra-actions-resolve">
              <div className="porra-actions-phase-head">
                <span className="porra-actions-phase-label">Siguiente paso</span>
                <h3 className="porra-actions-phase-title">Resolución en cadena</h3>
                <p className="porra-actions-phase-desc">
                  Cuando el partido haya terminado (o llegue el fin estimado en la cadena), podrás iniciar la resolución para que el oráculo registre el resultado.
                </p>
              </div>
              {!resolutionAvailable && matchEndTs != null && (
                <p className="hint porra-actions-resolve-hint">
                  Iniciar resolución estará disponible cuando la hora de la cadena llegue al momento indicado arriba (fin estimado del partido).
                </p>
              )}
              <button
                type="button"
                className="btn btn-outline"
                disabled={startResPending || startResConfirming || !resolutionAvailable}
                onClick={handleStartResolution}
              >
                {startResPending || startResConfirming ? 'Enviando...' : 'Iniciar resolución'}
              </button>
            </div>
          )}

          {canClaim && (
            <button
              type="button"
              className="btn btn-primary"
              disabled={claimPending || claimConfirming}
              onClick={handleClaim}
            >
              {claimPending || claimConfirming ? 'Reclamando...' : `Reclamar ${(Number(claimable) / 1e18).toFixed(4)} ETH`}
            </button>
          )}
        </section>
      )}

      <section className="card porra-leaderboard" aria-labelledby="porra-leaderboard-title">
        <p className="home-hero__badge">Clasificación</p>
        <div className="porra-leaderboard__head">
          <h2 id="porra-leaderboard-title" className="home-hero__title">
            Participantes y apuestas
          </h2>
          {players && players.length > 0 && (
            <span className="porra-leaderboard__count">
              {players.length} {players.length === 1 ? 'apuesta' : 'apuestas'}
            </span>
          )}
        </div>
        {isFinished && players && players.length > 0 && winnerAddressesWhenFinished != null && (
          <div className="porra-winners-banner" role="status">
            {winnerAddressesWhenFinished.length > 0 ? (
              <p style={{ marginTop: 0 }}>
                <strong>
                  {winnerAddressesWhenFinished.length === 1 ? 'Ganador' : 'Ganadores'}:
                </strong>{' '}
                {winnerAddressesWhenFinished
                  .map((addr) => playerDisplayLabel(addr, nicknameByLower))
                  .join('; ')}
              </p>
            ) : (
              <p style={{ marginTop: 0 }}>
                <strong>Ningún participante acertó</strong> el resultado final; cada uno puede recuperar su apuesta
                según las reglas del contrato.
              </p>
            )}
          </div>
        )}
        {players && players.length > 0 ? (
          <ul className="porra-leaderboard__list">
            {(players || []).map((addr, i) => {
              const isWinner =
                isFinished &&
                winnerAddressesWhenFinished != null &&
                Number(bets?.[i]) === Number(finalResult);
              const pred = Number(bets?.[i] ?? 0);
              const choice =
                OUTCOME_CHOICES.find((c) => c.prediction === pred) ?? OUTCOME_CHOICES[0];
              const nick = nicknameByLower?.[addr.toLowerCase()];
              const displayName = nick ?? `${addr.slice(0, 6)}…${addr.slice(-4)}`;
              return (
                <li
                  key={addr}
                  className={
                    isWinner
                      ? 'porra-leaderboard__item porra-leaderboard__item--winner'
                      : 'porra-leaderboard__item'
                  }
                >
                  <span className="porra-leaderboard__rank" aria-hidden>
                    {i + 1}
                  </span>
                  <div className="porra-leaderboard__body">
                    <div className="porra-leaderboard__who">
                      <span className="porra-leaderboard__name">{displayName}</span>
                      <span className="porra-leaderboard__addr address copyable" title="Copiar">
                        {addr}
                      </span>
                    </div>
                    <div
                      className={`porra-leaderboard__pick porra-leaderboard__pick--${choice.prediction}`}
                    >
                      <span className="porra-leaderboard__pick-code">{choice.code}</span>
                      <span className="porra-leaderboard__pick-label">
                        {PREDICTION_LABELS[pred] ?? choice.line}
                      </span>
                    </div>
                  </div>
                  {isWinner && (
                    <span className="porra-leaderboard__winner-pill" aria-label="Ganador">
                      Ganador
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="porra-leaderboard__empty">Nadie ha apostado aún.</p>
        )}
      </section>

      <section className="card">
        <p className="home-hero__badge">Whitelist</p>
        <h2 className="home-hero__title">Direcciones que pueden apostar (whitelist)</h2>
        {whitelistedParticipants && whitelistedParticipants.length > 0 ? (
          <ul className="address-list">
            {whitelistEntries.map(({ address, nickname }) => (
              <li key={address} className="address-list__item">
                {nickname ? (
                  <>
                    <span className="address-list__name">{nickname}</span>
                    <span className="address-list__addr" title="Copiar">
                      {address}
                    </span>
                  </>
                ) : (
                  <span className="address-list__addr" title="Copiar">
                    {address}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p>—</p>
        )}
      </section>

      <section className="card info-tecnica">
        <p className="home-hero__badge">Oráculo</p>
        <h2 className="home-hero__title">Datos para resolución (oráculo)</h2>
        <p className="home-hero__subtitle">
          El resultado debe estar publicado en la página <strong>API deportiva (mock)</strong>. Al confirmarse «Iniciar
          resolución», el servidor lee esa API y escribe en el MockOracle (como un nodo Chainlink).
        </p>
        <p><strong>Etiqueta del partido:</strong></p>
        <p style={{ marginTop: '-0.15rem' }}>{matchLabelText ?? '—'}</p>
        <p><strong>Identificador de partido (matchId):</strong></p>
        <p className="address copyable" title="Copiar">{matchId != null ? String(matchId) : '—'}</p>
        <p><strong>Dirección del oráculo:</strong></p>
        <p className="address copyable" title="Copiar">{ORACLE_ADDRESS || '—'}</p>
      </section>
      </div>
    </div>
  );
}

export default PorraDetail;
