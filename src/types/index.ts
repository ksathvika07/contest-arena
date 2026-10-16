export type UserRole = 'admin' | 'student';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  studentId: string;
  department: string;
  avatarId: string;
  bookmarks?: string[];
  createdAt?: string;
}

export type ContestType = 'exam' | 'coding contest';
export type ContestStatus = 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled';
export type TieBreakingRule = 'earlier_submission' | 'fewer_attempts' | 'higher_accuracy';

export interface Contest {
  _id: string;
  title: string;
  description: string;
  contestType: ContestType;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: ContestStatus;
  maxParticipants: number;
  maxScore: number;
  scorePrecision: number;
  scoringRules: string;
  tieBreakingRules: TieBreakingRule;
  participantCount?: number;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  name: string;
  department: string;
  avatarId: string;
  score: number;
  submissionCount: number;
  lastUpdatedAt: string;
  rankMovement?: 'up' | 'down' | 'same' | 'new';
}

export interface Submission {
  _id: string;
  contestId: string | Contest;
  studentId: string;
  userId: string | User;
  score: number;
  maximumScore: number;
  attemptNumber: number;
  completionTimeMs: number;
  submittedAt: string;
  status: 'valid' | 'disqualified' | 'pending';
  submittedBy: 'student' | 'admin' | 'simulator';
  notes?: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'contest_registered' | 'contest_starting' | 'score_updated' | 'contest_completed' | 'system';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AvatarMeta {
  id: string;
  name: string;
  category: 'chibi' | 'fantasy' | 'mascot';
  description: string;
  gradient: string;
  emoji: string;
}

export const CURATED_AVATARS: AvatarMeta[] = [
  {
    id: 'avatar_cyber_ninja',
    name: 'Cyber Ninja',
    category: 'chibi',
    description: 'Swift algorithm master navigating cyberspace',
    gradient: 'from-[#862249] to-[#ED9E59]',
    emoji: '🥷',
  },
  {
    id: 'avatar_code_alchemist',
    name: 'Code Alchemist',
    category: 'chibi',
    description: 'Transmuting complex logic into gold',
    gradient: 'from-[#44174E] to-[#A34054]',
    emoji: '🧙',
  },
  {
    id: 'avatar_quantum_hacker',
    name: 'Quantum Hacker',
    category: 'chibi',
    description: 'Cracking impossible constraints in superposition',
    gradient: 'from-[#1B1931] to-[#862249]',
    emoji: '⚡',
  },
  {
    id: 'avatar_stellar_architect',
    name: 'Stellar Architect',
    category: 'chibi',
    description: 'Constructing elegant distributed systems',
    gradient: 'from-[#A34054] to-[#E8BCB9]',
    emoji: '🧑‍🚀',
  },
  {
    id: 'avatar_crown_master',
    name: 'Crown Monarch',
    category: 'fantasy',
    description: 'Undisputed champion of competitive contests',
    gradient: 'from-[#ED9E59] to-[#862249]',
    emoji: '👑',
  },
  {
    id: 'avatar_phoenix_guardian',
    name: 'Phoenix Guardian',
    category: 'fantasy',
    description: 'Rising through the ranks with fierce resilience',
    gradient: 'from-[#862249] to-[#ED9E59]',
    emoji: '🔥',
  },
  {
    id: 'avatar_frost_valkyrie',
    name: 'Frost Valkyrie',
    category: 'fantasy',
    description: 'Calm and precise under high-pressure timers',
    gradient: 'from-[#44174E] to-[#E8BCB9]',
    emoji: '❄️',
  },
  {
    id: 'avatar_celestial_oracle',
    name: 'Celestial Oracle',
    category: 'fantasy',
    description: 'Anticipating test cases before execution',
    gradient: 'from-[#1B1931] to-[#A34054]',
    emoji: '🔮',
  },
  {
    id: 'avatar_neon_fox',
    name: 'Neon Fox',
    category: 'mascot',
    description: 'Clever, agile, and always finding the optimal O(1) path',
    gradient: 'from-[#ED9E59] to-[#A34054]',
    emoji: '🦊',
  },
  {
    id: 'avatar_titan_panda',
    name: 'Titan Panda',
    category: 'mascot',
    description: 'Unshakeable focus and immense computing power',
    gradient: 'from-[#44174E] to-[#1B1931]',
    emoji: '🐼',
  },
  {
    id: 'avatar_astro_owl',
    name: 'Astro Owl',
    category: 'mascot',
    description: 'Night owl debugging the trickiest corner cases',
    gradient: 'from-[#862249] to-[#44174E]',
    emoji: '🦉',
  },
  {
    id: 'avatar_blaze_dragon',
    name: 'Blaze Dragon',
    category: 'mascot',
    description: 'Fierce competitor unleashing lightning benchmarks',
    gradient: 'from-[#A34054] to-[#ED9E59]',
    emoji: '🐉',
  },
];
