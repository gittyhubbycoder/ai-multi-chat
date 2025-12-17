import { useState } from 'react';
import { UserIcon } from './Icons';
import { INVITE_CODE } from '../utils/constants';
import toast from 'react-hot-toast';

export default function Auth({ supabase, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        if (inviteCode !== INVITE_CODE) {
          toast.error('Invalid invite code');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Account created! Please check your email to verify.');
        setIsSignup(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
        onSuccess?.();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="glass-card p-6 sm:p-8 w-full max-w-md animate-fadeIn">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3 sm:mb-4 shadow-lg shadow-indigo-500/30">
            <UserIcon />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
            Multi-AI Platform
          </h1>
          <p className="text-white/50 mt-2 text-sm sm:text-base">Your personal AI suite</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-3 sm:space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
          />
          
          {isSignup && (
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invite Code"
              className="glass-input w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="glass-button w-full py-2.5 sm:py-3 text-base sm:text-lg"
          >
            {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
          </button>
        </form>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="w-full mt-3 sm:mt-4 text-center text-indigo-400 hover:text-indigo-300 transition-colors text-sm sm:text-base"
        >
          {isSignup ? 'Already have an account? Login' : 'Need an account? Sign up'}
        </button>
      </div>
    </div>
  );
}
