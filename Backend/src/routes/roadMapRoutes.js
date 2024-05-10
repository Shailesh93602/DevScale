import express from 'express';
import { createRoadMap, deleteRoadMap, getRoadMap, getRoadMaps, updateRoadMap } from '../controllers/roadMapControllers.js';

const router = express.Router();

router.get('/', getRoadMaps);
router.get('/:id', getRoadMap);
router.post('/create', createRoadMap);
router.put('/update/:id', updateRoadMap);
router.delete('/delete/:id', deleteRoadMap);

export default router;
