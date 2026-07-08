// wagmi.ts
// lib/wagmi.ts
import { flareTestnet, songbirdTestnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { createConfig, http } from 'wagmi';

export const config = createConfig({
  chains: [flareTestnet, songbirdTestnet],
  connectors: [injected()],
  transports: {
    [flareTestnet.id]: http(), // Coston2 Testnet (Chain ID: 114)
    [songbirdTestnet.id]: http(), // Coston Testnet (Chain ID: 16)
  },
});