import express from 'express';
import problemRoutes from './problem.js';
import submissionRoutes from './submission.js';
import userRoutes from './user.js';
import authRoutes from './auth.js'; 

const router = express.Router();

router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes); 

export default router;
