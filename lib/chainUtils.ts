// lib/chainUtils.ts
import { flare, flareTestnet, songbird, songbirdTestnet } from 'wagmi/chains';
import * as artifacts from '@flarenetwork/flare-periphery-contract-artifacts';
import type { Chain } from 'viem';

// Coston2 Testnet RPC URL (use public endpoint)
const COSTON2_RPC = 'https://coston2-api.flare.network/ext/bc/C/rpc';

export function getArtifactNetwork(chainId: number) {
  switch (chainId) {
    case 14:
      return artifacts.flare;
    case 114:
      return artifacts.coston2;
    case 19:
      return artifacts.songbird;
    case 16:
      return artifacts.coston;
    default:
      // Default to Coston2
      return artifacts.coston2;
  }
}

export function getChainName(chainId: number): string {
  switch (chainId) {
    case 14:
      return 'Flare Mainnet';
    case 114:
      return 'Coston2 Testnet';
    case 19:
      return 'Songbird';
    case 16:
      return 'Coston Testnet';
    default:
      return `Chain ${chainId}`;
  }
}

export function getExplorerName(chainId: number): string {
  switch (chainId) {
    case 14:
      return 'flare';
    case 114:
      return 'coston2';
    case 19:
      return 'songbird';
    case 16:
      return 'coston';
    default:
      return 'coston2';
  }
}

export function supportsFAssets(chainId: number): boolean {
  return chainId === 14 || chainId === 114;
}

export function getChainById(chainId: number): Chain | null {
  switch (chainId) {
    case 14:
      return flare;
    case 114:
      return flareTestnet;
    case 19:
      return songbird;
    case 16:
      return songbirdTestnet;
    default:
      // Return Coston2 as fallback
      return flareTestnet;
  }
}

// Get the RPC URL for a chain
export function getRpcUrl(chainId: number): string {
  switch (chainId) {
    case 14:
      return 'https://flare-api.flare.network/ext/bc/C/rpc';
    case 114:
      return COSTON2_RPC;
    case 19:
      return 'https://songbird-api.flare.network/ext/bc/C/rpc';
    case 16:
      return 'https://coston-api.flare.network/ext/bc/C/rpc';
    default:
      return COSTON2_RPC;
  }
}