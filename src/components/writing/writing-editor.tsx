"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Chapter } from '@/lib/types'
import { cn } from '@/lib/utils'
import { CheckCircle, RefreshCw, Clock, Bold, Italic, List, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WritingEditorProps {
  activeChapter: Chapter | null;
  onUpdateContent: (content: string) => void;
  onUpdateTitle: (title: string) => void;
  saving: boolean;
}

export function WritingEditor({
  activeChapter,
  onUpdateContent,
  onUpdateTitle,
  saving
}: WritingEditorProps) {
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  if (!activeChapter) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background/50 text-muted-foreground font-ui">
        <div className="text-center space-y-4">
          <Type className="w-12 h-12 mx-auto opacity-20" />
          <p className="text-xl">Select a chapter to begin your journey</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
      {/* Editor Header */}
      <header className="h-16 border-b flex items-center justify-between px-8 bg-background/80 backdrop-blur-md z-10 sticky top-0 font-ui">
        <div className="flex-1 flex items-center gap-4">
          <input
            value={activeChapter.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="bg-transparent border-none text-xl font-semibold focus:ring-0 outline-none w-full max-w-lg transition-all focus:text-primary"
            placeholder="Chapter Title..."
          />
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-accent" />
                <span>Saving changes...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>All progress saved</span>
              </>
            )}
          </div>
          <div className="h-4 w-px bg-border mx-2" />
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{activeChapter.lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center gap-1 px-8 py-2 border-b bg-card/30">
        <Button variant="ghost" size="icon" className="h-8 w-8"><Bold className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><Italic className="w-4 h-4" /></Button>
        <Button variant="ghost" size="icon" className="h-8 w-8"><List className="w-4 h-4" /></Button>
        <div className="w-px h-4 bg-border mx-2" />
        <span className="text-xs text-muted-foreground uppercase font-semibold">Word Count: {activeChapter.content.trim().split(/\s+/).length}</span>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto px-8 py-12 scroll-smooth">
        <div className="max-w-3xl mx-auto min-h-full">
          <textarea
            ref={contentRef}
            value={activeChapter.content}
            onChange={(e) => onUpdateContent(e.target.value)}
            className="w-full min-h-screen bg-transparent border-none focus:ring-0 outline-none resize-none text-xl leading-relaxed writing-mode selection:bg-primary/30 selection:text-white"
            placeholder="Once upon a time..."
            spellCheck={false}
          />
        </div>
      </div>
    </div>
  )
}