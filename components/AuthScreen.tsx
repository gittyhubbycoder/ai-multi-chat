
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { INVITE_CODE } from '../constants';
import { UserIcon } from './Icons';

const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  const handleAuth = async () => {
    try {
      if (isSignup) {
        if (inviteCode !== INVITE_CODE) {
          alert('Invalid invite code!');
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Account created! Please log in.');
        setIsSignup(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="glass-card p-6 md:p-8 rounded-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserIcon />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Multi-AI Chat</h1>
          <p className="text-gray-400 text-sm md:text-base">Your personal AI suite</p>
        </div>
        <div className="space-y-4">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"
            className="w-full glass-input text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"
            onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
            className="w-full glass-input text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          {isSignup && (
            <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="Invite Code"
              className="w-full glass-input text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
          )}
          <button onClick={handleAuth} className="w-full glass-button hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-base">
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
          <button onClick={() => setIsSignup(!isSignup)} className="w-full text-blue-400 hover:text-blue-300 text-sm">
            {isSignup ? 'Have an account? Login' : 'Need an account? Sign up'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
