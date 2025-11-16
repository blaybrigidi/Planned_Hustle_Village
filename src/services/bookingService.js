import { supabase } from '../config/supabase.js';

/**
 * Book a service now
 * @param {string} userId - Buyer's user ID
 * @param {string} serviceId - Service ID to book
 * @param {Object} bookingData - Booking data (date, time, status)
 * @returns {Promise<Object>} Booking result
 */
export const bookNow = async (userId, serviceId, bookingData) => {
  try {
    if (!userId || !serviceId) {
      return { status: 400, msg: "User ID and Service ID are required", data: null };
    }

    const { date, time, status = 'pending' } = bookingData;

    if (!date || !time) {
      return { status: 400, msg: "Date and time are required", data: null };
    }

    // Get the profile ID from user ID (bookings.buyer_id references profiles.id)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return { status: 404, msg: "User profile not found. Please complete your profile setup.", data: null };
    }

    // First, verify the service exists and is verified
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, is_verified, is_active, user_id')
      .eq('id', serviceId)
      .single();

    if (serviceError || !service) {
      if (serviceError?.code === 'PGRST116') {
        return { status: 404, msg: "Service not found", data: null };
      }
      return { status: 404, msg: "Service not found", data: null };
    }

    // Check if service is verified
    if (!service.is_verified) {
      return { status: 403, msg: "Cannot book unverified service", data: null };
    }

    // Check if service is active
    if (!service.is_active) {
      return { status: 403, msg: "Cannot book inactive service", data: null };
    }

    // Prevent sellers from booking their own services
    if (service.user_id === userId) {
      return { status: 403, msg: "Cannot book your own service", data: null };
    }

    // Create the booking using profile.id (not userId)
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        buyer_id: profile.id, // Use profile.id instead of userId
        service_id: serviceId,
        date: date,
        time: time,
        status: status
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      return { status: 400, msg: bookingError.message || "Failed to create booking", data: null };
    }

    return {
      status: 201,
      msg: "Booking created successfully",
      data: booking
    };
  } catch (e) {
    console.error("bookNow error:", e);
    return { status: 500, msg: "Failed to create booking", data: null };
  }
};

/**
 * Get booking by ID
 * @param {string} userId - User ID (buyer or seller)
 * @param {string} bookingId - Booking ID
 * @returns {Promise<Object>} Booking details
 */
export const getBookingById = async (userId, bookingId) => {
  try {
    if (!bookingId) {
      return { status: 400, msg: "Booking ID is required", data: null };
    }

    // Get booking with service details (without seller join for now)
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        service:services (
          id,
          title,
          description,
          category,
          default_price,
          express_price
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      if (error?.code === 'PGRST116') {
        return { status: 404, msg: "Booking not found", data: null };
      }
      return { status: 404, msg: "Booking not found", data: null };
    }

    // Check if user has permission (buyer or seller of the service)
    const isBuyer = booking.buyer_id === userId;
    
    // Check if user is the seller by checking if they own the service
    let isSeller = false;
    if (booking.service_id) {
      const { data: service, error: serviceError } = await supabase
        .from('services')
        .select('user_id')
        .eq('id', booking.service_id)
        .single();
      
      if (!serviceError && service) {
        isSeller = service.user_id === userId;
      }
    }

    if (!isBuyer && !isSeller) {
      return { status: 403, msg: "You do not have permission to view this booking", data: null };
    }

    return {
      status: 200,
      msg: "Booking retrieved successfully",
      data: booking
    };
  } catch (e) {
    console.error("getBookingById error:", e);
    return { status: 500, msg: "Failed to retrieve booking", data: null };
  }
};

/**
 * Get all bookings for a user (as buyer or seller)
 * @param {string} userId - User ID
 * @param {string} role - 'buyer' or 'seller'
 * @returns {Promise<Object>} List of bookings
 */
export const getUserBookings = async (userId, role = 'buyer') => {
  try {
    if (role === 'buyer') {
      // Get bookings where user is the buyer
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services (
            id,
            title,
            description,
            category,
            default_price,
            express_price
          )
        `)
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { status: 400, msg: error.message, data: null };
      }

      return {
        status: 200,
        msg: "Bookings retrieved successfully",
        data: { bookings: bookings || [] }
      };
    } else if (role === 'seller') {
      // For seller, first get their services, then get bookings for those services
      const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id')
        .eq('user_id', userId);

      if (servicesError) {
        return { status: 400, msg: "Failed to fetch seller services", data: null };
      }

      const serviceIds = services.map(s => s.id);
      if (serviceIds.length === 0) {
        return { status: 200, msg: "No bookings found", data: { bookings: [] } };
      }

      // Get bookings for seller's services
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services (
            id,
            title,
            description,
            category,
            default_price,
            express_price
          )
        `)
        .in('service_id', serviceIds)
        .order('created_at', { ascending: false });

      if (error) {
        return { status: 400, msg: error.message, data: null };
      }

      return {
        status: 200,
        msg: "Bookings retrieved successfully",
        data: { bookings: bookings || [] }
      };
    } else {
      return { status: 400, msg: "Invalid role. Must be 'buyer' or 'seller'", data: null };
    }
  } catch (e) {
    console.error("getUserBookings error:", e);
    return { status: 500, msg: "Failed to retrieve bookings", data: null };
  }
};

export const acceptBooking = async (userId, bookingId) => {
  try {
    // Get the booking with service info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, service:services(user_id)')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return { status: 404, msg: "Booking not found", data: null };
    }

    // Verify user is the seller (owns the service)
    if (booking.service.user_id !== userId) {
      return { status: 403, msg: "You do not have permission to accept this booking", data: null };
    }

    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return { status: 400, msg: `Cannot accept booking with status: ${booking.status}`, data: null };
    }

    // Update booking status to accepted
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'accepted' })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      return { status: 400, msg: error.message, data: null };
    }

    return { status: 200, msg: "Booking accepted successfully", data };
  } catch (e) {
    console.error("acceptBooking error:", e);
    return { status: 500, msg: "Failed to accept booking", data: null };
  }
};