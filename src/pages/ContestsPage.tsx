import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Contest } from '../types';
import {
  Activity,
  Calendar,
  Clock,
  Award,
  Users,
  Bookmark,
  CheckCircle,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

export const ContestsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [contests, setContests] = useState<Contest[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchContests = async () => {
    setIsLoading(true);
    try {
      const res = await api.getContests({
        status: filter !== 'all' ? filter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
      });
      if (res.success) {
        setContests(res.contests);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, [filter, typeFilter]);

  const handleRegister = async (contestId: string) => {
    if (!isAuthenticated) {
      setMsg({ text: 'Please sign in or create an account to register.', type: 'error' });
      return;
    }

    setRegisteringId(contestId);
    setMsg(null);
    try {
      const res = await api.registerForContest(contestId);
      if (res.success) {
        setMsg({ text: 'Registration confirmed! Added to contest roster & Redis leaderboard.', type: 'success' });
        fetchContests();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'Registration failed.', type: 'error' });
    } finally {
      setRegisteringId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Contests & Examinations</h1>
          <p className="text-xs text-gray-400">
            Browse active battles, proctored digital exams, and scheduled challenges.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl bg-arena-card p-1 border border-arena-border text-xs font-semibold">
            {['all', 'live', 'scheduled', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  filter === status
                    ? 'bg-arena-peach text-arena-midnight font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-arena-card border border-arena-border text-xs text-white focus:outline-none focus:border-arena-peach"
          >
            <option value="all">All Types</option>
            <option value="coding contest">Coding Contests</option>
            <option value="exam">Proctored Exams</option>
          </select>
        </div>
      </div>

      {msg && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center space-x-2 border ${
            msg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <Award className="w-4 h-4" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Grid of Contests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contests.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-gray-400 text-xs">
            {isLoading ? 'Loading contests...' : 'No contests found matching criteria.'}
          </div>
        ) : (
          contests.map((contest) => (
            <div
              key={contest._id}
              className="p-6 rounded-3xl bg-arena-card border border-arena-border hover:border-arena-peach/40 shadow-card-elevated transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        contest.status === 'live'
                          ? 'bg-emerald-500 text-arena-midnight animate-pulse'
                          : contest.status === 'scheduled'
                          ? 'bg-arena-peach text-arena-midnight'
                          : 'bg-arena-aubergine text-gray-400'
                      }`}
                    >
                      {contest.status}
                    </span>
                    <span className="text-xs text-arena-blush font-semibold capitalize">
                      {contest.contestType}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-arena-peach">
                    Max: {contest.maxScore} pts
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white hover:text-arena-peach transition-colors">
                  <Link to={`/contests/${contest._id}`}>{contest.title}</Link>
                </h3>

                <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">
                  {contest.description}
                </p>

                {/* Metadata Pills */}
                <div className="grid grid-cols-3 gap-2 pt-2 text-[11px] text-gray-400">
                  <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-arena-surface/60">
                    <Clock className="w-3.5 h-3.5 text-arena-peach shrink-0" />
                    <span>{contest.durationMinutes} mins</span>
                  </div>
                  <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-arena-surface/60">
                    <Users className="w-3.5 h-3.5 text-arena-rose shrink-0" />
                    <span>{contest.participantCount || 0} enrolled</span>
                  </div>
                  <div className="flex items-center space-x-1.5 p-2 rounded-xl bg-arena-surface/60">
                    <Calendar className="w-3.5 h-3.5 text-arena-blush shrink-0" />
                    <span className="truncate">
                      {new Date(contest.startTime).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-arena-border flex items-center justify-between">
                <Link
                  to={`/contests/${contest._id}`}
                  className="text-xs font-semibold text-arena-peach hover:underline flex items-center space-x-1"
                >
                  <span>Scoring Rules & Info</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center space-x-2">
                  <Link
                    to="/leaderboard"
                    className="px-3.5 py-1.5 rounded-xl bg-arena-aubergine hover:bg-arena-berry text-white text-xs font-bold transition-all"
                  >
                    Leaderboard
                  </Link>

                  {contest.status !== 'completed' && contest.status !== 'cancelled' && (
                    <button
                      onClick={() => handleRegister(contest._id)}
                      disabled={registeringId === contest._id}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-arena-peach to-arena-rose text-arena-midnight text-xs font-extrabold hover:shadow-glow-peach transition-all disabled:opacity-50"
                    >
                      {registeringId === contest._id ? 'Registering...' : 'Register'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
