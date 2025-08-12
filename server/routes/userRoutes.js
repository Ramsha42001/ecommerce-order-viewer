import express from 'express';
import { fetchAllUsers, fetchUserById } from '../controllers/userController.js';

const router = express.Router();

router.get('/', fetchAllUsers);
router.get('/:id', fetchUserById);

export default router; 