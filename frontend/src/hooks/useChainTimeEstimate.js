import { useState, useEffect } from 'react';
import { useChainId, usePublicClient } from 'wagmi';

const chainTimeAnchorKey = (chainId, blockNumberStr, blockTs) =>
  `porraChainTimeAnchor:${chainId}:${blockNumberStr}:${blockTs}`;

function loadChainTimeAnchorAtMs(chainId, blockNumberStr, blockTs) {
  try {
    const raw = sessionStorage.getItem(chainTimeAnchorKey(chainId, blockNumberStr, blockTs));
    if (!raw) return null;
    const p = JSON.parse(raw);
    return typeof p?.atMs === 'number' ? p.atMs : null;
  } catch {
    return null;
  }
}

function saveChainTimeAnchorAtMs(chainId, blockNumberStr, blockTs, atMs) {
  try {
    sessionStorage.setItem(chainTimeAnchorKey(chainId, blockNumberStr, blockTs), JSON.stringify({ atMs }));
  } catch {
    /* private mode / quota */
  }
}

/**
 * Estima la hora actual de la cadena (segundos unix) a partir del último bloque y un ancla en reloj local.
 * @param {bigint | undefined} blockNumber — de useBlockNumber({ watch: true }) en la página.
 * @param {unknown[]} extraDeps — p. ej. hashes de tx para re-sincronizar tras confirmaciones.
 */
export function useChainTimeEstimate(blockNumber, extraDeps = []) {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const [chainSync, setChainSync] = useState(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;
    publicClient
      .getBlock({ blockTag: 'latest' })
      .then((b) => {
        if (cancelled) return;
        const ts = Number(b.timestamp);
        const bn = b.number != null ? b.number.toString() : '0';
        let atMs = loadChainTimeAnchorAtMs(chainId, bn, ts);
        if (atMs == null) {
          atMs = Date.now();
          saveChainTimeAnchorAtMs(chainId, bn, ts, atMs);
        }
        setChainSync({ ts, atMs });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [publicClient, chainId, blockNumber, ...extraDeps]);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const chainTimeEst =
    chainSync != null ? chainSync.ts + Math.floor((Date.now() - chainSync.atMs) / 1000) : null;

  return chainTimeEst;
}
