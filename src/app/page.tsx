
"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Story, Chapter } from '@/lib/types'
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
import { KeyRound, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

const ACCESS_PASSWORD = 'darkwrite2025';

export default function DarkWriteApp() {
  const { toast } = useToast();
  const { auth } = useAuth();
  const { user, loading: authLoading } = useUser();
  const { firestore } = useFirestore();

  const [activeStoryId, setActiveStoryId] = useState<string | undefined>();
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  
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
      toast({
        title: "Access Granted",
        description: "Welcome back, scribe. Unlocking the sanctuary...",
      });
      setIsAuthorized(true);
      localStorage.setItem('dw_authorized', 'true');
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Access Key",
        description: "The path remains closed. Please verify the unique key.",
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

  // Loading Screen: Show when we are verifying password or signing in
  if (authLoading || (isAuthorized && !user && isAuthenticating)) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse font-medium tracking-wide">Opening the Sanctuary...</p>
      </div>
    );
  }

  // Password Gate: Show only if not authorized or not signed in
  if (!user || !isAuthorized) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 font-ui">
        <div className="max-w-md w-full space-y-8 text-center animate-in fade-in duration-700">
          <div className="w-20 h-20 rounded-2xl bg-primary mx-auto flex items-center justify-center shadow-2xl shadow-primary/20">
            <Lock className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">DarkWrite</h1>
            <p className="text-muted-foreground">A private sanctuary for the dedicated scribe.</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 pt-4">
            <div className="relative group">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Access Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 pr-12 h-12 bg-card border-border/50 focus:border-primary transition-all rounded-xl"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <Button 
              size="lg" 
              type="submit"
              disabled={isAuthenticating}
              className="w-full h-12 gap-2 text-lg font-semibold shadow-lg shadow-primary/20 rounded-xl transition-all active:scale-95"
            >
              {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Unlock Sanctuary <ArrowRight className="w-5 h-5" /></>}
            </Button>
            <p className="text-sm text-muted-foreground/60 italic pt-6">
              "Words are sacred. Only the worthy may scribe."
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Main Writing Dashboard
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/40 selection:text-white font-ui">
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
      
      <main className="flex-1 flex flex-row overflow-hidden relative">
        <WritingEditor 
          activeChapter={activeChapter}
          onUpdateContent={handleUpdateContent}
          onUpdateTitle={handleUpdateTitle}
          saving={saving}
        />
        
        <AIPanel 
          currentText={activeChapter?.content || ''} 
        />
      </main>
      
      <Toaster />
    </div>
  );
}
