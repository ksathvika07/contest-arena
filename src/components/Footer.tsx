import React from 'react';
import { Trophy, Database, Zap, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-arena-midnight border-t border-arena-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arena-peach to-arena-berry flex items-center justify-center">
                <Trophy className="w-4 h-4 text-arena-midnight fill-arena-midnight" />
              </div>
              <span className="text-lg font-extrabold text-white">
                CONTEST<span className="text-arena-peach">ARENA</span>
              </span>
            </div>
            <p className="text-xs text-arena-blush font-semibold">
              Compete. Climb. Conquer.
            </p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Real-time competitive exam & contest leaderboard architecture powered by dual NoSQL engines.
            </p>
          </div>

          {/* Academic Context */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-arena-peach">
              Academic Assignment
            </h4>
            <p className="text-xs text-gray-300 font-medium">
              VIT-AP University
            </p>
            <p className="text-[11px] text-gray-400">
              School of Computer Science & Engineering (SCOPE)
            </p>
            <p className="text-[11px] text-gray-400">
              Course: <span className="text-arena-blush">CSE3009 — NoSQL Databases</span>
            </p>
            <p className="text-[11px] text-gray-400">
              Faculty: <span className="text-white font-medium">Prof. Harapriya Kar</span>
            </p>
            <p className="text-[11px] text-arena-peach font-bold">
              Project 5: Real-Time Contest / Exam Leaderboard
            </p>
          </div>

          {/* Database Stack */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-arena-peach">
              NoSQL Architecture
            </h4>
            <ul className="space-y-1.5 text-[11px] text-gray-300">
              <li className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-arena-peach shrink-0" />
                <span><strong className="text-white">Redis:</strong> Sorted Sets (ZADD, ZREVRANK)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-arena-peach shrink-0" />
                <span><strong className="text-white">Redis:</strong> Pub/Sub live score channel</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-arena-blush shrink-0" />
                <span><strong className="text-white">MongoDB:</strong> Persistent submission audit</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-arena-blush shrink-0" />
                <span><strong className="text-white">MongoDB:</strong> Multi-stage aggregation pipelines</span>
              </li>
            </ul>
          </div>

          {/* Guarantees & Consistency */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-arena-peach">
              System Guarantees
            </h4>
            <div className="p-3 rounded-xl bg-arena-aubergine/40 border border-arena-border text-[11px] space-y-1 text-gray-300">
              <div className="flex items-center space-x-1 text-arena-peach font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CAP Theorem Choice</span>
              </div>
              <p className="text-[10px] text-gray-400">
                MongoDB delivers CP consistency for immutable submission audit history, while Redis provides high-throughput AP in-memory live rank computation.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-arena-border flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>© 2026 Contest Arena. VIT-AP CSE3009 Digital Assignment Project 5.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px] text-arena-peach">
            Redis 7 / 5 + MongoDB 8.0 + Socket.IO + React + Express
          </p>
        </div>
      </div>
    </footer>
  );
};
