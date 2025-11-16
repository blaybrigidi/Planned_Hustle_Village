import * as productService from '../services/productService.js';

const getAllProducts = async (req) => {
  try {
    const { category, search, limit, offset, sortBy, order } = req.query;

    const filters = {
      category: category || null,
      search: search || null,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
      sortBy: sortBy || 'created_at',
      order: order || 'desc'
    };

    if (filters.limit < 1 || filters.limit > 100) {
      return { status: 400, msg: 'Limit must be between 1 and 100', data: null };
    }
    if (filters.offset < 0) {
      return { status: 400, msg: 'Offset must be 0 or greater', data: null };
    }

    const result = await productService.getAllServices(filters);
    return { status: result.status, msg: result.msg, data: result.data };
  } catch {
    return { status: 500, msg: 'Failed to retrieve products', data: null };
  }
};

const getProductById = async (req) => {
  try {
    const { id } = req.params;
    if (!id) return { status: 400, msg: 'Product ID is required', data: null };

    const result = await productService.getServiceById(id);
    return { status: result.status, msg: result.msg, data: result.data };
  } catch {
    return { status: 500, msg: 'Failed to retrieve product', data: null };
  }
};

export default { getAllProducts, getProductById };


