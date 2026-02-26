import { Request, Response, NextFunction } from 'express';
import { UpdateCityUseCase } from '../../application/use-cases/update-city.use-case';
import { UserRepository } from '../../infrastructure/database/user.repository';
import { successResponse } from '../../shared/utils/response.util';
import { UnauthorizedError } from '../../shared/errors';

const userRepo = new UserRepository();
const updateCityUseCase = new UpdateCityUseCase(userRepo);

export async function updateCity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError();

    const { city } = req.body as { city: string };
    const user = await updateCityUseCase.execute({ userId, city });
    successResponse(res, { user }, 'City updated successfully');
  } catch (error) {
    next(error);
  }
}
