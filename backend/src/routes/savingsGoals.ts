import { Router } from 'express';
import {
  getGoal,
  upsertGoal,
  getProgress,
} from '../controllers/savingsGoalController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getGoal);
router.put('/', upsertGoal);
router.get('/progress', getProgress);

export default router;
