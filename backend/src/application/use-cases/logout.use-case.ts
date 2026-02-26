import { ISessionRepository } from '../../domain/repositories';
import { Session } from '../../domain/entities';
import { NotFoundError } from '../../shared/errors';

interface LogoutInput {
  sessionId: string;
  userId: string;
}

export class LogoutUseCase {
  constructor(private readonly sessionRepo: ISessionRepository) {}

  async execute(input: LogoutInput): Promise<Session> {
    const session = await this.sessionRepo.findById(input.sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    if (session.userId !== input.userId) {
      throw new NotFoundError('Session not found');
    }

    if (session.logoutTime) {
      // Already closed – return as-is
      return session;
    }

    return this.sessionRepo.closeSession(input.sessionId);
  }
}
