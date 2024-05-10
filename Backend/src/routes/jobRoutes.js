import express from 'express';
import { createJob, deleteJob, getJob, getJobs, updateJob } from '../controllers/jobControllers.js';

const router = express.Router();

router.get('/', getJobs);
router.get('/:id', getJob);
router.post('/create', createJob);
router.put('/update/:id', updateJob);
router.delete('/delete/:id', deleteJob);

export default router;
