import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAnalytics,
} from '../controllers/transactionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.get('/analytics', getAnalytics);

export default router;
