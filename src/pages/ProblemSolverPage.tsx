import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Code2,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Terminal,
  Trophy,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const ProblemSolverPage: React.FC = () => {
  const { contestId, problemId } = useParams<{ contestId: string; problemId: string }>();
  const { user, isAuthenticated } = useAuth();

  const [problem, setProblem] = useState<any>(null);
  const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp'>('javascript');
  const [code, setCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!contestId || !problemId) return;
    api.getProblem(contestId, problemId)
      .then((res) => {
        if (res.success && res.problem) {
          setProblem(res.problem);
          setCode(res.problem.starterCode?.[language] || '');
        }
      })
      .catch((err) => console.error(err));
  }, [contestId, problemId]);

  const handleLanguageChange = (newLang: 'javascript' | 'python' | 'cpp') => {
    setLanguage(newLang);
    if (problem?.starterCode?.[newLang]) {
      setCode(problem.starterCode[newLang]);
    }
  };

  const handleSubmitSolution = async () => {
    if (!contestId || !problemId) return;
    if (!isAuthenticated) {
      setErrorMsg('You must be signed in to submit solutions.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setEvalResult(null);

    try {
      const res = await api.submitSolution(contestId, problemId, {
        language,
        code,
      });

      if (res.success) {
        setEvalResult(res.evaluation);

        if (res.evaluation.status === 'Accepted') {
          confetti({
            particleCount: 80,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#ED9E59', '#862249', '#E8BCB9'],
          });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission evaluation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!problem) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400 text-xs">
        Loading challenge workspace...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Back and Title Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/contests/${contestId}/problems`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-gray-400 hover:text-arena-peach transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Problems</span>
        </Link>

        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              problem.difficulty === 'Easy'
                ? 'bg-emerald-500/20 text-emerald-300'
                : problem.difficulty === 'Medium'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-red-500/20 text-red-300'
            }`}
          >
            {problem.difficulty}
          </span>
          <span className="text-xs font-mono font-black text-arena-peach">
            {problem.points} Points
          </span>
        </div>
      </div>

      {/* Main Split View: Problem Details (Left) & Code Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Problem Specification */}
        <div className="p-6 rounded-3xl bg-arena-card border border-arena-border space-y-6 shadow-card-elevated overflow-y-auto max-h-[82vh]">
          <div>
            <h1 className="text-xl font-black text-white">{problem.title}</h1>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed whitespace-pre-line">
              {problem.description}
            </p>
          </div>

          {/* Formats */}
          <div className="space-y-3 pt-2 border-t border-arena-border text-xs">
            <div>
              <h3 className="font-bold text-arena-blush uppercase tracking-wider text-[11px] mb-1">
                Input Format
              </h3>
              <p className="text-gray-300 font-mono text-[11px] bg-arena-surface/80 p-2.5 rounded-xl border border-arena-border">
                {problem.inputFormat}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-arena-blush uppercase tracking-wider text-[11px] mb-1">
                Output Format
              </h3>
              <p className="text-gray-300 font-mono text-[11px] bg-arena-surface/80 p-2.5 rounded-xl border border-arena-border">
                {problem.outputFormat}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-arena-blush uppercase tracking-wider text-[11px] mb-1">
                Constraints
              </h3>
              <p className="text-gray-400 font-mono text-[11px]">
                {problem.constraints}
              </p>
            </div>
          </div>

          {/* Sample Test Cases */}
          <div className="space-y-3 pt-2 border-t border-arena-border">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-arena-peach" />
              <span>Sample Test Cases</span>
            </h3>

            {problem.sampleTestCases?.map((tc: any, index: number) => (
              <div key={index} className="p-3.5 rounded-2xl bg-arena-surface/80 border border-arena-border space-y-2 text-xs">
                <span className="text-[10px] font-bold text-arena-peach uppercase tracking-wider">
                  Sample {index + 1}
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-arena-midnight border border-arena-border">
                    <span className="text-[9px] text-gray-500 uppercase block">Input:</span>
                    <span className="text-white">{tc.input}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-arena-midnight border border-arena-border">
                    <span className="text-[9px] text-gray-500 uppercase block">Expected Output:</span>
                    <span className="text-emerald-400 font-bold">{tc.expectedOutput}</span>
                  </div>
                </div>
                {tc.explanation && (
                  <p className="text-[10px] text-gray-400 italic">
                    Explanation: {tc.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Code Editor & Execution Sandbox */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-arena-card border border-arena-border shadow-card-elevated space-y-4">
            {/* Language Selector & Controls Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-arena-peach" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Code Solution
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-arena-surface border border-arena-border text-xs text-arena-peach font-bold focus:outline-none"
                >
                  <option value="javascript">JavaScript (Node VM Sandbox)</option>
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ (GCC)</option>
                </select>
              </div>
            </div>

            {/* Code Editor Area */}
            <div className="relative">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={14}
                className="w-full p-4 rounded-2xl bg-arena-midnight border border-arena-border font-mono text-xs text-white focus:outline-none focus:border-arena-peach leading-relaxed selection:bg-arena-peach selection:text-arena-midnight"
                placeholder="// Implement solve(input) function returning the output..."
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-gray-400 font-mono">
                1.5s Execution Timeout • Isolated Memory Context
              </span>

              <button
                onClick={handleSubmitSolution}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-arena-peach to-arena-rose text-arena-midnight hover:shadow-glow-peach transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Evaluating Test Cases...' : 'Submit & Evaluate Solution'}</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center space-x-2 text-xs text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Evaluation Results Drawer */}
          {evalResult && (
            <div className="p-6 rounded-3xl bg-arena-card border border-arena-border shadow-card-elevated space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {evalResult.status === 'Accepted' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <h3
                    className={`text-base font-black ${
                      evalResult.status === 'Accepted' ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {evalResult.status}
                  </h3>
                </div>

                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="text-gray-400">
                    Passed: <strong className="text-white">{evalResult.passedCount} / {evalResult.totalCount}</strong>
                  </span>
                  <span className="text-arena-peach font-bold">
                    +{evalResult.scoreEarned} pts
                  </span>
                  <span className="text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {evalResult.executionTimeMs} ms
                  </span>
                </div>
              </div>

              {/* Individual test case breakdown */}
              <div className="space-y-2 pt-2 border-t border-arena-border">
                {evalResult.details?.map((tc: any, index: number) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      tc.passed
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                        : 'bg-red-500/10 border-red-500/30 text-red-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">Test Case {tc.testCaseNumber}:</span>
                      <span>{tc.passed ? 'Passed ✓' : 'Failed ✗'}</span>
                      {tc.isHidden && <span className="text-[10px] text-gray-400">(Hidden Test)</span>}
                    </div>

                    {!tc.isHidden && (
                      <div className="text-[11px] font-mono text-gray-300">
                        Expected: <strong className="text-white">{tc.expectedOutput}</strong> | Actual:{' '}
                        <strong className="text-arena-peach">{tc.actualOutput}</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {evalResult.status === 'Accepted' && (
                <div className="pt-2 flex items-center justify-between text-xs text-arena-peach">
                  <span>Live Leaderboard Sorted Set updated with verified score!</span>
                  <Link to="/leaderboard" className="font-bold underline">
                    View Live Standing →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
