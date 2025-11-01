import { Router } from 'express';
import { getInventory, equipItem } from '../controllers/inventoryController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getInventory);
router.post('/equip', authenticateToken, equipItem);

export default router;

