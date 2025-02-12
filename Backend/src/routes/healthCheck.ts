import { Router } from 'express';
import { NODE_ENV } from '../config';

const router = Router();

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

export default router;
