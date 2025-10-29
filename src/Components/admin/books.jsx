import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaSearch, FaPlus } from 'react-icons/fa';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editBookId, setEditBookId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    authorId: '',
    genreId: '',
    isbn: '',
    totalCopies: '',
    availableCopies: '',
    publishedYear: '',
    coverImageUrl: '',
  });

  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get('https://localhost:7158/api/Book', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBooks(res.data);
      } catch (err) {
        console.error('Error fetching books:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchDropdowns = async () => {
      try {
        const [authorRes, genreRes] = await Promise.all([
          axios.get('localhost:7158/api/Author', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('https://localhost:7158/api/Genre', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setAuthors(authorRes.data);
        setGenres(genreRes.data);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };

    fetchBooks();
    fetchDropdowns();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (book) => {
    const matchedAuthor = authors.find((a) => a.name === book.authorName);
    const matchedGenre = genres.find((g) => g.name === book.genreName);

    setFormData({
      title: book.title || '',
      description: book.description || '',
      authorId: matchedAuthor?.authorId ?? '',
      genreId: matchedGenre?.genreId ?? '',
      isbn: book.isbn || '',
      totalCopies: book.totalCopies ?? '',
      availableCopies: book.availableCopies ?? '',
      publishedYear: book.publishedYear ?? '',
      coverImageUrl: book.coverImageUrl || '',
    });

    setEditBookId(book.bookId);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await axios.delete(`https://localhost:7158/api/Book/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('🗑️ Book deleted successfully!');
        setBooks(books.filter((b) => b.bookId !== id));
      } catch (err) {
        console.error('Error deleting book:', err);
        toast.error('❌ Failed to delete book.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await axios.put(
          'https://localhost:7158/api/Book',
          {
            bookId: editBookId,
            ...formData,
            availableCopies: formData.availableCopies, // send old value
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('✅ Book updated successfully!');
      } else {
        await axios.post('https://localhost:7158/api/Book', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('📚 Book added successfully!');
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setEditBookId(null);

      const res = await axios.get('https://localhost:7158/api/Book', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(res.data);
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error('❌ Failed to submit book.');
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.authorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genreName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGenre =
      selectedGenre === '' || book.genreName === selectedGenre;

    return matchesSearch && matchesGenre;
  });

  return (
    <div className="flex flex-col h-full w-full p-6 font-body">
      <ToastContainer />

      {/* Top Controls */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
        >
          <FaArrowLeft /> Back
        </button>
        <button
          onClick={() => {
            setFormData({
              title: '',
              description: '',
              authorId: '',
              genreId: '',
              isbn: '',
              totalCopies: '',
              availableCopies: '',
              publishedYear: '',
              coverImageUrl: '',
            });
            setIsModalOpen(true);
            setIsEditing(false);
            setEditBookId(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <FaPlus /> Publish Book
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm w-64">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent outline-none font-body"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm">
            <select
              className="bg-transparent outline-none font-body w-40"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              {[...new Set(books.map((b) => b.genreName))].map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow">
        {loading ? (
          <p className="text-gray-600 p-4">Loading books...</p>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-indigo-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Genre</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Available</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book, index) => (
                <tr key={book.bookId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>{' '}
                  {/* Serial number */}
                  <td className="px-4 py-3">{book.title}</td>
                  <td className="px-4 py-3">{book.authorName}</td>
                  <td className="px-4 py-3">{book.genreName}</td>
                  <td className="px-4 py-3">{book.totalCopies}</td>
                  <td className="px-4 py-3">{book.availableCopies}</td>
                  <td className="px-4 py-3">{book.publishedYear}</td>
                  <td className="px-4 py-3 text-center space-x-4">
                    <button
                      onClick={() => handleEditClick(book)}
                      className="text-indigo-600 hover:text-indigo-800 transition"
                      title="Edit"
                    >
                      <MdEdit size={24} />
                    </button>
                    <button
                      onClick={() => handleDelete(book.bookId)}
                      className="text-red-600 hover:text-red-800 transition"
                      title="Delete"
                    >
                      <MdDeleteOutline size={24} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl shadow-lg relative font-body">
            <button
              className="absolute top-2 right-3 text-black hover:text-red-600 text-lg font-bold"
              onClick={() => {
                setIsModalOpen(false);
                setIsEditing(false);
                setEditBookId(null);
              }}
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4 font-heading">
              {isEditing ? '✏️ Edit Book' : '📚 Publish New Book'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              {/* Title */}
              <label className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                <span className="mb-1 md:mb-0 w-full md:w-32 font-semibold text-gray-700">
                  Title:
                </span>
                <input
                  type="text"
                  name="title"
                  placeholder="Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full md:flex-1 px-3 py-2 border rounded-lg bg-white shadow-sm outline-none text-base leading-normal"
                  style={{ minHeight: '40px' }}
                />
              </label>

              {/* Description */}
              <label className="flex flex-col md:flex-row md:items-start md:space-x-4 mb-4">
                <span className="mb-1 md:mb-0 w-full md:w-32 font-semibold text-gray-700">
                  Description:
                </span>
                <textarea
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full md:flex-1 px-3 py-2 border rounded-lg bg-white shadow-sm outline-none resize-y text-base leading-normal"
                  style={{ minHeight: '80px' }}
                />
              </label>

              {/* Author */}
              <label className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                <span className="mb-1 md:mb-0 w-full md:w-32 font-semibold text-gray-700">
                  Author:
                </span>
                <select
                  name="authorId"
                  value={formData.authorId}
                  onChange={handleInputChange}
                  required
                  className="w-full md:flex-1 px-3 py-2 border rounded-lg bg-white shadow-sm outline-none text-base leading-normal"
                >
                  <option value="">Select Author</option>
                  {authors.map((a) => (
                    <option key={a.authorId} value={a.authorId}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </label>

              {/* Genre */}
              <label className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                <span className="mb-1 md:mb-0 w-full md:w-32 font-semibold text-gray-700">
                  Genre:
                </span>
                <select
                  name="genreId"
                  value={formData.genreId}
                  onChange={handleInputChange}
                  required
                  className="w-full md:flex-1 px-3 py-2 border rounded-lg bg-white shadow-sm outline-none text-base leading-normal"
                >
                  <option value="">Select Genre</option>
                  {genres.map((g) => (
                    <option key={g.genreId} value={g.genreId}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </label>

              {/* ISBN */}
              <label className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                <span className="mb-1 md:mb-0 w-full md:w-32 font-semibold text-gray-700">
                  ISBN:
                </span>
                <input
                  type="text"
                  name="isbn"
                  placeholder="ISBN"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  required
                  className="w-full md:flex-1 px-3 py-2 border rounded-lg bg-white shadow-sm outline-none text-base leading-normal"
                  style={{ minHeight: '40px' }}
                />
              </label>

              {/* Total Copies */}
              <label className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                <span className="mb-1 md:mb-0 w-full md:w-32 font-semibold text-gray-700">
                  Total Copies:
                </span>
                <input
                  type="number"
                  name="totalCopies"
                  placeholder="Total Copies"
                  value={formData.totalCopies}
                  onChange={handleInputChange}
                  required
                  className="w-full md:flex-1 px-3 py-2 border rounded-lg bg-white shadow-sm outline-none text-base leading-normal"
                  style={{ minHeight: '40px' }}
                />
              </label>

              {/* Published Year */}
              <label className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
                <span className="mb-1 md:mb-0 w-full md:w-32 font-semibold text-gray-700">
                  Published Year:
                </span>
                <input
                  type="number"
                  name="publishedYear"
                  placeholder="Published Year"
                  value={formData.publishedYear}
                  onChange={handleInputChange}
                  required
                  className="w-full md:flex-1 px-3 py-2 border rounded-lg bg-white shadow-sm outline-none text-base leading-normal"
                  style={{ minHeight: '40px' }}
                />
              </label>

              {/* Cover Image URL */}
              <label className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-6">
                <span className="mb-1 md:mb-0 w-full md:w-32 font-semibold text-gray-700">
                  Cover Image URL:
                </span>
                <input
                  type="text"
                  name="coverImageUrl"
                  placeholder="Cover Image URL"
                  value={formData.coverImageUrl}
                  onChange={handleInputChange}
                  className="w-full md:flex-1 px-3 py-2 border rounded-lg bg-white shadow-sm outline-none text-base leading-normal"
                  style={{ minHeight: '40px' }}
                />
              </label>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-heading hover:bg-indigo-700 transition"
              >
                {isEditing ? 'Update Book' : 'Publish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
