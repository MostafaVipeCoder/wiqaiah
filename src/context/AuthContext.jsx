import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    // Initial check from localStorage for instant refresh
    return localStorage.getItem('wiqaiah_is_admin') === 'true';
  });
  const [loading, setLoading] = useState(true);

  const checkAdmin = async (email, isInitial = false) => {
    if (!email) {
      setIsAdmin(false);
      localStorage.removeItem('wiqaiah_is_admin');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('admin_users')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      const adminStatus = !!data && !error;
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        localStorage.setItem('wiqaiah_is_admin', 'true');
      } else {
        localStorage.removeItem('wiqaiah_is_admin');
      }
    } catch (err) {
      setIsAdmin(false);
      localStorage.removeItem('wiqaiah_is_admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // If we already have a cached admin status, we can set loading to false immediately
        // and let the background check update it if needed.
        if (localStorage.getItem('wiqaiah_is_admin') === 'true') {
          setLoading(false);
          checkAdmin(currentUser.email, false); // background check
        } else {
          checkAdmin(currentUser.email, true);
        }
      } else {
        setLoading(false);
      }
    }).catch(() => {
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        if (event === 'SIGNED_IN') {
          checkAdmin(currentUser.email, true);
        } else {
          checkAdmin(currentUser.email, false);
        }
      } else {
        setIsAdmin(false);
        localStorage.removeItem('wiqaiah_is_admin');
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
