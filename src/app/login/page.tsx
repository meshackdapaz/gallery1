import { login, signup } from './actions'
import { Camera, Mail, Lock, User } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none" />

      <Link href="/" className="absolute top-8 left-8 text-white/50 hover:text-white transition-colors">
        ← Back to Home
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 glass flex items-center justify-center mb-6 mx-auto rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <Camera className="w-8 h-8 text-white/80" />
          </div>
          <h1 className="text-3xl font-light tracking-tight font-serif mb-2">Welcome Back</h1>
          <p className="text-fg-secondary text-sm">Sign in or create an account to host galleries.</p>
        </div>

        <div className="glass-card p-8 rounded-3xl border border-white/10 bg-white/[0.02] shadow-2xl backdrop-blur-md">
          <form className="flex flex-col gap-6">
            
            {error && (
              <div className="bg-rose-500/10 text-rose-500 text-sm p-3 rounded-lg border border-rose-500/20 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-mono" htmlFor="fullName">Full Name (For Signup)</label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all text-white placeholder:text-white/20"
                />
                <User className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-mono" htmlFor="email">Email</label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all text-white placeholder:text-white/20"
                />
                <Mail className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-widest text-white/50 block mb-2 font-mono" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-white/40 transition-all text-white placeholder:text-white/20"
                />
                <Lock className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button formAction={login} className="flex-1 btn-primary py-3 rounded-xl tracking-wide font-medium">
                Log In
              </button>
              <button formAction={signup} className="flex-1 btn-secondary py-3 rounded-xl tracking-wide font-medium">
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
