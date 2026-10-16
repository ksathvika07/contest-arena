import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, User } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillAdmin = () => {
    setEmail('admin@contestarena.edu');
    setPassword('AdminSecurePass2026!');
    setError(null);
  };

  const handleFillStudent = () => {
    setEmail('aarav.sharma1@vitap.ac.in');
    setPassword('Student123!');
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-arena-card border border-arena-border rounded-3xl p-8 shadow-card-elevated space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-arena-peach to-arena-berry flex items-center justify-center text-arena-midnight shadow-glow-peach">
            <Trophy className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-white">Sign In to Contest Arena</h2>
          <p className="text-xs text-arena-blush font-semibold uppercase tracking-wider">
            Compete. Climb. Conquer.
          </p>
        </div>

        {/* Quick Demo Credentials helper buttons */}
        <div className="p-3.5 rounded-2xl bg-arena-surface border border-arena-peach/20 space-y-2">
          <span className="text-[11px] font-bold text-gray-300 block uppercase tracking-wider">
            ⚡ Quick Demo Autofill:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-arena-aubergine hover:bg-arena-berry text-[11px] font-bold text-arena-peach transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Role</span>
            </button>
            <button
              type="button"
              onClick={handleFillStudent}
              className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-arena-aubergine hover:bg-arena-berry text-[11px] font-bold text-arena-blush transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Student Role</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center space-x-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-arena-blush uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-arena-surface border border-arena-border text-sm text-white focus:outline-none focus:border-arena-peach"
                placeholder="name@vitap.ac.in"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-arena-blush uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-arena-surface border border-arena-border text-sm text-white focus:outline-none focus:border-arena-peach"
                placeholder="••••••••"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-arena-peach via-arena-rose to-arena-berry text-arena-midnight hover:shadow-glow-peach transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          New to Contest Arena?{' '}
          <Link to="/register" className="text-arena-peach font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
