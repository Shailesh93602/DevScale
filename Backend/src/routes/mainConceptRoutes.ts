import { Router } from 'express';
import {
  getAllMainConceptsController,
  getMainConceptByIdController,
  createMainConceptController,
  updateMainConceptController,
  deleteMainConceptController,
  getSubjectsInMainConceptController,
} from '../controllers/mainConceptController';

const router = Router();

// Public routes
router.get('/', getAllMainConceptsController);
router.get('/:id', getMainConceptByIdController);
router.get('/:id/subjects', getSubjectsInMainConceptController);

// Protected routes
router.post('/', createMainConceptController);
router.put('/:id', updateMainConceptController);
router.delete('/:id', deleteMainConceptController);

export default router;
