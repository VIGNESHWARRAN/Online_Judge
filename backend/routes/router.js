import express from 'express';
import problemRoutes from './problem.js';
import submissionRoutes from './submission.js';
import userRoutes from './user.js';
import authRoutes from './auth.js'; 
import contestRoutes from './contest.js';  // <-- Import contest routes

const router = express.Router();

router.use('/problems', problemRoutes);
router.use('/submissions', submissionRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/contests', contestRoutes);    // <-- Add contest routes here

export default router;
