import { supabase } from "../config/supabase.js";

export const signup = async ({ email, password, firstName, lastName, phoneNumber, profilePic, role }) => {
  try {
    const metadata = { firstName, lastName, phoneNumber, profilePic, role };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) {
      return { status: 400, msg: error.message, data: null };
    }

    return {
      status: 201,
      msg: "Signup successful. Please verify your email.",
      data: {
        userId: data.user?.id,
        email: data.user?.email
      }
    };

  } catch (e) {
    return { status: 500, msg: "Signup failed", data: null };
  }
};



export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { status: 400, msg: error.message, data: null };
    }

    return {
      status: 200,
      msg: "Login successful",
      data: {
        user: data.user,
        session: data.session
      }
    };

  } catch (e) {
    return { status: 500, msg: "Login failed", data: null };
  }
};



export const resendVerification = async (email) => {
  try {
    const { error } = await supabase.auth.resend({ email, type: "signup" });

    if (error) {
      return { status: 400, msg: error.message, data: null };
    }

    return { status: 200, msg: "Verification email sent", data: null };

  } catch (e) {
    return { status: 500, msg: "Failed to resend verification email", data: null };
  }
};



export const verifyEmail = async (token, type = "signup") => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: token, type });

    if (error) {
      return { status: 400, msg: error.message, data: null };
    }

    return {
      status: 200,
      msg: "Email verified successfully",
      data: data
    };

  } catch (e) {
    return { status: 500, msg: "Email verification failed", data: null };
  }
};



export const getMe = async (accessToken) => {
  try {
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error) {
      return { status: 401, msg: error.message, data: null };
    }

    return { status: 200, msg: "User retrieved", data: data.user };

  } catch (e) {
    return { status: 500, msg: "Failed to get user", data: null };
  }
};



export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { status: 400, msg: error.message, data: null };
    }

    return { status: 200, msg: "Logout successful", data: null };

  } catch (e) {
    return { status: 500, msg: "Logout failed", data: null };
  }
};
