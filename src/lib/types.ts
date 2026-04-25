export interface Chapter {
  id: string;
  title: string;
  content: string;
  lastSaved: any; // Using any for Firestore Timestamp compatibility
  order: number;
}

export interface Story {
  id: string;
  title: string;
  chapters?: Chapter[];
  createdAt: any; // Using any for Firestore Timestamp compatibility
  userId: string;
}

export type WritingMode = 'focus' | 'normal';