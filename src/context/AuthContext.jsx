import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);


  const checkAdmin = async (email) => {
    console.log('Checking admin status for:', email);
    setLoading(true);
    if (!email) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase.from('admin_users').select('*').eq('email', email).maybeSingle();
      console.log('Admin check result:', { data, error });
      if (data && !error) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('Admin check exception:', err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
      console.log('Auth loading finished.');
    }
  };

  useEffect(() => {


    // Get session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Auth check error:', error.message);
      }
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        checkAdmin(currentUser.email);
      } else {
        setLoading(false);
      }
    }).catch(err => {
      console.warn('Network issue during auth check:', err.message);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        checkAdmin(currentUser.email);
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const logout = () => {
    return supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
