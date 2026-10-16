import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AvatarBadge } from '../components/AvatarPicker';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  Trophy,
  Award,
  TrendingUp,
  Percent,
  Calendar,
  CheckCircle2,
  Clock,
  History,
} from 'lucide-react';

export const PerformancePage: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([api.getMyAnalytics(), api.getMySubmissions()])
      .then(([analyticsRes, subRes]) => {
        if (analyticsRes.success) {
          setStats(analyticsRes.stats);
          setHistory(analyticsRes.history);
        }
        if (subRes.success) {
          setSubmissions(subRes.submissions);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const chartData = history.map((item, index) => ({
    name: item.contestTitle?.substring(0, 15) || `Contest ${index + 1}`,
    score: item.currentScore,
    percentage: item.percentage,
    attempts: item.submissionCount,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-arena-aubergine via-arena-card to-arena-midnight border border-arena-peach/30 shadow-card-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <AvatarBadge avatarId={user?.avatarId || 'avatar_cyber_ninja'} size="xl" />
          <div>
            <span className="text-xs font-bold text-arena-peach uppercase tracking-wider">
              Student Performance Analytics
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{user?.name}</h1>
            <p className="text-xs text-gray-300 font-mono mt-1">
              ID: {user?.studentId} • {user?.department}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-arena-surface border border-arena-border text-arena-blush">
            Verified MongoDB Records
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-arena-surface/80 border border-arena-border">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Contests Entered</span>
            <Trophy className="w-4 h-4 text-arena-peach" />
          </div>
          <span className="text-2xl font-black text-white font-mono">
            {stats?.totalContests || 0}
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Total contests</span>
        </div>

        <div className="p-5 rounded-2xl bg-arena-surface/80 border border-arena-border">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Average Score</span>
            <Award className="w-4 h-4 text-arena-blush" />
          </div>
          <span className="text-2xl font-black text-white font-mono">
            {stats?.avgScore || 0}
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Points average</span>
        </div>

        <div className="p-5 rounded-2xl bg-arena-surface/80 border border-arena-border">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Percentage</span>
            <Percent className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">
            {stats?.avgPercentage || '0.0'}%
          </span>
          <span className="text-[10px] text-emerald-400 block mt-1">Accuracy benchmark</span>
        </div>

        <div className="p-5 rounded-2xl bg-arena-surface/80 border border-arena-border">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Highest Score</span>
            <TrendingUp className="w-4 h-4 text-arena-rose" />
          </div>
          <span className="text-2xl font-black text-arena-peach font-mono">
            {stats?.highestScore || 0}
          </span>
          <span className="text-[10px] text-arena-peach block mt-1">Peak performance</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trend Area Chart */}
        <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-4 shadow-card-elevated">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">Score Progression History</h3>
            <span className="text-[11px] font-mono text-arena-peach">Recharts Area</span>
          </div>

          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Participate in contests to visualize score progression.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ED9E59" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#862249" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#44174E" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#A34054" fontSize={10} />
                  <YAxis stroke="#A34054" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#2D1F44',
                      borderColor: '#ED9E59',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#ED9E59"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#scoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Attempts vs Performance Chart */}
        <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-4 shadow-card-elevated">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white">Attempt Counts per Contest</h3>
            <span className="text-[11px] font-mono text-arena-peach">Recharts Bar</span>
          </div>

          <div className="h-64 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No attempt logs recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#44174E" opacity={0.4} />
                  <XAxis dataKey="name" stroke="#A34054" fontSize={10} />
                  <YAxis stroke="#A34054" fontSize={10} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#2D1F44',
                      borderColor: '#ED9E59',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="attempts" fill="#862249" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Historical Submissions Table */}
      <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-4 shadow-card-elevated">
        <div className="flex items-center space-x-2">
          <History className="w-4 h-4 text-arena-peach" />
          <h3 className="text-sm font-bold text-white">
            Permanent Submission Audit Trail (MongoDB)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-arena-aubergine/60 text-arena-blush uppercase font-bold tracking-wider border-b border-arena-border">
              <tr>
                <th className="py-3 px-4">Contest</th>
                <th className="py-3 px-4 text-center">Attempt #</th>
                <th className="py-3 px-4 text-center">Score Recorded</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena-border">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No submissions recorded.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-bold text-white">
                      {sub.contestId?.title || 'Contest'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-arena-peach">
                      Attempt {sub.attemptNumber}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white">
                      {sub.score} / {sub.maximumScore}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400 font-mono text-[11px]">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
