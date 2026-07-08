// app/page.tsx - Updated with proper balance handling

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Send, 
  TrendingUp, 
  Wallet, 
  Shield, 
  Clock, 
  Sparkles,
  Gift,
  Users,
  BarChart3
} from 'lucide-react';
import { useAccount } from 'wagmi';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFXRPBalance } from '@/hooks/useFXRPBalance';
import { useFXRPPrice } from '@/hooks/useFXRPPrice';
import { formatPrice } from '@/lib/ftsoUtils';

export default function Dashboard() {
  const { isConnected } = useAccount();
  const { fxrpBalance } = useFXRPBalance();
  const { priceData } = useFXRPPrice();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Helper function to safely format balance
  const formatBalance = (balance: any): string => {
    if (balance === null || balance === undefined) return '0.0000';
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    if (isNaN(num)) return '0.0000';
    return num.toFixed(4);
  };

  // Helper function to get balance as number
  const getBalanceAsNumber = (balance: any): number => {
    if (balance === null || balance === undefined) return 0;
    const num = typeof balance === 'string' ? parseFloat(balance) : balance;
    return isNaN(num) ? 0 : num;
  };

  const balanceNumber = getBalanceAsNumber(fxrpBalance);
  const formattedBalance = formatBalance(fxrpBalance);
  const totalValue = balanceNumber * (priceData?.price || 0);

  const stats = [
    {
      title: 'Total Balance',
      value: `${formattedBalance} FXRP`,
      subValue: mounted && priceData ? `$${formatPrice(totalValue)}` : 'Loading...',
      icon: Wallet,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'FXRP Price',
      value: priceData ? `$${formatPrice(priceData.price)}` : 'Loading...',
      subValue: 'Live price',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Network Status',
      value: isConnected ? 'Connected' : 'Disconnected',
      subValue: isConnected ? 'Flare Network' : 'Please connect wallet',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const quickActions = [
    {
      title: 'Send FXRP',
      description: 'Transfer FXRP to any address',
      icon: Send,
      href: '/transfer',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'View Settings',
      description: 'Manage asset configurations',
      icon: BarChart3,
      href: '/settings',
      color: 'from-slate-600 to-slate-700',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Transactions',
      description: 'All transactions are secured by the Flare Network',
    },
    {
      icon: Clock,
      title: 'Fast Processing',
      description: 'Transactions complete in seconds',
    },
    {
      icon: Sparkles,
      title: 'Real-time Updates',
      description: 'Live balance and price updates',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Built for the FAssets ecosystem',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to Veri
            </h1>
            <p className="text-slate-600 mt-1">
              Your secure gateway to FAssets on Flare Network
            </p>
          </div>
          {!isConnected && (
            <Button 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              asChild
            >
              <Link href="/transfer">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.subValue}</p>
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-gradient-to-r ${action.color} rounded-xl shadow-lg`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">{action.title}</h3>
                        <p className="text-sm text-slate-500">{action.description}</p>
                      </div>
                      <ArrowRight className="ml-auto h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-600" />
            Why Veri?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => (
              <Card key={feature.title} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl mb-3">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800">{feature.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}