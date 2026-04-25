
"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { SidebarNav } from '@/components/writing/sidebar-nav'
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
  serverTimestamp 
} from 'firebase/firestore'
import { signOut } from 'firebase/auth'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { 
  Loader2, 
  Menu,
  PanelLeft,
  Wifi
} from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from '@/components/ui/button'
import { Story, Chapter, AppView } from '@/lib/types'

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, loading: authLoading } = useUser();
  const firestore = useFirestore();
  const isMobile = useIsMobile();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Responsive Sidebar Control
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobile]);

  // Strict Firebase Auth Routing
  useEffect(() => {
    const isLoginPage = pathname === '/darkwritelogin';
    if (!authLoading && !user && !isLoginPage) {
      router.push('/darkwritelogin');
    }
  }, [user, authLoading, pathname, router]);

  const storiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'stories'),
      where('userId', '==', user.uid)
    );
  }, [firestore, user]);

  const { data: storiesData, loading: storiesLoading } = useCollection<Story>(storiesQuery);

  const activeStoryId = searchParams.get('storyId') || undefined;
  const activeChapterId = searchParams.get('chapterId') || undefined;

  const chaptersQuery = useMemoFirebase(() => {
    if (!firestore || !activeStoryId) return null;
    return query(
      collection(firestore, 'stories', activeStoryId, 'chapters')
    );
  }, [firestore, activeStoryId]);

  const { data: chaptersData } = useCollection<Chapter>(chaptersQuery);

  const stories = useMemo(() => {
    if (!storiesData) return [];
    const sorted = [...storiesData].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    return sorted.map(s => ({
      ...s,
      chapters: activeStoryId === s.id ? (chaptersData ? [...chaptersData].sort((a, b) => a.order - b.order) : []) : []
    }));
  }, [storiesData, chaptersData, activeStoryId]);

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
        lastSaved: serverTimestamp(),
        status: 'draft',
        fontFamily: 'serif',
        fontSize: 'base'
      }).then((chapDoc) => {
        router.push(`/editor?storyId=${storyDoc.id}&chapterId=${chapDoc.id}`);
      });
    }).catch(() => {
      toast({ variant: "destructive", title: "Error", description: "Failed to create manuscript." });
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
      lastSaved: serverTimestamp(),
      status: 'draft',
      fontFamily: 'serif',
      fontSize: 'base'
    }).then((docRef) => {
      router.push(`/editor?storyId=${storyId}&chapterId=${docRef.id}`);
    });
  };

  const handleDeleteStory = (storyId: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, 'stories', storyId));
    if (activeStoryId === storyId) {
      router.push('/dashboard');
    }
  };

  const handleRenameStory = (storyId: string, newTitle: string) => {
    if (!firestore) return;
    const storyRef = doc(firestore, 'stories', storyId);
    updateDoc(storyRef, { title: newTitle });
  };

  const handleLogout = () => {
    if (auth) {
      signOut(auth).then(() => {
        router.push('/darkwritelogin');
      });
    }
  };

  // Global Loading State for Auth and initial redirection
  if (authLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#09090b] gap-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-[10px] font-bold tracking-[0.3em] text-foreground uppercase animate-pulse">Verifying Integrity</p>
      </div>
    );
  }

  // If on login page, render children directly (it handles its own user-redirect)
  if (pathname === '/darkwritelogin') {
    return <>{children}</>;
  }

  // Final check to prevent content flicker if unauthorized
  if (!user) return null;

  return (
    <div className="flex h-screen w-screen bg-[#09090b] overflow-hidden selection:bg-primary/30">
      {/* Sidebar - Priority z-index for click events */}
      {!isMobile && (
        <div className={cn("transition-all duration-500 ease-in-out shrink-0 relative z-[100]", isSidebarOpen ? "w-[22rem]" : "w-0 overflow-hidden")}>
          <SidebarNav 
            stories={stories}
            storiesLoading={storiesLoading}
            activeStoryId={activeStoryId}
            activeChapterId={activeChapterId}
            activeView={pathname.split('/')[1] as AppView || 'dashboard'}
            onSelectView={(v) => router.push(`/${v}`)}
            onSelectStory={(sid) => router.push(`${pathname}?storyId=${sid}`)}
            onSelectChapter={(sid, cid) => router.push(`/editor?storyId=${sid}&chapterId=${cid}`)}
            onAddStory={handleAddStory}
            onAddChapter={handleAddChapter}
            onDeleteStory={handleDeleteStory}
            onRenameStory={handleRenameStory}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      )}

      {isMobile && (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[300px] bg-[#09090b] border-white/5 z-[110]">
            <div className="sr-only">
              <SheetHeader>
                <SheetTitle>DarkWrite Sanctuary Navigation</SheetTitle>
                <SheetDescription>Access your manuscripts and writing tools.</SheetDescription>
              </SheetHeader>
            </div>
            <SidebarNav 
              stories={stories}
              storiesLoading={storiesLoading}
              activeStoryId={activeStoryId}
              activeChapterId={activeChapterId}
              activeView={pathname.split('/')[1] as AppView || 'dashboard'}
              onSelectView={(v) => { router.push(`/${v}`); setIsSidebarOpen(false); }}
              onSelectStory={(sid) => router.push(`${pathname}?storyId=${sid}`)}
              onSelectChapter={(sid, cid) => {
                router.push(`/editor?storyId=${sid}&chapterId=${cid}`);
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

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-w-0 z-10">
        {isMobile && (
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

        {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="absolute top-8 left-8 z-40 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl h-10 w-10 text-white hover:bg-white/5"
          >
            <PanelLeft className="w-5 h-5" />
          </Button>
        )}

        <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
          {children}
          <div className="absolute bottom-6 right-8 z-40 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/5 flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity pointer-events-none">
            <Wifi className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">Real-time Sanctuary Active</span>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
