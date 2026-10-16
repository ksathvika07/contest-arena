import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AvatarBadge } from '../components/AvatarPicker';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Database,
  PieChart,
  Users,
  Award,
  TrendingUp,
  Cpu,
  Layers,
  Code,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [contestAnalytics, setContestAnalytics] = useState<any>(null);
  const [contests, setContests] = useState<any[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 1. Fetch overview
    api.getOverviewAnalytics()
      .then((res) => {
        if (res.success) setOverview(res.data);
      })
      .catch((err) => console.error(err));

    // 2. Fetch contests to populate selector
    api.getContests()
      .then((res) => {
        if (res.success && res.contests.length > 0) {
          setContests(res.contests);
          const liveContest = res.contests.find((c) => c.status === 'live') || res.contests[0];
          setSelectedContestId(liveContest._id);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch contest-specific analytics when selected contest changes
  useEffect(() => {
    if (!selectedContestId) return;
    api.getContestAnalytics(selectedContestId)
      .then((res) => {
        if (res.success) setContestAnalytics(res);
      })
      .catch((err) => console.error(err));
  }, [selectedContestId]);

  const scoreDistColors = ['#862249', '#A34054', '#E8BCB9', '#ED9E59', '#34D399'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-arena-card border border-arena-peach/30 shadow-card-elevated">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-arena-aubergine text-arena-peach border border-arena-rose/30">
              MongoDB Aggregation Engine
            </span>
            <span className="text-xs text-gray-400 font-mono">$bucket • $group • $lookup</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Analytics & Statistical Intelligence
          </h1>
          <p className="text-xs text-gray-300">
            Multi-stage aggregation pipelines computing distribution histograms and department benchmarks.
          </p>
        </div>

        {/* Contest Switcher */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-arena-blush font-semibold whitespace-nowrap">Contest:</span>
          <select
            value={selectedContestId}
            onChange={(e) => setSelectedContestId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-xs text-white font-bold focus:outline-none focus:border-arena-peach"
          >
            {contests.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Platform Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-arena-surface/80 border border-arena-border">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Total Participants
          </span>
          <span className="text-2xl font-black text-white font-mono">
            {overview?.totalStudents || 35}
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Unique enrolled students</span>
        </div>

        <div className="p-5 rounded-2xl bg-arena-surface/80 border border-arena-border">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Submissions Processed
          </span>
          <span className="text-2xl font-black text-arena-peach font-mono">
            {overview?.totalSubmissions || 0}
          </span>
          <span className="text-[10px] text-gray-400 block mt-1">Audit trail entries</span>
        </div>

        <div className="p-5 rounded-2xl bg-arena-surface/80 border border-arena-border">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Platform Avg Score
          </span>
          <span className="text-2xl font-black text-white font-mono">
            {overview?.platformAvgScore || 0} pts
          </span>
          <span className="text-[10px] text-emerald-400 block mt-1">Weighted student mean</span>
        </div>

        <div className="p-5 rounded-2xl bg-arena-surface/80 border border-arena-border">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Contests Stored
          </span>
          <span className="text-2xl font-black text-white font-mono">
            {overview?.totalContests || 4}
          </span>
          <span className="text-[10px] text-arena-peach block mt-1">Live, scheduled, archived</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Histogram ($bucket) */}
        <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-4 shadow-card-elevated">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white">Score Distribution Histogram</h3>
              <p className="text-[11px] text-gray-400">
                Generated via MongoDB <code className="text-arena-peach font-mono">$bucket</code> pipeline
              </p>
            </div>
            <span className="text-[11px] font-mono text-arena-peach font-bold">5 Intervals</span>
          </div>

          <div className="h-64 w-full">
            {!contestAnalytics?.scoreDistribution ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Loading histogram...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contestAnalytics.scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#44174E" opacity={0.4} />
                  <XAxis dataKey="range" stroke="#A34054" fontSize={10} />
                  <YAxis stroke="#A34054" fontSize={10} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#2D1F44',
                      borderColor: '#ED9E59',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {contestAnalytics.scoreDistribution.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={scoreDistColors[index % scoreDistColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Department Performance Benchmark ($lookup + $group) */}
        <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-4 shadow-card-elevated">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white">Department Benchmark Comparison</h3>
              <p className="text-[11px] text-gray-400">
                Generated via MongoDB <code className="text-arena-peach font-mono">$lookup</code> across users collection
              </p>
            </div>
            <span className="text-[11px] font-mono text-arena-peach font-bold">Mean Score</span>
          </div>

          <div className="h-64 w-full">
            {!contestAnalytics?.departmentBreakdown ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Loading department comparison...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={contestAnalytics.departmentBreakdown.map((d: any) => ({
                    name: d.department.replace(' & Engineering', '').replace(' (SCOPE)', ''),
                    avgScore: d.avgScore,
                    participants: d.participantCount,
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#44174E" opacity={0.4} />
                  <XAxis type="number" stroke="#A34054" fontSize={10} />
                  <YAxis dataKey="name" type="category" stroke="#A34054" fontSize={10} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#2D1F44',
                      borderColor: '#ED9E59',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="avgScore" fill="#ED9E59" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 Performers All-Time Table */}
      <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-4 shadow-card-elevated">
        <div className="flex items-center space-x-2">
          <Award className="w-5 h-5 text-arena-peach" />
          <h3 className="text-sm font-extrabold text-white">
            Top Performers Across All Platform Contests (MongoDB Multi-Stage Pipeline)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-arena-aubergine/60 text-arena-blush uppercase font-bold tracking-wider border-b border-arena-border">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Rank</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Contests Entered</th>
                <th className="py-3 px-4 text-center">Average Score</th>
                <th className="py-3 px-4 text-right">Cumulative Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena-border">
              {!overview?.topPerformers ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Loading top performers...
                  </td>
                </tr>
              ) : (
                overview.topPerformers.map((performer: any, idx: number) => (
                  <tr key={performer.studentId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-arena-peach">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <AvatarBadge avatarId={performer.avatarId} size="sm" />
                        <div>
                          <span className="font-bold text-white block">{performer.name}</span>
                          <span className="text-[10px] font-mono text-gray-400">
                            {performer.studentId}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-[11px]">{performer.department}</td>
                    <td className="py-3 px-4 text-center font-mono text-gray-300">
                      {performer.contestsPlayed}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-white">
                      {performer.avgScore}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-arena-peach text-sm">
                      {performer.totalScore} pts
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
