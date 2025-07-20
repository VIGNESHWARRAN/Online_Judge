import express from 'express';
import * as submissionController from '../controllers/SubmissionController.js';

const router = express.Router();

router.post('/', submissionController.createSubmission); //create submission

router.get('/', submissionController.getSubmissions); //get submission

router.get('/:id', submissionController.getSubmissionById); //get by submission id

router.put('/:id', submissionController.updateSubmission); //update submission

router.delete('/:id', submissionController.deleteSubmission); // delete submission

export default router;
