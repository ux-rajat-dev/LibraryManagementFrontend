import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  FaUserAlt,
  FaTags,
  FaBook,
  FaClipboardList,
  FaUser,
} from 'react-icons/fa';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white p-6 space-y-4">
        <h2 className="text-xl font-heading font-bold mb-6">📚 Library</h2>

        <nav className="space-y-2">
          {/* This is for Authors*/}
          <NavLink
            to="authors"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md font-body transition-colors duration-200 ${
                isActive
                  ? 'bg-white text-indigo-700 font-semibold shadow'
                  : 'text-white hover:text-gray-200'
              }`
            }
          >
            <FaUserAlt /> Authors
          </NavLink>

          {/* This is for Genres*/}
          <NavLink
            to="genres"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md font-body transition-colors duration-200 ${
                isActive
                  ? 'bg-white text-indigo-700 font-semibold shadow'
                  : 'text-white hover:text-gray-200'
              }`
            }
          >
            <FaTags /> Genres
          </NavLink>

          {/* This is for Books*/}
          <NavLink
            to="books"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md font-body transition-colors duration-200 ${
                isActive
                  ? 'bg-white text-indigo-700 font-semibold shadow'
                  : 'text-white hover:text-gray-200'
              }`
            }
          >
            <FaBook /> Books
          </NavLink>

          {/* This is for Borrow Transactions */}
          <NavLink
            to="borrowtransactions"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md font-body transition-colors duration-200 ${
                isActive
                  ? 'bg-white text-indigo-700 font-semibold shadow'
                  : 'text-white hover:text-gray-200'
              }`
            }
          >
            <FaClipboardList /> Borrowings
          </NavLink>
          <NavLink
            to="users"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md font-body transition-colors duration-200 ${
                isActive
                  ? 'bg-white text-indigo-700 font-semibold shadow'
                  : 'text-white hover:text-gray-200'
              }`
            }
          >
            <FaUser /> Users
          </NavLink>
          <NavLink
            to="/login"
            onClick={() => localStorage.removeItem('token')}
            className="flex items-center gap-2 px-3 py-2 mt-10 rounded-md font-body bg-red-500 hover:bg-red-600 transition-colors duration-200"
          >
            🚪 Logout
          </NavLink>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 h-screen overflow-y-auto p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;
