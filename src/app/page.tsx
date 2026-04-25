
"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function RootLandingPage() {
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('dw_authorized');
    if (saved === 'true') {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-white flex flex-col font-ui selection:bg-primary/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <header className="container mx-auto px-6 py-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tighter">DarkWrite</span>
        </div>
        <Link href="/darkwritelogin">
          <Button variant="ghost" className="text-sm font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
            Access Sanctuary
          </Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center container mx-auto px-6 relative z-10 text-center">
        <div className="space-y-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-[0.2em] text-primary animate-fade-in">
            <Sparkles className="w-3 h-3" /> The Scribe's Sanctuary
          </div>
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-[0.9] animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Where your <span className="text-primary italic">shadows</span> find their words.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A minimalist, high-fidelity writing environment designed for novelists, storytellers, and dreamers who thrive in the dark.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link href="/darkwritelogin">
              <Button size="lg" className="h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold gap-3 shadow-2xl shadow-primary/20 text-lg">
                Enter the Sanctuary <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Secure Vault</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Your manuscripts are encrypted and stored in a private cloud sanctuary.</p>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">Real-time Sync</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Every keystroke is synchronized instantly across all your scribe devices.</p>
          </div>
          <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">AI Companion</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">A specialized AI trained to refine your prose without losing your voice.</p>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-6 py-12 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground opacity-40">
        &copy; 2025 DarkWrite. Scribe responsibly.
      </footer>
    </div>
  )
}
