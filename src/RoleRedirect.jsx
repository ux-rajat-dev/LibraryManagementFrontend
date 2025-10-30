// src/RoleRedirect.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');

    if (role === 'admin') {
      navigate('/admin/dashboard');
    } else if (role === 'user') {
      navigate('/user/dashboard');
    } else {
      // If no role is set or invalid, send back to login
      navigate('/login');
    }
  }, [navigate]);

  return null;
};

export default RoleRedirect;
