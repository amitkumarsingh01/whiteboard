import React from 'react';
import SignupForm from '../components/auth/SignupForm';
import { PenTool } from 'lucide-react';

const Signup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg mb-4">
            <PenTool size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Whiteboard</h1>
          <p className="text-gray-600 mt-2">Create an account to get started</p>
        </div>
        
        <SignupForm />
      </div>
    </div>
  );
};

export default Signup;