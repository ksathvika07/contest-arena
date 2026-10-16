import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ScoreSubmissionModal } from '../components/ScoreSubmissionModal';
import { AvatarBadge } from '../components/AvatarPicker';
import type { Contest } from '../types';
import {
  Clock,
  Calendar,
  Award,
  Users,
  ShieldAlert,
  CheckCircle,
  PlusCircle,
  ArrowLeft,
  Trophy,
  Scale,
} from 'lucide-react';

export const ContestDetailPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();
  const { user, isAuthenticated } = useAuth();

  const [contest, setContest] = useState<Contest | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    if (!contestId) return;
    setIsLoading(true);
    try {
      const [contestRes, partRes] = await Promise.all([
        api.getContest(contestId),
        api.getParticipants(contestId),
      ]);

      if (contestRes.success) setContest(contestRes.contest);
      if (partRes.success) {
        setParticipants(partRes.participants);
        if (user) {
          const registered = partRes.participants.some(
            (p: any) => p.studentId === user.studentId
          );
          setIsRegistered(registered);
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [contestId, user]);

  const handleRegister = async () => {
    if (!contestId) return;
    if (!isAuthenticated) {
      setMsg({ text: 'Please sign in to register for this contest.', type: 'error' });
      return;
    }

    try {
      const res = await api.registerForContest(contestId);
      if (res.success) {
        setMsg({ text: 'Successfully registered for this contest!', type: 'success' });
        setIsRegistered(true);
        loadData();
      }
    } catch (err: any) {
      setMsg({ text: err.message || 'Registration failed.', type: 'error' });
    }
  };

  if (isLoading || !contest) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-400 text-xs">
        Loading contest specifications...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        to="/contests"
        className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-400 hover:text-arena-peach transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Contests</span>
      </Link>

      {/* Main Contest Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-arena-aubergine via-arena-card to-arena-midnight border border-arena-peach/30 shadow-card-elevated space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                contest.status === 'live'
                  ? 'bg-emerald-500 text-arena-midnight animate-pulse'
                  : 'bg-arena-peach text-arena-midnight'
              }`}
            >
              {contest.status}
            </span>
            <span className="text-xs text-arena-peach font-bold uppercase font-mono">
              {contest.contestType}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/leaderboard"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-arena-aubergine hover:bg-arena-berry text-white border border-arena-border transition-all flex items-center space-x-1.5"
            >
              <Trophy className="w-3.5 h-3.5 text-arena-peach" />
              <span>Live Leaderboard</span>
            </Link>

            {contest.status === 'live' && (
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-arena-peach to-arena-rose text-arena-midnight hover:shadow-glow-peach transition-all flex items-center space-x-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Score</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white">{contest.title}</h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
          {contest.description}
        </p>

        {/* Highlight Metadata grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-arena-border">
          <div className="p-3 rounded-2xl bg-arena-surface/60">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Start Time</span>
            <span className="text-xs font-bold text-white">
              {new Date(contest.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-[10px] text-gray-400 block">
              {new Date(contest.startTime).toLocaleDateString()}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-arena-surface/60">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Duration</span>
            <span className="text-xs font-bold text-white">{contest.durationMinutes} Minutes</span>
            <span className="text-[10px] text-arena-peach block">Official Timer</span>
          </div>

          <div className="p-3 rounded-2xl bg-arena-surface/60">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Maximum Score</span>
            <span className="text-xs font-black text-arena-peach font-mono">
              {contest.maxScore} Points
            </span>
            <span className="text-[10px] text-gray-400 block">Cap Limit</span>
          </div>

          <div className="p-3 rounded-2xl bg-arena-surface/60">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Enrollment</span>
            <span className="text-xs font-bold text-white">
              {participants.length} / {contest.maxParticipants}
            </span>
            <span className="text-[10px] text-emerald-400 block">
              {isRegistered ? '✓ You Are Enrolled' : 'Open Slots'}
            </span>
          </div>
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
          <CheckCircle className="w-4 h-4" />
          <span>{msg.text}</span>
        </div>
      )}

      {/* Rules Breakdown & Academic Scoring Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-3">
          <div className="flex items-center space-x-2 text-arena-peach font-bold text-xs uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Scoring Methodology</span>
          </div>
          <h3 className="text-sm font-bold text-white">Point Distribution Rules</h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            {contest.scoringRules}
          </p>
          <div className="pt-2 text-[11px] text-gray-400">
            Every submission is validated on the backend and recorded permanently in MongoDB before live score promotion in Redis.
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-3">
          <div className="flex items-center space-x-2 text-arena-peach font-bold text-xs uppercase tracking-wider">
            <Scale className="w-4 h-4" />
            <span>Tie-Breaking Policy</span>
          </div>
          <h3 className="text-sm font-bold text-white capitalize">
            {contest.tieBreakingRules.replace('_', ' ')}
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            When multiple participants achieve identical scores, ranks are determined deterministically using{' '}
            <strong className="text-white">completion timestamp / elapsed time in milliseconds</strong>.
          </p>
          <div className="pt-2 text-[11px] text-arena-peach font-mono">
            Deterministic tie resolution prevents erratic leaderboard flips.
          </div>
        </div>
      </div>

      {/* Enrolled Participants Roster */}
      <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-4 shadow-card-elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-arena-peach" />
            <h3 className="text-sm font-bold text-white">
              Enrolled Contestants ({participants.length})
            </h3>
          </div>
          {!isRegistered && contest.status !== 'completed' && (
            <button
              onClick={handleRegister}
              className="px-4 py-1.5 rounded-xl text-xs font-extrabold bg-arena-peach text-arena-midnight hover:shadow-glow-peach transition-all"
            >
              Enroll Now
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {participants.map((p) => (
            <div
              key={p.studentId}
              className="p-3 rounded-2xl bg-arena-surface/60 border border-arena-border flex items-center space-x-3 text-xs"
            >
              <AvatarBadge avatarId={p.userId?.avatarId || 'avatar_cyber_ninja'} size="sm" />
              <div className="truncate">
                <p className="font-bold text-white truncate">{p.userId?.name || p.studentId}</p>
                <p className="text-[10px] text-arena-peach font-mono">{p.studentId}</p>
                <p className="text-[10px] text-gray-400 truncate">{p.userId?.department}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <ScoreSubmissionModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        contest={contest}
        onSubmitted={loadData}
      />
    </div>
  );
};
