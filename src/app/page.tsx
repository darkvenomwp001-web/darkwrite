
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
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
  PanelRight
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

  // Firestore Data Fetching
  const storiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'stories'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: storiesData } = useCollection<Story>(storiesQuery);

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
      toast({ variant: "destructive", title: "Access Denied", description: "The path remains closed." });
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

  const handleAddStory = () => {
    if (!firestore || !user) return;
    const storiesRef = collection(firestore, 'stories');
    addDoc(storiesRef, {
      title: 'New Manuscript',
      userId: user.uid,
      createdAt: serverTimestamp(),
      status: 'active'
    }).then((storyDoc) => {
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
          <ScrollArea className="flex-1 p-4 md:p-12 bg-[#09090b]">
            <div className="max-w-5xl mx-auto space-y-8 md:space-y-12">
              <div className="space-y-4 pt-8 md:pt-0">
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground italic text-sm md:text-base">"Your story is waiting to be written."</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Card className="bg-white/[0.02] border-white/5">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <BookOpen className="w-3 h-3" /> Manuscripts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <p className="text-3xl md:text-5xl font-bold tracking-tighter">{storiesData?.length || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/[0.02] border-white/5">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <TrendingUp className="w-3 h-3" /> Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <p className="text-3xl md:text-5xl font-bold tracking-tighter text-green-500/80">+2.4k</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4 md:space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-3">
                  <History className="w-5 h-5 text-primary" /> 
                  Continue Writing
                </h2>
                <div className="grid gap-3">
                  {storiesData?.slice(0, 3).map(s => (
                    <div 
                      key={s.id} 
                      className="p-4 md:p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all cursor-pointer" 
                      onClick={() => { setActiveStoryId(s.id); setActiveView('editor'); }}
                    >
                      <div className="space-y-1 overflow-hidden pr-4">
                        <h3 className="font-bold text-base md:text-xl truncate">{s.title}</h3>
                        <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Active Recently</p>
                      </div>
                      <ArrowRight className="w-5 h-5 shrink-0 text-muted-foreground group-hover:text-primary transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] text-muted-foreground p-6 text-center">
            <Sparkles className="w-12 h-12 opacity-20 mb-6" />
            <h2 className="text-xl font-bold text-foreground/80">{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h2>
            <p className="mt-2 text-sm italic max-w-xs">Expanding the sanctuary. This feature will arrive in a future update.</p>
          </div>
        );
    }
  };

  // Loading Screen
  if (authLoading || (isAuthorized && !user && isAuthenticating)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#09090b] gap-6 px-4 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-medium tracking-widest text-foreground uppercase animate-pulse">Opening the Sanctuary</p>
      </div>
    );
  }

  // Password Gate
  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden p-4">
        <div className="max-w-md w-full p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 bg-white/[0.01] border border-white/5 rounded-3xl backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary mx-auto flex items-center justify-center shadow-2xl shadow-primary/30">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter">DarkWrite</h1>
            <p className="text-muted-foreground text-xs md:text-sm">A private sanctuary for the dedicated scribe.</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Sanctuary Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-12 bg-card/50 border-border/50 text-base rounded-xl"
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button size="lg" type="submit" className="w-full h-12 text-base font-bold rounded-xl">
              Unlock <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
          <p className="text-center text-[9px] uppercase tracking-[0.2em] text-muted-foreground italic">"Only the worthy may scribe."</p>
        </div>
      </div>
    );
  }

  // Main App Shell
  return (
    <div className="flex h-screen w-screen bg-[#09090b] overflow-hidden font-ui">
      {/* Desktop Sidebar */}
      {!isMobile && writingMode === 'normal' && (
        <div className={cn("transition-all duration-500 ease-in-out shrink-0", isSidebarOpen ? "w-72" : "w-0 overflow-hidden")}>
          <SidebarNav 
            stories={stories}
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
            user={user}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Mobile Sidebar (Sheet) */}
      {isMobile && writingMode === 'normal' && (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 w-72 bg-[#09090b] border-white/5">
            <SidebarNav 
              stories={stories}
              activeStoryId={activeStoryId}
              activeChapterId={activeChapterId}
              activeView={activeView}
              onSelectView={(v) => { setActiveView(v); setIsSidebarOpen(false); }}
              onSelectStory={setActiveStoryId}
              onSelectChapter={(sid, cid) => {
                setActiveStoryId(sid);
                setActiveChapterId(cid);
                setActiveView('editor');
                setIsSidebarOpen(false);
              }}
              onAddStory={() => { handleAddStory(); setIsSidebarOpen(false); }}
              onAddChapter={handleAddChapter}
              onDeleteStory={handleDeleteStory}
              user={user}
              onLogout={handleLogout}
            />
          </SheetContent>
        </Sheet>
      )}
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-w-0">
        {/* Mobile Header Toggle */}
        {isMobile && writingMode === 'normal' && (
          <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(true)} 
              className="bg-black/40 backdrop-blur-md border border-white/5 rounded-lg h-9 w-9"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Desktop Sidebar Toggle */}
        {!isMobile && writingMode === 'normal' && !isSidebarOpen && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)} 
            className="absolute top-4 left-4 z-40 bg-black/40 backdrop-blur-md border border-white/5 rounded-lg h-9 w-9"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>
        )}

        <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
          {renderView()}
          
          {/* Desktop Sidebar Close Button */}
          {!isMobile && writingMode === 'normal' && isSidebarOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(false)} 
              className="absolute top-6 left-6 z-40 hover:bg-white/5"
            >
              <PanelLeft className="w-4 h-4 text-muted-foreground/40" />
            </Button>
          )}
        </div>
        
        {/* AI Panel (Desktop) */}
        {!isMobile && writingMode === 'normal' && activeView === 'editor' && (
          <div className={cn("transition-all duration-500 ease-in-out shrink-0 relative", isAIPanelOpen ? "w-80" : "w-0 overflow-hidden")}>
             <AIPanel currentText={activeChapter?.content || ''} />
             {isAIPanelOpen && (
               <Button 
                 variant="ghost" 
                 size="icon" 
                 onClick={() => setIsAIPanelOpen(false)} 
                 className="absolute top-6 left-6 z-40 hover:bg-white/5"
               >
                 <PanelRight className="w-4 h-4 text-muted-foreground/40" />
               </Button>
             )}
          </div>
        )}

        {/* AI Panel (Mobile Sheet) */}
        {isMobile && writingMode === 'normal' && activeView === 'editor' && (
          <Sheet open={isAIPanelOpen} onOpenChange={setIsAIPanelOpen}>
            <SheetContent side="right" className="p-0 w-80 bg-[#09090b] border-white/5">
              <AIPanel currentText={activeChapter?.content || ''} />
            </SheetContent>
          </Sheet>
        )}

        {/* Floating AI Toggle */}
        {writingMode === 'normal' && activeView === 'editor' && (!isAIPanelOpen || isMobile) && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsAIPanelOpen(true)} 
            className="absolute top-4 right-4 z-40 bg-black/40 backdrop-blur-md border border-white/5 rounded-lg h-9 w-9"
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </Button>
        )}
      </main>
      
      <Toaster />
    </div>
  );
}
