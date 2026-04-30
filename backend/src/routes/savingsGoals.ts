import { Router } from 'express';
import {
  getGoal,
  upsertGoal,
  getProgress,
} from '../controllers/savingsGoalController';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

router.use(authenticateToken);

router.get('/', getGoal as any);
router.put('/', upsertGoal as any);
router.get('/progress', getProgress as any);

export default router;
