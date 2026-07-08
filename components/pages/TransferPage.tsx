// app/transfer/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { 
  ArrowRight, 
  Loader2, 
  Send, 
  RefreshCw, 
  Wallet, 
  Sparkles, 
  Shield, 
  Clock,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useChainId, useWaitForTransactionReceipt } from 'wagmi';
import { z } from 'zod';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAssetManager } from '@/hooks/useAssetManager';
import { useFXRPBalance } from '@/hooks/useFXRPBalance';
import { useFXRPPrice } from '@/hooks/useFXRPPrice';
import { getTypedSettings, getWriteIFAsset } from '@/lib/abiUtils';
import { getExplorerUrl } from '@/lib/utils';
import { formatPrice } from '@/lib/ftsoUtils';
import { cn } from '@/lib/utils';

// Form data types
const SendFXRPFormDataSchema = z.object({
  recipientAddress: z
    .string()
    .min(1, 'Recipient address is required')
    .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Flare address format'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine(
      val => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      'Amount must be a positive number'
    )
    .refine(
      val => parseFloat(val) <= 1000000,
      'Amount cannot exceed 1,000,000'
    ),
});

type SendFXRPFormData = z.infer<typeof SendFXRPFormDataSchema>;

export default function TransferPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const chainId = useChainId();

  const {
    settings: rawSettings,
    isLoading: isLoadingSettings,
    error: assetManagerError,
  } = useAssetManager();

  const settings = getTypedSettings(rawSettings);
  const { fxrpBalance, refetchFxrpBalance, balanceError, isConnected } = useFXRPBalance();
  const { priceData } = useFXRPPrice();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SendFXRPFormData>({
    resolver: zodResolver(SendFXRPFormDataSchema),
    defaultValues: {
      recipientAddress: '',
      amount: '',
    },
  });

  const watchedAmount = watch('amount');
  const watchedRecipient = watch('recipientAddress');

  const amountInUSD = watchedAmount && priceData 
    ? parseFloat(watchedAmount) * priceData.price 
    : 0;

  const {
    data: transferHash,
    mutateAsync: transferContract,
    isPending: isTransferPending,
    error: writeError,
  } = getWriteIFAsset(chainId);

  const { isLoading: isConfirming, isSuccess: isTransferSuccess } =
    useWaitForTransactionReceipt({
      hash: transferHash,
    });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (writeError) {
      console.error('Write contract error:', writeError);
      if (writeError.message.includes('User denied transaction signature') ||
          writeError.message.includes('user rejected')) {
        setError('Transaction was cancelled by the user.');
      } else if (writeError.message.includes('execution reverted')) {
        setError('Transaction failed: Insufficient funds or invalid parameters.');
      } else if (writeError.message.includes('insufficient funds')) {
        setError('Insufficient funds to complete the transaction.');
      } else {
        setError(`Transaction failed: ${writeError.message}`);
      }
    }
  }, [writeError]);

  useEffect(() => {
    if (isTransferSuccess && transferHash) {
      setSuccess(`Successfully sent ${watchedAmount} FXRP`);
      reset();
      refetchFxrpBalance();
    }
  }, [isTransferSuccess, transferHash, watchedAmount, reset, refetchFxrpBalance]);

  const refreshBalances = async () => {
    setIsRefreshing(true);
    try {
      await refetchFxrpBalance();
    } catch (error) {
      console.error('Error refreshing balances:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const setMaxAmount = () => {
    if (fxrpBalance !== null && fxrpBalance !== undefined) {
      const balanceNumber = Number(fxrpBalance);
      if (!isNaN(balanceNumber)) {
        setValue('amount', balanceNumber.toString());
      }
    }
  };

  // Helper function to safely get balance as number
  const getBalanceNumber = (): number | null => {
    if (fxrpBalance === null || fxrpBalance === undefined) return null;
    const balanceNumber = Number(fxrpBalance);
    return isNaN(balanceNumber) ? null : balanceNumber;
  };

  const balanceAsNumber = getBalanceNumber();
  const isAmountValid = watchedAmount && 
    !errors.amount && 
    balanceAsNumber !== null && 
    parseFloat(watchedAmount) <= balanceAsNumber;

  async function transferFXRP(data: SendFXRPFormData) {
    setError(null);
    setSuccess(null);

    try {
      if (!isConnected) throw new Error('Please connect your wallet');
      if (!settings) throw new Error('AssetManager settings not loaded');

      const decimals = Number(settings.assetDecimals);
      const amountInWei = BigInt(
        Math.floor(parseFloat(data.amount) * Math.pow(10, decimals))
      );

      await transferContract({
        address: settings.fAsset as `0x${string}`,
        functionName: 'transfer',
        args: [data.recipientAddress as `0x${string}`, amountInWei],
      });
    } catch (error) {
      console.error('Error transferring FXRP:', error);
      setError(error instanceof Error ? error.message : 'Failed to transfer FXRP');
    }
  }

  const isProcessing = isTransferPending || isConfirming;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Send FXRP
              </h1>
              <p className="text-slate-600 mt-1 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Secure transfer on the Flare Network
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshBalances}
              disabled={isRefreshing}
              className="border-slate-200 hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Main Transfer Card */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                    <Send className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    Transfer Details
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit(transferFXRP)} className="space-y-6">
                  {/* Recipient Address */}
                  <div className="space-y-2">
                    <Label htmlFor="recipientAddress" className="text-slate-700 font-medium">
                      Recipient Address
                    </Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Wallet className="h-4 w-4 text-slate-400" />
                      </div>
                      <Input
                        {...register('recipientAddress')}
                        type="text"
                        placeholder="0x..."
                        className={cn(
                          "pl-10 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50",
                          watchedRecipient && !errors.recipientAddress && "border-green-300"
                        )}
                      />
                    </div>
                    {errors.recipientAddress && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.recipientAddress.message}
                      </p>
                    )}
                    {watchedRecipient && !errors.recipientAddress && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Valid Flare address
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="amount" className="text-slate-700 font-medium">
                        Amount (FXRP)
                      </Label>
                      {balanceAsNumber !== null && (
                        <button
                          type="button"
                          onClick={setMaxAmount}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                        >
                          <Zap className="h-3 w-3" />
                          Max: {balanceAsNumber.toFixed(4)}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">
                        FXRP
                      </div>
                      <Input
                        {...register('amount')}
                        type="number"
                        placeholder="0.00"
                        step="0.000001"
                        className={cn(
                          "pl-16 pr-20 border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50/50 text-lg",
                          watchedAmount && !errors.amount && balanceAsNumber !== null && parseFloat(watchedAmount) <= balanceAsNumber && "border-green-300"
                        )}
                      />
                      {amountInUSD > 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                          ≈ ${formatPrice(amountInUSD)}
                        </div>
                      )}
                    </div>
                    {errors.amount && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.amount.message}
                      </p>
                    )}
                    {watchedAmount && !errors.amount && balanceAsNumber !== null && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">
                          Available: {balanceAsNumber.toFixed(4)} FXRP
                        </span>
                        {parseFloat(watchedAmount) > balanceAsNumber && (
                          <span className="text-red-500 font-medium">Insufficient balance</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Transfer Button */}
                  <Button
                    type="submit"
                    disabled={
                      isProcessing || 
                      !isConnected || 
                      isLoadingSettings ||
                      (balanceAsNumber !== null && watchedAmount !== '' && parseFloat(watchedAmount) > balanceAsNumber)
                    }
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {isTransferPending
                          ? 'Waiting for confirmation...'
                          : isConfirming
                          ? 'Processing transaction...'
                          : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                        <span className="flex items-center gap-2">
                          Send FXRP
                          {watchedAmount && !errors.amount && isAmountValid && (
                            <span className="text-white/70 text-sm font-normal">
                              • {watchedAmount} FXRP
                            </span>
                          )}
                        </span>
                      </>
                    )}
                  </Button>

                  {/* Error and Success */}
                  {(error || assetManagerError || balanceError || writeError) && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-700 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {error ||
                          assetManagerError ||
                          balanceError?.message ||
                          writeError?.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-700">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">{success}</p>
                            {transferHash && chainId && (
                              <div className="mt-2">
                                <span className="text-sm">Transaction: </span>
                                <a
                                  href={getExplorerUrl(chainId, transferHash, 'tx')}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline font-mono text-sm"
                                >
                                  {transferHash.slice(0, 10)}...{transferHash.slice(-8)}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Balance Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-100">Available Balance</span>
                    <Sparkles className="h-4 w-4 text-blue-300" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">
                      {balanceAsNumber !== null ? balanceAsNumber.toFixed(4) : '0.0000'}
                    </div>
                    <div className="text-blue-200 text-sm">
                      FXRP
                      {mounted && priceData && balanceAsNumber !== null && (
                        <span className="block mt-1">
                          ≈ ${formatPrice(balanceAsNumber * priceData.price)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-blue-500/30 space-y-1">
                    <div className="flex justify-between text-sm text-blue-200">
                      <span>Network</span>
                      <span className="font-medium text-white">Flare</span>
                    </div>
                    <div className="flex justify-between text-sm text-blue-200">
                      <span>Status</span>
                      <span className="flex items-center gap-1 text-green-300">
                        <span className="h-2 w-2 bg-green-300 rounded-full animate-pulse" />
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Quick Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">FXRP Price</span>
                    <span className="font-medium text-slate-800">
                      {mounted && priceData ? `$${formatPrice(priceData.price)}` : 'Loading...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Fee</span>
                    <span className="font-medium text-slate-800">~ $0.01</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Processing Time</span>
                    <span className="font-medium text-slate-800">~ 3-5 sec</span>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-start gap-2 text-xs text-slate-500">
                      <Shield className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Your transaction is secured by the Flare Network</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}