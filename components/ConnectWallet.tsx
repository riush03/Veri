// components/ConnectWallet.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

import { ChevronDown, Copy, ExternalLink, LogOut, Wallet, Shield, Check } from 'lucide-react';

import { useAccount, useChainId, useConnect, useDisconnect } from 'wagmi';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { getChainName } from '@/lib/chainUtils';
import { copyToClipboard } from '@/lib/clipboard';
import { getExplorerUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { connect, connectors, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [showMenu, setShowMenu] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        showMenu
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleCopyAddress = async () => {
    if (address) {
      await copyToClipboard(address);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowMenu(false);
  };

  const handleConnect = (connector: (typeof connectors)[number]) => {
    connect({ connector });
    setShowConnectDialog(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!mounted) {
    return null;
  }

  if (!isConnected) {
    return (
      <>
        <Button
          onClick={() => setShowConnectDialog(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          <Wallet className="h-5 w-5 mr-2" />
          Connect Wallet
        </Button>

        <AlertDialog
          open={showConnectDialog}
          onOpenChange={setShowConnectDialog}
        >
          <AlertDialogContent className="border-0 shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Connect Your Wallet
              </AlertDialogTitle>
              <AlertDialogDescription className="text-slate-600">
                Choose a wallet to connect to Veri
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3 py-4">
              {connectors.map(connector => (
                <Button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  className="w-full justify-start text-lg h-14 border-2 hover:border-blue-400 hover:bg-blue-50/50 transition-all"
                  variant="outline"
                >
                  <Wallet className="h-5 w-5 mr-3 text-blue-600" />
                  {connector.name}
                </Button>
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <span className="text-red-500">⚠</span>
                Error: {error.message}
              </p>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel className="hover:bg-slate-100">Cancel</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        onClick={() => setShowMenu(!showMenu)}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span>{formatAddress(address!)}</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </Button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
          <div className="p-4 space-y-3">
            {/* Network Info */}
            {chainId && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-slate-600 mb-1">Network</p>
                <p className="font-semibold text-blue-900 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {getChainName(chainId)}
                </p>
              </div>
            )}

            {/* Address Info */}
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
              <p className="text-xs text-slate-600 mb-2">Your Address</p>
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-slate-900">
                  {formatAddress(address!)}
                </code>
                <div className="flex gap-1">
                  <button
                    onClick={handleCopyAddress}
                    className="p-2 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                    title="Copy address"
                  >
                    {copySuccess ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-600" />
                    )}
                  </button>
                  {chainId && (
                    <a
                      href={getExplorerUrl(chainId, address!, 'address')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-slate-200 rounded-md transition-colors"
                      title="View on explorer"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-600" />
                    </a>
                  )}
                </div>
              </div>
              {copySuccess && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Address copied to clipboard
                </p>
              )}
            </div>

            {/* Disconnect Button */}
            <Button
              onClick={handleDisconnect}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect Wallet
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}