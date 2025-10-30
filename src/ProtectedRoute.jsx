// src/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // 'admin' or 'user'

  if (!token) {
    return <Navigate to="/login" />;
  }

  // If a role is specified and doesn't match, redirect appropriately
  if (role && userRole !== role) {
    return <Navigate to={`/${userRole}/dashboard`} />;
  }

  return children;
};

export default ProtectedRoute;
