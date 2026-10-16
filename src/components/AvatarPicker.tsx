import React, { useState } from 'react';
import { CURATED_AVATARS, type AvatarMeta } from '../types';
import { Check, Sparkles } from 'lucide-react';

interface AvatarPickerProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  required?: boolean;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  selectedAvatarId,
  onSelectAvatar,
  required = true,
}) => {
  const [filter, setFilter] = useState<'all' | 'chibi' | 'fantasy' | 'mascot'>('all');

  const filteredAvatars = CURATED_AVATARS.filter((avatar) =>
    filter === 'all' ? true : avatar.category === filter
  );

  const selectedMeta = CURATED_AVATARS.find((a) => a.id === selectedAvatarId) || CURATED_AVATARS[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-semibold text-arena-blush">
            Choose Your Avatar Character {required && <span className="text-arena-peach">*</span>}
          </label>
          <p className="text-xs text-gray-400">
            Mandatory selection. This character will represent you across live leaderboards and contests.
          </p>
        </div>
        {/* Selected badge */}
        <div className="flex items-center space-x-2 bg-arena-aubergine/80 px-3 py-1.5 rounded-full border border-arena-rose/30">
          <span className="text-xl">{selectedMeta.emoji}</span>
          <span className="text-xs font-bold text-arena-peach">{selectedMeta.name}</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex space-x-2 border-b border-arena-border pb-2">
        {(['all', 'chibi', 'fantasy', 'mascot'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
              filter === tab
                ? 'bg-arena-peach text-arena-midnight font-bold shadow-glow-peach'
                : 'text-arena-blush hover:text-white hover:bg-white/5'
            }`}
          >
            {tab === 'all' && 'All Characters'}
            {tab === 'chibi' && '🥷 Chibi Coders'}
            {tab === 'fantasy' && '👑 Fantasy Champions'}
            {tab === 'mascot' && '🦊 Animal Mascots'}
          </button>
        ))}
      </div>

      {/* Grid of Avatars */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-1">
        {filteredAvatars.map((avatar) => {
          const isSelected = selectedAvatarId === avatar.id;
          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelectAvatar(avatar.id)}
              className={`group relative flex flex-col items-center p-2 rounded-xl transition-all duration-200 text-center ${
                isSelected
                  ? 'bg-arena-aubergine border-2 border-arena-peach shadow-glow-peach scale-105'
                  : 'bg-arena-surface/60 border border-arena-border hover:border-arena-rose/50 hover:bg-arena-aubergine/40 hover:scale-102'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner bg-gradient-to-br ${avatar.gradient} mb-1.5`}
              >
                <span>{avatar.emoji}</span>
              </div>
              <span className="text-[11px] font-semibold text-gray-200 truncate w-full group-hover:text-arena-peach">
                {avatar.name}
              </span>
              <span className="text-[9px] text-gray-400 capitalize">{avatar.category}</span>

              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 bg-arena-peach text-arena-midnight p-0.5 rounded-full shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const AvatarBadge: React.FC<{
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
}> = ({ avatarId, size = 'md', showName = false }) => {
  const meta = CURATED_AVATARS.find((a) => a.id === avatarId) || CURATED_AVATARS[0];

  const sizeClasses = {
    sm: 'w-7 h-7 text-sm rounded-lg',
    md: 'w-10 h-10 text-xl rounded-xl',
    lg: 'w-14 h-14 text-3xl rounded-2xl',
    xl: 'w-20 h-20 text-4xl rounded-3xl',
  };

  return (
    <div className="inline-flex items-center space-x-2">
      <div
        className={`${sizeClasses[size]} flex items-center justify-center bg-gradient-to-br ${meta.gradient} shadow-md border border-white/10 shrink-0`}
        title={`${meta.name} (${meta.description})`}
      >
        <span>{meta.emoji}</span>
      </div>
      {showName && (
        <div>
          <p className="text-xs font-bold text-arena-peach">{meta.name}</p>
          <p className="text-[10px] text-gray-400 capitalize">{meta.category}</p>
        </div>
      )}
    </div>
  );
};
