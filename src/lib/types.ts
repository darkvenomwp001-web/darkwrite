
export interface Chapter {
  id: string;
  title: string;
  content: string;
  lastSaved: any; 
  order: number;
  status?: 'draft' | 'progress' | 'complete';
  fontFamily?: 'serif' | 'sans' | 'mono';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
}

export interface Story {
  id: string;
  title: string;
  chapters?: Chapter[];
  createdAt: any;
  userId: string;
  status?: 'active' | 'archived' | 'draft';
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  traits: string;
  storyId: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  storyId: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: any;
}

export type WritingMode = 'focus' | 'normal';

export type AppView = 
  | 'dashboard' 
  | 'editor' 
  | 'characters' 
  | 'world' 
  | 'plot' 
  | 'stats' 
  | 'search' 
  | 'export' 
  | 'archive' 
  | 'settings'
  | 'notes';
