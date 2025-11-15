import express from 'express';
import productController from '../controllers/productController.js';
import { responseHandler } from '../middleware/responseHandler.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products (with optional filters)
 * @access  Public
 * @query   category, search, limit, offset, sortBy, order
 */
router.get('/', responseHandler(productController.getAllProducts));

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID
 * @access  Public
 */
router.get('/:id', responseHandler(productController.getProductById));

export default router;

