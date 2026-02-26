import { Router } from 'express';
import { searchNews } from '../controllers/news.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { newsQuerySchema } from '../validators';

const router = Router();

// GET /api/news?city=mumbai&sessionId=xxx
router.get('/', authenticate, validate(newsQuerySchema, 'query'), searchNews);

export default router;
