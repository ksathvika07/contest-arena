import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { AvatarBadge } from '../components/AvatarPicker';
import type { Contest } from '../types';
import {
  Trophy,
  Activity,
  Flame,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Database,
  Radio,
  CheckCircle2,
  Users,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  const [activeContests, setActiveContests] = useState<Contest[]>([]);
  const [scheduledContests, setScheduledContests] = useState<Contest[]>([]);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [liveActivity, setLiveActivity] = useState<any[]>([]);
  const [userRankInfo, setUserRankInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Fetch contests & platform overview
    Promise.all([
      api.getContests({ status: 'live' }),
      api.getContests({ status: 'scheduled' }),
      api.getOverviewAnalytics(),
    ])
      .then(([liveRes, schedRes, statsRes]) => {
        if (liveRes.success) setActiveContests(liveRes.contests);
        if (schedRes.success) setScheduledContests(schedRes.contests);
        if (statsRes.success) setOverviewStats(statsRes.data);
      })
      .catch((err) => console.error('Dashboard data load error:', err))
      .finally(() => setIsLoading(false));

    // Fetch personal rank if user is authenticated and active contests exist
    if (isAuthenticated) {
      api.getContests({ status: 'live' }).then((res) => {
        if (res.success && res.contests.length > 0) {
          api.getMyRank(res.contests[0]._id)
            .then((rankRes) => {
              if (rankRes.success && rankRes.isRanked) {
                setUserRankInfo({
                  contestTitle: res.contests[0].title,
                  rank: rankRes.rank,
                  score: rankRes.score,
                  total: rankRes.totalParticipants,
                });
              }
            })
            .catch(() => {});
        }
      });
    }

    // Subscribe to global live activity stream via Socket.IO
    const socket = getSocket();
    const handleActivity = (event: any) => {
      setLiveActivity((prev) => [event, ...prev.slice(0, 7)]);
    };

    socket.on('activity:feed', handleActivity);

    return () => {
      socket.off('activity:feed', handleActivity);
    };
  }, [isAuthenticated]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Student Snapshot Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-arena-aubergine via-arena-card to-arena-midnight border border-arena-peach/30 shadow-card-elevated">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <AvatarBadge avatarId={user?.avatarId || 'avatar_cyber_ninja'} size="lg" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-arena-peach tracking-wider uppercase">
                  Welcome to Contest Arena
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-arena-berry text-white">
                  {user?.role || 'Guest'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                {user ? user.name : 'Competitive Leaderboard Hub'}
              </h1>
              <p className="text-xs text-gray-300 mt-1">
                {user?.department || 'VIT-AP University SCOPE'} • ID: {user?.studentId || 'Guest'}
              </p>
            </div>
          </div>

          {/* Quick Rank Snapshot Card */}
          {userRankInfo ? (
            <div className="p-4 rounded-2xl bg-arena-surface/80 border border-arena-peach/40 flex items-center space-x-4 shrink-0 shadow-glow-peach">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-arena-peach to-arena-berry flex items-center justify-center text-arena-midnight font-black text-lg">
                #{userRankInfo.rank}
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block uppercase font-bold">
                  Your Current Standing
                </span>
                <p className="text-xs font-bold text-white truncate max-w-[150px]">
                  {userRankInfo.contestTitle}
                </p>
                <p className="text-xs font-mono font-extrabold text-arena-peach">
                  {userRankInfo.score} pts (of {userRankInfo.total} participants)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/leaderboard"
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-arena-peach to-arena-rose text-arena-midnight hover:shadow-glow-peach transition-all"
              >
                View Live Standings
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-arena-surface/70 border border-arena-border">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active Contests</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">
            {overviewStats?.activeContests || activeContests.length || 0}
          </span>
          <span className="text-[10px] text-emerald-400 block mt-1">● Live rankings running</span>
        </div>

        <div className="p-5 rounded-2xl bg-arena-surface/70 border border-arena-border">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Upcoming</span>
            <Clock className="w-4 h-4 text-arena-peach" />
          </div>
          <span className="text-2xl font-black text-white font-mono">
            {overviewStats?.scheduledContests || scheduledContests.length || 0}
          </span>
          <span className="text-[10px] text-arena-peach block mt-1">Scheduled events</span>
        </div>

        <div className="p-5 rounded-2xl bg-arena-surface/70 border border-arena-border">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Coders</span>
            <Users className="w-4 h-4 text-arena-blush" />
          </div>
          <span className="text-2xl font-black text-white font-mono">
            {overviewStats?.totalStudents || 35}+
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Across SCOPE depts</span>
        </div>

        <div className="p-5 rounded-2xl bg-arena-surface/70 border border-arena-border">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Submissions</span>
            <Award className="w-4 h-4 text-arena-rose" />
          </div>
          <span className="text-2xl font-black text-white font-mono">
            {overviewStats?.totalSubmissions || 50}+
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Logged in MongoDB</span>
        </div>
      </div>

      {/* Main Grid: Active Contests & Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Active & Upcoming Contests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-arena-peach" />
              <h2 className="text-lg font-extrabold text-white">Live Contests & Exams</h2>
            </div>
            <Link to="/contests" className="text-xs font-bold text-arena-peach hover:underline">
              View All Contests →
            </Link>
          </div>

          <div className="space-y-4">
            {activeContests.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-arena-surface/40 border border-arena-border text-gray-400 text-xs">
                No active contests currently running. Check scheduled contests below!
              </div>
            ) : (
              activeContests.map((contest) => (
                <div
                  key={contest._id}
                  className="p-5 rounded-2xl bg-arena-card border border-arena-border hover:border-arena-peach/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500 text-arena-midnight animate-pulse">
                        LIVE
                      </span>
                      <span className="text-xs text-arena-peach font-bold uppercase font-mono">
                        {contest.contestType}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">{contest.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1 max-w-md">
                      {contest.description}
                    </p>
                    <div className="flex items-center space-x-4 text-[11px] text-gray-400 pt-1">
                      <span>Max: <strong className="text-white">{contest.maxScore} pts</strong></span>
                      <span>•</span>
                      <span>Participants: <strong className="text-arena-peach">{contest.participantCount || 30}</strong></span>
                      <span>•</span>
                      <span>Duration: <strong className="text-white">{contest.durationMinutes} mins</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <Link
                      to={`/leaderboard`}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-arena-peach text-arena-midnight hover:shadow-glow-peach transition-all"
                    >
                      Leaderboard
                    </Link>
                    <Link
                      to={`/contests/${contest._id}`}
                      className="px-3 py-2 rounded-xl text-xs font-semibold bg-arena-surface hover:bg-white/10 text-arena-blush"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Scheduled upcoming contests */}
          {scheduledContests.length > 0 && (
            <div className="pt-4 space-y-4">
              <h3 className="text-sm font-bold text-arena-blush uppercase tracking-wider">
                Upcoming Scheduled Events
              </h3>
              <div className="space-y-3">
                {scheduledContests.map((contest) => (
                  <div
                    key={contest._id}
                    className="p-4 rounded-2xl bg-arena-surface/60 border border-arena-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-arena-aubergine text-arena-blush uppercase">
                        Scheduled
                      </span>
                      <h4 className="font-bold text-white mt-1">{contest.title}</h4>
                      <p className="text-[11px] text-gray-400">
                        Starts: {new Date(contest.startTime).toLocaleString()}
                      </p>
                    </div>
                    <Link
                      to={`/contests/${contest._id}`}
                      className="px-3 py-1.5 rounded-lg bg-arena-aubergine hover:bg-arena-berry text-arena-peach font-bold"
                    >
                      View Rules
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Live Score Activity Feed (Socket.IO Stream) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <h2 className="text-base font-extrabold text-white">Live Activity Stream</h2>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Socket.IO Push</span>
          </div>

          <div className="p-4 rounded-3xl bg-arena-card border border-arena-border space-y-3 max-h-[500px] overflow-y-auto">
            {liveActivity.length === 0 ? (
              <div className="py-12 text-center text-xs text-gray-400 space-y-2">
                <Radio className="w-8 h-8 mx-auto text-arena-rose animate-spin" />
                <p>Waiting for live scores...</p>
                <p className="text-[10px] text-gray-500">
                  Scores generated by students or the Live Simulator appear here instantly.
                </p>
              </div>
            ) : (
              liveActivity.map((act, index) => (
                <div
                  key={index}
                  className="p-3 rounded-2xl bg-arena-surface/80 border border-arena-peach/20 text-xs space-y-1 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate max-w-[140px]">
                      {act.studentName || act.studentId}
                    </span>
                    <span className="text-[10px] font-bold text-arena-peach font-mono">
                      #{act.rank || 1} Rank
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>
                      Scored <strong className="text-white font-mono">{act.score} pts</strong> (Attempt {act.attemptNumber || 1})
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
