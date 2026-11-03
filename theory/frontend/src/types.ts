// Hand-written mirrors of backend/models/tkj.py — nothing infers across the
// Python/TypeScript boundary. Keep both sides in sync in the same edit.

export interface AdminUser {
  id: string;
  username: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  category: string;
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface ActivityInput {
  title: string;
  description?: string;
  date?: string;
  category?: string;
  photos?: string[];
}

export interface Leader {
  id: string;
  name: string;
  position: string;
  duties: string;
  period: string;
  photo: string;
  order: number;
  created_at: string;
}

export interface LeaderInput {
  name: string;
  position: string;
  duties?: string;
  period?: string;
  photo?: string;
  order?: number;
}

export interface Member {
  id: string;
  full_name: string;
  nickname: string;
  angkatan: string;
  year: number;
  status: string;
  skills: string[];
  description: string;
  photo: string;
  created_at: string;
}

export interface MemberInput {
  full_name: string;
  nickname?: string;
  angkatan?: string;
  year?: number;
  status?: string;
  skills?: string[];
  description?: string;
  photo?: string;
}

export interface Attachment {
  name: string;
  url: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  category: string;
  team: string;
  tech: string[];
  photos: string[];
  attachments: Attachment[];
  created_at: string;
}

export interface ProjectInput {
  title: string;
  description?: string;
  date?: string;
  category?: string;
  team?: string;
  tech?: string[];
  photos?: string[];
  attachments?: Attachment[];
}

export interface SiteContent {
  key: string;
  data: Record<string, string>;
  updated_at: string;
}

export interface Stats {
  members: number;
  activities: number;
  projects: number;
}
