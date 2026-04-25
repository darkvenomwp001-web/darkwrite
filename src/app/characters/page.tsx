
"use client"

import React, { Suspense } from 'react'
import { AppShell } from '@/components/writing/app-shell'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus, Loader2 } from 'lucide-react'

function CharactersContent() {
  return (
    <AppShell>
      <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#09090b]">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="flex items-center justify-between pt-8 md:pt-0">
            <div className="space-y-2 text-white">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" /> Character Codex
              </h1>
              <p className="text-muted-foreground italic">Manage profiles across your manuscripts.</p>
            </div>
            <Button className="rounded-xl bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> New Character
            </Button>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/[0.02] border-white/5 border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground italic">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                No active characters in this manuscript folder.
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function CharactersPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[#09090b]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <CharactersContent />
    </Suspense>
  )
}
