import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AvatarPicker } from '../components/AvatarPicker';
import { Trophy, Mail, Lock, User, School, Hash, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('avatar_cyber_ninja');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAvatarId) {
      setError('Avatar selection is mandatory. Please choose your character.');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        studentId: studentId.trim().toUpperCase(),
        department,
        avatarId: selectedAvatarId,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl bg-arena-card border border-arena-border rounded-3xl p-8 shadow-card-elevated space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-arena-peach to-arena-berry flex items-center justify-center text-arena-midnight shadow-glow-peach">
            <Trophy className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl font-black text-white">Create Student Account</h2>
          <p className="text-xs text-arena-blush font-semibold uppercase tracking-wider">
            Compete. Climb. Conquer.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center space-x-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mandatory Avatar Picker Section */}
          <div className="p-4 rounded-2xl bg-arena-surface/80 border border-arena-peach/20">
            <AvatarPicker
              selectedAvatarId={selectedAvatarId}
              onSelectAvatar={(id) => setSelectedAvatarId(id)}
              required={true}
            />
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-arena-blush uppercase tracking-wider mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-arena-surface border border-arena-border text-xs text-white focus:outline-none focus:border-arena-peach"
                  placeholder="e.g. Aarav Sharma"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-arena-blush uppercase tracking-wider mb-1.5">
                VIT-AP Student ID *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-arena-surface border border-arena-border text-xs text-white focus:outline-none focus:border-arena-peach font-mono"
                  placeholder="e.g. 23BCE1050"
                />
                <Hash className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-arena-blush uppercase tracking-wider mb-1.5">
                VIT-AP Student Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-arena-surface border border-arena-border text-xs text-white focus:outline-none focus:border-arena-peach"
                  placeholder="student@vitap.ac.in"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-arena-blush uppercase tracking-wider mb-1.5">
                Password (min 6 chars) *
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-arena-surface border border-arena-border text-xs text-white focus:outline-none focus:border-arena-peach"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-arena-blush uppercase tracking-wider mb-1.5">
                Department / Specialization *
              </label>
              <div className="relative">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-arena-surface border border-arena-border text-xs text-white focus:outline-none focus:border-arena-peach appearance-none"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering (SCOPE)</option>
                  <option value="Software Engineering">Software Engineering (SCOPE)</option>
                  <option value="Data Science & AI">Data Science & AI (SCOPE)</option>
                  <option value="Cyber Security">Cyber Security (SCOPE)</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
                <School className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-arena-peach via-arena-rose to-arena-berry text-arena-midnight hover:shadow-glow-peach transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <span>{isLoading ? 'Creating Account...' : 'Complete Registration & Join Arena'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-arena-peach font-bold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
