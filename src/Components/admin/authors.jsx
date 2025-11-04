import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaArrowLeft, FaPlus, FaSearch } from 'react-icons/fa';
import { MdDeleteOutline, MdEdit } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Authors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editAuthorId, setEditAuthorId] = useState(null);
  const [formData, setFormData] = useState({ name: '', bio: '' });

  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await axios.get(
          'https://librarymanagementbackend-oqjx.onrender.com/api/Author',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAuthors(res.data);
      } catch (err) {
        console.error('Error fetching authors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuthors();
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (author) => {
    setFormData({ name: author.name, bio: author.bio });
    setEditAuthorId(author.authorId);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      try {
        await axios.delete(
          `https://librarymanagementbackend-oqjx.onrender.com/api/Author/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('🗑️ Author deleted successfully!');
        setAuthors(authors.filter((a) => a.authorId !== id));
      } catch (err) {
        console.error('Error deleting author:', err);
        toast.error('❌ Failed to delete author.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(
          'https://librarymanagementbackend-oqjx.onrender.com/api/Author',
          {
            authorId: editAuthorId,
            name: formData.name,
            bio: formData.bio,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('✅ Author updated successfully!');
      } else {
        await axios.post(
          'https://librarymanagementbackend-oqjx.onrender.com/api/Author',
          {
            name: formData.name,
            bio: formData.bio,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success('✍️ Author added successfully!');
      }

      setIsModalOpen(false);
      setIsEditing(false);
      setEditAuthorId(null);
      setFormData({ name: '', bio: '' });

      const res = await axios.get(
        'https://librarymanagementbackend-oqjx.onrender.com/api/Author',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAuthors(res.data);
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error('❌ Failed to submit author.');
    }
  };

  // Filter authors based on search query
  const filteredAuthors = authors.filter((author) => {
    const matchesSearchQuery =
      author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      author.bio.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearchQuery;
  });

  return (
    <div className="flex flex-col h-full w-full p-6 font-body">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded hover:bg-indigo-50"
        >
          <FaArrowLeft /> Back
        </button>
        <button
          onClick={() => {
            setFormData({ name: '', bio: '' });
            setIsModalOpen(true);
            setIsEditing(false);
            setEditAuthorId(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          <FaPlus /> Add Author
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg px-3 py-2 bg-white shadow-sm w-64">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search authors..."
              className="w-full bg-transparent outline-none font-body"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white rounded-lg shadow">
        {loading ? (
          <p className="text-gray-600 p-4">Loading authors...</p>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead className="bg-indigo-600 text-white sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Bio</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAuthors.map((author, index) => (
                <tr key={author.authorId} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{author.name}</td>
                  <td className="px-4 py-3">{author.bio}</td>
                  <td className="px-4 py-3 text-center space-x-4">
                    <div className="flex justify-center space-x-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEditClick(author)}
                        className="text-indigo-600 hover:text-indigo-800 transition"
                        title="Edit"
                      >
                        <MdEdit size={24} />
                      </button>
                      <button
                        onClick={() => handleDelete(author.authorId)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Delete"
                      >
                        <MdDeleteOutline size={24} />
                      </button>
                    </div>
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
                setEditAuthorId(null);
              }}
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4 font-heading">
              {isEditing ? '✏️ Edit Author' : '➕ Add New Author'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4 font-body">
              <label className="flex flex-col">
                <span className="font-semibold text-gray-700 mb-1">Name:</span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="px-3 py-2 border rounded-lg bg-white shadow-sm outline-none"
                />
              </label>

              <label className="flex flex-col">
                <span className="font-semibold text-gray-700 mb-1">Bio:</span>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="px-3 py-2 border rounded-lg bg-white shadow-sm outline-none"
                  rows={3}
                />
              </label>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-heading hover:bg-indigo-700 transition"
              >
                {isEditing ? 'Update Author' : 'Add Author'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Authors;
