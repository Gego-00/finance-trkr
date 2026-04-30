import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

router.use(authenticateToken);

router.get('/', getCategories as any);
router.post('/', createCategory as any);
router.put('/:id', updateCategory as any);
router.delete('/:id', deleteCategory as any);

export default router;
