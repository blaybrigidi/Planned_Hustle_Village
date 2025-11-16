import express from 'express';
import sellerController from '../controllers/sellerController.js';
import { responseHandler } from '../middleware/responseHandler.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/setup', verifyToken, responseHandler(sellerController.setupSeller));
router.post('/create-service', verifyToken, responseHandler(sellerController.createService));
router.get('/services', verifyToken, responseHandler(sellerController.getMyServices));
router.put('/edit-service/:serviceId', verifyToken, responseHandler(sellerController.editService));
router.put('/toggleServiceStatus/:serviceId', verifyToken, responseHandler(sellerController.toggleService));

export default router;
  

