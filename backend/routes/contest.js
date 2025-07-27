import express from 'express';
import * as contestController from '../controllers/ContestController.js';

const router = express.Router();

// Create a new contest
router.post('/', contestController.createContest);

// Get all contests
router.get('/', contestController.getContests);

// Get a contest by ID
router.get('/:id', contestController.getContestById);

// Update a contest by ID
router.put('/:id', contestController.updateContest);

// Delete a contest by ID
router.delete('/:id', contestController.deleteContest);

// Register user for a contest
router.post('/register', contestController.registerUserForContest);

// Unregister user from a contest (optional)
router.post('/unregister', contestController.unregisterUserFromContest);

export default router;
