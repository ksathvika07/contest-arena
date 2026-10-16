import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Contest } from '../types';
import {
  Trophy,
  Zap,
  Database,
  ArrowRight,
  Sparkles,
  Users,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Cpu,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [featuredContest, setFeaturedContest] = useState<Contest | null>(null);

  useEffect(() => {
    api.getContests({ status: 'live' })
      .then((res) => {
        if (res.success && res.contests.length > 0) {
          setFeaturedContest(res.contests[0]);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Background ambient gradient orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-arena-berry/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-arena-peach/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center">
        {/* Academic Badge */}
        <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-arena-aubergine/80 border border-arena-rose/30 text-xs font-semibold text-arena-peach mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-arena-peach" />
          <span>VIT-AP University • CSE3009 NoSQL Databases • Project 5</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Real-Time Contest & <br />
          <span className="text-gradient-peach">Exam Leaderboard</span>
        </h1>

        {/* Tagline */}
        <p className="mt-4 text-xl sm:text-2xl font-extrabold text-arena-peach tracking-wide uppercase">
          Compete. Climb. Conquer.
        </p>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Sub-millisecond live rankings calculated via <strong className="text-white">Redis Sorted Sets</strong>,
          instant score streaming over <strong className="text-white">Redis Pub/Sub & WebSockets</strong>, and
          permanent submission analytics backed by <strong className="text-white">MongoDB</strong>.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/leaderboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-arena-peach via-arena-rose to-arena-berry text-arena-midnight hover:shadow-glow-peach transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
          >
            <Trophy className="w-5 h-5 fill-current" />
            <span>Launch Live Leaderboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/database-demo"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-sm font-bold bg-arena-card/90 hover:bg-arena-aubergine text-arena-blush hover:text-white border border-arena-border hover:border-arena-peach/40 transition-all flex items-center justify-center space-x-2"
          >
            <Database className="w-5 h-5 text-arena-peach" />
            <span>Live Database Explorer</span>
          </Link>
        </div>

        {/* Live Featured Contest Preview Card */}
        {featuredContest && (
          <div className="mt-14 max-w-3xl mx-auto p-6 rounded-3xl glass-panel-elevated shadow-card-elevated border border-arena-peach/30 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-arena-midnight animate-pulse">
                    LIVE NOW
                  </span>
                  <span className="text-xs text-arena-peach font-bold uppercase tracking-wider">
                    Featured Contest
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  {featuredContest.title}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-2 max-w-xl">
                  {featuredContest.description}
                </p>
              </div>

              <div className="flex items-center space-x-3 shrink-0">
                <Link
                  to={`/leaderboard`}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-arena-peach text-arena-midnight hover:shadow-glow-peach transition-all"
                >
                  View Rankings
                </Link>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-arena-border/50 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-arena-surface/60">
                <span className="text-[10px] text-gray-400 block uppercase">Max Score</span>
                <span className="font-extrabold text-white font-mono">{featuredContest.maxScore} pts</span>
              </div>
              <div className="p-2 rounded-xl bg-arena-surface/60">
                <span className="text-[10px] text-gray-400 block uppercase">Participants</span>
                <span className="font-extrabold text-arena-peach font-mono">
                  {featuredContest.participantCount || 30}+ Registered
                </span>
              </div>
              <div className="p-2 rounded-xl bg-arena-surface/60">
                <span className="text-[10px] text-gray-400 block uppercase">Tie-Breaker</span>
                <span className="font-bold text-white capitalize text-[11px]">
                  {featuredContest.tieBreakingRules.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Architecture Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Dual NoSQL Storage Architecture
          </h2>
          <p className="mt-2 text-sm text-gray-400 max-w-xl mx-auto">
            Engineered specifically to solve the scalability bottleneck of high-frequency competitive leaderboards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Redis Feature 1 */}
          <div className="p-6 rounded-3xl glass-panel border border-arena-border hover:border-arena-peach/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-arena-peach to-arena-berry flex items-center justify-center text-arena-midnight shadow-glow-peach">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Redis Sorted Sets (ZSet)</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Maintains an in-memory skip list paired with a hash table. Computes exact student ranks in <code className="text-arena-peach font-mono">O(log(N))</code> time without expensive relational table scans.
            </p>
            <div className="pt-2 text-[11px] font-mono text-arena-peach flex items-center space-x-1">
              <span>Commands: ZADD, ZREVRANK, ZREVRANGE</span>
            </div>
          </div>

          {/* Redis Feature 2 */}
          <div className="p-6 rounded-3xl glass-panel border border-arena-border hover:border-arena-peach/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-arena-berry to-arena-aubergine flex items-center justify-center text-arena-peach shadow-glow-berry">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Redis Pub/Sub & WebSockets</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Decoupled publish/subscribe architecture. New scores are broadcasted across dedicated channels to Node.js backend subscribers and pushed via Socket.IO directly to connected browsers.
            </p>
            <div className="pt-2 text-[11px] font-mono text-arena-peach flex items-center space-x-1">
              <span>Channel: contest:&#123;id&#125;:updates</span>
            </div>
          </div>

          {/* MongoDB Feature 3 */}
          <div className="p-6 rounded-3xl glass-panel border border-arena-border hover:border-arena-peach/40 transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-arena-aubergine to-arena-rose flex items-center justify-center text-arena-blush">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">MongoDB Document Store</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Permanent source of truth for contest histories, submission attempt logs, and multi-stage aggregation pipelines generating score distribution histograms and department comparisons.
            </p>
            <div className="pt-2 text-[11px] font-mono text-arena-peach flex items-center space-x-1">
              <span>Pipelines: $bucket, $group, $lookup</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-arena-aubergine via-arena-card to-arena-berry border border-arena-peach/40 shadow-card-elevated space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Ready to test the live leaderboard platform?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto">
            Experience real-time rank updates, simulate score submissions, or explore live Redis and MongoDB queries.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              to="/leaderboard"
              className="px-6 py-3 rounded-xl text-xs font-extrabold bg-arena-peach text-arena-midnight hover:shadow-glow-peach transition-all"
            >
              Enter Live Arena
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              Create Student Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
