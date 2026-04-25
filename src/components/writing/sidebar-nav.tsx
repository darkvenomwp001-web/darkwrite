"use client"

import React from 'react'
import { FolderOpen, Plus, FileText, ChevronRight, Settings, Trash2, Edit3, Library } from 'lucide-react'
import { Story, Chapter } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface SidebarNavProps {
  stories: Story[];
  activeStoryId?: string;
  activeChapterId?: string;
  onSelectChapter: (storyId: string, chapterId: string) => void;
  onAddStory: () => void;
  onAddChapter: (storyId: string) => void;
  onDeleteStory: (storyId: string) => void;
}

export function SidebarNav({
  stories,
  activeStoryId,
  activeChapterId,
  onSelectChapter,
  onAddStory,
  onAddChapter,
  onDeleteStory
}: SidebarNavProps) {
  return (
    <div className="w-64 border-r bg-card flex flex-col h-full font-ui overflow-hidden shadow-xl">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">DarkWrite</span>
        </div>
      </div>

      <div className="px-4 py-2">
        <Button 
          onClick={onAddStory}
          variant="outline" 
          className="w-full justify-start gap-2 border-dashed border-muted hover:border-primary/50 transition-all text-muted-foreground hover:text-foreground"
        >
          <Plus className="w-4 h-4" />
          New Story
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Library className="w-3 h-3" />
              Your Library
            </div>
            
            <div className="space-y-1">
              {stories.map((story) => (
                <div key={story.id} className="group flex flex-col">
                  <div className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FolderOpen className={cn("w-4 h-4 shrink-0 transition-colors", activeStoryId === story.id ? "text-primary" : "text-muted-foreground")} />
                      <span className="text-sm font-medium truncate">{story.title}</span>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Settings className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onAddChapter(story.id)} className="gap-2">
                          <Plus className="w-3 h-3" /> New Chapter
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDeleteStory(story.id)} className="text-destructive gap-2">
                          <Trash2 className="w-3 h-3" /> Delete Story
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="ml-6 mt-1 space-y-1">
                    {story.chapters.map((chapter) => (
                      <button
                        key={chapter.id}
                        onClick={() => onSelectChapter(story.id, chapter.id)}
                        className={cn(
                          "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all text-left",
                          activeChapterId === chapter.id 
                            ? "bg-primary/20 text-primary font-medium" 
                            : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                        )}
                      >
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{chapter.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <Separator />
      
      <div className="p-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-xs">
            JD
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">Writer Profile</p>
            <p className="text-xs text-muted-foreground truncate">Free Plan</p>
          </div>
        </div>
      </div>
    </div>
  )
}
