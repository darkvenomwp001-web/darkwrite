
"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth, useUser } from '@/firebase'
import { signInAnonymously } from 'firebase/auth'
import { KeyRound, Lock, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react'

const ACCESS_PASSWORD = '08172004';

export default function DarkWriteLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isVerifying || !auth) return;

    if (password !== ACCESS_PASSWORD) {
      toast({ 
        variant: "destructive", 
        title: "Invalid Access Key", 
        description: "The sanctuary remains closed to the unauthorized." 
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      await signInAnonymously(auth);
      toast({ 
        title: "Sanctuary Unlocked", 
        description: "Welcome back, scribe. Your manuscripts are ready." 
      });
      router.push('/dashboard');
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Connection Error", 
        description: "Failed to establish a secure handshake with the sanctuary." 
      });
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden p-6 font-ui">
      {/* Dynamic Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-primary/5 blur-[120px] rounded-full opacity-60" />
        <div className="absolute -top-[20%] -right-[20%] w-[60%] h-[60%] bg-primary/10 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-md w-full p-10 md:p-14 space-y-12 relative z-10 bg-white/[0.01] border border-white/5 rounded-[3.5rem] backdrop-blur-3xl shadow-[0_32px_128px_-32px_rgba(0,0,0,0.8)] border-t-white/10">
        <div className="text-center space-y-6">
          <div className="w-24 h-24 rounded-[2rem] bg-primary mx-auto flex items-center justify-center shadow-2xl shadow-primary/40 group relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
             <Lock className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-500 relative z-10" />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tighter text-white">Access Sanctuary</h1>
            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-bold opacity-40">DarkWrite Security Terminal</p>
          </div>
        </div>

        <form onSubmit={handleUnlock} className="space-y-8">
          <div className="space-y-2">
            <div className="relative group">
              <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Secure Access Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-14 pr-14 h-18 bg-white/[0.03] border-white/10 text-lg rounded-[1.5rem] text-white focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-white/10"
                autoFocus
                disabled={isVerifying}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button 
            size="lg" 
            type="submit" 
            disabled={isVerifying}
            className="w-full h-18 text-lg font-bold rounded-[1.5rem] shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white transition-all transform active:scale-[0.98] group"
          >
            {isVerifying ? (
              <span className="flex items-center gap-3">
                Verifying Credentials <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Unlock Sanctuary <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/5 border border-green-500/10">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            <span className="text-[9px] font-bold text-green-500 uppercase tracking-widest">End-to-End Encryption Active</span>
          </div>
          <p className="text-center text-[9px] uppercase tracking-[0.4em] text-muted-foreground italic opacity-20">"The silence is yours to break."</p>
        </div>
      </div>
    </div>
  );
}
