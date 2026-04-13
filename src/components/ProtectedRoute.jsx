import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return <div className="section-padding container"><h3>Loading Auth...</h3></div>;
  
  if (!user || !isAdmin) {
    return <Navigate to="/dashboard/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
