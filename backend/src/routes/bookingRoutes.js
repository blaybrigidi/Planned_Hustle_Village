import express from 'express';
import bookingController from '../controllers/bookingController.js';
import { responseHandler } from '../middleware/responseHandler.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/book-now', verifyToken, responseHandler(bookingController.bookNow));
router.get('/:bookingId', verifyToken, responseHandler(bookingController.getBookingById));
router.get('/', verifyToken, responseHandler(bookingController.getUserBookings));

export default router;


