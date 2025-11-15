import express from 'express';
import requestController from '../controllers/requestController.js';
import { responseHandler } from '../middleware/responseHandler.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-request', verifyToken, responseHandler(requestController.createRequest));

export default router;