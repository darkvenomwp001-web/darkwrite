
"use client"

import React, { useRef } from 'react'
import { Chapter, WritingMode } from '@/lib/types'
import { cn } from '@/lib/utils'
import { 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Type, 
  Sparkles,
  Edit3
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

  if (!activeChapter) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09090b] text-muted-foreground font-ui relative overflow-hidden p-6 text-center">
        <div className="absolute inset-0 bg-radial-at-c from-primary/5 to-transparent pointer-events-none" />
        <div className="space-y-8 max-w-md relative z-10 animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto border border-primary/10 shadow-2xl shadow-primary/5">
            <Edit3 className="w-10 h-10 text-primary/40" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-white/80">Begin Your Story</h2>
            <p className="text-base text-muted-foreground/60 leading-relaxed max-w-xs mx-auto italic">
              "The first sentence is the hardest. After that, the words find their own way."
            </p>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/60">
            Select a chapter in the library to start scribing
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "flex-1 flex flex-col bg-[#09090b] relative overflow-hidden focus-transition min-w-0 transition-all duration-700",
      writingMode === 'focus' ? "px-0" : "px-0"
    )}>
      {/* Editor Header */}
      <header className={cn(
        "h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-12 bg-[#09090b]/90 backdrop-blur-xl z-20 sticky top-0 font-ui transition-all duration-700 shrink-0",
        writingMode === 'focus' && "opacity-0 -translate-y-full pointer-events-none h-0 border-none"
      )}>
        <div className="flex-1 flex items-center gap-2 md:gap-4 min-w-0 md:pl-0 pl-12">
          <input
            value={activeChapter.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="bg-transparent border-none text-lg md:text-2xl font-bold focus:ring-0 outline-none w-full max-w-xl transition-all focus:text-primary tracking-tight truncate text-white"
            placeholder="Chapter Title..."
          />
        </div>
        
        <div className="flex items-center gap-2 md:gap-6 shrink-0 ml-2">
          <div className="flex items-center gap-1 md:gap-3 text-xs md:text-sm font-medium">
            {saving ? (
              <div className="flex items-center gap-2 text-primary/60">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Autosaving...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-500/60">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Saved</span>
              </div>
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleWritingMode}
            className="hover:bg-primary/10 hover:text-primary transition-all rounded-xl h-8 w-8 md:h-10 md:w-10 border border-white/5"
          >
            {writingMode === 'normal' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative px-4 md:px-0 bg-[#09090b]">
        <div className={cn(
          "max-w-3xl mx-auto min-h-full transition-all duration-1000",
          writingMode === 'focus' ? "py-16 md:py-32" : "py-8 md:py-16"
        )}>
          <textarea
            ref={contentRef}
            value={activeChapter.content}
            onChange={(e) => onUpdateContent(e.target.value)}
            className={cn(
              "w-full min-h-[70vh] bg-transparent border-none focus:ring-0 outline-none resize-none text-lg md:text-2xl leading-relaxed writing-mode selection:bg-primary/30 selection:text-white placeholder:text-white/5 text-white/90 font-body",
              writingMode === 'focus' ? "text-white" : "text-white/80"
            )}
            placeholder="Let the words flow..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Editor Footer */}
      <footer className={cn(
        "h-10 border-t border-white/5 flex items-center justify-between px-4 md:px-12 bg-[#09090b] text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground transition-all duration-700 shrink-0",
        writingMode === 'focus' && "opacity-0 translate-y-full pointer-events-none h-0 border-none"
      )}>
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <div className="flex items-center gap-1.5 truncate">
            <Type className="w-2.5 h-2.5 text-primary shrink-0" />
            <span>{wordCount} Words</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 truncate">
            <Sparkles className="w-2.5 h-2.5 text-primary shrink-0" />
            <span>Chapter {activeChapter.order}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <Clock className="w-2.5 h-2.5 shrink-0" />
          <span>
            {activeChapter.lastSaved ? (activeChapter.lastSaved.toDate ? activeChapter.lastSaved.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(activeChapter.lastSaved).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : '--:--'}
          </span>
        </div>
      </footer>
    </div>
  )
}
