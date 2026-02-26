import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../infrastructure/database/user.repository';
import { SessionRepository } from '../../infrastructure/database/session.repository';
import { SearchRepository } from '../../infrastructure/database/search.repository';
import { successResponse, paginationMeta } from '../../shared/utils/response.util';

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();
const searchRepo = new SearchRepository();

export async function getAllUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as { page?: number; limit?: number };
    const { users, total } = await userRepo.findAll({ page: +page, limit: +limit });
    successResponse(
      res,
      { users },
      'Users fetched',
      200,
      paginationMeta(total, +page, +limit)
    );
  } catch (error) {
    next(error);
  }
}

export async function getAllSessions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as { page?: number; limit?: number };
    const { sessions, total } = await sessionRepo.findAll({ page: +page, limit: +limit });
    successResponse(
      res,
      { sessions },
      'Sessions fetched',
      200,
      paginationMeta(total, +page, +limit)
    );
  } catch (error) {
    next(error);
  }
}

export async function getAllSearches(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { page = 1, limit = 20 } = req.query as { page?: number; limit?: number };
    const { searches, total } = await searchRepo.findAll({ page: +page, limit: +limit });
    successResponse(
      res,
      { searches },
      'Searches fetched',
      200,
      paginationMeta(total, +page, +limit)
    );
  } catch (error) {
    next(error);
  }
}
