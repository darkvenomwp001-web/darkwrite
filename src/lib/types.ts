
export interface Chapter {
  id: string;
  title: string;
  content: string;
  lastSaved: any; 
  order: number;
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
  | 'settings';
