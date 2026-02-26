import { Router } from 'express';
import { getAllUsers, getAllSessions, getAllSearches } from '../controllers/admin.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { paginationSchema } from '../validators';

const router = Router();

// All admin routes require valid token + ADMIN role
router.use(authenticate, requireAdmin);

// GET /api/admin/users
router.get('/users', validate(paginationSchema, 'query'), getAllUsers);

// GET /api/admin/sessions
router.get('/sessions', validate(paginationSchema, 'query'), getAllSessions);

// GET /api/admin/searches
router.get('/searches', validate(paginationSchema, 'query'), getAllSearches);

export default router;
