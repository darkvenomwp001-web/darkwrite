"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Story, Chapter, WritingMode } from '@/lib/types'
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
import { KeyRound, Lock, ArrowRight, Loader2, Eye, EyeOff, Sparkles } from 'lucide-react'
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

  // Automatic anonymous sign-in if authorized but no Firebase session yet
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
      toast({
        title: "Sanctuary Unlocked",
        description: "Welcome back, scribe.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "The path remains closed. Check your unique key.",
      });
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
          path: chapterRef.path,
          operation: 'update',
          requestResourceData: { content }
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
          path: chapterRef.path,
          operation: 'update',
          requestResourceData: { title }
        }));
      });
  };

  const handleAddStory = () => {
    if (!firestore || !user) return;
    const storiesRef = collection(firestore, 'stories');
    addDoc(storiesRef, {
      title: 'New Story',
      userId: user.uid,
      createdAt: serverTimestamp()
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

  // Loading Screen
  if (authLoading || (isAuthorized && !user && isAuthenticating)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#09090b] gap-6">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <Sparkles className="w-6 h-6 text-primary absolute -top-2 -right-2 animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-xl font-medium tracking-widest text-foreground animate-pulse">Opening the Sanctuary</p>
          <p className="text-sm text-muted-foreground italic">"Patience is the scribe's greatest virtue."</p>
        </div>
      </div>
    );
  }

  // Password Gate
  if (!isAuthorized) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#09090b] font-ui relative overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 bg-radial-at-t from-primary/10 via-transparent to-transparent opacity-50" />
        
        <div className="max-w-md w-full p-8 space-y-12 relative z-10">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-primary mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(124,58,237,0.3)] animate-in zoom-in duration-1000">
              <Lock className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
              <h1 className="text-5xl font-bold tracking-tighter">DarkWrite</h1>
              <p className="text-muted-foreground text-lg">A private sanctuary for the dedicated scribe.</p>
            </div>
          </div>

          <form onSubmit={handleUnlock} className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <div className="space-y-4">
              <div className="relative group">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Sanctuary Key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-14 pr-14 h-16 bg-card/50 border-border/50 focus:border-primary/50 text-xl transition-all rounded-2xl backdrop-blur-sm"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>
              <Button 
                size="lg" 
                type="submit"
                disabled={isAuthenticating}
                className="w-full h-16 gap-3 text-xl font-bold shadow-2xl shadow-primary/20 rounded-2xl transition-all active:scale-[0.98] glow-on-hover"
              >
                {isAuthenticating ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Unlock Sanctuary <ArrowRight className="w-6 h-6" /></>}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground/40 text-center italic leading-relaxed px-8">
              "Words are sacred. Only those who hold the key may enter the silence and begin their legacy."
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Main Writing Dashboard
  return (
    <div className="flex h-screen w-full bg-[#09090b] overflow-hidden selection:bg-primary/40 selection:text-white font-ui">
      {writingMode === 'normal' && (
        <SidebarNav 
          stories={stories}
          activeStoryId={activeStoryId}
          activeChapterId={activeChapterId}
          onSelectChapter={(sid, cid) => {
            setActiveStoryId(sid);
            setActiveChapterId(cid);
          }}
          onAddStory={handleAddStory}
          onAddChapter={handleAddChapter}
          onDeleteStory={handleDeleteStory}
          user={user}
          onLogout={handleLogout}
        />
      )}
      
      <main className="flex-1 flex flex-row overflow-hidden relative">
        <WritingEditor 
          activeChapter={activeChapter}
          onUpdateContent={handleUpdateContent}
          onUpdateTitle={handleUpdateTitle}
          saving={saving}
          writingMode={writingMode}
          onToggleWritingMode={() => setWritingMode(prev => prev === 'normal' ? 'focus' : 'normal')}
        />
        
        {writingMode === 'normal' && (
          <AIPanel 
            currentText={activeChapter?.content || ''} 
          />
        )}
      </main>
      
      <Toaster />
    </div>
  );
}