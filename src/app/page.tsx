
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KeyRound, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'

const ACCESS_PASSWORD = 'darkwrite2025';

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('dw_authorized');
    if (saved === 'true') {
      router.push('/dashboard');
    }
  }, [router]);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      localStorage.setItem('dw_authorized', 'true');
      toast({ title: "Sanctuary Unlocked", description: "Welcome back, scribe." });
      router.push('/dashboard');
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "The key is incorrect." });
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden p-4">
      <div className="max-w-md w-full p-8 md:p-12 space-y-12 relative z-10 bg-white/[0.01] border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-primary mx-auto flex items-center justify-center shadow-2xl shadow-primary/40 group">
            <Lock className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter text-white">DarkWrite</h1>
            <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-[0.2em] font-medium opacity-60">The Scribe's Sanctuary</p>
          </div>
        </div>

        <form onSubmit={handleUnlock} className="space-y-6">
          <div className="relative group">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Sanctuary Key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 pr-12 h-14 bg-white/[0.03] border-white/10 text-base rounded-2xl text-white focus:border-primary focus:ring-primary"
              autoFocus
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Button size="lg" type="submit" className="w-full h-14 text-base font-bold rounded-2xl shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white transition-all transform hover:scale-[1.02]">
            Access Sanctuary <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
        <p className="text-center text-[9px] uppercase tracking-[0.3em] text-muted-foreground italic opacity-40">"Only the worthy may scribe."</p>
      </div>
    </div>
  );
}
