import { useRef } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useEnsName } from 'wagmi';
import { mainnet } from 'wagmi/chains';

function formatConnectError(error) {
  const msg = (error.shortMessage || error.message || '').toLowerCase();
  if (
    error.code === -32002 ||
    msg.includes('already pending') ||
    msg.includes('recurso no disponible')
  ) {
    return 'MetaMask ya tiene una solicitud abierta para este sitio. Cierra cualquier ventana de MetaMask, espera unos segundos y vuelve a pulsar Conectar.';
  }
  return error.shortMessage || error.message;
}

function ConnectWallet() {
  const connectLock = useRef(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error, reset } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: ensName } = useEnsName({
    address,
    chainId: mainnet.id,
  });

  if (isConnected) {
    return (
      <div className="connect-wallet flex max-w-[min(100%,14rem)] flex-wrap items-center justify-end gap-2 sm:max-w-none sm:flex-nowrap sm:gap-3">
        <span
          className="address font-mono-brand max-w-[9rem] truncate text-sm text-[var(--text-primary)] sm:max-w-[11rem]"
          title={address}
        >
          {ensName || `${address?.slice(0, 6)}...${address?.slice(-4)}`}
        </span>
        <button type="button" onClick={() => disconnect()} className="wallet-outline btn-touch px-4 py-2.5 text-sm font-semibold">
          Desconectar
        </button>
      </div>
    );
  }

  const connector =
    connectors.find((c) => c.name.toLowerCase().includes('metamask')) || connectors[0];

  return (
    <div className="connect-wallet-trigger flex flex-col items-stretch gap-1 sm:items-end">
      <button
        type="button"
        className="cta-metamask btn-touch px-5 py-2.5 text-sm font-semibold whitespace-nowrap"
        disabled={isPending || !connector}
        onClick={() => {
          if (!connector || isPending || connectLock.current) return;
          connectLock.current = true;
          reset();
          connect(
            { connector },
            {
              onSettled: () => {
                connectLock.current = false;
              },
            },
          );
        }}
      >
        {isPending ? 'Conectando...' : 'Conectar MetaMask'}
      </button>
      {error ? (
        <p className="connect-wallet-error hint max-w-[min(100vw-2rem,20rem)] text-xs text-[var(--text-muted)]" role="alert">
          {formatConnectError(error)}
        </p>
      ) : null}
    </div>
  );
}

export default ConnectWallet;
