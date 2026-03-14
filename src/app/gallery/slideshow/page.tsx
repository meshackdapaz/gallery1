import { Suspense } from 'react';
import SlideshowClient from './SlideshowClient';

export default function SlideshowPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SlideshowClient />
    </Suspense>
  );
}
