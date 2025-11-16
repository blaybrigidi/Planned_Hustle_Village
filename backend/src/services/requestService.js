import { supabase } from '../config/supabase.js';

export const createRequest = async (userId, requestData) => {
  try {
    const { data, error } = await supabase
      .from('requests')
      .insert([{ user_id: userId, ...requestData, status: 'active', created_at: new Date().toISOString() }])
      .select()
      .single();

    if (error) return { status: 400, msg: error.message, data: null };
    return { status: 201, msg: "Request created successfully", data };
  } catch (error) {
    console.error("createRequest error:", error);
    return { status: 500, msg: "Failed to create request", data: null };
  }
};


