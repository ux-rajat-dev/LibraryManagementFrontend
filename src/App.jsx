// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import DashboardWelcome from './Welcome';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from './Components/admin/dashboard';
import AdminAuthors from './Components/admin/authors';
import AdminGenres from './Components/admin/genres';
import AdminBooks from './Components/admin/books';
import UserDashboard from './Components/user/UserDashboard';
import AdminBorrowTransactions from './Components/admin/borrowtransactions';
import UserManagement from './Components/admin/usermanagement';
import RoleRedirect from './RoleRedirect';
import History from './Components/admin/history';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Redirect root based on role */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <RoleRedirect />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="admin">
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardWelcome />} />
        <Route path="authors" element={<AdminAuthors />} />
        <Route path="genres" element={<AdminGenres />} />
        <Route path="books" element={<AdminBooks />} />
        <Route path="users" element={<UserManagement />} />
        <Route
          path="borrowtransactions"
          element={<AdminBorrowTransactions />}
        />
        <Route path="borrowtransactions/history" element={<History />} />
      </Route>

      {/* User Dashboard */}
      <Route
        path="/user/dashboard"
        element={
          <ProtectedRoute role="user">
            <UserDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;
