// ─── User Entity ────────────────────────────────────────────────────────────

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  city?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  token: string | null;
  referesh_token: string | null;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  city?: string | null;
  role: UserRole;
  createdAt: Date;
  lastLoginAt?: Date | null;
  token: string | null;
  refresh_token: string | null;
}

// ─── Session Entity ──────────────────────────────────────────────────────────

export interface Session {
  id: string;
  userId: string;
  loginTime: Date;
  logoutTime?: Date | null;
  durationSeconds?: number | null;
  createdAt: Date;
  // additional info for admin views
  userEmail?: string | null;
  userName?: string | null;
}

// ─── Search Entity ───────────────────────────────────────────────────────────

export interface Search {
  id: string;
  userId: string;
  sessionId: string;
  searchQuery: string;
  city: string;
  timestamp: Date;
  userEmail?: string | null;
  userName?: string | null;
}

// ─── News Entity ─────────────────────────────────────────────────────────────

export interface NewsArticle {
  title: string;
  source: string;
  url: string;
  snippet: string;
  publishedAt?: string;
  thumbnail?: string;
}

export interface NewsResult {
  query: string;
  city: string;
  articles: NewsArticle[];
  totalResults: number;
}
