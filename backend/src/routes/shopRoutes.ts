import { Router } from 'express';
import { catalog, purchase } from '../controllers/shopController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/catalog', catalog);
router.post('/purchase', authenticateToken, purchase);

export default router;

