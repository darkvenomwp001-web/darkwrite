
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
import { Sparkles, KeyRound, Lock, ArrowRight } from 'lucide-react'
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
  
  // Gatekeeper state
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check if we've already been authorized in this session
  useEffect(() => {
    const saved = localStorage.getItem('dw_authorized');
    if (saved === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  // Fetch Stories
  const storiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'stories'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: storiesData } = useCollection<Story>(storiesQuery);

  // Fetch Chapters for active story
  const chaptersQuery = useMemoFirebase(() => {
    if (!firestore || !activeStoryId) return null;
    return query(
      collection(firestore, 'stories', activeStoryId, 'chapters'),
      orderBy('order', 'asc')
    );
  }, [firestore, activeStoryId]);

  const { data: chaptersData } = useCollection<Chapter>(chaptersQuery);

  // Active Data Mapping
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

  const handleUnlock = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password === ACCESS_PASSWORD) {
      setIsAuthenticating(true);
      try {
        await signInAnonymously(auth);
        setIsAuthorized(true);
        localStorage.setItem('dw_authorized', 'true');
        toast({
          title: "Sanctuary Unlocked",
          description: "Welcome back, scribe.",
        });
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Could not establish a secure session.",
        });
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Access Key",
        description: "The path remains closed.",
      });
    }
  };

  const handleUpdateContent = (content: string) => {
    if (!firestore || !activeStoryId || !activeChapterId) return;

    const chapterRef = doc(firestore, 'stories', activeStoryId, 'chapters', activeChapterId);
    setSaving(true);
    
    updateDoc(chapterRef, {
      content,
      lastSaved: serverTimestamp()
    }).then(() => {
      setSaving(false);
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: chapterRef.path,
        operation: 'update',
        requestResourceData: { content }
      });
      errorEmitter.emit('permission-error', permissionError);
      setSaving(false);
    });
  };

  const handleUpdateTitle = (title: string) => {
    if (!firestore || !activeStoryId || !activeChapterId) return;

    const chapterRef = doc(firestore, 'stories', activeStoryId, 'chapters', activeChapterId);
    
    updateDoc(chapterRef, {
      title,
      lastSaved: serverTimestamp()
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: chapterRef.path,
        operation: 'update',
        requestResourceData: { title }
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleAddStory = () => {
    if (!firestore || !user) return;

    const storiesRef = collection(firestore, 'stories');
    const newStoryData = {
      title: 'New Story',
      userId: user.uid,
      createdAt: serverTimestamp()
    };

    addDoc(storiesRef, newStoryData).then((storyDoc) => {
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
  };

  if (authLoading || isAuthenticating) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  // Password Gate
  if (!isAuthorized || !user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary mx-auto flex items-center justify-center shadow-2xl shadow-primary/20 animate-in fade-in zoom-in duration-500">
            <Lock className="w-10 h-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">DarkWrite Sanctuary</h1>
            <p className="text-muted-foreground">Access is restricted to authorized scribes.</p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4 pt-4 animate-in slide-in-from-bottom-4 duration-700">
            <div className="relative group">
              <KeyRound className="absolute left-3 top-3 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="password"
                placeholder="Enter Sanctuary Key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-card border-border/50 focus:border-primary transition-all text-lg"
              />
            </div>
            <Button size="lg" className="w-full h-12 gap-2 text-lg shadow-lg shadow-primary/10">
              Unlock Sanctuary
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-xs text-muted-foreground/50 pt-4">
              "Words are sacred. Only the worthy may scribe."
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
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
      
      <main className="flex-1 flex flex-row overflow-hidden">
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
