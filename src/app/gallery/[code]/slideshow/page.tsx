import SlideshowClient from './SlideshowClient';

export function generateStaticParams() {
  return [];
}

export default async function SlideshowPage({ params }: { params: Promise<{ code: string }> }) {
  return <SlideshowClient params={params} />;
}
