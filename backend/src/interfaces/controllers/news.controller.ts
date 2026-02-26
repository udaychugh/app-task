import { Request, Response, NextFunction } from 'express';
import { SearchNewsUseCase } from '../../application/use-cases/search-news.use-case';
import { SearchRepository } from '../../infrastructure/database/search.repository';
import { SerpApiService } from '../../infrastructure/serp/serp.service';
import { successResponse } from '../../shared/utils/response.util';
import { UnauthorizedError } from '../../shared/errors';

const searchRepo = new SearchRepository();
const serpService = new SerpApiService();
const searchNewsUseCase = new SearchNewsUseCase(searchRepo, serpService);

export async function searchNews(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError("User ID missing in request context");

    const { city, sessionId } = req.query as { city: string; sessionId: string };

    const { news } = await searchNewsUseCase.execute({ city, userId, sessionId });
    successResponse(res, { news }, 'News fetched successfully');
  } catch (error) {
    next(error);
  }
}
