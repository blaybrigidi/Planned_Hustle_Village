import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, signupData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Track if we've already processed this user to prevent duplicate calls
    let hasProcessedUser = false;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user && !hasProcessedUser) {
          hasProcessedUser = true;
          // Check if profile exists, create if needed
          setTimeout(() => {
            checkAndCreateProfile(session.user);
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAndCreateProfile = async (user: User) => {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!existingProfile) {
        // Get signup data from auth metadata (stored in Supabase)
        const signupData = user.user_metadata || {};

        // Create user profile with correct field names
        const { error: profileError } = await supabase.from('profiles').insert({
          id: user.id,
          first_name: signupData.firstName || null,
          last_name: signupData.lastName || null,
          phone: signupData.phoneNumber || null,
          role: signupData.userType || 'customer',
          profile_pic: null,
        });

        if (profileError) {
          // Handle duplicate key error gracefully (race condition from multiple auth state changes)
          if (profileError.code === '23505') {
            console.log('Profile already exists (duplicate key caught) - continuing...');
            return;
          }
          console.error('Error creating profile:', profileError);
          toast.error('Failed to create profile');
          return;
        }

        // If user is a seller and has service data, create the service
        if (signupData.service && (signupData.userType === 'seller' || signupData.userType === 'both')) {
          const { error: serviceError } = await supabase.from('services').insert({
            user_id: user.id,
            title: signupData.service.title,
            description: signupData.service.description,
            category: signupData.service.category,
            default_price: signupData.service.price || null,
            default_delivery_time: signupData.service.default_delivery_time || null,
            express_price: signupData.service.express_price || null,
            express_delivery_time: signupData.service.express_delivery_time || null,
            portfolio: signupData.service.portfolio || null,
            is_active: true,
          });

          if (serviceError) {
            console.error('Error creating service:', serviceError);
            toast.error('Profile created but failed to create service. You can add it later.');
          } else {
            toast.success('Account and service created successfully!');
          }
        } else {
          toast.success('Account created successfully!');
        }
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    }
  };

  const signIn = async (email: string, signupData?: any) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: signupData ? {
          firstName: signupData.firstName,
          lastName: signupData.lastName,
          phoneNumber: signupData.phoneNumber,
          userType: signupData.userType,
          service: signupData.service
        } : undefined
      }
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      navigate('/');
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
