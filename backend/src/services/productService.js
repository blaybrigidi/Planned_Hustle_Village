import { supabase } from '../config/supabase.js';

export const getAllServices = async (filters = {}) => {
  try {
    const { category, search, limit = 50, offset = 0, sortBy = 'created_at', order = 'desc' } = filters;

    let query = supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order(sortBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    if (category) query = query.eq('category', category);

    if (search) {
      const searchPattern = `%${search}%`;
      query = query.or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`);
    }

    const { data: services, error } = await query;
    if (error) return { status: 400, msg: error.message, data: null };

    const userIds = [...new Set(services?.map(s => s.user_id) || [])];
    let sellersMap = {};
    if (userIds.length > 0) {
      const { data: sellers } = await supabase.from('sellers').select('id, title, description, category, user_id').in('user_id', userIds);
      if (sellers) {
        sellersMap = sellers.reduce((acc, seller) => {
          acc[seller.user_id] = seller;
          return acc;
        }, {});
      }
    }

    const products = (services || []).map(service => ({ ...service, seller: sellersMap[service.user_id] || null }));

    return { status: 200, msg: 'Products retrieved successfully', data: { products: products || [], count: products?.length || 0, limit, offset } };
  } catch {
    return { status: 500, msg: 'Failed to retrieve products', data: null };
  }
};

export const getServiceById = async (productId) => {
  try {
    if (!productId) return { status: 400, msg: 'Product ID is required', data: null };

    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { status: 404, msg: 'Product not found', data: null };
      return { status: 400, msg: error.message, data: null };
    }

    if (!service) return { status: 404, msg: 'Product not found', data: null };

    const { data: seller } = await supabase
      .from('sellers')
      .select('id, title, description, category, user_id, portfolio')
      .eq('user_id', service.user_id)
      .single();

    const serviceWithSeller = { ...service, seller: seller || null };
    return { status: 200, msg: 'Product retrieved successfully', data: serviceWithSeller };
  } catch {
    return { status: 500, msg: 'Failed to retrieve product', data: null };
  }
};


