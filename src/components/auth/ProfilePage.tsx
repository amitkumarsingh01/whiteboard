import React, { useState, useEffect } from 'react';
import { getCurrentUser, getSheets } from '../../utils/localStorage';
import { User, Sheet } from '../../types';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sheetsCount, setSheetsCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const userSheets = getSheets(currentUser.id);
      setSheetsCount(userSheets.length);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (!user) {
    return <div className="flex justify-center items-center h-full">Loading profile...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-8 max-w-2xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
        <button
          onClick={onLogout}
          className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} className="mr-1" />
          <span>Logout</span>
        </button>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
        <div className="bg-indigo-100 rounded-full p-8 flex items-center justify-center">
          <UserIcon size={64} className="text-indigo-600" />
        </div>
        
        <div>
          <h3 className="text-xl font-semibold">{user.username}</h3>
          <p className="text-gray-500 mt-1">Account created on {new Date(user.createdAt).toLocaleDateString()}</p>
          <div className="mt-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full inline-block">
            {sheetsCount} {sheetsCount === 1 ? 'Sheet' : 'Sheets'} Created
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold mb-4">Account Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-medium">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-indigo-500 hover:bg-indigo-600 transition-colors text-white font-medium py-2 px-6 rounded-lg"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;