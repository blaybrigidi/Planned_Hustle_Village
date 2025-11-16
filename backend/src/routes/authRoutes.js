import express from 'express';
import authController from '../controllers/authController.js';
import { responseHandler } from '../middleware/responseHandler.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', responseHandler(authController.signup));
router.post('/login', responseHandler(authController.login));
router.post('/resend-verification', responseHandler(authController.resendVerification));
router.post('/verify-email', responseHandler(authController.verifyEmail));
router.get('/me', verifyToken, responseHandler(authController.getMe));
router.post('/logout', verifyToken, responseHandler(authController.logout));

export default router;


