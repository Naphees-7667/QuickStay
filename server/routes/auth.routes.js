import express from 'express';
import { register, login, logout, getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/auth.controllers.js';
import { protect } from '../middleware/authMiddleware.js';

const authRouter = express.Router();

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);

// Protected routes
authRouter.post('/logout', protect, logout);
authRouter.get('/profile', protect, getProfile);
authRouter.patch('/update-profile', protect, updateProfile);
authRouter.patch('/change-password', protect, changePassword);
authRouter.delete('/delete-account', protect, deleteAccount);

export default authRouter;
