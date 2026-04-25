
"use client"

import React, { useState, Suspense } from 'react'
import { AppShell } from '@/components/writing/app-shell'
import { WritingEditor } from '@/components/writing/writing-editor'
import { AIPanel } from '@/components/writing/ai-panel'
import { useSearchParams } from 'next/navigation'
import { 
  useFirestore, 
  useDoc, 
  useMemoFirebase 
} from '@/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { errorEmitter } from '@/firebase/error-emitter'
import { FirestorePermissionError } from '@/firebase/errors'
import { Chapter, WritingMode } from '@/lib/types'
import { Loader2 } from 'lucide-react'

function EditorContent() {
  const searchParams = useSearchParams();
  const storyId = searchParams.get('storyId');
  const chapterId = searchParams.get('chapterId');
  const firestore = useFirestore();

  const [saving, setSaving] = useState(false);
  const [writingMode, setWritingMode] = useState<WritingMode>('normal');

  const chapterRef = useMemoFirebase(() => {
    if (!firestore || !storyId || !chapterId) return null;
    return doc(firestore, 'stories', storyId, 'chapters', chapterId);
  }, [firestore, storyId, chapterId]);

  const { data: chapterData } = useDoc<Chapter>(chapterRef);

  const handleUpdateContent = (content: string) => {
    if (!firestore || !storyId || !chapterId) return;
    const ref = doc(firestore, 'stories', storyId, 'chapters', chapterId);
    setSaving(true);
    updateDoc(ref, { content, lastSaved: serverTimestamp() })
      .then(() => setSaving(false))
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: ref.path, operation: 'update', requestResourceData: { content }
        }));
        setSaving(false);
      });
  };

  const handleUpdateTitle = (title: string) => {
    if (!firestore || !storyId || !chapterId) return;
    const ref = doc(firestore, 'stories', storyId, 'chapters', chapterId);
    updateDoc(ref, { title, lastSaved: serverTimestamp() })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: ref.path, operation: 'update', requestResourceData: { title }
        }));
      });
  };

  const handleUpdatePreference = (key: string, value: string) => {
    if (!firestore || !storyId || !chapterId) return;
    const ref = doc(firestore, 'stories', storyId, 'chapters', chapterId);
    updateDoc(ref, { [key]: value, lastSaved: serverTimestamp() })
      .catch((err) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: ref.path, operation: 'update', requestResourceData: { [key]: value }
        }));
      });
  };

  return (
    <AppShell>
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative min-w-0">
        <WritingEditor 
          activeChapter={chapterData}
          onUpdateContent={handleUpdateContent}
          onUpdateTitle={handleUpdateTitle}
          onUpdatePreference={handleUpdatePreference}
          saving={saving}
          writingMode={writingMode}
          onToggleWritingMode={() => setWritingMode(prev => prev === 'normal' ? 'focus' : 'normal')}
        />
        
        {writingMode === 'normal' && (
          <div className="w-[24rem] hidden lg:block border-l border-white/5 shrink-0 bg-[#09090b]">
             <AIPanel currentText={chapterData?.content || ''} />
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-[#09090b]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <EditorContent />
    </Suspense>
  )
}
