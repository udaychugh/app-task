import { Router } from 'express';
import { updateCity } from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateCitySchema } from '../validators';

const router = Router();

// PUT /api/users/city
router.put('/city', authenticate, validate(updateCitySchema), updateCity);

export default router;
