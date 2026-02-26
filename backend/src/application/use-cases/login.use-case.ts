import bcrypt from 'bcrypt';
import { IUserRepository, ISessionRepository } from '../../domain/repositories';
import { PublicUser, Session } from '../../domain/entities';
import { UnauthorizedError } from '../../shared/errors';
import { issueConvexTokens } from '../../infrastructure/convex/convex.client';

interface LoginInput {
  email: string;
  password: string;
}

interface LoginOutput {
  user: PublicUser;
  session: Session;
}

export class LoginUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly sessionRepo: ISessionRepository
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Create session record
    const session = await this.sessionRepo.create({ userId: user.id });

    // Update last login timestamp
    await this.userRepo.updateLastLogin(user.id);

    const issued = await issueConvexTokens({ email: user.email, name: user.name });

    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      city: user.city,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: new Date(),
      token: issued.token,
      refresh_token: issued.refresh_token,
    };

    return { user: publicUser, session };
  }
}
