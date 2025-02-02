import express from 'express';
import {
  enrollCourse,
  getCourse,
  getCourses,
} from '../controllers/courseControllers.js';

const router = express.Router();

router.get('/', getCourses);
router.get('/:id', getCourse);
router.post('/enroll', enrollCourse);

export default router;
