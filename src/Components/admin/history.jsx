import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import TextField from '@mui/material/TextField';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          'https://librarymanagementbackend-oqjx.onrender.com/api/borrowtransaction',
          config
        );
        const returnedOnly = res.data.filter(
          (txn) => txn.status === 'returned'
        );
        setTransactions(returnedOnly);
      } catch (error) {
        console.error(error);
        toast.error('❌ Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Convert selectedMonth dayjs object to YYYY-MM string for filtering
  const selectedMonthString = selectedMonth
    ? selectedMonth.format('YYYY-MM')
    : '';

  // Filter transactions based on searchQuery and selectedMonth
  const filtered = transactions.filter((txn) => {
    // Search filter
    const matchesSearch =
      txn.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.bookTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Month filter
    if (!selectedMonthString) return true; // no month selected, so ignore this filter

    if (!txn.returnDate) return false; // if no returnDate, can't match month

    // Extract YYYY-MM from returnDate (assuming it's in "YYYY-MM-DD" format)
    const returnMonth = txn.returnDate.slice(0, 7);

    return returnMonth === selectedMonthString;
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex flex-col h-full w-full p-6 font-body bg-gray-50">
        <ToastContainer />

        {/* Header buttons */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition"
          >
            <FaArrowLeft /> Back
          </button>
          <h2 className="text-xl font-semibold text-indigo-700">
            📖 Borrow History
          </h2>
        </div>

        {/* Search + Filter container */}
        <div className="flex justify-end mb-4 gap-2 items-center">
          <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm w-64">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search history..."
              className="w-full bg-transparent outline-none font-body"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Month filter using MUI DesktopDatePicker */}
          <DesktopDatePicker
            views={['year', 'month']}
            value={selectedMonth}
            onChange={(newValue) => setSelectedMonth(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                sx={{
                  width: 180,
                  '& .MuiInputBase-root': {
                    height: 40, // match search bar height approx
                    padding: '6px 12px', // similar padding to your search input px-3 py-2
                    fontSize: '0.875rem', // keep font size consistent
                  },
                }}
                InputLabelProps={{ shrink: false }} // prevents space for label, though label is not passed
                helperText={null}
                variant="outlined"
              />
            )}
          />
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow">
          {loading ? (
            <p className="text-gray-600 p-4">Loading history...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-600 p-4">
              No completed borrow records found.
            </p>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-indigo-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">User Email</th>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Borrow Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Return Date</th>
                  <th className="px-4 py-3">Fine</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((txn, idx) => (
                  <tr
                    key={txn.transactionId}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3">{txn.userEmail}</td>
                    <td className="px-4 py-3">{txn.bookTitle}</td>
                    <td className="px-4 py-3">{txn.borrowDate}</td>
                    <td className="px-4 py-3">{txn.dueDate}</td>
                    <td className="px-4 py-3">{txn.returnDate}</td>
                    <td className="px-4 py-3">₹{txn.fineAmount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </LocalizationProvider>
  );
};

export default History;
