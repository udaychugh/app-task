import { IUserRepository } from '../../domain/repositories';
import { User, PublicUser } from '../../domain/entities';
import { prisma } from './prisma.client';

export class UserRepository implements IUserRepository {
  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    city?: string;
    role?: 'USER' | 'ADMIN';
  }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        city: data.city,
        role: data.role ?? 'USER',
      },
    });
    return this.mapToEntity(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? this.mapToEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? this.mapToEntity(user) : null;
  }

  async updateCity(userId: string, city: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { city },
    });
    return this.mapToEntity(user);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
  }): Promise<{ users: PublicUser[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          role: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    return { users: users as PublicUser[], total };
  }

  private mapToEntity(raw: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    city: string | null;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt: Date | null;
  }): User {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      passwordHash: raw.passwordHash,
      city: raw.city,
      role: raw.role as 'USER' | 'ADMIN',
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      lastLoginAt: raw.lastLoginAt,
    };
  }
}
