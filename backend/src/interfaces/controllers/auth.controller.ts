import { Request, Response, NextFunction } from 'express';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { UserRepository } from '../../infrastructure/database/user.repository';
import { SessionRepository } from '../../infrastructure/database/session.repository';
import { successResponse } from '../../shared/utils/response.util';
import { UnauthorizedError } from '../../shared/errors';

const userRepo = new UserRepository();
const sessionRepo = new SessionRepository();
const registerUseCase = new RegisterUseCase(userRepo);
const loginUseCase = new LoginUseCase(userRepo, sessionRepo);
const logoutUseCase = new LogoutUseCase(sessionRepo);

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user } = await registerUseCase.execute(req.body);
    successResponse(res, { user }, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { user, session } = await loginUseCase.execute(req.body);
    successResponse(res, { user, session }, 'Login successful');
  } catch (error) {
    next(error);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) throw new UnauthorizedError();

    const { sessionId } = req.body as { sessionId: string };
    const session = await logoutUseCase.execute({ sessionId, userId });
    successResponse(res, { session }, 'Logout successful');
  } catch (error) {
    next(error);
  }
}
