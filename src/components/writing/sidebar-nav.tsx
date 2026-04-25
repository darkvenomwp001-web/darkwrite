
"use client"

import React, { useState } from 'react'
import { 
  Plus, 
  FileText, 
  Trash2, 
  Library, 
  LogOut, 
  User, 
  ChevronRight,
  LayoutDashboard,
  Users,
  Globe,
  GitGraph,
  BarChart3,
  Search as SearchIcon,
  Archive as ArchiveIcon,
  FolderOpen,
  StickyNote,
  Pencil,
  ChevronDown,
  BookOpen,
  Settings2,
  Download
} from 'lucide-react'
import { Story, AppView } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { User as FirebaseUser } from 'firebase/auth'

interface SidebarNavProps {
  stories: Story[];
  storiesLoading?: boolean;
  activeStoryId?: string;
  activeChapterId?: string;
  activeView: AppView;
  onSelectStory: (storyId: string) => void;
  onSelectChapter: (storyId: string, chapterId: string) => void;
  onSelectView: (view: AppView) => void;
  onAddStory: () => void;
  onAddChapter: (storyId: string) => void;
  onDeleteStory: (storyId: string) => void;
  onRenameStory: (storyId: string, newTitle: string) => void;
  user?: FirebaseUser | null;
  onLogout?: () => void;
}

export function SidebarNav({
  stories,
  storiesLoading,
  activeStoryId,
  activeChapterId,
  activeView,
  onSelectStory,
  onSelectChapter,
  onSelectView,
  onAddStory,
  onAddChapter,
  onDeleteStory,
  onRenameStory,
  user,
  onLogout
}: SidebarNavProps) {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [storyToRename, setStoryToRename] = useState<{id: string, title: string} | null>(null);
  const [newStoryTitle, setNewStoryTitle] = useState('');

  const mainNavItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'search', icon: SearchIcon, label: 'Search' },
    { id: 'archive', icon: ArchiveIcon, label: 'Archive' },
  ] as const;

  const projectModules = [
    { id: 'editor', icon: FileText, label: 'Manuscript' },
    { id: 'characters', icon: Users, label: 'Characters' },
    { id: 'world', icon: Globe, label: 'World Atlas' },
    { id: 'plot', icon: GitGraph, label: 'Plot Outline' },
    { id: 'notes', icon: StickyNote, label: 'Note Vault' },
    { id: 'stats', icon: BarChart3, label: 'Statistics' },
    { id: 'export', icon: Download, label: 'Export' },
  ] as const;

  const handleRenameSubmit = () => {
    if (storyToRename && newStoryTitle.trim()) {
      onRenameStory(storyToRename.id, newStoryTitle.trim());
      setRenameDialogOpen(false);
      setStoryToRename(null);
      setNewStoryTitle('');
    }
  };

  return (
    <div className="w-full flex flex-col h-full font-ui overflow-hidden bg-[#09090b] border-r border-white/5 shadow-2xl">
      <div className="p-8 pb-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xl tracking-tighter leading-none truncate text-white">DarkWrite</span>
            <span className="text-[9px] font-bold tracking-widest text-primary uppercase mt-1 truncate">Sanctuary Cloud</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 shrink-0">
        <Button 
          onClick={onAddStory}
          className="w-full h-12 justify-center gap-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl group shadow-lg shadow-primary/20"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="text-sm">New Writing Project</span>
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 py-2">
        <div className="space-y-8">
          <div className="space-y-1">
            <h3 className="px-4 mb-2 text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Navigation</h3>
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-all text-left group",
                  activeView === item.id 
                    ? "bg-primary/10 text-primary font-bold" 
                    : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-3.5 h-3.5 shrink-0 transition-colors", activeView === item.id ? "text-primary" : "text-muted-foreground/50 group-hover:text-foreground")} />
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="h-px w-full bg-white/5 mx-2" />

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-4 text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em] whitespace-nowrap">
              <Library className="w-3 h-3 text-primary shrink-0" />
              Your Library
            </div>
            
            <div className="space-y-2">
              {storiesLoading ? (
                <div className="space-y-2 px-4">
                  <Skeleton className="h-10 w-full rounded-xl opacity-10" />
                  <Skeleton className="h-10 w-full rounded-xl opacity-10" />
                </div>
              ) : stories.length === 0 ? (
                <div className="px-4 py-8 text-center rounded-2xl border border-dashed border-white/5 mx-2">
                  <p className="text-[10px] text-muted-foreground italic">Your library is silent.</p>
                  <Button variant="link" onClick={onAddStory} className="text-[10px] text-primary h-auto p-0 mt-2">Begin your first manuscript</Button>
                </div>
              ) : (
                stories.map((story) => (
                  <div key={story.id} className="group flex flex-col space-y-1 mb-2">
                    <div className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer group/item border border-transparent",
                      activeStoryId === story.id ? "bg-white/[0.05] border-white/5" : "hover:bg-white/[0.02]"
                    )}>
                      <div 
                        className="flex items-center gap-3 overflow-hidden flex-1"
                        onClick={() => onSelectStory(story.id)}
                      >
                        <FolderOpen className={cn("w-4 h-4 shrink-0", activeStoryId === story.id ? "text-primary fill-primary/20" : "text-muted-foreground/40")} />
                        <span className={cn("text-xs font-bold truncate", activeStoryId === story.id ? "text-white" : "text-muted-foreground")}>
                          {story.title}
                        </span>
                        {activeStoryId === story.id ? <ChevronDown className="w-3 h-3 text-muted-foreground/40" /> : <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity text-muted-foreground/40" />}
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => { e.stopPropagation(); onAddChapter(story.id); }}
                          className="h-7 w-7 hover:bg-primary/20 hover:text-primary rounded-lg text-muted-foreground"
                          title="Add Chapter"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-white/5 rounded-lg shrink-0">
                              <Settings2 className="w-3.5 h-3.5 text-muted-foreground/60" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 bg-[#09090b] border-white/5 shadow-2xl p-1.5 rounded-xl">
                            <DropdownMenuItem onClick={() => onAddChapter(story.id)} className="gap-3 cursor-pointer py-2.5 rounded-lg text-white">
                              <Plus className="w-4 h-4 text-primary" /> New Chapter
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setStoryToRename({id: story.id, title: story.title});
                              setNewStoryTitle(story.title);
                              setRenameDialogOpen(true);
                            }} className="gap-3 cursor-pointer py-2.5 rounded-lg text-white">
                              <Pencil className="w-4 h-4 text-primary" /> Rename Folder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem onClick={() => onDeleteStory(story.id)} className="text-red-500 gap-3 cursor-pointer py-2.5 rounded-lg hover:bg-red-500/10">
                              <Trash2 className="w-4 h-4" /> Delete Manuscript
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {activeStoryId === story.id && (
                      <div className="ml-5 mt-1 flex flex-col space-y-1 animate-in slide-in-from-top-1">
                        <div className="flex gap-1 mb-4 overflow-x-auto py-1 custom-scrollbar">
                          {projectModules.map((pItem) => (
                             <button
                               key={pItem.id}
                               title={pItem.label}
                               onClick={() => onSelectView(pItem.id as AppView)}
                               className={cn(
                                 "flex items-center gap-2 px-3 py-2 rounded-lg transition-all border shrink-0",
                                 activeView === pItem.id
                                   ? "bg-primary/20 text-primary border-primary/20"
                                   : "bg-white/[0.01] text-muted-foreground border-transparent hover:bg-white/5"
                               )}
                             >
                               <pItem.icon className="w-3.5 h-3.5" />
                               <span className="text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap">
                                 {pItem.label}
                               </span>
                             </button>
                          ))}
                        </div>

                        <div className="space-y-1 pr-2">
                          <div className="flex items-center justify-between px-2 mb-2">
                            <span className="text-[7px] font-bold text-muted-foreground/60 uppercase tracking-widest">Chapters</span>
                            <button 
                              onClick={() => onAddChapter(story.id)}
                              className="text-primary hover:text-primary/80 transition-colors p-1"
                              title="New Chapter"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          
                          {story.chapters?.map((chapter) => (
                            <button
                              key={chapter.id}
                              onClick={() => onSelectChapter(story.id, chapter.id)}
                              className={cn(
                                "group flex items-center gap-3 px-4 py-2 rounded-xl text-xs transition-all text-left w-full",
                                activeChapterId === chapter.id 
                                  ? "text-primary bg-primary/5 font-bold" 
                                  : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground"
                              )}
                            >
                              <FileText className={cn("w-3.5 h-3.5 shrink-0", activeChapterId === chapter.id ? "text-primary" : "text-muted-foreground/30")} />
                              <span className="truncate flex-1">{chapter.title}</span>
                              <ChevronRight className={cn("w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 shrink-0", activeChapterId === chapter.id && "opacity-100")} />
                            </button>
                          ))}
                          
                          {(!story.chapters || story.chapters.length === 0) && (
                            <div className="px-4 py-4 text-center rounded-xl bg-white/[0.01] border border-dashed border-white/5">
                              <p className="text-[9px] text-muted-foreground/50">No chapters yet.</p>
                              <Button 
                                variant="link" 
                                size="sm" 
                                onClick={() => onAddChapter(story.id)}
                                className="text-[9px] text-primary h-auto p-0 mt-1"
                              >
                                Create first chapter
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 mt-auto shrink-0">
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
                  <p className="text-xs font-bold truncate tracking-tight text-white">{user?.displayName || 'Author'}</p>
                  <p className="text-[8px] text-muted-foreground truncate uppercase font-bold tracking-widest mt-0.5">Secure Session</p>
                </div>
                <Settings2 className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-[#09090b] border-white/5 p-2 shadow-2xl rounded-2xl">
              <div className="px-3 py-2 mb-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Signed in as</p>
                <p className="text-xs font-medium truncate mt-1 text-white">{user?.email || 'Anonymous Session'}</p>
              </div>
              <DropdownMenuSeparator className="bg-white/5" />
              <DropdownMenuItem onClick={onLogout} className="text-red-500 gap-3 py-3 rounded-lg hover:bg-red-500/10 cursor-pointer">
                <LogOut className="w-4 h-4" /> Terminate Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="bg-[#09090b] border-white/5 text-white rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Rename Manuscript Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input 
              value={newStoryTitle} 
              onChange={(e) => setNewStoryTitle(e.target.value)} 
              placeholder="Manuscript title..."
              className="bg-white/[0.02] border-white/10 text-white h-12 rounded-xl focus:ring-primary"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="rounded-xl" onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameSubmit} className="bg-primary text-white hover:bg-primary/90 rounded-xl px-6">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
