import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  Terminal,
  Trophy,
  CheckCircle,
  Clock,
  ArrowRight,
  Filter,
  Sparkles,
} from 'lucide-react';

export const ProblemsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const contestParam = searchParams.get('contestId');

  const [contests, setContests] = useState<any[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>(contestParam || '');
  const [problems, setProblems] = useState<any[]>([]);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getContests()
      .then((res) => {
        if (res.success && res.contests.length > 0) {
          setContests(res.contests);
          if (!selectedContestId) {
            const liveC = res.contests.find((c: any) => c.status === 'live') || res.contests[0];
            setSelectedContestId(liveC._id);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedContestId) return;
    setIsLoading(true);
    api.getProblems(selectedContestId)
      .then((res) => {
        if (res.success) setProblems(res.problems);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [selectedContestId]);

  const filteredProblems = problems.filter((p) =>
    difficultyFilter === 'all' ? true : p.difficulty.toLowerCase() === difficultyFilter
  );

  const selectedContest = contests.find((c) => c._id === selectedContestId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-arena-card border border-arena-peach/30 shadow-card-elevated">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-arena-peach text-arena-midnight shadow-sm">
              Problem Arena
            </span>
            <span className="text-xs text-arena-blush font-semibold">
              Verified Test-Case Evaluation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Coding Problems & Challenges</h1>
          <p className="text-xs text-gray-300">
            Contest: <strong className="text-arena-peach">{selectedContest?.title || 'Loading...'}</strong>
          </p>
        </div>

        {/* Contest Switcher & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedContestId}
            onChange={(e) => {
              setSelectedContestId(e.target.value);
              setSearchParams({ contestId: e.target.value });
            }}
            className="px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-xs text-white font-bold focus:outline-none focus:border-arena-peach"
          >
            {contests.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-arena-surface border border-arena-border text-xs text-gray-300 focus:outline-none focus:border-arena-peach"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Problems Table */}
      <div className="overflow-x-auto rounded-3xl bg-arena-card border border-arena-border shadow-card-elevated">
        <table className="w-full text-left text-xs">
          <thead className="bg-arena-aubergine/60 text-arena-blush uppercase font-bold tracking-wider border-b border-arena-border">
            <tr>
              <th className="py-3.5 px-4 w-16 text-center">#</th>
              <th className="py-3.5 px-4">Problem Title</th>
              <th className="py-3.5 px-4 text-center">Difficulty</th>
              <th className="py-3.5 px-4 text-center">Max Points</th>
              <th className="py-3.5 px-4 text-center">Sample Cases</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-arena-border font-medium">
            {filteredProblems.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-gray-400">
                  {isLoading ? 'Loading problems...' : 'No problems available for this contest.'}
                </td>
              </tr>
            ) : (
              filteredProblems.map((problem, idx) => (
                <tr key={problem._id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 text-center font-mono text-gray-400 font-bold">
                    {problem.order || idx + 1}
                  </td>
                  <td className="py-3.5 px-4">
                    <Link
                      to={`/contests/${selectedContestId}/problems/${problem._id}`}
                      className="font-bold text-white hover:text-arena-peach transition-colors text-sm"
                    >
                      {problem.title}
                    </Link>
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                      {problem.description}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        problem.difficulty === 'Easy'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : problem.difficulty === 'Medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-arena-peach text-sm">
                    {problem.points} pts
                  </td>
                  <td className="py-3.5 px-4 text-center text-gray-300 font-mono">
                    {problem.sampleTestCases?.length || 2}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/contests/${selectedContestId}/problems/${problem._id}`}
                      className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-arena-peach to-arena-rose text-arena-midnight hover:shadow-glow-peach transition-all"
                    >
                      <span>Solve Problem</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
