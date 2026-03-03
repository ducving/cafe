import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

type AnyObject = Record<string, any>;

function isAdminUser(user: any): boolean {
  if (!user || typeof user !== 'object') return false;
  const u: AnyObject = user as AnyObject;
  const role = String(u.role || u.type || u.user_type || '').toLowerCase();
  if (role === 'admin') return true;
  if (u.isAdmin === true || u.is_admin === true) return true;
  if (u.is_admin === 1 || u.isAdmin === 1) return true;
  if (u.level === 1 || u.role_id === 1) return true;
  return false;
}

function safeParseUser(raw: string | null): AnyObject | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AnyObject;
  } catch {
    return null;
  }
}

type RequireAuthProps = {
  children: React.ReactElement;
  adminOnly?: boolean;
};

export default function RequireAuth({ children, adminOnly = false }: RequireAuthProps): React.ReactElement {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const user = safeParseUser(localStorage.getItem('user'));

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (adminOnly && !isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

