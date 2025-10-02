import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { User, Package, Settings, Lock } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  // State for profile fields (separate from password fields for control)
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // --- Effect to fetch user profile data on load ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
            navigate('/login');
            return;
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        };
        const { data } = await axios.get(`${backendUrl}/api/users/profile`, config);
        setProfile(data);
      } catch (err) {
        toast.error('Failed to fetch profile data. Please log in again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [backendUrl, navigate]);

  // --- Handler for profile update submission ---
  const submitHandler = async (e) => {
    e.preventDefault();
    setUpdating(true);

    if (password !== confirmPassword) {
      toast.error('New passwords do not match.');
      setUpdating(false);
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      const updateData = { name: profile.name, email: profile.email };
      if (password) {
        updateData.password = password; // Send password to be hashed in controller
      }
      
      const { data } = await axios.put(`${backendUrl}/api/users/profile`, updateData, config);
      
      // Update local storage with the new token (if the token changed, which it usually does)
      localStorage.setItem('userToken', data.token);

      toast.success('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center border-b pb-4">
        <Settings className="mr-3 text-red-600" /> Account Settings
      </h1>

      <form onSubmit={submitHandler} className="bg-white rounded-lg shadow-xl p-8 space-y-8">
        
        {/* --- Personal Details Section --- */}
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center border-b pb-2">
                <User className="w-6 h-6 mr-2 text-blue-600" /> Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Name</label>
                    <input
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="name"
                      type="text"
                      placeholder="Enter name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email Address</label>
                    <input
                      className="w-full px-4 py-3 border rounded-lg bg-gray-100 cursor-not-allowed"
                      id="email"
                      type="email"
                      placeholder="Enter email"
                      value={profile.email}
                      readOnly // Generally best practice to prevent easy email changes
                    />
                    <p className='text-xs text-gray-500 mt-1'>Email address cannot be changed directly here.</p>
                </div>
            </div>
        </div>

        {/* --- Password Change Section --- */}
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center border-b pb-2">
                <Lock className="w-6 h-6 mr-2 text-red-600" /> Change Password
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">New Password</label>
                    <input
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="password"
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={updating}
            className="bg-red-600 text-white font-bold py-3 px-8 rounded-full hover:bg-red-700 transition duration-200 shadow-md disabled:bg-gray-400 flex items-center"
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Quick link to orders page */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Package className="mr-2 text-green-600" /> My Orders History
        </h2>
        <div className="bg-white rounded-lg shadow-md p-6 flex justify-between items-center border-l-4 border-green-500">
            <p className="text-gray-700 font-medium">
                View your complete order history, status updates, and details.
            </p>
            <button
                onClick={() => navigate('/orders')}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors shrink-0"
            >
                View Orders
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
