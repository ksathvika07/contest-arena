import React, { useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Contest } from '../types';
import confetti from 'canvas-confetti';
import { X, Send, Award, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface ScoreSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: Contest;
  onSubmitted?: () => void;
}

export const ScoreSubmissionModal: React.FC<ScoreSubmissionModalProps> = ({
  isOpen,
  onClose,
  contest,
  onSubmitted,
}) => {
  const { user, isAdmin } = useAuth();

  const [studentId, setStudentId] = useState<string>(user?.studentId || '');
  const [score, setScore] = useState<string>('');
  const [completionTimeMs, setCompletionTimeMs] = useState<string>('30000');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 0) {
      setError('Please provide a valid non-negative score.');
      return;
    }

    if (numericScore > contest.maxScore) {
      setError(`Score cannot exceed contest maximum of ${contest.maxScore}.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.submitScore(contest._id, {
        studentId: isAdmin ? studentId.trim() : user?.studentId,
        score: numericScore,
        completionTimeMs: Number(completionTimeMs) || 0,
        notes: notes.trim(),
        idempotencyKey: `sub_${contest._id}_${studentId}_${Date.now()}`,
      });

      if (res.success) {
        setSuccessMsg(
          `Score of ${numericScore} submitted! New rank: #${res.newRank || 1} in Redis Sorted Set.`
        );

        // Fire celebratory confetti if good score
        if (numericScore >= contest.maxScore * 0.7) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ED9E59', '#862249', '#E8BCB9'],
          });
        }

        setTimeout(() => {
          if (onSubmitted) onSubmitted();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit score.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-arena-card border border-arena-peach/30 rounded-3xl shadow-card-elevated overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-arena-aubergine to-arena-berry border-b border-arena-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-arena-peach text-arena-midnight flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">Submit Contest Score</h3>
              <p className="text-[10px] text-arena-blush truncate max-w-[240px]">{contest.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center space-x-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center space-x-2 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Student ID (Admin can select target participant) */}
          <div>
            <label className="block text-xs font-bold text-arena-blush uppercase tracking-wider mb-1">
              Student Identifier {isAdmin && <span className="text-arena-peach">(Admin Override)</span>}
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={!isAdmin}
              required
              className="w-full px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-xs text-white focus:outline-none focus:border-arena-peach disabled:opacity-60"
              placeholder="e.g. 23BCE1001"
            />
          </div>

          {/* Score Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-arena-blush uppercase tracking-wider">
                Score Points *
              </label>
              <span className="text-[11px] font-semibold text-gray-400">
                Max: <span className="text-arena-peach">{contest.maxScore}</span>
              </span>
            </div>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              max={contest.maxScore}
              min="0"
              required
              className="w-full px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-sm text-white focus:outline-none focus:border-arena-peach font-mono"
              placeholder={`Enter score 0 - ${contest.maxScore}`}
            />
          </div>

          {/* Completion Time (Tie-breaker) */}
          <div>
            <label className="block text-xs font-bold text-arena-blush uppercase tracking-wider mb-1">
              Completion Time (ms)
            </label>
            <div className="relative">
              <input
                type="number"
                value={completionTimeMs}
                onChange={(e) => setCompletionTimeMs(e.target.value)}
                min="0"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-xs text-white focus:outline-none focus:border-arena-peach font-mono"
                placeholder="Time taken in milliseconds"
              />
              <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Used as a deterministic tie-breaker when multiple participants have identical scores.
            </p>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-bold text-arena-blush uppercase tracking-wider mb-1">
              Submission Notes / Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-xs text-white focus:outline-none focus:border-arena-peach"
              placeholder="e.g. Completed All Test Cases"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-arena-peach to-arena-rose text-arena-midnight hover:shadow-glow-peach transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Recording...' : 'Submit & Update Live Rank'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
