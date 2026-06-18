import React, { useState } from 'react';
import { confirmPasswordRecovery } from '../appwrite';
import Spinner from './Spinner';

const ResetPasswordModal = ({ userId, secret, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await confirmPasswordRecovery(userId, secret, newPassword);
      setSuccess(true);
      setTimeout(() => {
        onClose(); // Automatically close and let them log in
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#0f0d23] border border-gray-800 w-full max-w-md rounded-2xl p-8 shadow-2xl relative animate-fade-in">
        
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Set New Password</h2>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg text-center">{error}</div>}
        
        {success ? (
          <div className="text-center">
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-400 text-sm rounded-lg">
              Password successfully reset!
            </div>
            <p className="text-gray-400 text-sm mb-4">Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-gray-300 text-sm mb-1 block">New Password</label>
              <input 
                type="password" required minLength={8} 
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                className="w-full bg-[#cecefb]/5 border border-transparent focus:border-[#a8b5db]/30 rounded-lg px-4 py-3 text-white outline-none" 
                placeholder="••••••••" 
              />
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#de23ff] to-[#7f34f6] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center h-12">
              {isLoading ? <Spinner /> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;