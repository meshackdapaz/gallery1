import GalleryClient from './GalleryClient';

export function generateStaticParams() {
  return [{ code: 'preview' }];
}

export const dynamicParams = false;

export default async function GalleryPage({ params }: { params: Promise<{ code: string }> }) {
  return <GalleryClient params={params} />;
}
