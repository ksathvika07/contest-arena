import React from 'react';
import { AvatarBadge } from './AvatarPicker';
import type { LeaderboardEntry } from '../types';
import { Crown, Medal, Flame, TrendingUp } from 'lucide-react';

interface PodiumCardProps {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
}

export const PodiumCard: React.FC<PodiumCardProps> = ({ entry, rank }) => {
  const configs = {
    1: {
      title: 'Champion',
      border: 'border-amber-400/80 shadow-glow-peach',
      bg: 'bg-gradient-to-b from-arena-aubergine via-arena-card to-arena-midnight',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-arena-peach text-arena-midnight',
      icon: Crown,
      height: 'h-80 sm:h-88',
      scale: 'scale-105 z-10',
      label: '1st Place',
    },
    2: {
      title: 'Runner Up',
      border: 'border-slate-300/60 shadow-lg',
      bg: 'bg-gradient-to-b from-arena-surface via-arena-card to-arena-midnight',
      badgeBg: 'bg-gradient-to-r from-slate-200 to-slate-400 text-arena-midnight',
      icon: Medal,
      height: 'h-72 sm:h-80',
      scale: 'z-0',
      label: '2nd Place',
    },
    3: {
      title: 'Bronze Finalist',
      border: 'border-amber-700/60 shadow-lg',
      bg: 'bg-gradient-to-b from-arena-berry/30 via-arena-card to-arena-midnight',
      badgeBg: 'bg-gradient-to-r from-amber-600 to-amber-800 text-white',
      icon: Medal,
      height: 'h-68 sm:h-76',
      scale: 'z-0',
      label: '3rd Place',
    },
  };

  const c = configs[rank];
  const Icon = c.icon;

  return (
    <div
      className={`relative flex flex-col items-center justify-between p-5 rounded-3xl border-2 transition-all duration-300 hover:scale-108 ${c.border} ${c.bg} ${c.height} ${c.scale}`}
    >
      {/* Top Rank Badge */}
      <div className="flex flex-col items-center">
        <div
          className={`flex items-center space-x-1 px-3 py-1 rounded-full font-black text-xs shadow-md ${c.badgeBg}`}
        >
          <Icon className="w-3.5 h-3.5 fill-current" />
          <span>{c.label}</span>
        </div>

        {/* Large Avatar */}
        <div className="mt-4 relative">
          <AvatarBadge avatarId={entry.avatarId} size="lg" />
          {rank === 1 && (
            <div className="absolute -top-3 -right-2 bg-amber-400 text-arena-midnight p-1 rounded-full shadow-lg animate-bounce">
              <Crown className="w-4 h-4 fill-current" />
            </div>
          )}
        </div>

        {/* Student Name & Department */}
        <div className="mt-3 text-center">
          <h3 className="font-extrabold text-white text-sm sm:text-base tracking-tight truncate max-w-[160px]">
            {entry.name}
          </h3>
          <p className="text-[11px] font-mono font-medium text-arena-blush">{entry.studentId}</p>
          <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{entry.department}</p>
        </div>
      </div>

      {/* Score and Activity */}
      <div className="w-full mt-2 pt-3 border-t border-white/10 flex flex-col items-center">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl sm:text-3xl font-black text-gradient-peach font-mono">
            {entry.score}
          </span>
          <span className="text-[11px] text-gray-400 font-semibold uppercase">pts</span>
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-1">
          <span className="flex items-center text-emerald-400 font-medium">
            <TrendingUp className="w-3 h-3 mr-0.5" />
            Active
          </span>
          <span>•</span>
          <span>{entry.submissionCount} attempts</span>
        </div>
      </div>
    </div>
  );
};
