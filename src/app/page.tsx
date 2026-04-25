
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
import { 
  KeyRound, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff, 
  Sparkles,
  Search,
  Users,
  Globe,
  GitGraph,
  BarChart3,
  Download,
  LayoutDashboard,
  Archive,
  History,
  TrendingUp,
  BookOpen
} from 'lucide-react'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

const ACCESS_PASSWORD = 'darkwrite2025';

export default function DarkWriteApp() {
  const { toast } = useToast();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();

  const [activeStoryId, setActiveStoryId] = useState<string | undefined>();
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>();
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [saving, setSaving] = useState(false);
  const [writingMode, setWritingMode] = useState<WritingMode>('normal');
  
  // Authorization state
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

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
          console.error("Auto sign-in failed", err);
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

  // View Components (The "10 Pages")
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <ScrollArea className="flex-1 p-12 bg-[#09090b]">
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Author's Dashboard</h1>
                <p className="text-muted-foreground italic">"Your story is waiting to be written."</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/[0.02] border-white/5 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Total Manuscripts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-5xl font-bold tracking-tighter">{storiesData?.length || 0}</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/[0.02] border-white/5 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Word Growth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-5xl font-bold tracking-tighter text-green-500/80">+2.4k</p>
                  </CardContent>
                </Card>
                <Card className="bg-white/[0.02] border-white/5 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <History className="w-4 h-4" /> Recent Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-medium truncate">{storiesData?.[0]?.title || 'None'}</p>
                    <p className="text-xs text-muted-foreground mt-2">Active 2 hours ago</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <h2 className="text-lg font-bold flex items-center gap-3">
                  <History className="w-5 h-5 text-primary" /> 
                  Continue Writing
                </h2>
                <div className="grid gap-4">
                  {storiesData?.slice(0, 3).map(s => (
                    <div key={s.id} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between group hover:bg-white/[0.05] transition-all cursor-pointer" onClick={() => { setActiveStoryId(s.id); setActiveView('editor'); }}>
                      <div className="space-y-1">
                        <h3 className="font-bold text-xl">{s.title}</h3>
                        <p className="text-xs text-muted-foreground">Drafting • Last saved 4m ago</p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-all" />
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
      case 'characters':
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] text-muted-foreground p-12">
            <Users className="w-20 h-20 opacity-20 mb-8" />
            <h2 className="text-3xl font-bold text-foreground/80">Character Codex</h2>
            <p className="mt-4 italic max-w-md text-center">Map out the souls of your story. Roles, motivations, and growth tracking coming soon.</p>
            <Button variant="outline" className="mt-8 rounded-xl border-white/10">Coming to the next revision</Button>
          </div>
        );
      case 'world':
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] text-muted-foreground p-12">
            <Globe className="w-20 h-20 opacity-20 mb-8" />
            <h2 className="text-3xl font-bold text-foreground/80">World Atlas</h2>
            <p className="mt-4 italic max-w-md text-center">Track locations, lore, and the physics of your universe here.</p>
          </div>
        );
      case 'plot':
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] text-muted-foreground p-12">
            <GitGraph className="w-20 h-20 opacity-20 mb-8" />
            <h2 className="text-3xl font-bold text-foreground/80">Story Timeline</h2>
            <p className="mt-4 italic max-w-md text-center">Plot your arcs and map your climaxes with visual timeline tools.</p>
          </div>
        );
      case 'stats':
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] text-muted-foreground p-12">
            <BarChart3 className="w-20 h-20 opacity-20 mb-8" />
            <h2 className="text-3xl font-bold text-foreground/80">Writing Analytics</h2>
            <p className="mt-4 italic max-w-md text-center">Deep insights into your writing habits, word frequency, and peak productivity hours.</p>
          </div>
        );
      case 'search':
        return (
          <div className="flex-1 flex flex-col p-12 bg-[#09090b]">
            <div className="max-w-2xl mx-auto w-full space-y-12">
               <div className="space-y-4">
                 <h1 className="text-4xl font-bold tracking-tight">Global Search</h1>
                 <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                   <Input placeholder="Search characters, lines of prose, or chapters..." className="h-16 pl-14 bg-white/[0.02] border-white/5 rounded-2xl text-xl" />
                 </div>
               </div>
               <div className="p-12 text-center rounded-3xl border border-dashed border-white/5">
                 <p className="text-sm italic opacity-40">"Searching the silence for specific echoes..."</p>
               </div>
            </div>
          </div>
        );
      case 'export':
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] text-muted-foreground p-12">
            <Download className="w-20 h-20 opacity-20 mb-8" />
            <h2 className="text-3xl font-bold text-foreground/80">Manuscript Export</h2>
            <p className="mt-4 italic max-w-md text-center">Export your work in PDF, ePub, or DOCX formats with professional author styling.</p>
          </div>
        );
      case 'archive':
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] text-muted-foreground p-12">
            <Archive className="w-20 h-20 opacity-20 mb-8" />
            <h2 className="text-3xl font-bold text-foreground/80">Project Archive</h2>
            <p className="mt-4 italic max-w-md text-center">Dormant stories waiting for their time to return.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="flex-1 flex flex-col p-12 bg-[#09090b]">
             <div className="max-w-3xl mx-auto w-full space-y-12">
               <h1 className="text-4xl font-bold tracking-tight">Sanctuary Settings</h1>
               <div className="grid gap-6">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                     <div className="space-y-1">
                       <h3 className="font-bold">Setting Option {i}</h3>
                       <p className="text-xs text-muted-foreground">Manage your private sanctuary preferences.</p>
                     </div>
                     <div className="w-12 h-6 rounded-full bg-white/5" />
                   </div>
                 ))}
               </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Loading Screen
  if (authLoading || (isAuthorized && !user && isAuthenticating)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#09090b] gap-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-xl font-medium tracking-widest text-foreground animate-pulse">Opening the Sanctuary</p>
      </div>
    );
  }

  // Password Gate
  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#09090b] font-ui relative overflow-hidden">
        <div className="max-w-md w-full p-8 space-y-12 relative z-10">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-primary mx-auto flex items-center justify-center shadow-2xl shadow-primary/30">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-bold tracking-tighter">DarkWrite</h1>
            <p className="text-muted-foreground">A private sanctuary for the dedicated scribe.</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-6">
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Sanctuary Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-14 pr-14 h-16 bg-card/50 border-border/50 text-xl rounded-2xl"
                autoFocus
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-50">
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
            <Button size="lg" type="submit" className="w-full h-16 text-xl font-bold rounded-2xl">
              Unlock Sanctuary <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="flex h-screen w-full bg-[#09090b] overflow-hidden selection:bg-primary/40 selection:text-white font-ui">
      {writingMode === 'normal' && (
        <SidebarNav 
          stories={stories}
          activeStoryId={activeStoryId}
          activeChapterId={activeChapterId}
          activeView={activeView}
          onSelectView={setActiveView}
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
      )}
      
      <main className="flex-1 flex flex-row overflow-hidden relative">
        {renderView()}
        
        {writingMode === 'normal' && activeView === 'editor' && (
          <AIPanel currentText={activeChapter?.content || ''} />
        )}
      </main>
      
      <Toaster />
    </div>
  );
}
