import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Database,
  Server,
  Zap,
  Code,
  Clock,
  Layers,
  CheckCircle,
  RefreshCw,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';

export const DatabaseDemoPage: React.FC = () => {
  const [demoData, setDemoData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'redis' | 'mongodb'>('all');

  const fetchDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDatabaseDemo();
      if (res.success) {
        setDemoData(res);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemo();
  }, []);

  const filteredDemos = (demoData?.demonstrations || []).filter((d: any) =>
    activeTab === 'all' ? true : d.database.toLowerCase() === activeTab
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-arena-aubergine via-arena-card to-arena-midnight border border-arena-peach/30 shadow-card-elevated flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-arena-peach text-arena-midnight shadow-sm">
              Academic Demonstration
            </span>
            <span className="text-xs text-arena-blush font-mono">
              VIT-AP CSE3009 Prof. Harapriya Kar
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Live NoSQL Database Command Explorer
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            Live execution of Redis Sorted Set primitives, Pub/Sub channels, and MongoDB aggregation pipelines with real millisecond benchmark latencies.
          </p>
        </div>

        <button
          onClick={fetchDemo}
          disabled={isLoading}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-arena-peach text-arena-midnight hover:shadow-glow-peach transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Execute Live Queries</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-arena-border pb-3">
        {(['all', 'redis', 'mongodb'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab
                ? 'bg-arena-peach text-arena-midnight shadow-glow-peach'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'all' && 'All Features'}
            {tab === 'redis' && '⚡ Redis Sorted Sets & Pub/Sub'}
            {tab === 'mongodb' && '🍃 MongoDB Document & Aggregations'}
          </button>
        ))}
      </div>

      {/* Demonstrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDemos.map((demo: any, idx: number) => {
          const isRedis = demo.database === 'Redis';
          return (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-arena-card border border-arena-border hover:border-arena-peach/40 shadow-card-elevated space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Database & Complexity Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        isRedis ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {demo.database}
                    </span>
                    <h3 className="text-sm font-extrabold text-white">{demo.feature}</h3>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-arena-surface text-[10px] font-mono text-arena-peach font-bold">
                    {demo.complexity}
                  </span>
                </div>

                {/* Command Snippet */}
                <div className="p-3.5 rounded-2xl bg-arena-midnight border border-arena-border">
                  <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                    Executed Command / Query:
                  </span>
                  <code className="text-xs font-mono text-arena-peach block break-all">
                    {demo.command}
                  </code>
                </div>

                {/* Explanation */}
                <p className="text-xs text-gray-300 leading-relaxed">
                  {demo.explanation}
                </p>

                {/* Output Inspection Box */}
                <div className="p-3.5 rounded-2xl bg-arena-surface/80 border border-arena-border space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase">
                    <span>Live Output Result:</span>
                    <span className="flex items-center text-emerald-400 font-mono">
                      <Clock className="w-3 h-3 mr-1" />
                      {demo.executionTimeMs} ms
                    </span>
                  </div>
                  <pre className="text-[11px] font-mono text-arena-blush overflow-x-auto max-h-32">
                    {JSON.stringify(demo.output, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Academic Rationale Pill */}
              <div className="pt-3 border-t border-arena-border/50 text-[10px] text-gray-400">
                <strong className="text-arena-peach">Why this fits Contest Arena: </strong>
                {isRedis
                  ? 'Skip lists eliminate full-table O(N log(N)) sorting on every concurrent submission, making live podium computation sub-millisecond.'
                  : 'Document schema stores submission history with attempt timestamps and enables multi-stage analytical pipelines without joins.'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative NoSQL vs Relational & CAP Theorem Card */}
      <div className="p-8 rounded-3xl bg-arena-card border border-arena-peach/30 shadow-card-elevated space-y-6">
        <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-5 h-5 text-arena-peach" />
          <span>Academic Evaluation: Data Model & CAP Theorem Analysis</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-300">
          <div className="space-y-3 p-5 rounded-2xl bg-arena-surface/60 border border-arena-border">
            <h3 className="font-bold text-white text-sm flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-arena-peach" />
              <span>Why Redis Sorted Sets vs Relational SQL</span>
            </h3>
            <p className="leading-relaxed">
              In relational databases (e.g., PostgreSQL / MySQL), finding a participant's live rank requires:
              <code className="text-arena-peach block my-1 font-mono">
                SELECT COUNT(*) + 1 FROM results WHERE contest_id = ? AND score &gt; my_score
              </code>
              Under 10,000 participants and 500 score submissions per second, this causes heavy index locking and table scans. Redis Sorted Sets maintain an in-memory <strong>Skip List</strong> and <strong>Hash Table</strong> in dual sync. Adding a score with <code className="text-arena-peach font-mono">ZADD</code> and querying rank with <code className="text-arena-peach font-mono">ZREVRANK</code> takes strictly <strong className="text-white">O(log(N))</strong> time, providing instant live leaderboard updates.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-arena-surface/60 border border-arena-border">
            <h3 className="font-bold text-white text-sm flex items-center space-x-1.5">
              <Database className="w-4 h-4 text-arena-blush" />
              <span>CAP Theorem & Cross-Database Consistency</span>
            </h3>
            <p className="leading-relaxed">
              Under network partitions (CAP Theorem), MongoDB operates primarily as a <strong>CP (Consistency & Partition Tolerance)</strong> store with majority write concerns, ensuring exam audit trails are never corrupted. Redis acts as a high-throughput <strong>AP in-memory cache</strong> for live rankings.
              Because MongoDB and Redis are independent systems, cross-database operations are not atomic. Contest Arena uses an <strong className="text-white">idempotent write pattern</strong>: MongoDB records the permanent submission first, followed by Redis Sorted Set update. If Redis crashes, the <strong className="text-white">Admin Rebuild API</strong> restores Redis in-memory state directly from MongoDB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
