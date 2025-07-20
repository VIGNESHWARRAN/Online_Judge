import express from 'express';
import * as problemController from '../controllers/ProblemController.js';

const router = express.Router();

router.post('/', problemController.createProblem); //create

router.get('/', problemController.getProblems); //get all problems

router.get('/:id', problemController.getProblemById); //get problem by id

router.put('/:id', problemController.updateProblem); //update problem by id

router.delete('/:id', problemController.deleteProblem); //delete problem

export default router;
