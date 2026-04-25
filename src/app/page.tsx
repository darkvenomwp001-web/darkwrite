
"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/firebase'
import { Loader2 } from 'lucide-react'

export default function RootLandingPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/darkwritelogin');
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen w-full bg-[#09090b] flex flex-col items-center justify-center gap-6">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="text-[10px] font-bold tracking-[0.3em] text-foreground uppercase animate-pulse">Establishing Secure Sanctuary</p>
    </div>
  )
}
