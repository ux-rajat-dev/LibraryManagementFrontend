import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaPlus, FaSearch } from 'react-icons/fa';
import { MdEdit, MdDeleteOutline } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Genres = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editGenreId, setEditGenreId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
  });

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGenres();
  }, [token]);

  const fetchGenres = async () => {
    try {
      const res = await axios.get('https://localhost:7158/api/Genre', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGenres(res.data);
    } catch (err) {
      console.error('Error fetching genres:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ name: e.target.value });
  };

  const handleEditClick = (genre) => {
    setFormData({ name: genre.name });
    setEditGenreId(genre.genreId);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this genre?')) {
      try {
        await axios.delete(`https://localhost:7158/api/Genre/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('🗑️ Genre deleted successfully!');
        setGenres(genres.filter((g) => g.genreId !== id));
      } catch (err) {
        console.error('Error deleting genre:', err);
        toast.error('❌ Failed to delete genre.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await axios.put(
          'https://localhost:7158/api/Genre',
          { genreId: editGenreId, ...formData },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success('✅ Genre updated successfully!');
      } else {
        await axios.post('https://localhost:7158/api/Genre', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('🎉 Genre created successfully!');
      }

      setFormData({ name: '' });
      setIsModalOpen(false);
      setIsEditing(false);
      setEditGenreId(null);
      fetchGenres();
    } catch (err) {
      console.error('Error submitting genre:', err);
      toast.error('❌ Failed to submit genre.');
    }
  };

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            setIsModalOpen(true);
            setIsEditing(false);
            setEditGenreId(null);
            setFormData({ name: '' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <FaPlus /> Add Genre
        </button>
      </div>

      {/* Search */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm w-64">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search genres..."
            className="w-full bg-transparent outline-none font-body"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow">
        {loading ? (
          <p className="text-gray-600 p-4">Loading genres...</p>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-indigo-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Genre Name</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGenres.map((genre, index) => (
                <tr key={genre.genreId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>{' '}
                  {/* This will start the numbering from 1 */}
                  <td className="px-4 py-3">{genre.name}</td>
                  <td className="px-4 py-3 text-center space-x-4">
                    <button
                      onClick={() => handleEditClick(genre)}
                      className="text-indigo-600 hover:text-indigo-800 transition"
                      title="Edit"
                    >
                      <MdEdit size={24} />
                    </button>
                    <button
                      onClick={() => handleDelete(genre.genreId)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative font-body">
            <button
              className="absolute top-2 right-3 text-black hover:text-red-600 text-lg font-bold"
              onClick={() => {
                setIsModalOpen(false);
                setIsEditing(false);
                setEditGenreId(null);
              }}
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4 font-heading">
              {isEditing ? '✏️ Edit Genre' : '➕ Add Genre'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              <input
                type="text"
                name="name"
                placeholder="Genre Name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg bg-white shadow-sm outline-none font-body"
                required
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-heading hover:bg-indigo-700 transition"
              >
                {isEditing ? 'Update Genre' : 'Add Genre'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Genres;
