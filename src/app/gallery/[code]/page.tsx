import GalleryClient from './GalleryClient';

export function generateStaticParams() {
  return [];
}

export default async function GalleryPage({ params }: { params: Promise<{ code: string }> }) {
  return <GalleryClient params={params} />;
}
