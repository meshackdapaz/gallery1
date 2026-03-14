import { Suspense } from 'react';
import BoothClient from './BoothClient';

export default function BoothPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <BoothClient />
    </Suspense>
  );
}
