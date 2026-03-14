'use client';

import { Suspense } from 'react';
import GalleryClient from './GalleryClient';

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <GalleryClient params={null} />
    </Suspense>
  );
}
