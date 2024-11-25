import { Router } from 'express';
import { estimateRide, confirmRide, getRideHistory } from '../controllers/rideController';

const router = Router();

router.post('/estimate', estimateRide);
router.patch('/confirm', confirmRide);
router.get('/:customer_id', getRideHistory);

export default router;
