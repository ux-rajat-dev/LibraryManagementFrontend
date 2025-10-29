// BorrowTransactions.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaSearch, FaPlus } from 'react-icons/fa';
import { MdReplay } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';
import {
  DatePicker,
  DesktopDatePicker,
  MobileDatePicker,
  StaticDatePicker,
} from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';

const BorrowTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [borrowForm, setBorrowForm] = useState({
    userId: '',
    bookId: '',
    borrowDate: today,
    dueDate: '',
  });
  const [returnForm, setReturnForm] = useState({
    transactionId: null,
    returnDate: '',
  });
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [usersRes, booksRes, txRes] = await Promise.all([
          axios.get('https://localhost:7158/api/user', config),
          axios.get('https://localhost:7158/api/Book', config),
          axios.get('https://localhost:7158/api/borrowtransaction', config),
        ]);

        // Ensure we handle both object and array responses
        const safeUsers = Array.isArray(usersRes.data)
          ? usersRes.data
          : [usersRes.data];
        const safeBooks = Array.isArray(booksRes.data)
          ? booksRes.data
          : [booksRes.data];

        setUsers(safeUsers);
        setBooks(safeBooks);

        setTransactions(
          txRes.data.sort((a, b) => {
            if (!a.returnDate && b.returnDate) return -1;
            if (a.returnDate && !b.returnDate) return 1;
            return new Date(b.borrowDate) - new Date(a.borrowDate);
          })
        );
      } catch (err) {
        console.error(err);
        toast.error('❌ Error fetching data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [token]);

  const filtered = searchQuery
    ? transactions.filter(
        (txn) =>
          txn.status === 'borrowed' &&
          (txn.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : transactions.filter((txn) => txn.status === 'borrowed');

  const handleSubmitBorrow = async (e) => {
    e.preventDefault();
    const { userId, bookId, borrowDate, dueDate } = borrowForm;

    if (!userId || !bookId || !borrowDate) {
      alert('Please fill in user, book, and borrow date.');
      return;
    }

    let finalDueDate = dueDate;

    // Auto-set dueDate to 7 days after borrowDate if not provided
    if (!finalDueDate) {
      const borrow = new Date(borrowDate);
      borrow.setDate(borrow.getDate() + 7);
      finalDueDate = borrow.toISOString().split('T')[0]; // format YYYY-MM-DD
    }

    try {
      const payload = {
        userId: Number(userId),
        bookId: Number(bookId),
        borrowDate,
        dueDate: finalDueDate,
        fineAmount: 0,
      };

      await axios.post(
        'https://localhost:7158/api/borrowtransaction/borrow',
        payload,
        config
      );

      toast.success('📘 Book borrowed successfully');
      setIsBorrowModalOpen(false);

      const txRes = await axios.get(
        'https://localhost:7158/api/borrowtransaction',
        config
      );
      setTransactions(txRes.data);

      setBorrowForm({ userId: '', bookId: '', borrowDate: '', dueDate: '' });
    } catch (error) {
      console.error('Borrow API error:', error);
      const errMsg =
        error.response?.data?.title || error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(', ')
          : error.message;
      alert('Failed to borrow book: ' + errMsg);
    }
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();

    if (!returnForm.returnDate) {
      alert('Please select a return date');
      return;
    }

    const payload = {
      transactionId: returnForm.transactionId,
      returnDate: returnForm.returnDate,
    };

    try {
      await axios.put(
        'https://localhost:7158/api/borrowtransaction/return',
        payload,
        config
      );

      toast.success('✅ Book returned successfully');
      setIsReturnModalOpen(false);

      const txRes = await axios.get(
        'https://localhost:7158/api/borrowtransaction',
        config
      );
      setTransactions(txRes.data);
    } catch (err) {
      console.error('Return API error:', err.response || err);
      console.log('Transactions after return:', txRes.data);
      toast.error(
        `❌ Failed to return book: ${err.response?.data?.title || err.message}`
      );
    }
  };

  const formFieldClass =
    'w-full px-3 py-2 border rounded-lg bg-white shadow-sm outline-none text-base';

  return (
    <div className="flex flex-col h-full w-full p-6 font-body bg-gray-50">
      <ToastContainer />

      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition"
        >
          <FaArrowLeft /> Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={() =>
              navigate('/admin/dashboard/borrowtransactions/history')
            }
            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50 transition"
          >
            📖 History
          </button>

          <button
            onClick={() => setIsBorrowModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
          >
            <FaPlus /> Borrow Book
          </button>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm w-64">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="w-full bg-transparent outline-none font-body"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow">
        {loading ? (
          <p className="text-gray-600 p-4">Loading transactions...</p>
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
                <th className="px-4 py-3 text-center">Actions</th>
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
                  <td className="px-4 py-3">
                    {txn.returnDate || (
                      <span className="text-yellow-600 font-medium">
                        Not Returned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">₹{txn.fineAmount || 0}</td>
                  <td className="px-4 py-3 text-center">
                    {!txn.returnDate ? (
                      <button
                        onClick={() => {
                          setReturnForm({
                            transactionId: txn.transactionId,
                            returnDate: '',
                          });
                          setIsReturnModalOpen(true);
                        }}
                        title="Return Book"
                        className="text-green-600 hover:text-green-800"
                      >
                        <MdReplay size={22} />
                      </button>
                    ) : (
                      <span
                        className="text-green-600 font-semibold flex items-center justify-center gap-1"
                        title="Returned"
                      >
                        Book Received
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Borrow Modal */}
      {isBorrowModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl relative font-body">
            <button
              onClick={() => setIsBorrowModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600 text-2xl"
            >
              ×
            </button>
            <h3 className="text-2xl font-semibold mb-6 text-indigo-700 flex gap-2 items-center">
              📘 Borrow Book
            </h3>
            <form onSubmit={handleSubmitBorrow} className="space-y-6">
              {/* Select User */}
              <select
                name="userId"
                value={borrowForm.userId}
                onChange={(e) =>
                  setBorrowForm((prev) => ({ ...prev, userId: e.target.value }))
                }
                required
                className={formFieldClass}
              >
                <option value="">Select User</option>
                {users
                  .filter((user) => user.role !== 'admin')
                  .map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.fullName || user.name || user.email}
                    </option>
                  ))}
              </select>

              {/* Select Book */}
              <select
                name="bookId"
                value={borrowForm.bookId}
                onChange={(e) =>
                  setBorrowForm((prev) => ({ ...prev, bookId: e.target.value }))
                }
                required
                className={formFieldClass}
              >
                <option value="">Select Book</option>
                {books.map((book) => (
                  <option key={book.bookId} value={book.bookId}>
                    {book.title}
                  </option>
                ))}
              </select>

              {/* Borrow Date & Due Date Pickers wrapped in one LocalizationProvider */}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="flex gap-4">
                  <DatePicker
                    label="Borrow Date"
                    value={
                      borrowForm.borrowDate
                        ? dayjs(borrowForm.borrowDate)
                        : null
                    }
                    onChange={(newValue) => {
                      const formatted = newValue
                        ? newValue.format('YYYY-MM-DD')
                        : '';
                      setBorrowForm((prev) => ({
                        ...prev,
                        borrowDate: formatted,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        className={`${formFieldClass} flex-1`}
                      />
                    )}
                  />

                  <DatePicker
                    label="Due Date (Optional)"
                    value={
                      borrowForm.dueDate ? dayjs(borrowForm.dueDate) : null
                    }
                    onChange={(newValue) => {
                      const formatted = newValue
                        ? newValue.format('YYYY-MM-DD')
                        : '';
                      setBorrowForm((prev) => ({
                        ...prev,
                        dueDate: formatted,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        className={`${formFieldClass} flex-1`}
                      />
                    )}
                  />
                </div>
              </LocalizationProvider>

              <small className="text-sm text-gray-500 block">
                Optional: Leave due date empty to auto-set +7 days from borrow
                date.
              </small>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition font-semibold"
              >
                Borrow
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-lg shadow-xl relative font-body">
            {/* Close Button */}
            <button
              onClick={() => setIsReturnModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600 transition text-2xl"
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Header */}
            <h3 className="text-2xl font-semibold mb-6 flex items-center gap-3 font-heading text-green-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 14l-7 7-7-7M12 3v18"
                />
              </svg>
              Return Book
            </h3>

            <form onSubmit={handleSubmitReturn} className="space-y-6">
              <label className="block text-gray-700 font-semibold">
                <div className="flex items-center gap-2 mb-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7a2 2 0 002 2z"
                    />
                  </svg>
                  Return Date
                </div>

                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    value={
                      returnForm.returnDate
                        ? dayjs(returnForm.returnDate)
                        : null
                    }
                    onChange={(newValue) => {
                      const formatted = newValue
                        ? newValue.format('YYYY-MM-DD')
                        : '';
                      setReturnForm((prev) => ({
                        ...prev,
                        returnDate: formatted,
                      }));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        fullWidth
                        className="bg-white border border-green-400 rounded-lg shadow-sm"
                      />
                    )}
                  />
                </LocalizationProvider>
              </label>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold text-lg shadow-md"
              >
                Return
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowTransactions;
