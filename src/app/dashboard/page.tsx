
"use client"

import React from 'react'
import { AppShell } from '@/components/writing/app-shell'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  useUser, 
  useFirestore, 
  useCollection, 
  useMemoFirebase 
} from '@/firebase'
import { collection, query, where, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { 
  BookOpen, 
  Plus, 
  Wifi, 
  Zap, 
  Target, 
  Clock, 
  Timer, 
  History, 
  Calendar, 
  Library, 
  FileText, 
  Type, 
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Search,
  BarChart3,
  Download,
  Settings2
} from 'lucide-react'
import { Story } from '@/lib/types'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();

  const storiesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'stories'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: storiesData } = useCollection<Story>(storiesQuery);

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
        router.push(`/editor?storyId=${storyDoc.id}&chapterId=${chapDoc.id}`);
      });
    });
  };

  return (
    <AppShell>
      <ScrollArea className="flex-1 p-4 md:p-8 lg:p-12 bg-[#09090b]">
        <div className="max-w-7xl mx-auto space-y-10">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-white/[0.02] border-white/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Library className="w-16 h-16" />
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

            <Card className="bg-white/[0.02] border-white/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="w-16 h-16" />
              </div>
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Zap className="w-3 h-3" /> Sprint Word Count
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold tracking-tighter text-green-500">2,481</p>
                  <span className="text-xs text-muted-foreground">Words</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Timer className="w-16 h-16" />
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

            <Card className="bg-white/[0.02] border-white/5 group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <History className="w-16 h-16" />
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-3 text-white">
                <History className="w-5 h-5 text-primary" /> 
                Continue Scribing
              </h2>
              <div className="grid gap-4">
                {storiesData?.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl border border-dashed border-white/5 bg-white/[0.01]">
                    <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground italic">Your library is currently silent.</p>
                  </div>
                ) : (
                  storiesData?.slice(0, 4).map(s => (
                    <div 
                      key={s.id} 
                      className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between hover:bg-white/[0.05] hover:border-primary/20 transition-all cursor-pointer" 
                      onClick={() => router.push(`/editor?storyId=${s.id}`)}
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
                              <Type className="w-3 h-3" /> Active Project
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="w-5 h-5 text-primary" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-8">
              <Card className="bg-primary/5 border-primary/20 rounded-3xl overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <CardHeader className="p-6">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary uppercase tracking-widest">
                    <Zap className="w-4 h-4" /> AI Spark
                  </CardTitle>
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
                  <Button variant="outline" className="h-20 flex-col gap-2 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 text-muted-foreground">
                    <Search className="w-5 h-5 text-primary/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Search</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 text-muted-foreground">
                    <BarChart3 className="w-5 h-5 text-green-500/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Stats</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 text-muted-foreground">
                    <Download className="w-5 h-5 text-orange-500/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Export</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-primary/20 text-muted-foreground">
                    <Settings2 className="w-5 h-5 text-muted-foreground" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </AppShell>
  );
}
