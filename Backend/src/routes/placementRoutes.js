import express from 'express';
import { getBooks, getResources } from '../controllers/placementControllers.js';

const router = express.Router();

router.get('/resources', getResources);
router.post('/sessions/book', getBooks);

export default router;
