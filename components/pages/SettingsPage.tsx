// app/settings/page.tsx
'use client';

import { useState } from 'react';

import {
  Check,
  Copy,
  ExternalLink,
  RefreshCw,
  Settings as SettingsIcon,
  Shield,
  Info,
  Database,
  Coins,
  Globe,
} from 'lucide-react';

import { useChainId } from 'wagmi';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAssetManager } from '@/hooks/useAssetManager';
import { useFXRPPrice } from '@/hooks/useFXRPPrice';
import { useFXRPTokenDetails } from '@/hooks/useFXRPTokenDetails';
import { useMintingCapData } from '@/hooks/useMintingCapData';
import { getTypedSettings } from '@/lib/abiUtils';
import { getExplorerName } from '@/lib/chainUtils';
import { copyToClipboardWithTimeout } from '@/lib/clipboard';
import { formatPrice } from '@/lib/ftsoUtils';
import { truncateAddress } from '@/lib/utils';

export default function SettingsPage() {
  const {
    assetManagerAddress,
    settings: rawSettings,
    isLoading: loading,
    error,
    refetchSettings,
  } = useAssetManager();

  const chainId = useChainId();
  const settings = getTypedSettings(rawSettings);

  const {
    mintingData,
    isLoading: isLoadingMintingCap,
    refetch: refetchMintingCap,
  } = useMintingCapData();

  const { priceData } = useFXRPPrice();
  const {
    fAssetAddress,
    tokenName,
    tokenSymbol,
    tokenDecimals,
    assetName,
    assetSymbol,
  } = useFXRPTokenDetails();
  
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchSettings(), refetchMintingCap()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const isLoading = loading || isRefreshing || isLoadingMintingCap;

  function createExplorerLink(address: string) {
    const isCopied = copiedAddress === address;
    const explorer = chainId ? getExplorerName(chainId) : 'flare';

    return (
      <div className="flex items-center gap-2">
        <a
          href={`https://${explorer}-explorer.flare.network/address/${address}`}
          target="_blank"
          className="text-slate-600 font-mono hover:text-blue-600 transition-colors"
        >
          {truncateAddress(address)}
        </a>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboardWithTimeout(address, setCopiedAddress)}
          className="h-6 w-6 p-0 hover:bg-slate-100 cursor-pointer"
        >
          {isCopied ? (
            <Check className="h-3 w-3 text-green-600" />
          ) : (
            <Copy className="h-3 w-3 text-slate-400" />
          )}
        </Button>
      </div>
    );
  }

  function settingsLabel(title: string, docUrl?: string) {
    if (!docUrl) return title;
    return (
      <a
        href={docUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:text-blue-600 hover:underline transition-colors"
      >
        {title}
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Settings
              </h1>
              <p className="text-slate-600 mt-1 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Asset Manager FXRP Configuration
              </p>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-slate-200 hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Main Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                <SettingsIcon className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-800">
                Configuration Overview
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-6">
              <p className="text-slate-600 text-sm">
                View and manage Asset Manager configuration settings for FXRP operations.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <Alert className="mb-6 border-slate-200 bg-slate-50">
                <AlertDescription className="text-slate-600">
                  Loading AssetManager settings...
                </AlertDescription>
              </Alert>
            )}

            {settings && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Token & Contracts Card */}
                <Card className="border-0 shadow-md bg-white/50">
                  <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                      <Coins className="h-5 w-5 text-blue-600" />
                      FXRP Token & Contracts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-slate-700">
                          {settingsLabel('Asset Manager Controller', 'https://dev.flare.network/fassets/reference/IAssetManagerController')}:
                        </span>
                        <span className="text-right">{createExplorerLink(settings.assetManagerController)}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-slate-700">
                          {settingsLabel('Asset Manager', 'https://dev.flare.network/fassets/reference/IAssetManager')}:
                        </span>
                        <span className="text-right">
                          {assetManagerAddress ? createExplorerLink(assetManagerAddress) : 'Loading...'}
                        </span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-slate-700">
                          {settingsLabel('Agent Owner Registry', 'https://dev.flare.network/fassets/reference/IAgentOwnerRegistry')}:
                        </span>
                        <span className="text-right">{createExplorerLink(settings.agentOwnerRegistry)}</span>
                      </div>
                      
                      <hr className="border-slate-200 my-3" />
                      
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-slate-700">FXRP Token:</span>
                        <span className="text-right">
                          {fAssetAddress ? createExplorerLink(fAssetAddress) : createExplorerLink(settings.fAsset)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-700">Name:</span>
                        <span>{tokenName ?? 'Loading...'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-700">Symbol:</span>
                        <span className="font-mono">{tokenSymbol ?? 'Loading...'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-700">Decimals:</span>
                        <span>{tokenDecimals !== undefined ? tokenDecimals.toString() : 'Loading...'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-700">Underlying Asset:</span>
                        <span>{assetName ? `${assetName} (${assetSymbol})` : 'Loading...'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Minting Cap Card */}
                <Card className="border-0 shadow-md bg-white/50">
                  <CardHeader>
                    <CardTitle className="text-slate-800 flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      Minting Cap 🧢
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-700">Minting Cap AMG:</span>
                        <span className="font-mono">{settings.mintingCapAMG.toString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-700">Minting Cap (FXRP):</span>
                        <span>
                          {(() => {
                            const mintingCap = BigInt(settings.mintingCapAMG) * BigInt(settings.assetMintingGranularityUBA);
                            if (mintingCap === BigInt(0)) return '♾️ Unlimited';
                            const assetDecimals = Number(settings.assetDecimals);
                            const formattedCap = Number(mintingCap) / Math.pow(10, assetDecimals);
                            return formattedCap.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            });
                          })()}
                        </span>
                      </div>
                      {priceData && (
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">Minting Cap (USD):</span>
                          <span>
                            {(() => {
                              const mintingCap = BigInt(settings.mintingCapAMG) * BigInt(settings.assetMintingGranularityUBA);
                              if (mintingCap === BigInt(0)) return '♾️ Unlimited';
                              const assetDecimals = Number(settings.assetDecimals);
                              const fxrpAmount = Number(mintingCap) / Math.pow(10, assetDecimals);
                              const usdValue = fxrpAmount * priceData.price;
                              return formatPrice(usdValue);
                            })()}
                          </span>
                        </div>
                      )}
                      
                      <hr className="border-slate-200 my-3" />
                      
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-700">Total Supply (FXRP):</span>
                        <span>
                          {!mintingData ? 'Loading...' : 
                            mintingData.totalSupplyFXRP.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 6,
                            })
                          }
                        </span>
                      </div>
                      {priceData && mintingData && (
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">Total Supply (USD):</span>
                          <span>{formatPrice(mintingData.totalSupplyFXRP * priceData.price)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-700">Available to Mint (lots):</span>
                        <span>
                          {!mintingData ? 'Loading...' : mintingData.availableToMintLots.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-700">Available to Mint (FXRP):</span>
                        <span>
                          {!mintingData ? 'Loading...' : 
                            mintingData.availableToMintFXRP.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          }
                        </span>
                      </div>
                      {priceData && mintingData && (
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-700">Available to Mint (USD):</span>
                          <span>{formatPrice(mintingData.availableToMintFXRP * priceData.price)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="font-medium text-slate-700">Status:</span>
                        <span>
                          {BigInt(settings.mintingCapAMG) === BigInt(0) ? (
                            <span className="text-green-600 font-semibold flex items-center gap-1">
                              <Check className="h-3 w-3" /> Unlimited
                            </span>
                          ) : (
                            <span className="text-blue-600 font-semibold">Cap Enabled</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}