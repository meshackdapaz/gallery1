import BoothClient from './BoothClient';

export function generateStaticParams() {
  return [{ code: 'preview' }];
}

export const dynamicParams = false;

export default function BoothPage({ params }: { params: Promise<{ code: string }> }) {
  return <BoothClient params={params} />;
}
