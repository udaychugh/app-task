import { ISearchRepository } from '../../domain/repositories';
import { Search } from '../../domain/entities';
import { prisma } from './prisma.client';

export class SearchRepository implements ISearchRepository {
  async create(data: {
    userId: string;
    sessionId: string;
    searchQuery: string;
    city: string;
  }): Promise<Search> {
    const search = await prisma.search.create({ data });
    return this.mapToEntity(search);
  }

  async findByUserId(userId: string): Promise<Search[]> {
    const searches = await prisma.search.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
    return searches.map(this.mapToEntity);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
  }): Promise<{ searches: Search[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [searches, total] = await Promise.all([
      prisma.search.findMany({
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: { select: { email: true, name: true } },
        },
      }),
      prisma.search.count(),
    ]);

    return { searches: searches.map(this.mapToEntity), total };
  }

  private mapToEntity(raw: {
    id: string;
    userId: string;
    sessionId: string;
    searchQuery: string;
    city: string;
    timestamp: Date;
    user?: { email: string; name: string } | null;
  }): Search {
    const search: Search = {
      id: raw.id,
      userId: raw.userId,
      sessionId: raw.sessionId,
      searchQuery: raw.searchQuery,
      city: raw.city,
      timestamp: raw.timestamp,
    };
    if (raw.user) {
      search.userEmail = raw.user.email;
      search.userName = raw.user.name;
    }
    return search;
  }
}
