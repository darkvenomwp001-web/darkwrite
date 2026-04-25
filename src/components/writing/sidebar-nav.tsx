"use client"

import React from 'react'
import { 
  Plus, 
  FileText, 
  Settings, 
  Trash2, 
  Edit3, 
  Library, 
  LogOut, 
  User, 
  ChevronRight,
  LayoutDashboard,
  Users,
  Globe,
  GitGraph,
  BarChart3,
  Search,
  Download,
  Archive,
  FolderOpen
} from 'lucide-react'
import { Story, AppView } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { User as FirebaseUser } from 'firebase/auth'

interface SidebarNavProps {
  stories: Story[];
  activeStoryId?: string;
  activeChapterId?: string;
  activeView: AppView;
  onSelectStory: (storyId: string) => void;
  onSelectChapter: (storyId: string, chapterId: string) => void;
  onSelectView: (view: AppView) => void;
  onAddStory: () => void;
  onAddChapter: (storyId: string) => void;
  onDeleteStory: (storyId: string) => void;
  user?: FirebaseUser | null;
  onLogout?: () => void;
}

export function SidebarNav({
  stories,
  activeStoryId,
  activeChapterId,
  activeView,
  onSelectStory,
  onSelectChapter,
  onSelectView,
  onAddStory,
  onAddChapter,
  onDeleteStory,
  user,
  onLogout
}: SidebarNavProps) {
  
  const mainNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'search', icon: Search, label: 'Global Search' },
    { id: 'stats', icon: BarChart3, label: 'Statistics' },
    { id: 'archive', icon: Archive, label: 'Archive' },
  ] as const;

  const projectNavItems = [
    { id: 'editor', icon: Edit3, label: 'Manuscript' },
    { id: 'characters', icon: Users, label: 'Characters' },
    { id: 'world', icon: Globe, label: 'World Atlas' },
    { id: 'plot', icon: GitGraph, label: 'Plot Outline' },
    { id: 'export', icon: Download, label: 'Export' },
    { id: 'settings', icon: Settings, label: 'Project Settings' },
  ] as const;

  return (
    <div className="w-full flex flex-col h-full font-ui overflow-hidden bg-[#09090b] border-r border-white/5 shadow-2xl">
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <Edit3 className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xl tracking-tighter leading-none truncate">DarkWrite</span>
            <span className="text-[9px] font-bold tracking-widest text-primary uppercase mt-1 truncate">Sanctuary</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <Button 
          onClick={onAddStory}
          variant="outline" 
          className="w-full h-11 justify-start gap-3 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-muted-foreground hover:text-foreground rounded-xl group"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 shrink-0" />
          <span className="text-xs font-semibold truncate">New Writing Project</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-6">
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all text-left group",
                  activeView === item.id 
                    ? "bg-primary/10 text-primary font-bold shadow-sm shadow-primary/5" 
                    : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-4 h-4 shrink-0 transition-colors", activeView === item.id ? "text-primary" : "text-muted-foreground/50 group-hover:text-foreground")} />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-white/5 mx-2" />

          <div>
            <div className="flex items-center gap-3 px-3 mb-4 text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">
              <Library className="w-3 h-3 text-primary shrink-0" />
              Library
            </div>
            
            <div className="space-y-1">
              {stories.length === 0 && (
                <div className="px-4 py-8 text-center rounded-2xl border border-dashed border-white/5">
                  <p className="text-[10px] text-muted-foreground italic">Your library is silent.</p>
                </div>
              )}
              {stories.map((story) => (
                <div key={story.id} className="group flex flex-col space-y-1 mb-2">
                  <div className={cn(
                    "flex items-center justify-between px-4 py-2.5 rounded-xl transition-all cursor-pointer group/item",
                    activeStoryId === story.id ? "bg-white/[0.05]" : "hover:bg-white/[0.02]"
                  )}>
                    <div 
                      className="flex items-center gap-3 overflow-hidden flex-1"
                      onClick={() => {
                        onSelectView('editor');
                        if (activeStoryId !== story.id && story.chapters?.[0]) {
                          onSelectChapter(story.id, story.chapters[0].id);
                        } else {
                          onSelectStory(story.id);
                        }
                      }}
                    >
                      <FolderOpen className={cn("w-4 h-4 shrink-0", activeStoryId === story.id ? "text-primary" : "text-muted-foreground/40")} />
                      <span className={cn("text-sm font-semibold truncate", activeStoryId === story.id ? "text-foreground" : "text-muted-foreground")}>
                        {story.title}
                      </span>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover/item:opacity-100 hover:bg-white/5 shrink-0 transition-opacity">
                          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-[#09090b] border-white/5">
                        <DropdownMenuItem onClick={() => onAddChapter(story.id)} className="gap-3">
                          <Plus className="w-4 h-4" /> New Chapter
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem onClick={() => onDeleteStory(story.id)} className="text-red-500 gap-3">
                          <Trash2 className="w-4 h-4" /> Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {activeStoryId === story.id && (
                    <div className="ml-5 flex flex-col space-y-1 animate-in slide-in-from-top-1">
                      <div className="grid grid-cols-3 gap-1 mb-2 px-1">
                        {projectNavItems.map((pItem) => (
                           <button
                             key={pItem.id}
                             title={pItem.label}
                             onClick={() => onSelectView(pItem.id as AppView)}
                             className={cn(
                               "flex flex-col items-center justify-center gap-1 p-2 rounded-lg transition-all border shrink-0",
                               activeView === pItem.id && activeStoryId === story.id
                                 ? "bg-primary/20 text-primary border-primary/20"
                                 : "bg-white/[0.01] text-muted-foreground border-transparent hover:bg-white/5"
                             )}
                           >
                             <pItem.icon className="w-3.5 h-3.5" />
                             <span className="text-[8px] font-bold uppercase tracking-tighter truncate w-full text-center">
                               {pItem.label.split(' ')[0]}
                             </span>
                           </button>
                        ))}
                      </div>

                      {activeView === 'editor' && story.chapters?.map((chapter) => (
                        <button
                          key={chapter.id}
                          onClick={() => onSelectChapter(story.id, chapter.id)}
                          className={cn(
                            "group flex items-center gap-3 px-4 py-2 rounded-xl text-xs transition-all text-left",
                            activeChapterId === chapter.id 
                              ? "text-primary bg-primary/5 font-bold" 
                              : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground"
                          )}
                        >
                          <FileText className={cn("w-3.5 h-3.5 shrink-0", activeChapterId === chapter.id ? "text-primary" : "text-muted-foreground/30")} />
                          <span className="truncate">{chapter.title}</span>
                          <ChevronRight className={cn("w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 shrink-0", activeChapterId === chapter.id && "opacity-100")} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 mt-auto">
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full text-left group overflow-hidden">
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 overflow-hidden shadow-inner">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    user?.displayName?.charAt(0) || <User className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold truncate tracking-tight">{user?.displayName || 'Author'}</p>
                  <p className="text-[8px] text-muted-foreground truncate uppercase font-bold tracking-widest mt-0.5">Scribe Session</p>
                </div>
                <Settings className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-[#09090b] border-white/5 p-2 shadow-2xl">
              <div className="px-3 py-2 mb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Signed in as</p>
                <p className="text-xs font-medium truncate mt-1">{user?.email || 'Anonymous Session'}</p>
              </div>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={onLogout} className="text-red-500 gap-3 py-3 rounded-lg hover:bg-red-500/10 cursor-pointer">
                <LogOut className="w-4 h-4" /> Terminate Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
