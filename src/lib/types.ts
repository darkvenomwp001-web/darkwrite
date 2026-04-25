export interface Chapter {
  id: string;
  title: string;
  content: string;
  lastSaved: Date;
}

export interface Story {
  id: string;
  title: string;
  chapters: Chapter[];
  createdAt: Date;
}

export type WritingMode = 'focus' | 'normal';
