import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { LiveSimulatorControl } from '../components/LiveSimulatorControl';
import type { Contest } from '../types';
import {
  ShieldAlert,
  Server,
  Database,
  Radio,
  RefreshCw,
  PlusCircle,
  Play,
  Square,
  CheckCircle,
  AlertCircle,
  Archive,
  ArrowRight,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const [health, setHealth] = useState<any>(null);
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestToRebuild, setSelectedContestToRebuild] = useState<string>('');
  const [isRebuilding, setIsRebuilding] = useState<boolean>(false);
  const [rebuildResult, setRebuildResult] = useState<string | null>(null);

  // New Contest Form State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'coding contest' | 'exam'>('coding contest');
  const [newMaxScore, setNewMaxScore] = useState('1000');
  const [newDuration, setNewDuration] = useState('120');
  const [newTieBreak, setNewTieBreak] = useState<'earlier_submission' | 'fewer_attempts' | 'higher_accuracy'>('earlier_submission');
  const [createMsg, setCreateMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchHealth = async () => {
    try {
      const res = await api.getHealth();
      if (res.success) setHealth(res);
    } catch (err) {}
  };

  const fetchContests = async () => {
    try {
      const res = await api.getContests();
      if (res.success) {
        setContests(res.contests);
        if (res.contests.length > 0 && !selectedContestToRebuild) {
          setSelectedContestToRebuild(res.contests[0]._id);
        }
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchHealth();
    fetchContests();
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRebuild = async () => {
    if (!selectedContestToRebuild) return;
    setIsRebuilding(true);
    setRebuildResult(null);

    try {
      const res = await api.rebuildLeaderboard(selectedContestToRebuild);
      if (res.success) {
        setRebuildResult(
          `Rebuild Complete: Successfully synchronized ${res.restoredEntriesCount} records from MongoDB into Redis Sorted Set!`
        );
      }
    } catch (err: any) {
      setRebuildResult('Rebuild failed: ' + err.message);
    } finally {
      setIsRebuilding(false);
    }
  };

  const handleStatusChange = async (contestId: string, status: string) => {
    try {
      await api.updateContestStatus(contestId, status);
      fetchContests();
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleArchive = async (contestId: string) => {
    if (!confirm('Are you sure you want to archive this contest?')) return;
    try {
      await api.deleteContest(contestId);
      fetchContests();
    } catch (err: any) {
      alert('Archive failed: ' + err.message);
    }
  };

  const handleCreateContest = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg(null);

    try {
      const now = new Date();
      const end = new Date(now.getTime() + Number(newDuration) * 60 * 1000);

      const res = await api.createContest({
        title: newTitle.trim(),
        description: newDesc.trim(),
        contestType: newType,
        maxScore: Number(newMaxScore),
        durationMinutes: Number(newDuration),
        startTime: now.toISOString(),
        endTime: end.toISOString(),
        status: 'live',
        tieBreakingRules: newTieBreak,
      });

      if (res.success) {
        setCreateMsg({ text: 'Contest created and deployed live!', type: 'success' });
        setTimeout(() => {
          setShowCreateModal(false);
          fetchContests();
        }, 1200);
      }
    } catch (err: any) {
      setCreateMsg({ text: err.message || 'Contest creation failed.', type: 'error' });
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-gray-400">
          Please sign in with administrator credentials to manage platform resources.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-arena-card border border-arena-peach/30 shadow-card-elevated">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
              Admin Console
            </span>
            <span className="text-xs text-gray-400">System Monitoring & Reconciliation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Contest Arena Operations
          </h1>
          <p className="text-xs text-gray-300">
            Control live score simulation, rebuild in-memory Redis state, and manage contest lifecycles.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-arena-peach to-arena-rose text-arena-midnight hover:shadow-glow-peach transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Contest</span>
        </button>
      </div>

      {/* Real Database Health Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* MongoDB Health */}
        <div className="p-6 rounded-3xl bg-arena-surface/80 border border-arena-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Persistent Document Store
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                health?.services.mongodb.connected
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/20 text-red-300'
              }`}
            >
              {health?.services.mongodb.status || 'Checking...'}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-arena-peach" />
            <span>MongoDB Community</span>
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            {health?.services.mongodb.purpose}
          </p>
          <div className="text-[10px] text-gray-400 font-mono pt-1">Port: 27017 • Native Windows Service</div>
        </div>

        {/* Redis Health */}
        <div className="p-6 rounded-3xl bg-arena-surface/80 border border-arena-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              In-Memory Sorted Sets & Pub/Sub
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                health?.services.redis.connected
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-red-500/20 text-red-300'
              }`}
            >
              {health?.services.redis.status || 'Checking...'}
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
            <Server className="w-4 h-4 text-arena-peach" />
            <span>Redis Server</span>
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Latency: <strong className="text-arena-peach font-mono">{health?.services.redis.latencyMs || 0} ms</strong>. {health?.services.redis.purpose}
          </p>
          <div className="text-[10px] text-gray-400 font-mono pt-1">Port: 6379 • Native Windows Service</div>
        </div>

        {/* WebSocket / Socket.IO Health */}
        <div className="p-6 rounded-3xl bg-arena-surface/80 border border-arena-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Real-Time Push Transport
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300">
              Active
            </span>
          </div>
          <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Socket.IO Engine</span>
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed">
            Connected Browser Clients: <strong className="text-white font-mono">{health?.services.socketio.activeClients || 1}</strong>
          </p>
          <div className="text-[10px] text-gray-400 font-mono pt-1">Bidirectional Event Streaming</div>
        </div>
      </div>

      {/* Cross-Database Reconciliation Section (Academic Highlight) */}
      <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-4 shadow-card-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-arena-peach" />
              <span>Cross-Database Failure Recovery & Leaderboard Rebuild</span>
            </h3>
            <p className="text-xs text-gray-300 max-w-2xl">
              Demonstrates resilient NoSQL architecture. If Redis in-memory ranking data is lost or flushed, this administrative mechanism reads the immutable source-of-truth records from MongoDB and re-populates the Redis Sorted Set atomically.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedContestToRebuild}
              onChange={(e) => setSelectedContestToRebuild(e.target.value)}
              className="px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-xs text-white"
            >
              {contests.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleRebuild}
              disabled={isRebuilding}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-arena-aubergine hover:bg-arena-berry text-arena-peach border border-arena-peach/30 transition-all disabled:opacity-50"
            >
              {isRebuilding ? 'Rebuilding...' : 'Rebuild Redis ZSet'}
            </button>
          </div>
        </div>

        {rebuildResult && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{rebuildResult}</span>
          </div>
        )}
      </div>

      {/* Simulator Control */}
      <LiveSimulatorControl />

      {/* Contests Management Table */}
      <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-4 shadow-card-elevated">
        <h3 className="text-sm font-extrabold text-white">Contest Lifecycle Administration</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-arena-aubergine/60 text-arena-blush uppercase font-bold tracking-wider border-b border-arena-border">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Max Score</th>
                <th className="py-3 px-4 text-center">Duration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena-border font-medium">
              {contests.map((contest) => (
                <tr key={contest._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">{contest.title}</td>
                  <td className="py-3 px-4 capitalize text-gray-300">{contest.contestType}</td>
                  <td className="py-3 px-4">
                    <select
                      value={contest.status}
                      onChange={(e) => handleStatusChange(contest._id, e.target.value)}
                      className="px-2 py-1 rounded bg-arena-surface border border-arena-border text-xs text-arena-peach font-bold focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="live">Live</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-gray-300">{contest.maxScore}</td>
                  <td className="py-3 px-4 text-center text-gray-300">{contest.durationMinutes}m</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleArchive(contest._id)}
                      className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      title="Archive contest"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Contest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-arena-card border border-arena-peach/30 rounded-3xl p-6 shadow-card-elevated space-y-4">
            <h3 className="text-base font-extrabold text-white">Deploy New Contest</h3>

            {createMsg && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                  createMsg.type === 'success'
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-red-500/15 text-red-300'
                }`}
              >
                <span>{createMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleCreateContest} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-arena-blush mb-1">Contest Title *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-white"
                  placeholder="e.g. Scope Hackathon Finals 2026"
                />
              </div>

              <div>
                <label className="block font-bold text-arena-blush mb-1">Description *</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-white"
                  placeholder="Problem details and objectives..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-arena-blush mb-1">Contest Type</label>
                  <select
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-white"
                  >
                    <option value="coding contest">Coding Contest</option>
                    <option value="exam">Proctored Exam</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-arena-blush mb-1">Maximum Score</label>
                  <input
                    type="number"
                    value={newMaxScore}
                    onChange={(e) => setNewMaxScore(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-arena-blush mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-arena-blush mb-1">Tie-Breaking Policy</label>
                  <select
                    value={newTieBreak}
                    onChange={(e: any) => setNewTieBreak(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-white"
                  >
                    <option value="earlier_submission">Earlier Submission Time</option>
                    <option value="fewer_attempts">Fewer Attempts</option>
                    <option value="higher_accuracy">Higher Accuracy</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-arena-peach text-arena-midnight hover:shadow-glow-peach"
                >
                  Create & Launch Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
