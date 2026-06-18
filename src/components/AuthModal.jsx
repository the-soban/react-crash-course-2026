import React, { useState, useRef } from 'react';
import { loginUser, registerUser, loginWithGoogle, sendPasswordRecovery } from '../appwrite';
import Spinner from './Spinner';

const PRE_MADE_AVATARS = [
  '/avatars/avatar-01.png', '/avatars/avatar-02.png', '/avatars/avatar-03.png', 
  '/avatars/avatar-04.png', '/avatars/avatar-05.png', '/avatars/avatar-06.png',
  '/avatars/avatar-07.png', '/avatars/avatar-08.png', '/avatars/avatar-09.png',
  '/avatars/avatar-10.png', '/avatars/avatar-11.png', '/avatars/avatar-12.png'
];

const AuthModal = ({ onClose, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false); // NEW: Recovery State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState(''); // NEW: Success message for email sent

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [selectedPreMade, setSelectedPreMade] = useState(null);
  
  const fileInputRef = useRef(null);
  
  const avatarScrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleAvatarScroll = () => {
    if (avatarScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = avatarScrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollAvatars = (direction) => {
    if (avatarScrollRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      avatarScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
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
      setSelectedPreMade(null); 
    }
  };

  const selectPreMadeAvatar = (url) => {
    setSelectedPreMade(url);
    setAvatarFile(null); 
    setAvatarPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isRecovery) {
        // --- FORGOT PASSWORD LOGIC ---
        await sendPasswordRecovery(email);
        setSuccessMsg("Recovery email sent! Check your inbox for the reset link.");
        setTimeout(() => setIsRecovery(false), 3000); // Send them back to login after 3 seconds
      } else if (isLogin) {
        await loginUser(email, password);
        onLoginSuccess();
        onClose();
      } else {
        let finalPreMade = selectedPreMade;
        if (!avatarFile && !selectedPreMade) {
          const randomIndex = Math.floor(Math.random() * PRE_MADE_AVATARS.length);
          finalPreMade = PRE_MADE_AVATARS[randomIndex];
        }
        await registerUser(email, password, name, avatarFile, finalPreMade);
        onLoginSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center bg-black/80 backdrop-blur-sm p-4" onClick={handleOverlayClick}>
      <div className="bg-[#0f0d23] border border-gray-800 w-full max-w-md rounded-2xl p-8 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          {isRecovery ? 'Reset Password' : (isLogin ? 'Welcome Back' : 'Create Account')}
        </h2>

        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 text-red-500 text-sm rounded-lg text-center">{error}</div>}
        {successMsg && <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 text-green-400 text-sm rounded-lg text-center">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input is shared across all 3 states */}
          <div>
            <label className="text-gray-300 text-sm mb-1 block">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#cecefb]/5 border border-transparent focus:border-[#a8b5db]/30 rounded-lg px-4 py-3 text-white outline-none" placeholder="you@example.com" />
          </div>

          {!isRecovery && !isLogin && (
            <>
              <div>
                <label className="text-gray-300 text-sm mb-1 block">Display Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#cecefb]/5 border border-transparent focus:border-[#a8b5db]/30 rounded-lg px-4 py-3 text-white outline-none" placeholder="John Doe" />
              </div>

              <div className="pt-2 pb-2">
                <label className="text-gray-300 text-sm mb-2 block">Choose an Avatar (Optional)</label>
                <div className="relative mb-4 flex items-center">
                  {showLeftArrow && (
                    <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-[#0f0d23] to-transparent pointer-events-none flex items-center justify-start z-10">
                      <button type="button" onClick={() => scrollAvatars('left')} className="pointer-events-auto outline-none text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                    </div>
                  )}
                  <div ref={avatarScrollRef} onScroll={handleAvatarScroll} className="flex gap-3 overflow-x-auto py-3 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full">
                    {PRE_MADE_AVATARS.map((url, idx) => (
                      <img key={idx} src={url} alt={`Avatar ${idx}`} onClick={() => selectPreMadeAvatar(url)} className={`w-14 h-14 rounded-full object-cover cursor-pointer transition-all shrink-0 border-2 ${selectedPreMade === url ? 'border-[#de23ff] scale-110 shadow-[0_0_10px_rgba(222,35,255,0.5)]' : 'border-transparent hover:border-gray-500'}`} />
                    ))}
                  </div>
                  {showRightArrow && (
                    <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[#0f0d23] to-transparent pointer-events-none flex items-center justify-end z-10">
                      <button type="button" onClick={() => scrollAvatars('right')} className="pointer-events-auto outline-none text-gray-400 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-gray-600 bg-[#030014] overflow-hidden shrink-0 flex items-center justify-center">
                    {avatarPreview ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-[10px] text-gray-500 text-center leading-tight">Or<br/>Upload</span>}
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm text-[#de23ff] hover:text-white transition-colors border border-[#de23ff]/30 px-3 py-1.5 rounded-full">Upload Custom Image</button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                </div>
              </div>
            </>
          )}

          {!isRecovery && (
            <div>
              <label className="text-gray-300 text-sm mb-1 flex justify-between">
                <span>Password</span>
                {/* FORGOT PASSWORD BUTTON */}
                {isLogin && (
                  <button type="button" onClick={() => { setIsRecovery(true); setError(''); }} className="text-[#de23ff] hover:underline text-xs">
                    Forgot Password?
                  </button>
                )}
              </label>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-[#cecefb]/5 border border-transparent focus:border-[#a8b5db]/30 rounded-lg px-4 py-3 text-white outline-none" placeholder="••••••••" />
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-[#de23ff] to-[#7f34f6] text-white font-bold py-3.5 rounded-lg hover:opacity-90 transition-opacity mt-2 flex justify-center items-center h-12">
            {isLoading ? <Spinner /> : (isRecovery ? 'Send Recovery Email' : (isLogin ? 'Sign In' : 'Sign Up'))}
          </button>
        </form>

        {!isRecovery && (
          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-6">
              <div className="border-t border-gray-700 w-full absolute"></div>
              <span className="bg-[#0f0d23] px-4 text-xs text-gray-400 relative">OR</span>
            </div>
            <button type="button" onClick={async () => { await loginWithGoogle(); }} className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-3">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-400 mt-6">
          {isRecovery ? (
            <button type="button" onClick={() => { setIsRecovery(false); setError(''); }} className="text-[#de23ff] hover:underline font-semibold">
              ← Back to Log In
            </button>
          ) : (
            <>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-[#de23ff] hover:underline font-semibold">
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  );
};

export default AuthModal;