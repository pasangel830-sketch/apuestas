import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { mainnet, sepolia } from 'wagmi/chains';

const isLocal = import.meta.env.DEV && import.meta.env.VITE_USE_LOCAL_CHAIN === 'true';

export const chains = isLocal
  ? [
      {
        id: 31337,
        name: 'Localhost',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: ['http://127.0.0.1:8545'] } },
        blockExplorers: { default: { name: 'None', url: '' } },
      },
    ]
  : [sepolia, mainnet];

export const config = createConfig({
  chains,
  multiInjectedProviderDiscovery: false,
  connectors: [
    injected({
      // Evita wallet_requestPermissions: con MetaMask suele colisionar con otra petición
      // en curso (“already pending”) y deja el botón sin efecto aparente.
      shimDisconnect: false,
    }),
  ],
  transports: {
    ...(isLocal
      ? { 31337: http('http://127.0.0.1:8545') }
      : {
          [sepolia.id]: http(),
          [mainnet.id]: http(),
        }),
  },
});

/** Coincide con PorraGame / MockOracle: 0 local, 1 empate, 2 visitante */
export const PREDICTION_LABELS = {
  0: '1 — Victoria local',
  1: 'X — Empate',
  2: '2 — Victoria visitante',
};

export const GAME_STATE_LABELS = {
  0: 'Apuestas',
  1: 'Resolviendo',
  2: 'Reclamando',
  3: 'Finalizado',
};
