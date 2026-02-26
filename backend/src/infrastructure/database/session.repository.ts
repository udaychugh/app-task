import { ISessionRepository } from '../../domain/repositories';
import { Session } from '../../domain/entities';
import { prisma } from './prisma.client';

export class SessionRepository implements ISessionRepository {
  async create(data: { userId: string }): Promise<Session> {
    const session = await prisma.session.create({
      data: { userId: data.userId },
    });
    return this.mapToEntity(session);
  }

  async findById(id: string): Promise<Session | null> {
    const session = await prisma.session.findUnique({ where: { id } });
    return session ? this.mapToEntity(session) : null;
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { loginTime: 'desc' },
    });
    return sessions.map(this.mapToEntity);
  }

  async closeSession(sessionId: string): Promise<Session> {
    // Retrieve the session to calculate duration
    const existing = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!existing) throw new Error('Session not found');

    const logoutTime = new Date();
    const durationSeconds = Math.floor(
      (logoutTime.getTime() - existing.loginTime.getTime()) / 1000
    );

    const session = await prisma.session.update({
      where: { id: sessionId },
      data: { logoutTime, durationSeconds },
    });
    return this.mapToEntity(session);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
  }): Promise<{ sessions: Session[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      prisma.session.findMany({
        skip,
        take: limit,
        orderBy: { loginTime: 'desc' },
        include: {
          user: { select: { email: true, name: true } },
        },
      }),
      prisma.session.count(),
    ]);

    return { sessions: sessions.map(this.mapToEntity), total };
  }

  private mapToEntity(raw: {
    id: string;
    userId: string;
    loginTime: Date;
    logoutTime: Date | null;
    durationSeconds: number | null;
    createdAt: Date;
    user?: { email: string; name: string } | null;
  }): Session {
    const session: Session = {
      id: raw.id,
      userId: raw.userId,
      loginTime: raw.loginTime,
      logoutTime: raw.logoutTime,
      durationSeconds: raw.durationSeconds,
      createdAt: raw.createdAt,
    };
    if (raw.user) {
      session.userEmail = raw.user.email;
      session.userName = raw.user.name;
    }
    return session;
  }
}
