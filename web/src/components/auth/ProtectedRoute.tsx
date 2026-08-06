import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles,
  children 
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    // Oturum açmamış kullanıcıyı login sayfasına yönlendir.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile) {
    // Kullanıcının rolü istenen rollerden biri değilse anasayfaya yönlendir
    if (!allowedRoles.includes(profile.role)) {
      return <Navigate to="/" replace />;
    }
  }

  // Children varsa onu render et, yoksa Outlet (nested route) render et
  return <>{children ? children : <Outlet />}</>;
};

export default ProtectedRoute;
