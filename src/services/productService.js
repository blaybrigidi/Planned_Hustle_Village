import { supabase } from '../config/supabase.js';

/**
 * Get all products with optional filters
 * @param {Object} filters - Optional filters (category, search, limit, offset)
 * @returns {Promise<Object>} Products list
 */
export const getAllServices = async (filters = {}) => {
  try {
    const { category, search, limit = 50, offset = 0, sortBy = 'created_at', order = 'desc' } = filters;

    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true) // Only show active products
      .order(sortBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply category filter if provided
    if (category) {
      query = query.eq('category', category);
    }

    // Apply search filter if provided
    if (search) {
      const searchPattern = `%${search}%`;
      query = query.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`);
    }

    const { data: services, error } = await query;

    if (error) {
      return { status: 400, msg: error.message, data: null };
    }

    // Fetch sellers for all unique user_ids
    const userIds = [...new Set(services?.map(s => s.user_id) || [])];
    let sellersMap = {};
    
    if (userIds.length > 0) {
      const { data: sellers, error: sellersError } = await supabase
        .from('sellers')
        .select('id, title, description, category, user_id')
        .in('user_id', userIds);

      if (!sellersError && sellers) {
        // Create a map of user_id -> seller for quick lookup
        sellersMap = sellers.reduce((acc, seller) => {
          acc[seller.user_id] = seller;
          return acc;
        }, {});
      }
    }

    // Merge seller data with services
    const products = (services || []).map(service => ({
      ...service,
      seller: sellersMap[service.user_id] || null
    }));

    return {
      status: 200,
      msg: 'Products retrieved successfully',
      data: {
        products: products || [],
        count: products?.length || 0,
        limit,
        offset
      }
    };
  } catch (e) {
    return { status: 500, msg: 'Failed to retrieve products', data: null };
  }
};

/**
 * Get product by ID
 * @param {string} productId - Product ID
 * @returns {Promise<Object>} Product details
 */
export const getServiceById = async (productId) => {
  try {
    if (!productId) {
      return { status: 400, msg: 'Product ID is required', data: null };
    }

    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { status: 404, msg: 'Product not found', data: null };
      }
      return { status: 400, msg: error.message, data: null };
    }

    if (!service) {
      return { status: 404, msg: 'Product not found', data: null };
    }

    // Fetch seller data for this service's user_id
    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id, title, description, category, user_id, portfolio')
      .eq('user_id', service.user_id)
      .single();

    // Merge seller data (seller might not exist, which is fine)
    const serviceWithSeller = {
      ...service,
      seller: sellerError ? null : seller
    };

    return {
      status: 200,
      msg: 'Product retrieved successfully',
      data: serviceWithSeller
    };
  } catch (e) {
    return { status: 500, msg: 'Failed to retrieve product', data: null };
  }
};