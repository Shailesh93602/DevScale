import { Router } from 'express';
import {
  getAllMainConcepts,
  getMainConceptById,
  createMainConcept,
  updateMainConcept,
  deleteMainConcept,
  getSubjectsInMainConcept,
} from '../controllers/mainConceptController';

const router = Router();

// Public routes
router.get('/', getAllMainConcepts);
router.get('/:id', getMainConceptById);
router.get('/:id/subjects', getSubjectsInMainConcept);

// Protected routes
router.post('/', createMainConcept);
router.put('/:id', updateMainConcept);
router.delete('/:id', deleteMainConcept);

export default router;
