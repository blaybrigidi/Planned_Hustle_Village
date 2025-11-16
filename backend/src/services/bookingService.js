import { supabase } from '../config/supabase.js';

export const bookNow = async (userId, serviceId, bookingData) => {
  try {
    if (!userId || !serviceId) {
      return { status: 400, msg: "User ID and Service ID are required", data: null };
    }

    const { date, time, status = 'pending' } = bookingData;
    if (!date || !time) return { status: 400, msg: "Date and time are required", data: null };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    if (profileError || !profile) return { status: 404, msg: "User profile not found. Please complete your profile setup.", data: null };

    const { data: service, error: serviceError } = await supabase
      .from('services')
      .select('id, is_verified, is_active, user_id')
      .eq('id', serviceId)
      .single();
    if (serviceError || !service) return { status: 404, msg: "Service not found", data: null };
    if (!service.is_verified) return { status: 403, msg: "Cannot book unverified service", data: null };
    if (!service.is_active) return { status: 403, msg: "Cannot book inactive service", data: null };
    if (service.user_id === userId) return { status: 403, msg: "Cannot book your own service", data: null };

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({ buyer_id: profile.id, service_id: serviceId, date, time, status })
      .select()
      .single();
    if (bookingError) return { status: 400, msg: bookingError.message || "Failed to create booking", data: null };

    return { status: 201, msg: "Booking created successfully", data: booking };
  } catch (e) {
    console.error("bookNow error:", e);
    return { status: 500, msg: "Failed to create booking", data: null };
  }
};

export const getBookingById = async (userId, bookingId) => {
  try {
    if (!bookingId) return { status: 400, msg: "Booking ID is required", data: null };

    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`*, service:services (id, title, description, category, default_price, express_price)`)
      .eq('id', bookingId)
      .single();
    if (error || !booking) return { status: 404, msg: "Booking not found", data: null };

    const isBuyer = booking.buyer_id === userId;
    let isSeller = false;
    if (booking.service_id) {
      const { data: service } = await supabase.from('services').select('user_id').eq('id', booking.service_id).single();
      isSeller = service?.user_id === userId;
    }
    if (!isBuyer && !isSeller) return { status: 403, msg: "You do not have permission to view this booking", data: null };

    return { status: 200, msg: "Booking retrieved successfully", data: booking };
  } catch (e) {
    console.error("getBookingById error:", e);
    return { status: 500, msg: "Failed to retrieve booking", data: null };
  }
};

export const getUserBookings = async (userId, role = 'buyer') => {
  try {
    if (role === 'buyer') {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`*, service:services (id, title, description, category, default_price, express_price)`)
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false });
      if (error) return { status: 400, msg: error.message, data: null };
      return { status: 200, msg: "Bookings retrieved successfully", data: { bookings: bookings || [] } };
    }

    const { data: services, error: servicesError } = await supabase.from('services').select('id').eq('user_id', userId);
    if (servicesError) return { status: 400, msg: "Failed to fetch seller services", data: null };
    const serviceIds = services.map(s => s.id);
    if (serviceIds.length === 0) return { status: 200, msg: "No bookings found", data: { bookings: [] } };

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`*, service:services (id, title, description, category, default_price, express_price)`)
      .in('service_id', serviceIds)
      .order('created_at', { ascending: false });
    if (error) return { status: 400, msg: error.message, data: null };

    return { status: 200, msg: "Bookings retrieved successfully", data: { bookings: bookings || [] } };
  } catch (e) {
    console.error("getUserBookings error:", e);
    return { status: 500, msg: "Failed to retrieve bookings", data: null };
  }
};


