import React, { useState, useRef } from 'react';
import { loginWithEmail, registerUser, loginWithGoogle } from '../appwrite';
import Spinner from './Spinner';

const AuthModal = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const fileInputRef = useRef(null);

  // Lock scrolling when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        if (!displayName) throw new Error("Display Name is required");
        await registerUser(email, password, displayName, avatarFile);
      }
      onLoginSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-center items-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#0f0d23] border border-gray-800 w-full max-w-md rounded-2xl p-8 relative shadow-2xl animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center">
          {isLogin ? 'Welcome Back' : 'Join '}
          {!isLogin && <span className="text-gradient">Notflix</span>}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sign Up Only Fields */}
          {!isLogin && (
            <>
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-3 mb-4">
                <div 
                  className="w-24 h-24 rounded-full border-2 border-gray-700 bg-[#030014] overflow-hidden cursor-pointer flex items-center justify-center hover:border-[#de23ff] transition-colors relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">Upload</span>
                  </div>
                </div>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/webp" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-1 block">Display Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#cecefb]/5 border border-transparent focus:border-[#a8b5db]/30 rounded-lg px-4 py-3 text-white outline-none transition-colors"
                  placeholder="MovieFan99"
                />
              </div>
            </>
          )}

          {/* Standard Fields (Login & Signup) */}
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#cecefb]/5 border border-transparent focus:border-[#a8b5db]/30 rounded-lg px-4 py-3 text-white outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-gray-300 text-sm mb-1 block">Password</label>
            <input 
              type="password" 
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#cecefb]/5 border border-transparent focus:border-[#a8b5db]/30 rounded-lg px-4 py-3 text-white outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#de23ff] to-[#8d14ff] text-white font-bold py-3 rounded-lg hover:opacity-90 transition-opacity flex justify-center items-center mt-6"
          >
            {isLoading ? <Spinner /> : isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-full bg-gray-700"></div>
          <span className="text-gray-400 text-sm">OR</span>
          <div className="h-px w-full bg-gray-700"></div>
        </div>

        <button 
          onClick={loginWithGoogle}
          className="w-full mt-6 bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-gray-400 text-sm text-center mt-6">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => setIsLogin(!isLogin)} 
            className="text-[#de23ff] hover:underline font-semibold"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default AuthModal;