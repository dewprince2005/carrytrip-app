import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the public profile associated with the user ID
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If the profile does not exist yet (due to race condition or trigger lag)
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching profile:', error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    // Check active session on mount
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && mounted) {
          setUser(session.user);
          const userProfile = await fetchProfile(session.user.id);
          if (mounted) setProfile(userProfile);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes (login, logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setLoading(true);
      if (session) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Login with email and password
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Signup with email, password, and custom metadata which triggers profile creation
  const signup = async (email, password, fullName, phone, roles) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
          roles: roles, // array of strings e.g. ['sender', 'carrier']
        },
      },
    });
    if (error) throw error;
    return data;
  };

  // Logout current user
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Login with Google OAuth (Supabase handles the redirect)
  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
    return data;
  };

  // Trigger password reset email
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  };

  // Update password (used on reset password screen)
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return data;
  };

  // Manually refresh profile (e.g. after profile edits or role updates)
  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  const value = {
    user,
    profile,
    loading,
    login,
    loginWithGoogle,
    signup,
    logout,
    resetPassword,
    updatePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
