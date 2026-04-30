import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAnalytics,
} from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

router.use(authenticateToken);

router.get('/', getTransactions as any);
router.post('/', createTransaction as any);
router.put('/:id', updateTransaction as any);
router.delete('/:id', deleteTransaction as any);
router.get('/analytics', getAnalytics as any);

export default router;
