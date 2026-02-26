import { User, PublicUser, Session, Search } from '../entities';

// ─── User Repository Interface ────────────────────────────────────────────────

export interface IUserRepository {
  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    city?: string;
    role?: 'USER' | 'ADMIN';
  }): Promise<User>;

  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;

  updateCity(userId: string, city: string): Promise<User>;
  updateLastLogin(userId: string): Promise<void>;

  findAll(options?: { page?: number; limit?: number }): Promise<{ users: PublicUser[]; total: number }>;
}

// ─── Session Repository Interface ────────────────────────────────────────────

export interface ISessionRepository {
  create(data: { userId: string }): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  closeSession(sessionId: string): Promise<Session>;
  findAll(options?: { page?: number; limit?: number }): Promise<{ sessions: Session[]; total: number }>;
}

// ─── Search Repository Interface ─────────────────────────────────────────────

export interface ISearchRepository {
  create(data: {
    userId: string;
    sessionId: string;
    searchQuery: string;
    city: string;
  }): Promise<Search>;

  findByUserId(userId: string): Promise<Search[]>;
  findAll(options?: { page?: number; limit?: number }): Promise<{ searches: Search[]; total: number }>;
}
