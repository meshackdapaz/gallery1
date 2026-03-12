import type { Metadata } from 'next';
import './globals.css';
import SplashScreen from '@/components/SplashScreen';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Memorial Gallery',
  description: 'Shared, real-time sanctuary for precious moments.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SplashScreen />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
