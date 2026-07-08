// hooks/useAssetManager.ts
import { useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { getReadIAssetManager } from '@/lib/abiUtils';
import { getAssetManagerAddress } from '@/lib/flareContracts';

export function useAssetManager() {
  const chainId = useChainId();
  const [assetManagerAddress, setAssetManagerAddress] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchAddress = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('Fetching AssetManager address for chain:', chainId);
        const address = await getAssetManagerAddress(chainId);
        console.log('AssetManager address fetched:', address);
        
        if (!cancelled) {
          setAssetManagerAddress(address);
          setError(null);
        }
      } catch (error) {
        console.error('Error fetching AssetManager address:', error);
        if (!cancelled) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch AssetManager address';
          setError(errorMessage);
          setAssetManagerAddress(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAddress();

    return () => {
      cancelled = true;
    };
  }, [chainId]);

  // Only try to read settings if we have the address
  const useReadIAssetManager = getReadIAssetManager(chainId);
  
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: readError,
    refetch: refetchSettings,
  } = useReadIAssetManager({
    address: assetManagerAddress as `0x${string}`,
    functionName: 'getSettings',
    query: {
      enabled: !!assetManagerAddress && !error,
      gcTime: 0,
      staleTime: 0,
      retry: 2,
    },
  });

  useEffect(() => {
    if (readError) {
      console.error('Error reading settings:', readError);
      setError(readError.message);
    } else if (settings) {
      setError(null);
    }
  }, [readError, settings]);

  return {
    assetManagerAddress,
    settings,
    isLoading: isLoading || isLoadingSettings,
    error,
    refetchSettings,
  };
}