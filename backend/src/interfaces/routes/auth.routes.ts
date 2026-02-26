import { Router } from 'express';
import { register, login, logout } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, logoutSchema } from '../validators';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// POST /api/auth/logout  (protected)
router.post('/logout', authenticate, validate(logoutSchema), logout);

export default router;
