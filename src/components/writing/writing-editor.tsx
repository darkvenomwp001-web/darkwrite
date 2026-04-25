
"use client"

import React, { useRef, useEffect } from 'react'
import { Chapter, WritingMode } from '@/lib/types'
import { cn } from '@/lib/utils'
import { 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Type, 
  FileText,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WritingEditorProps {
  activeChapter: Chapter | null;
  onUpdateContent: (content: string) => void;
  onUpdateTitle: (title: string) => void;
  saving: boolean;
  writingMode: WritingMode;
  onToggleWritingMode: () => void;
}

export function WritingEditor({
  activeChapter,
  onUpdateContent,
  onUpdateTitle,
  saving,
  writingMode,
  onToggleWritingMode
}: WritingEditorProps) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  // Word count calculation
  const wordCount = activeChapter?.content?.trim() ? activeChapter.content.trim().split(/\s+/).length : 0;

  useEffect(() => {
    // Auto-focus on chapter switch
    if (activeChapter && contentRef.current) {
      // contentRef.current.focus();
    }
  }, [activeChapter?.id]);

  if (!activeChapter) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09090b] text-muted-foreground font-ui relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-at-c from-primary/5 to-transparent pointer-events-none" />
        <div className="text-center space-y-6 max-w-sm animate-in fade-in zoom-in duration-1000 px-6">
          <div className="w-20 h-20 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-8 border border-white/5">
            <FileText className="w-10 h-10 opacity-20" />
          </div>
          <p className="text-xl md:text-2xl font-light tracking-wide text-foreground/50">Select a chapter to begin your journey</p>
          <p className="text-xs md:text-sm italic opacity-40 leading-relaxed">"The first sentence is the hardest, but every journey starts with a single stroke of ink."</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex-1 flex flex-col bg-[#09090b] relative overflow-hidden focus-transition min-w-0",
      writingMode === 'focus' ? "px-0" : "px-0"
    )}>
      {/* Editor Header */}
      <header className={cn(
        "h-20 border-b flex items-center justify-between px-6 md:px-12 bg-[#09090b]/90 backdrop-blur-xl z-20 sticky top-0 font-ui transition-all duration-700 shrink-0",
        writingMode === 'focus' && "opacity-0 -translate-y-full pointer-events-none h-0"
      )}>
        <div className="flex-1 flex items-center gap-4 min-w-0">
          <input
            value={activeChapter.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="bg-transparent border-none text-xl md:text-2xl font-bold focus:ring-0 outline-none w-full max-w-xl transition-all focus:text-primary tracking-tight truncate"
            placeholder="Chapter Title..."
          />
        </div>
        
        <div className="flex items-center gap-4 md:gap-6 shrink-0 ml-4">
          <div className="flex items-center gap-2 md:gap-3 text-sm font-medium">
            {saving ? (
              <div className="flex items-center gap-2 text-primary animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                <span className="tracking-widest uppercase text-[9px] hidden sm:inline">Syncing</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <span className="tracking-widest uppercase text-[9px] hidden sm:inline">Saved</span>
              </div>
            )}
          </div>
          
          <div className="h-6 w-px bg-white/10 hidden sm:block" />
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleWritingMode}
            className="hover:bg-primary/10 hover:text-primary transition-all rounded-full h-9 w-9"
            title="Toggle Focus Mode"
          >
            {writingMode === 'normal' ? <Maximize2 className="w-4 h-4 md:w-5 h-5" /> : <Minimize2 className="w-4 h-4 md:w-5 h-5" />}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative px-6 md:px-0">
        {/* Floating Focus Mode Toggle for when header is hidden */}
        {writingMode === 'focus' && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleWritingMode}
            className="fixed top-8 right-8 z-50 opacity-20 hover:opacity-100 transition-opacity rounded-full bg-background/50 backdrop-blur-md border border-white/5 h-10 w-10"
          >
            <Minimize2 className="w-5 h-5" />
          </Button>
        )}

        <div className={cn(
          "max-w-3xl mx-auto min-h-full transition-all duration-1000",
          writingMode === 'focus' ? "py-24 md:py-32" : "py-12 md:py-16"
        )}>
          <textarea
            ref={contentRef}
            value={activeChapter.content}
            onChange={(e) => onUpdateContent(e.target.value)}
            className={cn(
              "w-full min-h-[70vh] bg-transparent border-none focus:ring-0 outline-none resize-none text-xl md:text-2xl leading-relaxed writing-mode selection:bg-primary/30 selection:text-white placeholder:text-white/5",
              writingMode === 'focus' ? "text-foreground" : "text-foreground/90"
            )}
            placeholder="Begin your story here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Editor Footer / Info Bar */}
      <footer className={cn(
        "h-12 border-t flex items-center justify-between px-6 md:px-12 bg-[#09090b] text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground transition-all duration-700 shrink-0",
        writingMode === 'focus' && "opacity-0 translate-y-full pointer-events-none h-0"
      )}>
        <div className="flex items-center gap-4 md:gap-6 min-w-0">
          <div className="flex items-center gap-2 truncate">
            <Type className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">Words: {wordCount}</span>
          </div>
          <div className="flex items-center gap-2 truncate hidden sm:flex">
            <Sparkles className="w-3 h-3 text-primary shrink-0" />
            <span className="truncate">Chapter {activeChapter.order}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Clock className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {activeChapter.lastSaved ? (activeChapter.lastSaved.toDate ? activeChapter.lastSaved.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(activeChapter.lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : '--:--'}
          </span>
        </div>
      </footer>
    </div>
  )
}
