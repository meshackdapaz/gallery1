import type { Metadata } from 'next';
import './globals.css';
import SplashScreen from '@/components/SplashScreen';
import Navbar from '@/components/Navbar';
import { InsforgeProvider } from './providers';

export const metadata: Metadata = {
  title: 'Memorial Gallery',
  description: 'Shared, real-time sanctuary for precious moments.',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <InsforgeProvider>
          <SplashScreen />
          <Navbar />
          {children}
          <footer className="relative z-10 py-8 px-6 text-center border-t border-white/5">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold">
              © 2026 DAPAZCM • All Rights Reserved
            </p>
          </footer>
        </InsforgeProvider>
      </body>
    </html>
  );
}
