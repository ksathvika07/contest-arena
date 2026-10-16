import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getSocket, joinContestRoom, leaveContestRoom } from '../services/socket';
import { PodiumCard } from '../components/PodiumCard';
import { AvatarBadge } from '../components/AvatarPicker';
import { ScoreSubmissionModal } from '../components/ScoreSubmissionModal';
import { LiveSimulatorControl } from '../components/LiveSimulatorControl';
import type { Contest, LeaderboardEntry } from '../types';
import {
  Trophy,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  TrendingUp,
  UserCheck,
  Radio,
  Sparkles,
  Calendar,
  AlertCircle,
  Database,
} from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [totalParticipants, setTotalParticipants] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [viewFilter, setViewFilter] = useState<'all' | 'top10' | 'top50'>('all');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [highlightStudentId, setHighlightStudentId] = useState<string | null>(null);

  const userRowRef = useRef<HTMLTableRowElement | null>(null);

  // 1. Fetch available contests on mount
  useEffect(() => {
    api.getContests()
      .then((res) => {
        if (res.success && res.contests.length > 0) {
          setContests(res.contests);
          const liveContest = res.contests.find((c) => c.status === 'live') || res.contests[0];
          setSelectedContestId(liveContest._id);
        }
      })
      .catch((err) => console.error('Failed to load contests:', err));
  }, []);

  // 2. Fetch Leaderboard from Redis when contest/filters change
  const fetchLeaderboard = async () => {
    if (!selectedContestId) return;
    setIsLoading(true);

    let queryLimit = limit;
    if (viewFilter === 'top10') queryLimit = 10;
    if (viewFilter === 'top50') queryLimit = 50;

    try {
      const res = await api.getLeaderboard(selectedContestId, {
        page: viewFilter === 'all' ? page : 1,
        limit: queryLimit,
        department: departmentFilter || undefined,
        search: searchQuery || undefined,
      });

      if (res.success) {
        setEntries(res.entries);
        setTotalParticipants(res.total);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err: any) {
      console.error('Leaderboard fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedContestId, page, limit, viewFilter, departmentFilter, searchQuery]);

  // 3. Socket.IO Real-Time Updates Subscription
  useEffect(() => {
    if (!selectedContestId) return;

    joinContestRoom(selectedContestId);
    const socket = getSocket();
    setIsLiveConnected(socket.connected);

    const onConnect = () => setIsLiveConnected(true);
    const onDisconnect = () => setIsLiveConnected(false);

    const handleContestUpdate = (event: any) => {
      // Whenever a score update or rebuild event is broadcasted by Redis Pub/Sub
      fetchLeaderboard();

      if (event.studentId) {
        setHighlightStudentId(event.studentId);
        setTimeout(() => setHighlightStudentId(null), 3500);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('contest:update', handleContestUpdate);

    return () => {
      leaveContestRoom(selectedContestId);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('contest:update', handleContestUpdate);
    };
  }, [selectedContestId]);

  // Scroll to current user's rank
  const handleLocateMyRank = () => {
    if (userRowRef.current) {
      userRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightStudentId(user?.studentId || null);
      setTimeout(() => setHighlightStudentId(null), 3000);
    } else if (user) {
      api.getMyRank(selectedContestId).then((res) => {
        if (res.success && res.isRanked) {
          alert(`Your current rank is #${res.rank} with ${res.score} points!`);
        } else {
          alert('You are not currently ranked in this contest. Submit a score to climb the leaderboard!');
        }
      });
    }
  };

  const selectedContest = contests.find((c) => c._id === selectedContestId) || contests[0];

  // Distinct Top 3 for Podium
  const top1 = entries.find((e) => e.rank === 1);
  const top2 = entries.find((e) => e.rank === 2);
  const top3 = entries.find((e) => e.rank === 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Contest Header & Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-arena-card border border-arena-peach/30 shadow-card-elevated">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-arena-peach text-arena-midnight shadow-sm">
              Live Redis ZSet
            </span>
            <span className="text-xs text-arena-blush font-semibold">
              O(log(N)) Rank Lookups
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Live Contest Leaderboard
          </h1>
          <p className="text-xs text-gray-300">
            Current Contest: <strong className="text-arena-peach">{selectedContest?.title}</strong>
          </p>
        </div>

        {/* Contest Switcher Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedContestId}
            onChange={(e) => {
              setSelectedContestId(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-arena-surface border border-arena-border text-xs text-white font-bold focus:outline-none focus:border-arena-peach"
          >
            {contests.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title} ({c.status.toUpperCase()})
              </option>
            ))}
          </select>

          {/* Submit Score CTA Button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-arena-peach to-arena-rose text-arena-midnight hover:shadow-glow-peach transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Score</span>
          </button>
        </div>
      </div>

      {/* Simulator Control Bar */}
      <LiveSimulatorControl
        contestId={selectedContestId}
        onSimulationEvent={fetchLeaderboard}
      />

      {/* Top 3 Podium Cards */}
      {top1 && (
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Honor Roll Podium</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-gray-400">
              Live top 3 contenders dynamically computed via Redis Sorted Sets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4 max-w-4xl mx-auto">
            {/* Rank 2 (Silver) */}
            <div className="order-2 md:order-1">
              {top2 ? (
                <PodiumCard entry={top2} rank={2} />
              ) : (
                <div className="h-64 rounded-3xl bg-arena-surface/40 border border-arena-border flex items-center justify-center text-xs text-gray-400">
                  Awaiting 2nd Place
                </div>
              )}
            </div>

            {/* Rank 1 (Gold) */}
            <div className="order-1 md:order-2">
              <PodiumCard entry={top1} rank={1} />
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="order-3">
              {top3 ? (
                <PodiumCard entry={top3} rank={3} />
              ) : (
                <div className="h-64 rounded-3xl bg-arena-surface/40 border border-arena-border flex items-center justify-center text-xs text-gray-400">
                  Awaiting 3rd Place
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table Controls & Filter Bar */}
      <div className="p-4 rounded-2xl bg-arena-card border border-arena-border flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search & Dept Filter */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Search */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search student or ID..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-arena-surface border border-arena-border text-xs text-white focus:outline-none focus:border-arena-peach"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {/* Department filter */}
          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-arena-surface border border-arena-border text-xs text-gray-300 focus:outline-none focus:border-arena-peach"
          >
            <option value="">All Departments</option>
            <option value="Computer Science & Engineering">Computer Science</option>
            <option value="Software Engineering">Software Eng</option>
            <option value="Data Science & AI">Data Science</option>
            <option value="Cyber Security">Cyber Security</option>
            <option value="Information Technology">IT</option>
          </select>
        </div>

        {/* View toggle (Top 10 / Top 50 / All) & Locate Me */}
        <div className="flex items-center space-x-2">
          <div className="flex rounded-xl bg-arena-surface p-1 border border-arena-border text-xs font-semibold">
            {(['all', 'top10', 'top50'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => {
                  setViewFilter(mode);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewFilter === mode
                    ? 'bg-arena-peach text-arena-midnight font-bold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode === 'all' && 'All'}
                {mode === 'top10' && 'Top 10'}
                {mode === 'top50' && 'Top 50'}
              </button>
            ))}
          </div>

          {isAuthenticated && (
            <button
              onClick={handleLocateMyRank}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-arena-aubergine hover:bg-arena-berry text-arena-peach border border-arena-peach/30 text-xs font-bold transition-all"
              title="Locate my position in the leaderboard"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>My Rank</span>
            </button>
          )}

          <button
            onClick={fetchLeaderboard}
            className="p-1.5 rounded-xl bg-arena-surface hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-arena-peach' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="overflow-x-auto rounded-3xl bg-arena-card border border-arena-border shadow-card-elevated">
        <table className="w-full text-left text-xs">
          <thead className="bg-arena-aubergine/80 text-arena-blush font-bold uppercase tracking-wider border-b border-arena-border">
            <tr>
              <th className="py-3.5 px-4 w-16 text-center">Rank</th>
              <th className="py-3.5 px-4">Participant</th>
              <th className="py-3.5 px-4 hidden sm:table-cell">Department</th>
              <th className="py-3.5 px-4 text-center">Attempts</th>
              <th className="py-3.5 px-4 text-right">Live Score</th>
              <th className="py-3.5 px-4 hidden md:table-cell text-right">Last Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-arena-border font-medium">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  {isLoading ? 'Computing live rankings in Redis...' : 'No participants found matching criteria.'}
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const isCurrentUser = user && user.studentId === entry.studentId;
                const isHighlighted = highlightStudentId === entry.studentId;

                return (
                  <tr
                    key={entry.studentId}
                    ref={isCurrentUser ? userRowRef : null}
                    className={`transition-colors ${
                      isHighlighted
                        ? 'bg-arena-peach/20 border-l-4 border-arena-peach'
                        : isCurrentUser
                        ? 'bg-arena-aubergine/50 border-l-4 border-arena-peach'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center">
                      {entry.rank === 1 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-arena-midnight font-black shadow-sm">
                          1
                        </span>
                      ) : entry.rank === 2 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-arena-midnight font-black shadow-sm">
                          2
                        </span>
                      ) : entry.rank === 3 ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black shadow-sm">
                          3
                        </span>
                      ) : (
                        <span className="font-mono text-gray-400 font-bold">#{entry.rank}</span>
                      )}
                    </td>

                    {/* Participant Details with Avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <AvatarBadge avatarId={entry.avatarId} size="sm" />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-white">{entry.name}</span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-arena-peach text-arena-midnight">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-arena-blush block">
                            {entry.studentId}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 hidden sm:table-cell text-gray-300 text-[11px]">
                      {entry.department}
                    </td>

                    {/* Attempts count */}
                    <td className="py-3 px-4 text-center text-gray-300 font-mono">
                      {entry.submissionCount}
                    </td>

                    {/* Score */}
                    <td className="py-3 px-4 text-right">
                      <span className="text-base font-black font-mono text-arena-peach">
                        {entry.score}
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3 px-4 hidden md:table-cell text-right text-gray-400 text-[11px]">
                      {new Date(entry.lastUpdatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {viewFilter === 'all' && totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>
            Showing page <strong className="text-white">{page}</strong> of{' '}
            <strong className="text-white">{totalPages}</strong> ({totalParticipants} total ranked)
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-xl bg-arena-card border border-arena-border hover:bg-arena-aubergine text-white disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-xl bg-arena-card border border-arena-border hover:bg-arena-aubergine text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Score Submission Modal */}
      {selectedContest && (
        <ScoreSubmissionModal
          isOpen={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
          contest={selectedContest}
          onSubmitted={fetchLeaderboard}
        />
      )}
    </div>
  );
};
