// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { WagmiProvider } from '@/components/providers/WagmiProvider';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Veri - Secure FAssets on Flare',
  description: 'Transfer and manage FXRP assets securely on the Flare Network',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t border-slate-100 bg-white/50 backdrop-blur-sm py-4">
              <div className="container mx-auto px-4 text-center text-sm text-slate-500">
                <p>© 2026 Veri. Built on Flare Network.</p>
              </div>
            </footer>
          </div>
        </WagmiProvider>
      </body>
    </html>
  );
}