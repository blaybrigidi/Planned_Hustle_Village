import express from 'express';
import bookingController from '../controllers/bookingController.js';
import { responseHandler } from '../middleware/responseHandler.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/bookings/book-now
 * @desc    Book a service now
 * @access  Private
 * @body    { serviceId, date, time, status? }
 */
router.post('/book-now', verifyToken, responseHandler(bookingController.bookNow));

/**
 * @route   GET /api/bookings/:bookingId
 * @desc    Get booking by ID
 * @access  Private (buyer or seller of the service)
 */
router.get('/:bookingId', verifyToken, responseHandler(bookingController.getBookingById));

/**
 * @route   GET /api/bookings
 * @desc    Get user's bookings (as buyer or seller)
 * @access  Private
 * @query   role (buyer or seller, defaults to buyer)
 */
router.get('/', verifyToken, responseHandler(bookingController.getUserBookings));
/**
 * @route   PATCH /api/bookings/:bookingId/accept
 * @desc    Accept a booking (seller only)
 * @access  Private (seller)
 */
router.patch('/:bookingId/accept', verifyToken, responseHandler(bookingController.acceptBooking));
export default router;

