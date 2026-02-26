import { ISearchRepository } from '../../domain/repositories';
import { NewsResult } from '../../domain/entities';
import { SerpApiService } from '../../infrastructure/serp/serp.service';
import { logger } from '../../shared/logger';

interface SearchNewsInput {
  city: string;
  userId: string;
  sessionId: string;
}

interface SearchNewsOutput {
  news: NewsResult;
}

export class SearchNewsUseCase {
  constructor(
    private readonly searchRepo: ISearchRepository,
    private readonly serpService: SerpApiService
  ) {}

  async execute(input: SearchNewsInput): Promise<SearchNewsOutput> {
    // Fetch from SERP API
    const news = await this.serpService.searchNews(input.city);

    // Log search to DB (non-blocking – don't fail the request if this errors)
    this.searchRepo
      .create({
        userId: input.userId,
        sessionId: input.sessionId,
        searchQuery: news.query,
        city: input.city,
      })
      .catch((err) => {
        logger.error('Failed to log search to DB', { error: err });
      });

    return { news };
  }
}
