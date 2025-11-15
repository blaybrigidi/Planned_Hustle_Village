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
      .select(`
        *,
        seller:sellers (
          id,
          title,
          description,
          category,
          user_id
        )
      `)
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

    const { data, error, count } = await query;

    if (error) {
      return { status: 400, msg: error.message, data: null };
    }

    return {
      status: 200,
      msg: 'Products retrieved successfully',
      data: {
        products: data || [],
        count: data?.length || 0,
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

    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        seller:sellers (
          id,
          title,
          description,
          category,
          user_id,
          portfolio
        )
      `)
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { status: 404, msg: 'Product not found', data: null };
      }
      return { status: 400, msg: error.message, data: null };
    }

    if (!data) {
      return { status: 404, msg: 'Product not found', data: null };
    }

    return {
      status: 200,
      msg: 'Product retrieved successfully',
      data: data
    };
  } catch (e) {
    return { status: 500, msg: 'Failed to retrieve product', data: null };
  }
};

