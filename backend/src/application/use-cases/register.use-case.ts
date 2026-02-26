import bcrypt from 'bcrypt';
import { IUserRepository } from '../../domain/repositories';
import { PublicUser } from '../../domain/entities';
import { ConflictError } from '../../shared/errors';
import { issueConvexTokens } from '../../infrastructure/convex/convex.client';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  city?: string;
}

interface RegisterOutput {
  user: PublicUser;
}

export class RegisterUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email is already registered');
    }

    const SALT_ROUNDS = 12;
    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const issued = await issueConvexTokens({ email: input.email, name: input.name });

    const user = await this.userRepo.create({
      name: input.name,
      email: input.email,
      passwordHash,
      city: input.city,
    });


    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      city: user.city,
      role: user.role,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      token: issued.token,
      refresh_token: issued.refresh_token,
    };

    return { user: publicUser };
  }
}
