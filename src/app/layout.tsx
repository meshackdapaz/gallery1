```typescript
import type { Metadata } from 'next';
import type { NextConfig } from 'next'; // Added this import for NextConfig type
import './globals.css';
import SplashScreen from '@/components/SplashScreen';
import Navbar from '@/components/Navbar';
import { InsforgeProvider } from './providers';

export const metadata: Metadata = {
  title: 'Memorial Gallery',
  description: 'Shared, real-time sanctuary for precious moments.',
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
};

// Added the nextConfig object as requested.
// Corrected the malformed 'images' property based on common Next.js config structure.
export const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Assuming this is the intended configuration for images in an 'export' setup.
  },
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
        </InsforgeProvider>
      </body>
    </html>
  );
}
