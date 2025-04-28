import React from 'react';
import ProfilePage from '../components/auth/ProfilePage';
import { setCurrentUser, getCurrentUser } from '../utils/localStorage';
import { useNavigate, Link } from 'react-router-dom';
import { PenTool } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };
  
  const user = getCurrentUser();
  if (!user) {
    navigate('/login');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 pt-4">
          <Link to="/dashboard" className="flex items-center text-gray-800 hover:text-blue-600">
            <PenTool size={24} className="mr-2" />
            <span className="font-bold text-xl">Whiteboard</span>
          </Link>
        </header>
        
        <ProfilePage onLogout={handleLogout} />
      </div>
    </div>
  );
};

export default Profile;