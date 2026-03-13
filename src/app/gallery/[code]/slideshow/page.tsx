import SlideshowClient from './SlideshowClient';

export function generateStaticParams() {
  return [{ code: 'preview' }];
}

export const dynamicParams = false;

export default async function SlideshowPage({ params }: { params: Promise<{ code: string }> }) {
  return <SlideshowClient params={params} />;
}
