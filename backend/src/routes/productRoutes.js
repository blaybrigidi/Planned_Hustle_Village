import express from 'express';
import productController from '../controllers/productController.js';
import { responseHandler } from '../middleware/responseHandler.js';

const router = express.Router();

router.get('/', responseHandler(productController.getAllProducts));
router.get('/:id', responseHandler(productController.getProductById));

export default router;


