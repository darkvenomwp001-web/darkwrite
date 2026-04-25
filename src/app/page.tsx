"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Story, Chapter } from '@/lib/types'
import { SidebarNav } from '@/components/writing/sidebar-nav'
import { WritingEditor } from '@/components/writing/writing-editor'
import { AIPanel } from '@/components/writing/ai-panel'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'

const INITIAL_STORIES: Story[] = [
  {
    id: 'story-1',
    title: 'Echoes of the Void',
    createdAt: new Date(),
    chapters: [
      {
        id: 'chap-1',
        title: 'The Unseen Door',
        content: 'It was a door that shouldn\'t have existed. In the middle of the obsidian plains, beneath a sky filled with dying stars, the mahogany threshold stood firm against the howling winds of the void...',
        lastSaved: new Date()
      },
      {
        id: 'chap-2',
        title: 'Whispers in Silence',
        content: 'The silence was loud. Not the empty silence of a desert night, but a heavy, purposeful quiet that seemed to lean in close, listening to your heartbeat...',
        lastSaved: new Date()
      }
    ]
  }
];

export default function DarkWriteApp() {
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>(INITIAL_STORIES);
  const [activeStoryId, setActiveStoryId] = useState<string | undefined>(INITIAL_STORIES[0].id);
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>(INITIAL_STORIES[0].chapters[0].id);
  const [saving, setSaving] = useState(false);

  // Derived state
  const activeStory = stories.find(s => s.id === activeStoryId);
  const activeChapter = activeStory?.chapters.find(c => c.id === activeChapterId) || null;

  // Real-time auto-save effect
  useEffect(() => {
    if (!activeChapter) return;
    
    const timer = setTimeout(() => {
      setSaving(true);
      // Simulate API call
      setTimeout(() => {
        setSaving(false);
      }, 600);
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeChapter?.content, activeChapter?.title]);

  const handleUpdateContent = (content: string) => {
    if (!activeStoryId || !activeChapterId) return;

    setStories(prev => prev.map(story => {
      if (story.id !== activeStoryId) return story;
      return {
        ...story,
        chapters: story.chapters.map(chapter => {
          if (chapter.id !== activeChapterId) return chapter;
          return { ...chapter, content, lastSaved: new Date() };
        })
      };
    }));
  };

  const handleUpdateTitle = (title: string) => {
    if (!activeStoryId || !activeChapterId) return;

    setStories(prev => prev.map(story => {
      if (story.id !== activeStoryId) return story;
      return {
        ...story,
        chapters: story.chapters.map(chapter => {
          if (chapter.id !== activeChapterId) return chapter;
          return { ...chapter, title, lastSaved: new Date() };
        })
      };
    }));
  };

  const handleAddStory = () => {
    const newStory: Story = {
      id: `story-${Date.now()}`,
      title: 'Untitled Story',
      createdAt: new Date(),
      chapters: [
        {
          id: `chap-${Date.now()}`,
          title: 'Chapter 1',
          content: '',
          lastSaved: new Date()
        }
      ]
    };
    setStories(prev => [...prev, newStory]);
    setActiveStoryId(newStory.id);
    setActiveChapterId(newStory.chapters[0].id);
    toast({
      title: "Story Created",
      description: "A new blank canvas awaits your words.",
    });
  };

  const handleAddChapter = (storyId: string) => {
    setStories(prev => prev.map(story => {
      if (story.id !== storyId) return story;
      const newChapter: Chapter = {
        id: `chap-${Date.now()}`,
        title: `Chapter ${story.chapters.length + 1}`,
        content: '',
        lastSaved: new Date()
      };
      return {
        ...story,
        chapters: [...story.chapters, newChapter]
      };
    }));
    toast({
      title: "Chapter Added",
      description: "New chapter appended to your story.",
    });
  };

  const handleDeleteStory = (storyId: string) => {
    setStories(prev => prev.filter(s => s.id !== storyId));
    if (activeStoryId === storyId) {
      setActiveStoryId(undefined);
      setActiveChapterId(undefined);
    }
  };

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
