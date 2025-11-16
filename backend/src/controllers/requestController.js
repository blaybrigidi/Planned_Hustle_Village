import * as requestService from '../services/requestService.js';

const createRequest = async (req) => {
  try {
    const userId = req.user?.id;
    if (!userId) return { status: 401, msg: "Unauthorized: user not found", data: null };

    const { title, description, needed_by } = req.body; 
    if (!title || !description || !needed_by) return { status: 400, msg: "Title, description, and needed_by are required", data: null };

    const result = await requestService.createRequest(userId, { title, description, needed_by });
    return { status: result.status, msg: result.msg, data: result.data };
  } catch (error) {
    console.error('Error in createRequest controller:', error);
    return { status: 500, msg: "Internal server error", data: null };
  }
};

export default { createRequest };


