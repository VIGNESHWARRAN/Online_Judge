import express from 'express';
import * as UserController from '../controllers/UserController.js';


const router = express.Router();

router.post('/', UserController.createUser); //create user

router.get('/', UserController.getUsers); //get user

router.get('/:id', UserController.getUserById); //get by user id

router.put('/:id', UserController.updateUser); //update user

router.delete('/:id', UserController.deleteUser); // delete user

router.patch('/:id', UserController.partialUpdateUser); // partial update, e.g., updating contest field only

export default router;
