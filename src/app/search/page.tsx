
"use client"

import React, { useState, Suspense } from 'react'
import { AppShell } from '@/components/writing/app-shell'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, FileText, Users, Globe, BookOpen, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'

function SearchContent() {
  const [query, setQuery] = useState('');

  return (
    <AppShell>
      <ScrollArea className="flex-1 p-8 md:p-12 bg-[#09090b]">
        <div className="max-w-4xl mx-auto space-y-10">
          <header className="space-y-6 pt-8 md:pt-0">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter text-white">Search Sanctuary</h1>
              <p className="text-muted-foreground italic">Query across all manuscripts, characters, and world-building notes.</p>
            </div>

            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for words, themes, or characters..."
                className="h-16 pl-12 bg-white/[0.03] border-white/10 text-lg rounded-2xl text-white focus:border-primary transition-all shadow-2xl"
              />
            </div>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Manuscripts', icon: FileText },
              { label: 'Characters', icon: Users },
              { label: 'Locations', icon: Globe },
              { label: 'Notes', icon: BookOpen },
            ].map((filter) => (
              <button 
                key={filter.label}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-primary/20 transition-all text-center space-y-2 group"
              >
                <filter.icon className="w-5 h-5 mx-auto text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">{filter.label}</span>
              </button>
            ))}
          </div>

          {!query ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.02] flex items-center justify-center mx-auto border border-white/5 opacity-20">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-sm text-muted-foreground italic">Enter a query to begin searching your library.</p>
            </div>
          ) : (
             <div className="space-y-4 animate-fade-in">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2">Results for "{query}"</h3>
                <Card className="bg-white/[0.02] border-white/5">
                  <CardContent className="p-12 text-center text-muted-foreground italic">
                    No results found in the current manuscript vault.
                  </CardContent>
                </Card>
             </div>
          )}
        </div>
      </ScrollArea>
    </AppShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[#09090b]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
