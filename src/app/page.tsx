"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Story, Chapter, WritingMode, AppView } from '@/lib/types'
import { SidebarNav } from '@/components/writing/sidebar-nav'
import { WritingEditor } from '@/components/writing/writing-editor'
import { AIPanel } from '@/components/writing/ai-panel'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { 
  useAuth, 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase 
} from '@/firebase'
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  orderBy
} from 'firebase/firestore'
import { signInAnonymously, signOut } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { 
  KeyRound, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff, 
  History, 
  TrendingUp, 
  BookOpen, 
  Menu,
  Sparkles,
  PanelLeft,
  Users,
  Globe,
  GitGraph,
  Search,
  Archive,
  StickyNote,
  Plus,
  Wifi,
  BarChart3,
  Download,
  Calendar,
  Zap,
  Target,
  MessageSquare,
  Clock,
  LayoutDashboard,
  Library,
  Timer,
  FileText,
  Type,
  Settings2
} from 'lucide-react'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

const ACCESS_PASSWORD = 'darkwrite2025';

export default function DarkWriteApp() {
  const { toast } = useToast();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const isMobile = useIsMobile();

  const [activeStoryId, setActiveStoryId] = useState<string | undefined>();
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>();
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [saving, setSaving] = useState(false);
  const [writingMode, setWritingMode] = useState<WritingMode>('normal');
  
  // Layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  // Authorization state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Sync sidebar state with mobile detection
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
      setIsAIPanelOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  // Load initial authorization from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dw_authorized');
    if (saved === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  // Automatic anonymous sign-in if authorized
  useEffect(() => {
    if (isAuthorized && !user && !authLoading && !isAuthenticating) {
      setIsAuthenticating(true);
      signInAnonymously(auth)
        .catch((err) => {
          setIsAuthorized(false);
          localStorage.removeItem('dw_authorized');
        })
        .finally(() => setIsAuthenticating(false));
    }
  }, [isAuthorized, user, authLoading, auth, isAuthenticating]);

  // Firestore Data Fetching - REAL TIME LISTENERS
  const storiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'stories'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: storiesData, loading: storiesLoading } = useCollection<Story>(storiesQuery);

  const chaptersQuery = useMemoFirebase(() => {
    if (!firestore || !activeStoryId) return null;
    return query(
      collection(firestore, 'stories', activeStoryId, 'chapters'),
      orderBy('order', 'asc')
    );
  }, [firestore, activeStoryId]);

  const { data: chaptersData } = useCollection<Chapter>(chaptersQuery);

  // Mapped Data for UI
  const stories = useMemo(() => {
    if (!storiesData) return [];
    return storiesData.map(s => ({
      ...s,
      chapters: activeStoryId === s.id ? (chaptersData || []) : []
    }));
  }, [storiesData, chaptersData, activeStoryId]);

  const activeChapter = useMemo(() => {
    if (!chaptersData || !activeChapterId) return null;
    return chaptersData.find(c => c.id === activeChapterId) || null;
  }, [chaptersData, activeChapterId]);

  // Actions
  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      setIsAuthorized(true);
      localStorage.setItem('dw_authorized', 'true');
      toast({ title: "Sanctuary Unlocked", description: "Welcome back, scribe." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "The key is incorrect." });
    }
  };

  const handleUpdateContent = (content: string) => {
    if (!firestore || !activeStoryId || !activeChapterId) return;
    const chapterRef = doc(firestore, 'stories', activeStoryId, 'chapters', activeChapterId);
    setSaving(true);
    updateDoc(chapterRef, { content, lastSaved: serverTimestamp() })
      .then(() => setSaving(false))
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: chapterRef.path, operation: 'update', requestResourceData: { content }
        }));
        setSaving(false);
      });
  };

  const handleUpdateTitle = (title: string) => {
    if (!firestore || !activeStoryId || !activeChapterId) return;
    const chapterRef = doc(firestore, 'stories', activeStoryId, 'chapters', activeChapterId);
    updateDoc(chapterRef, { title, lastSaved: serverTimestamp() })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: chapterRef.path, operation: 'update', requestResourceData: { title }
        }));
      });
  };

  const handleRenameStory = (storyId: string, newTitle: string) => {
    if (!firestore) return;
    const storyRef = doc(firestore, 'stories', storyId);
    updateDoc(storyRef, { title: newTitle })
      .catch((err) => {
        toast({ variant: "destructive", title: "Error", description: "Failed to rename manuscript." });
      });
  };

  const handleAddStory = () => {
    if (!firestore || !user) return;
    const storiesRef = collection(firestore, 'stories');
    addDoc(storiesRef, {
      title: 'New Manuscript',
      userId: user.uid,
      createdAt: serverTimestamp(),
      status: 'active'
    }).then((storyDoc) => {
      // Create first chapter automatically
      const chaptersRef = collection(firestore, 'stories', storyDoc.id, 'chapters');
      addDoc(chaptersRef, {
        title: 'Chapter 1',
        content: '',
        order: 1,
        lastSaved: serverTimestamp()
      }).then((chapDoc) => {
        setActiveStoryId(storyDoc.id);
        setActiveChapterId(chapDoc.id);
        setActiveView('editor');
      });
    }).catch((err) => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create new manuscript." });
    });
  };

  const handleAddChapter = (storyId: string) => {
    if (!firestore) return;
    const chaptersRef = collection(firestore, 'stories', storyId, 'chapters');
    const order = (chaptersData?.length || 0) + 1;
    addDoc(chaptersRef, {
      title: `Chapter ${order}`,
      content: '',
      order,
      lastSaved: serverTimestamp()
    }).then((docRef) => {
      setActiveChapterId(docRef.id);
      setActiveView('editor');
    });
  };

  const handleDeleteStory = (storyId: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, 'stories', storyId));
    if (activeStoryId === storyId) {
      setActiveStoryId(undefined);
      setActiveChapterId(undefined);
      setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setIsAuthorized(false);
    localStorage.removeItem('dw_authorized');
    setPassword('');
  };

  // View Components
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <ScrollArea className="flex-1 p-4 md:p-8 lg:p-12 bg-[#09090b]">
            <div className="max-w-7xl mx-auto space-y-10">
              {/* Header Section */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8 md:pt-0">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
                      <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Sanctuary Node Alpha</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                      <Wifi className="w-2.5 h-2.5 text-green-500" />
                      <span className="text-[10px] font-bold text-green-500 uppercase tracking-[0.2em]">Live Sync</span>
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">Scribe's Dashboard</h1>
                  <p className="text-muted-foreground italic text-sm md:text-base opacity-60">"The scariest moment is always just before you start." — Stephen King</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button onClick={handleAddStory} className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold gap-2 shadow-xl shadow-primary/20">
                    <Plus className="w-4 h-4" /> New Manuscript
                  </Button>
                </div>
              </div>

              {/* Stats Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="bg-white/[0.02] border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <BookOpen className="w-16 h-16" />
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Library className="w-3 h-3" /> Library Size
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold tracking-tighter text-white">{storiesData?.length || 0}</p>
                      <span className="text-xs text-muted-foreground">Volumes</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap className="w-16 h-16" />
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Target className="w-3 h-3" /> Sprint Word Count
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold tracking-tighter text-green-500">2,481</p>
                      <span className="text-xs text-muted-foreground">Words</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Clock className="w-16 h-16" />
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Timer className="w-3 h-3" /> Monthly Velocity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold tracking-tighter text-white">42.5k</p>
                      <span className="text-xs text-muted-foreground">Total</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/[0.02] border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Calendar className="w-16 h-16" />
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <History className="w-3 h-3" /> Writing Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 pt-0">
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold tracking-tighter text-orange-500">12</p>
                      <span className="text-xs text-muted-foreground">Days</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Secondary Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Manuscripts */}
                <div className="lg:col-span-2 space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                    <History className="w-5 h-5 text-primary" /> 
                    Continue Scribing
                  </h2>
                  <div className="grid gap-4">
                    {storiesData?.length === 0 ? (
                      <div className="p-12 text-center rounded-3xl border border-dashed border-white/5 bg-white/[0.01]">
                        <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground italic">Your library is currently silent. Create a manuscript to begin.</p>
                      </div>
                    ) : (
                      storiesData?.slice(0, 4).map(s => (
                        <div 
                          key={s.id} 
                          className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] hover:border-primary/20 transition-all cursor-pointer" 
                          onClick={() => { setActiveStoryId(s.id); setActiveView('editor'); }}
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center border border-white/10 text-muted-foreground group-hover:text-primary transition-colors">
                              <FileText className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{s.title}</h3>
                              <div className="flex items-center gap-4">
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> Modified 2h ago
                                </span>
                                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1">
                                  <Type className="w-3 h-3" /> 1,240 Words
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                              <ArrowRight className="w-5 h-5 text-primary" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Button variant="ghost" className="w-full h-12 rounded-2xl border border-dashed border-white/5 text-muted-foreground hover:bg-white/5 hover:text-white">
                    View Full Library
                  </Button>
                </div>

                {/* AI Inspiration & Quick Actions */}
                <div className="space-y-8">
                  <Card className="bg-primary/5 border-primary/20 rounded-3xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <CardHeader className="p-6">
                      <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-widest">
                        <Zap className="w-4 h-4" /> AI Spark
                      </CardTitle>
                      <CardDescription className="text-xs italic text-muted-foreground mt-2">Daily creative prompt tailored to your style.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <p className="text-sm leading-relaxed text-white/80 border-l-2 border-primary/30 pl-4 py-2 italic bg-white/[0.02] rounded-r-xl">
                        "The protagonist discovers a locked room in their attic that wasn't there yesterday. Inside, they find a mirror that reflects the room as it will look ten years from now."
                      </p>
                      <Button className="w-full mt-6 bg-primary/20 hover:bg-primary/30 text-primary font-bold text-xs uppercase tracking-widest h-10 rounded-xl">
                        Expand with DarkWrite AI
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                      <LayoutDashboard className="w-3 h-3" /> Dashboard Tools
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={() => setActiveView('search')} className="h-20 flex-col gap-2 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 text-muted-foreground hover:text-white">
                        <Search className="w-5 h-5 text-primary/60" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Global Search</span>
                      </Button>
                      <Button variant="outline" onClick={() => setActiveView('stats')} className="h-20 flex-col gap-2 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 text-muted-foreground hover:text-white">
                        <BarChart3 className="w-5 h-5 text-green-500/60" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Analytics</span>
                      </Button>
                      <Button variant="outline" onClick={() => setActiveView('export')} className="h-20 flex-col gap-2 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 text-muted-foreground hover:text-white">
                        <Download className="w-5 h-5 text-orange-500/60" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Export</span>
                      </Button>
                      <Button variant="outline" onClick={() => setActiveView('settings')} className="h-20 flex-col gap-2 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 text-muted-foreground hover:text-white">
                        <Settings2 className="w-5 h-5 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
                      </Button>
                    </div>
                  </div>

                  {/* Feedback Card */}
                  <div className="p-6 rounded-3xl bg-white/[0.01] border border-dashed border-white/10 space-y-3">
                    <p className="text-[10px] text-muted-foreground italic leading-relaxed">
                      Your sanctuary is expanding. New modules for <span className="text-primary">Dialogue Analysis</span> and <span className="text-primary">Character Relationship Mapping</span> are coming soon.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-20" /> {/* Spacer for scroll padding */}
          </ScrollArea>
        );
      case 'editor':
        return (
          <WritingEditor 
            activeChapter={activeChapter}
            onUpdateContent={handleUpdateContent}
            onUpdateTitle={handleUpdateTitle}
            saving={saving}
            writingMode={writingMode}
            onToggleWritingMode={() => setWritingMode(prev => prev === 'normal' ? 'focus' : 'normal')}
          />
        );
      case 'characters':
        return (
          <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-[#09090b]">
            <div className="max-w-4xl mx-auto space-y-8">
              <header className="flex items-center justify-between pt-8 md:pt-0">
                <div className="space-y-2 text-white">
                  <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" /> Character Codex
                  </h1>
                  <p className="text-muted-foreground italic">Sync profiles across your entire writing team.</p>
                </div>
                <Button className="rounded-xl bg-primary hover:bg-primary/90"><Plus className="w-4 h-4 mr-2" /> New Character</Button>
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
        );
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] text-muted-foreground p-6 text-center">
            <Sparkles className="w-12 h-12 opacity-20 mb-6" />
            <h2 className="text-xl font-bold text-white uppercase tracking-widest text-[10px] mb-2">{activeView} Mode</h2>
            <p className="mt-2 text-sm italic max-w-xs text-muted-foreground/60">This module is currently expanding in your sanctuary.</p>
          </div>
        );
    }
  };

  // Loading Screen
  if (authLoading || (isAuthorized && !user && isAuthenticating)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#09090b] gap-6 px-4 text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-bold tracking-[0.3em] text-foreground uppercase animate-pulse">Establishing Secure Sanctuary</p>
      </div>
    );
  }

  // Password Gate
  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden p-4">
        <div className="max-w-md w-full p-8 md:p-12 space-y-12 relative z-10 bg-white/[0.01] border border-white/5 rounded-[2.5rem] backdrop-blur-xl">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-primary mx-auto flex items-center justify-center shadow-2xl shadow-primary/40 group">
              <Lock className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter text-white">DarkWrite</h1>
              <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-[0.2em] font-medium opacity-60">The Scribe's Sanctuary</p>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="space-y-6">
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Sanctuary Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-14 bg-white/[0.03] border-white/10 text-base rounded-2xl text-white focus:border-primary focus:ring-primary"
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button size="lg" type="submit" className="w-full h-14 text-base font-bold rounded-2xl shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90 text-white transition-all transform hover:scale-[1.02]">
              Access Sanctuary <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
          <p className="text-center text-[9px] uppercase tracking-[0.3em] text-muted-foreground italic opacity-40">"Only the worthy may scribe."</p>
        </div>
      </div>
    );
  }

  // Main App Shell
  return (
    <div className="flex h-screen w-screen bg-[#09090b] overflow-hidden font-ui selection:bg-primary/30">
      {/* Desktop Sidebar */}
      {!isMobile && writingMode === 'normal' && (
        <div className={cn("transition-all duration-500 ease-in-out shrink-0", isSidebarOpen ? "w-[22rem]" : "w-0 overflow-hidden")}>
          <SidebarNav 
            stories={stories}
            storiesLoading={storiesLoading}
            activeStoryId={activeStoryId}
            activeChapterId={activeChapterId}
            activeView={activeView}
            onSelectView={setActiveView}
            onSelectStory={setActiveStoryId}
            onSelectChapter={(sid, cid) => {
              setActiveStoryId(sid);
              setActiveChapterId(cid);
              setActiveView('editor');
            }}
            onAddStory={handleAddStory}
            onAddChapter={handleAddChapter}
            onDeleteStory={handleDeleteStory}
            onRenameStory={handleRenameStory}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Mobile Sidebar (Sheet) */}
      {isMobile && writingMode === 'normal' && (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[300px] bg-[#09090b] border-white/5">
            <div className="sr-only">
              <SheetHeader>
                <SheetTitle>DarkWrite Sanctuary Navigation</SheetTitle>
                <SheetDescription>Access your manuscript folders and writing tools.</SheetDescription>
              </SheetHeader>
            </div>
            <SidebarNav 
              stories={stories}
              storiesLoading={storiesLoading}
              activeStoryId={activeStoryId}
              activeChapterId={activeChapterId}
              activeView={activeView}
              onSelectView={(v) => { setActiveView(v); setIsSidebarOpen(false); }}
              onSelectStory={(sid) => { setActiveStoryId(sid); }}
              onSelectChapter={(sid, cid) => {
                setActiveStoryId(sid);
                setActiveChapterId(cid);
                setActiveView('editor');
                setIsSidebarOpen(false);
              }}
              onAddStory={handleAddStory}
              onAddChapter={handleAddChapter}
              onDeleteStory={handleDeleteStory}
              onRenameStory={handleRenameStory}
              user={user}
              onLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
      )}
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-w-0">
        {/* Mobile Sidebar Trigger */}
        {isMobile && writingMode === 'normal' && (
          <div className="absolute top-4 left-4 z-40">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(true)} 
              className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl h-10 w-10 text-white"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Desktop Sidebar Close Button */}
        {!isMobile && writingMode === 'normal' && isSidebarOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(false)} 
            className="absolute top-8 left-8 z-40 hover:bg-white/5 transition-colors"
          >
            <PanelLeft className="w-5 h-5 text-muted-foreground/30" />
          </Button>
        )}
        
        {/* Desktop Sidebar Open Button */}
        {!isMobile && writingMode === 'normal' && !isSidebarOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)} 
            className="absolute top-8 left-8 z-40 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl h-10 w-10 text-white"
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
        )}

        <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
          {renderView()}
          
          {/* Real-time Status */}
          {writingMode === 'normal' && (
            <div className="absolute bottom-6 right-8 z-40 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity pointer-events-none">
              <Wifi className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Real-time Sanctuary Active</span>
            </div>
          )}
        </div>
        
        {/* AI Panel (Desktop) */}
        {!isMobile && writingMode === 'normal' && activeView === 'editor' && isAIPanelOpen && (
          <div className="w-[24rem] shrink-0 relative transition-all duration-500">
             <AIPanel currentText={activeChapter?.content || ''} />
          </div>
        )}
      </main>
      
      <Toaster />
    </div>
  );
}
