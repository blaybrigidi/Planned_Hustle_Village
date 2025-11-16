import * as bookingService from '../services/bookingService.js';

const bookNow = async (req) => {
  try {
    const userId = req.user?.id; // from verifyToken middleware
    if (!userId) {
      return { status: 401, msg: "Unauthorized: user not found", data: null };
    }

    const { serviceId, date, time, status } = req.body;

    if (!serviceId) return { status: 400, msg: "Service ID is required", data: null };
    if (!date || !time) return { status: 400, msg: "Date and time are required", data: null };

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return { status: 400, msg: "Invalid date format", data: null };
    if (dateObj < new Date()) return { status: 400, msg: "Booking date must be in the future", data: null };

    const result = await bookingService.bookNow(userId, serviceId, {
      date,
      time,
      status: status || 'pending'
    });

    return { status: result.status, msg: result.msg, data: result.data };
  } catch (error) {
    console.error("Book now error:", error);
    return { status: 500, msg: "Failed to create booking", data: null };
  }
};

const getBookingById = async (req) => {
  try {
    const userId = req.user?.id;
    if (!userId) return { status: 401, msg: "Unauthorized: user not found", data: null };

    const { bookingId } = req.params;
    if (!bookingId) return { status: 400, msg: "Booking ID is required", data: null };

    const result = await bookingService.getBookingById(userId, bookingId);
    return { status: result.status, msg: result.msg, data: result.data };
  } catch (error) {
    console.error("Get booking error:", error);
    return { status: 500, msg: "Failed to retrieve booking", data: null };
  }
};

const getUserBookings = async (req) => {
  try {
    const userId = req.user?.id;
    if (!userId) return { status: 401, msg: "Unauthorized: user not found", data: null };

    const { role = 'buyer' } = req.query;
    if (role !== 'buyer' && role !== 'seller') return { status: 400, msg: "Role must be 'buyer' or 'seller'", data: null };

    const result = await bookingService.getUserBookings(userId, role);
    return { status: result.status, msg: result.msg, data: result.data };
  } catch (error) {
    console.error("Get user bookings error:", error);
    return { status: 500, msg: "Failed to retrieve bookings", data: null };
  }
};

export default { bookNow, getBookingById, getUserBookings };


