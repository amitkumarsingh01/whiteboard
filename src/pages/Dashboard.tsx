import React from 'react';
import SheetManager from '../components/whiteboard/SheetManager';
import { getCurrentUser, setCurrentUser } from '../utils/localStorage';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/login');
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 py-3 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">Whiteboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <User size={18} className="mr-1" />
              <span>{user.username}</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
            >
              <LogOut size={18} className="mr-1" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 p-6 overflow-hidden">
        <SheetManager />
      </main>
    </div>
  );
};

export default Dashboard;