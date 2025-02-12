import express from 'express';
import { getBooks, getResources } from '../controllers/placementControllers';

const router = express.Router();

router.get('/resources', getResources);
router.get('/books', getBooks);

export default router;
