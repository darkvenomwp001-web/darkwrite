
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
  useDoc 
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
  orderBy,
  Firestore
} from 'firebase/firestore'
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { LogIn, Sparkles } from 'lucide-react'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'

export default function DarkWriteApp() {
  const { toast } = useToast();
  const { auth } = useAuth();
  const { user, loading: authLoading } = useUser();
  const { firestore } = useFirestore();

  const [activeStoryId, setActiveStoryId] = useState<string | undefined>();
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  // Fetch Stories
  const storiesQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'stories'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: storiesData, loading: storiesLoading } = useCollection<Story>(storiesQuery);

  // Fetch Chapters for active story
  const chaptersQuery = useMemo(() => {
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

  const handleLogin = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Login failed", error);
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
      title: 'Untitled Story',
      userId: user.uid,
      createdAt: serverTimestamp()
    };

    addDoc(storiesRef, newStoryData).then((storyDoc) => {
      // Create initial chapter
      const chaptersRef = collection(firestore, 'stories', storyDoc.id, 'chapters');
      addDoc(chaptersRef, {
        title: 'Chapter 1',
        content: '',
        order: 1,
        lastSaved: serverTimestamp()
      }).then((chapDoc) => {
        setActiveStoryId(storyDoc.id);
        setActiveChapterId(chapDoc.id);
        toast({
          title: "Story Created",
          description: "A new blank canvas awaits your words.",
        });
      });
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: storiesRef.path,
        operation: 'create',
        requestResourceData: newStoryData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleAddChapter = (storyId: string) => {
    if (!firestore) return;

    const chaptersRef = collection(firestore, 'stories', storyId, 'chapters');
    const order = (chaptersData?.length || 0) + 1;
    const newChapterData = {
      title: `Chapter ${order}`,
      content: '',
      order,
      lastSaved: serverTimestamp()
    };

    addDoc(chaptersRef, newChapterData).then((docRef) => {
      setActiveStoryId(storyId);
      setActiveChapterId(docRef.id);
      toast({
        title: "Chapter Added",
        description: "New chapter appended to your story.",
      });
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: chaptersRef.path,
        operation: 'create',
        requestResourceData: newChapterData
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDeleteStory = (storyId: string) => {
    if (!firestore) return;
    const storyRef = doc(firestore, 'stories', storyId);
    deleteDoc(storyRef).then(() => {
      if (activeStoryId === storyId) {
        setActiveStoryId(undefined);
        setActiveChapterId(undefined);
      }
      toast({
        title: "Story Deleted",
        description: "Your story has been removed.",
      });
    }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        path: storyRef.path,
        operation: 'delete'
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="max-w-md space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-primary mx-auto flex items-center justify-center shadow-2xl shadow-primary/20">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">DarkWrite</h1>
          <p className="text-muted-foreground text-lg">
            A focused, AI-powered writing sanctuary for modern authors. Sign in to start your masterpiece.
          </p>
          <Button onClick={handleLogin} size="lg" className="w-full gap-2 text-lg h-12">
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </Button>
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
        onLogout={() => auth && signOut(auth)}
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
