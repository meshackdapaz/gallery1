import BoothClient from './BoothClient';

export default function BoothPage({ params }: { params: Promise<{ code: string }> }) {
  return <BoothClient params={params} />;
}
