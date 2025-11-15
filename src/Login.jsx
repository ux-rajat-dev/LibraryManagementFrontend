import React, { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showDemoPopup, setShowDemoPopup] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await axios.post(
        'https://librarymanagement-ry5j.onrender.com/api/user/login',
        formData
      );

      const token = res.data.token;
      if (!token) {
        throw new Error('No token returned from API');
      }

      const decoded = jwtDecode(token);

      localStorage.setItem('token', token);
      localStorage.setItem('userId', decoded.sub);
      localStorage.setItem('role', decoded.role);
      localStorage.setItem('email', decoded.email);

      if (decoded.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (decoded.role === 'user') {
        navigate('/user/dashboard');
      } else {
        setMessage('Unknown role');
        localStorage.clear();
      }
    } catch (err) {
      setMessage('❌ Login failed. Please check your credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 🔥 DEMO POPUP OVERLAY */}
      {showDemoPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-80 text-center">
            <h2 className="text-xl font-bold mb-3">Demo Credentials</h2>

            <div className="text-sm space-y-4 font-body text-left">
              <div>
                <p className="font-semibold">Admin:</p>
                <p>
                  Email: <span className="font-mono">admin@gmail.com</span>
                </p>
                <p>
                  Password: <span className="font-mono">Admin</span>
                </p>
              </div>

              <div>
                <p className="font-semibold">User:</p>
                <p>
                  Email: <span className="font-mono">dummy@gmail.com</span>
                </p>
                <p>
                  Password: <span className="font-mono">Dummy</span>
                </p>
              </div>
            </div>

            <button
              className="w-full bg-indigo-600 text-white py-2 rounded-lg mt-6 hover:bg-indigo-700"
              onClick={() => setShowDemoPopup(false)}
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full flex items-center justify-center bg-[#F9FAFB] px-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-heading font-bold text-center mb-6">
            Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-sm">Email</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <FaEnvelope className="text-gray-400 mr-2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full outline-none bg-transparent font-body"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">Password</label>
              <div className="flex items-center border rounded-lg px-3 py-2">
                <FaLock className="text-gray-400 mr-2" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full outline-none bg-transparent font-body"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-heading text-sm hover:bg-indigo-700 transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {message && (
              <p className="text-center text-sm text-red-500 font-body">
                {message}
              </p>
            )}

            <p className="text-center text-xs mt-2 text-gray-500 font-body">
              Please do not modify any settings. This is a demo environment.
            </p>
          </form>

          <p className="text-center text-sm mt-4 font-body">
            Don’t have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-600 font-medium hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
