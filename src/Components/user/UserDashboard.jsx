import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/UserDashboard.css';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { HttpTransportType } from '@microsoft/signalr';

const UserDashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [isAllBooksModalOpen, setIsAllBooksModalOpen] = useState(false);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [selectedFilterGenre, setSelectedFilterGenre] = useState('All');
  const [borrowings, setBorrowings] = useState([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const returnedBooks = borrowings.filter((b) => b.status === 'returned');
  const totalFine = borrowings
    .filter((b) => b.status?.toLowerCase() !== 'returned')
    .reduce((sum, b) => sum + (b.fineAmount || 0), 0);

  // New state for SignalR connection
  const [connection, setConnection] = useState(null);

  // SignalR Setup
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get('https://localhost:7158/api/Genre');

        setGenres(res.data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  // Setup SignalR connection
  // Setup SignalR connection
  useEffect(() => {
    const startSignalR = async () => {
      try {
        const conn = new HubConnectionBuilder()
          .withUrl('https://localhost:7158/notificationHub', {
            accessTokenFactory: () => localStorage.getItem('token'),
            transport: HttpTransportType.WebSockets,
          })
          .withAutomaticReconnect()
          .build();

        // Listen for book updates
        conn.on('ReceiveBookUpdate', async (message) => {
          console.log('SignalR message received:', message);
          // Refetch books
          try {
            const booksRes = await axios.get('https://localhost:7158/api/Book');
            setBooks(booksRes.data);
            // Refetch borrowings
            const token = localStorage.getItem('token');
            const userEmail = localStorage.getItem('email');
            const borrowRes = await axios.get(
              'https://localhost:7158/api/borrowtransaction',
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setBorrowings(
              borrowRes.data.filter((b) => b.userEmail === userEmail)
            );
          } catch (err) {
            console.error('Error refreshing data after SignalR update:', err);
          }
        });

        await conn.start();
        console.log('SignalR connected');
        setConnection(conn);
      } catch (err) {
        console.error('SignalR connection failed:', err);
      }
    };

    startSignalR();

    return () => {
      if (connection) connection.stop();
    };
  }, []);

  const handleFilterChange = (genre) => {
    setSelectedFilterGenre(genre);
    if (genre === 'All') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(
        (b) => b.genreName.toLowerCase() === genre.toLowerCase()
      );
      setFilteredBooks(filtered);
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('https://localhost:7158/api/Book');
        setBooks(res.data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleBookClick = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const confirmBorrow = async () => {
    if (!selectedBook) return;

    setBorrowing(true);
    try {
      const actualUserId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      // Borrow date is today
      const borrowDate = new Date();

      // Due date is 7 days later
      const dueDate = new Date(borrowDate);
      dueDate.setDate(dueDate.getDate() + 7);

      // Format dates as YYYY-MM-DD
      const formatDate = (date) => date.toISOString().split('T')[0];

      const payload = {
        userId: actualUserId,
        bookId: selectedBook.bookId,
        borrowDate: formatDate(borrowDate),
        dueDate: formatDate(dueDate),
      };

      await axios.post(
        'https://localhost:7158/api/borrowtransaction/borrow',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setBooks((prevBooks) =>
        prevBooks.map((b) =>
          b.bookId === selectedBook.bookId
            ? { ...b, availableCopies: b.availableCopies - 1 }
            : b
        )
      );

      setIsConfirmOpen(false);
      setIsModalOpen(false);

      // Trigger SignalR to notify all connected clients
      if (connection && connection.state === 'Connected') {
        connection
          .invoke('NotifyBookUpdate', 'A book has been borrowed!')
          .catch((err) => console.error('SignalR invoke error:', err));
      } else {
        console.warn('SignalR connection not ready yet');
      }

      setSelectedBook(null);
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert('Failed to borrow book. Please try again.');
    } finally {
      setBorrowing(false);
    }
  };

  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchBorrowings = async () => {
      try {
        const token = localStorage.getItem('token');
        const userEmail = localStorage.getItem('email');

        const response = await fetch(
          'https://localhost:7158/api/borrowtransaction',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        const filtered = data.filter((b) => b.userEmail === userEmail);

        setBorrowings(filtered);
      } catch (error) {
        console.error('Error fetching borrowings:', error);
      }
    };

    fetchBorrowings();
  }, []);

  return (
    <div className="user-dashboard">
      <div className="borrowed-section">
        <div className="dashboard-header">
          <h2 className="dashboard-title">📚 Featured Books</h2>
          <button
            className="see-all-btn"
            onClick={() => {
              setFilteredBooks(books); // load all books by default
              setIsAllBooksModalOpen(true);
            }}
          >
            See All Books
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Loading books...</p>
        ) : (
          <div className="book-scroll-container">
            {books.map((book) => (
              <div
                key={book.bookId}
                className="book-card"
                onClick={() => handleBookClick(book)}
              >
                <div className="book-image-wrapper">
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="book-cover"
                  />
                </div>
                <div className="book-info">
                  <h3 className="book-title">{book.title}</h3>
                  <p className="book-author">by {book.authorName}</p>
                  <p className="book-genre">{book.genreName}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Modal */}
      {isModalOpen && selectedBook && (
        <div className="book-modal-overlay">
          <div className="book-modal">
            <button
              className="modal-close"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>

            <div className="modal-content">
              <div className="modal-image">
                <img
                  src={selectedBook.coverImageUrl}
                  alt={selectedBook.title}
                />
              </div>

              <div className="modal-details">
                <h3>{selectedBook.title}</h3>
                <p>
                  <strong>Author:</strong> {selectedBook.authorName}
                </p>
                <p>
                  <strong>Genre:</strong> {selectedBook.genreName}
                </p>
                <p>
                  <strong>Published Year:</strong> {selectedBook.publishedYear}
                </p>
                <p>
                  <strong>ISBN:</strong> {selectedBook.isbn}
                </p>
                <p>
                  <strong>Available Copies:</strong>{' '}
                  {selectedBook.availableCopies}
                </p>
                <p className="modal-desc">
                  <strong>Description:</strong> {selectedBook.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Overlay */}
      {isConfirmOpen && (
        <div className="book-modal-overlay">
          <div
            className="book-modal"
            style={{ maxWidth: '400px', textAlign: 'center' }}
          >
            <p>
              Are you sure you want to borrow " <br />
              <strong>{selectedBook.title}</strong>"?
            </p>
            <div className="modal-actions">
              <button
                className="cancel-btn"
                onClick={() => setIsConfirmOpen(false)}
              >
                No
              </button>
              <button
                className="borrow-btn"
                onClick={confirmBorrow}
                disabled={borrowing}
              >
                {borrowing ? 'Processing...' : 'Yes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Overlay */}

      {/* See All Books Overlay */}
      {isAllBooksModalOpen && (
        <div className="overlay">
          <div className="overlay-modal">
            {/* Header */}
            <div className="overlay-header">
              <h2>📚 All Books</h2>
              <button
                className="close-btn"
                onClick={() => setIsAllBooksModalOpen(false)}
              >
                ×
              </button>
            </div>

            {/* Filter by Genre */}
            <div className="overlay-filter">
              <label>Filter by Genre:</label>
              <select
                value={selectedFilterGenre}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="All">All</option>
                {genres.map((genre) => (
                  <option key={genre.genreId} value={genre.name}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Book List */}
            <div className="overlay-book-list">
              {(selectedFilterGenre === 'All' ? books : filteredBooks).map(
                (book) => {
                  // Get genre name safely

                  // Handle published year safely
                  const publishedYear =
                    book.publishedYear || book.PublishYear || 'N/A';

                  // Handle description safely
                  const description =
                    book.description && book.description.length > 120
                      ? book.description.slice(0, 120) + '...'
                      : book.description || 'No description available.';

                  return (
                    <div key={book.bookId} className="list-book-card">
                      <img src={book.coverImageUrl} alt={book.title} />

                      <div className="book-info">
                        <div className="Desctitle">
                          <h3 className="book-title">{book.title}</h3>

                          <p className="book-description">{description}</p>

                          {/* Publish Year */}
                          <p className="book-year">
                            <strong>Published:</strong> {publishedYear}
                          </p>

                          {/* Genre Name */}
                          <p className="book-genre">
                            <strong>Genre:</strong>{' '}
                            {book.genreName || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* Borrowed Books */}
      <div className="ub-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">📘 Your Borrowed Books</h2>
          <button
            className="see-all-btn"
            onClick={() => setShowHistoryModal(true)}
          >
            History
          </button>
        </div>

        {/* Main Borrowed Books Table */}
        <div className="ub-table-wrapper">
          <table className="ub-table">
            <thead>
              <tr>
                <th>Book Title</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Fine (₹)</th>
                <th>Days Late</th> {/* Added new column */}
              </tr>
            </thead>
            <tbody>
              {borrowings
                .filter((b) => b.status?.toLowerCase() !== 'returned')
                .map((b) => {
                  const today = new Date();
                  const dueDate = new Date(b.dueDate);
                  const todayMidnight = new Date(today.setHours(0, 0, 0, 0)); // Set today's time to midnight
                  const dueDateMidnight = new Date(
                    dueDate.setHours(0, 0, 0, 0)
                  ); // Set due date to midnight

                  let daysLate = 0;

                  if (
                    b.status?.toLowerCase() !== 'returned' &&
                    todayMidnight > dueDateMidnight
                  ) {
                    const diffTime = todayMidnight - dueDateMidnight; // Calculate the difference in milliseconds
                    daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
                  }

                  return (
                    <tr key={b.transactionId}>
                      <td>{b.bookTitle}</td>
                      <td>{new Date(b.borrowDate).toLocaleDateString()}</td>
                      <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                      <td className={`ub-status ${b.status?.toLowerCase()}`}>
                        {b.status}
                      </td>
                      <td>{b.fineAmount || 0}</td>
                      <td>{daysLate}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* History Modal */}
        {showHistoryModal && (
          <div className="ub-modal-overlay">
            <div className="ub-modal">
              <div className="ub-modal-header">
                <h3>📚 Borrowing History</h3>
                <button
                  className="ub-modal-close"
                  onClick={() => setShowHistoryModal(false)}
                >
                  ×
                </button>
              </div>
              <div className="ub-modal-body ub-table-wrapper">
                <table className="ub-table">
                  <thead>
                    <tr>
                      <th>Book Title</th>
                      <th>Borrow Date</th>
                      <th>Due Date</th>
                      <th>Return Date</th>
                      <th>Status</th>
                      <th>Fine (₹)</th>
                      <th>Days Late</th> {/* Added new column */}
                    </tr>
                  </thead>
                  <tbody>
                    {returnedBooks.length > 0 ? (
                      returnedBooks.map((b) => {
                        const returnDate = new Date(b.returnDate);
                        const dueDate = new Date(b.dueDate);
                        const diffTime = returnDate - dueDate;
                        const daysLate = Math.ceil(
                          diffTime / (1000 * 60 * 60 * 24)
                        ); // Days late calculation

                        return (
                          <tr key={b.transactionId}>
                            <td>{b.bookTitle}</td>
                            <td>
                              {new Date(b.borrowDate).toLocaleDateString()}
                            </td>
                            <td>{new Date(b.dueDate).toLocaleDateString()}</td>
                            <td>
                              {new Date(b.returnDate).toLocaleDateString()}
                            </td>
                            <td
                              className={`ub-status ${b.status?.toLowerCase()}`}
                            >
                              {b.status}
                            </td>
                            <td>{b.fineAmount || 0}</td>
                            <td>{daysLate}</td> {/* Displaying Days Late */}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="ub-empty">
                          No returned books yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {borrowings.some((b) => b.status?.toLowerCase() !== 'returned') && (
          <div className="ub-total-fine">
            <p className="ub-total-text">
              💰 <strong>Total Fine:</strong> ₹{totalFine}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
