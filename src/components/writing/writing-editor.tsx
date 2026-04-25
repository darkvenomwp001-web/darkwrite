
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

  if (!activeChapter) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09090b] text-muted-foreground font-ui relative overflow-hidden p-6 text-center">
        <div className="absolute inset-0 bg-radial-at-c from-primary/5 to-transparent pointer-events-none" />
        <div className="space-y-6 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-white/[0.02] flex items-center justify-center mx-auto mb-8 border border-white/5">
            <FileText className="w-8 h-8 opacity-20" />
          </div>
          <p className="text-lg md:text-2xl font-light tracking-wide text-foreground/50">Select a chapter to begin</p>
          <p className="text-xs italic opacity-40 leading-relaxed">"The first sentence is the hardest."</p>
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
        "h-20 border-b flex items-center justify-between px-4 md:px-12 bg-[#09090b]/90 backdrop-blur-xl z-20 sticky top-0 font-ui transition-all duration-700 shrink-0",
        writingMode === 'focus' && "opacity-0 -translate-y-full pointer-events-none h-0"
      )}>
        <div className="flex-1 flex items-center gap-2 md:gap-4 min-w-0 md:pl-0 pl-12">
          <input
            value={activeChapter.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="bg-transparent border-none text-lg md:text-2xl font-bold focus:ring-0 outline-none w-full max-w-xl transition-all focus:text-primary tracking-tight truncate"
            placeholder="Title..."
          />
        </div>
        
        <div className="flex items-center gap-2 md:gap-6 shrink-0 ml-2">
          <div className="flex items-center gap-1 md:gap-3 text-xs md:sm font-medium">
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-primary" />
            )}
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleWritingMode}
            className="hover:bg-primary/10 hover:text-primary transition-all rounded-full h-8 w-8 md:h-9 md:w-9"
          >
            {writingMode === 'normal' ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar relative px-4 md:px-0">
        <div className={cn(
          "max-w-3xl mx-auto min-h-full transition-all duration-1000",
          writingMode === 'focus' ? "py-16 md:py-32" : "py-8 md:py-16"
        )}>
          <textarea
            ref={contentRef}
            value={activeChapter.content}
            onChange={(e) => onUpdateContent(e.target.value)}
            className={cn(
              "w-full min-h-[60vh] bg-transparent border-none focus:ring-0 outline-none resize-none text-lg md:text-2xl leading-relaxed writing-mode selection:bg-primary/30 selection:text-white placeholder:text-white/5",
              writingMode === 'focus' ? "text-foreground" : "text-foreground/90"
            )}
            placeholder="Begin your story..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Editor Footer */}
      <footer className={cn(
        "h-10 border-t flex items-center justify-between px-4 md:px-12 bg-[#09090b] text-[8px] md:text-[9px] font-bold tracking-[0.2em] uppercase text-muted-foreground transition-all duration-700 shrink-0",
        writingMode === 'focus' && "opacity-0 translate-y-full pointer-events-none h-0"
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
