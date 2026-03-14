import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import SignupClient from './SignupClient';

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>}>
      <SignupClient />
    </Suspense>
  );
}
