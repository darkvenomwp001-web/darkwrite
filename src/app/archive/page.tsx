
"use client"

import React, { Suspense } from 'react'
import { AppShell } from '@/components/writing/app-shell'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Archive, Inbox, Clock, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

function ArchiveContent() {
  return (
    <AppShell>
      <ScrollArea className="flex-1 p-8 md:p-12 bg-[#09090b]">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="space-y-3 pt-8 md:pt-0">
            <div className="flex items-center gap-3">
              <Archive className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold tracking-tighter text-white">Manuscript Archive</h1>
            </div>
            <p className="text-muted-foreground italic">Resting grounds for completed works and retired drafts.</p>
          </header>

          <div className="grid gap-6">
            <Card className="bg-white/[0.02] border-white/5 border-dashed">
              <CardContent className="p-16 text-center space-y-4">
                <Inbox className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground italic">Your archive is currently empty.</p>
                  <p className="text-[10px] text-muted-foreground/40 uppercase tracking-widest font-bold">Archived projects will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <Clock className="w-3 h-3" /> Archive History
            </h3>
            <div className="h-px w-full bg-white/5" />
          </div>
        </div>
      </ScrollArea>
    </AppShell>
  );
}

export default function ArchivePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[#09090b]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <ArchiveContent />
    </Suspense>
  )
}
