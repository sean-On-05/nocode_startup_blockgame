import { LeaderboardEntry, PlayerProfile, FriendChallenge } from '../game/types';

const STORAGE_KEYS = {
  PROFILE: 'block_blast_player_profile',
  GLOBAL_SCORES: 'block_blast_global_scores',
  FRIEND_SCORES: 'block_blast_friend_scores',
  CHALLENGES: 'block_blast_challenges',
};

// Initial realistic world-class players
const SEED_GLOBAL_PLAYERS: Omit<LeaderboardEntry, 'rank'>[] = [
  { id: 'p1', name: 'JewelKing_KR', avatar: '👑', country: '🇰🇷', countryCode: 'KR', score: 18450, maxCombo: 14, date: '2026-10-18' },
  { id: 'p2', name: 'Alex_Vortex', avatar: '⚡', country: '🇺🇸', countryCode: 'US', score: 17290, maxCombo: 13, date: '2026-10-17' },
  { id: 'p3', name: 'Sakura_Blast', avatar: '🌸', country: '🇯🇵', countryCode: 'JP', score: 16840, maxCombo: 12, date: '2026-10-18' },
  { id: 'p4', name: 'Hans_Puzzle', avatar: '🎯', country: '🇩🇪', countryCode: 'DE', score: 15320, maxCombo: 11, date: '2026-10-16' },
  { id: 'p5', name: 'BlockMaster_99', avatar: '💎', country: '🇰🇷', countryCode: 'KR', score: 14750, maxCombo: 11, date: '2026-10-19' },
  { id: 'p6', name: 'Lucas_BR', avatar: '⚽', country: '🇧🇷', countryCode: 'BR', score: 13900, maxCombo: 10, date: '2026-10-15' },
  { id: 'p7', name: 'Oliver_UK', avatar: '🦁', country: '🇬🇧', countryCode: 'GB', score: 12850, maxCombo: 9, date: '2026-10-17' },
  { id: 'p8', name: 'Chloe_Paris', avatar: '🥐', country: '🇫🇷', countryCode: 'FR', score: 11980, maxCombo: 9, date: '2026-10-18' },
  { id: 'p9', name: 'Liam_Maple', avatar: '🍁', country: '🇨🇦', countryCode: 'CA', score: 10650, maxCombo: 8, date: '2026-10-16' },
  { id: 'p10', name: 'Neo_Matrix', avatar: '🚀', country: '🇸🇬', countryCode: 'SG', score: 9840, maxCombo: 8, date: '2026-10-19' },
  { id: 'p11', name: 'Yuki_Combo', avatar: '🦊', country: '🇯🇵', countryCode: 'JP', score: 8900, maxCombo: 7, date: '2026-10-19' },
  { id: 'p12', name: 'Minji_Star', avatar: '⭐', country: '🇰🇷', countryCode: 'KR', score: 8120, maxCombo: 7, date: '2026-10-18' },
  { id: 'p13', name: 'Aussie_Boomer', avatar: '🦘', country: '🇦🇺', countryCode: 'AU', score: 7460, maxCombo: 6, date: '2026-10-17' },
  { id: 'p14', name: 'Chen_TW', avatar: '🐉', country: '🇹🇼', countryCode: 'TW', score: 6890, maxCombo: 6, date: '2026-10-18' },
  { id: 'p15', name: 'Emma_NY', avatar: '🗽', country: '🇺🇸', countryCode: 'US', score: 6240, maxCombo: 5, date: '2026-10-19' },
  { id: 'p16', name: 'Dragon_Slayer', avatar: '🔥', country: '🇰🇷', countryCode: 'KR', score: 5780, maxCombo: 5, date: '2026-10-16' },
  { id: 'p17', name: 'Matteo_Rome', avatar: '🍕', country: '🇮🇹', countryCode: 'IT', score: 5120, maxCombo: 5, date: '2026-10-17' },
  { id: 'p18', name: 'Sven_Nordic', avatar: '❄️', country: '🇸🇪', countryCode: 'SE', score: 4650, maxCombo: 4, date: '2026-10-18' },
  { id: 'p19', name: 'PuzzleAddict', avatar: '🧩', country: '🇰🇷', countryCode: 'KR', score: 4180, maxCombo: 4, date: '2026-10-19' },
  { id: 'p20', name: 'LuckyStrike', avatar: '🍀', country: '🇮🇪', countryCode: 'IE', score: 3820, maxCombo: 4, date: '2026-10-18' },
];

export function getPlayerProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  const defaultProfile: PlayerProfile = {
    name: '블록마스터_' + Math.floor(100 + Math.random() * 900),
    avatar: '💎',
    country: '🇰🇷',
    countryCode: 'KR',
    highScore: 0,
    maxCombo: 0,
    totalGames: 0,
    totalLinesCleared: 0,
  };
  savePlayerProfile(defaultProfile);
  return defaultProfile;
}

export function savePlayerProfile(profile: PlayerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {}
}

export function updateGameStats(score: number, combo: number, linesCleared: number): {
  isNewHigh: boolean;
  profile: PlayerProfile;
} {
  const profile = getPlayerProfile();
  let isNewHigh = false;

  if (score > profile.highScore) {
    profile.highScore = score;
    isNewHigh = true;
  }
  if (combo > profile.maxCombo) {
    profile.maxCombo = combo;
  }
  profile.totalGames += 1;
  profile.totalLinesCleared += linesCleared;

  savePlayerProfile(profile);

  // Sync to leaderboard
  if (profile.highScore > 0) {
    recordScoreToLeaderboard(profile.highScore, profile.maxCombo);
  }

  return { isNewHigh, profile };
}

export function getGlobalLeaderboard(): { list: LeaderboardEntry[]; userRank: number | null } {
  let stored: LeaderboardEntry[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GLOBAL_SCORES);
    if (raw) {
      stored = JSON.parse(raw);
    }
  } catch {}

  const baseList: Omit<LeaderboardEntry, 'rank'>[] = stored.length > 0 ? stored : [...SEED_GLOBAL_PLAYERS];
  const profile = getPlayerProfile();

  // Remove previous user entries from base list before reinserting
  const filtered = baseList.filter((item) => !item.isUser && item.name !== profile.name);

  // If user has played, insert user
  if (profile.highScore > 0) {
    filtered.push({
      id: 'user_current',
      name: profile.name,
      avatar: profile.avatar,
      country: profile.country,
      countryCode: profile.countryCode,
      score: profile.highScore,
      maxCombo: profile.maxCombo,
      date: new Date().toISOString().slice(0, 10),
      isUser: true,
    });
  }

  // Sort descending by score, then combo
  filtered.sort((a, b) => b.score - a.score || b.maxCombo - a.maxCombo);

  const rankedList: LeaderboardEntry[] = filtered.map((entry, idx) => ({
    ...entry,
    rank: idx + 1,
  }));

  const userEntry = rankedList.find((e) => e.isUser);
  const userRank = userEntry ? userEntry.rank : null;

  return { list: rankedList, userRank };
}

export function recordScoreToLeaderboard(score: number, maxCombo: number): void {
  const profile = getPlayerProfile();
  const current = getGlobalLeaderboard().list;
  
  // Persist updated list
  try {
    localStorage.setItem(STORAGE_KEYS.GLOBAL_SCORES, JSON.stringify(current));
  } catch {}
}

export function getFriendLeaderboard(): LeaderboardEntry[] {
  let stored: LeaderboardEntry[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FRIEND_SCORES);
    if (raw) {
      stored = JSON.parse(raw);
    }
  } catch {}

  const profile = getPlayerProfile();
  const list = [...stored];
  const existingUserIdx = list.findIndex((e) => e.isUser || e.name === profile.name);

  if (profile.highScore > 0) {
    const userEntry: LeaderboardEntry = {
      id: 'friend_user',
      rank: 1,
      name: profile.name + ' (나)',
      avatar: profile.avatar,
      country: profile.country,
      countryCode: profile.countryCode,
      score: profile.highScore,
      maxCombo: profile.maxCombo,
      date: '오늘',
      isUser: true,
    };
    if (existingUserIdx >= 0) {
      list[existingUserIdx] = userEntry;
    } else {
      list.push(userEntry);
    }
  }

  list.sort((a, b) => b.score - a.score);
  return list.map((e, i) => ({ ...e, rank: i + 1 }));
}

export function addFriendScore(entry: Omit<LeaderboardEntry, 'rank'>): void {
  try {
    const list = getFriendLeaderboard();
    const updated = [...list.filter((e) => e.name !== entry.name), entry];
    localStorage.setItem(STORAGE_KEYS.FRIEND_SCORES, JSON.stringify(updated));
  } catch {}
}

// Challenge generator & decoder
export function generateChallengeCode(targetScore: number, seed: string): string {
  // Format: [SEED]-[SCORE] e.g. BLA88-2450
  const cleanSeed = seed.toUpperCase().slice(0, 5);
  return `${cleanSeed}-${targetScore}`;
}

export function parseChallengeFromUrl(): FriendChallenge | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const challengeParam = params.get('challenge');
    const hostParam = params.get('host') || '친구';
    const avatarParam = params.get('avatar') || '🎮';
    const comboParam = parseInt(params.get('combo') || '5', 10);

    if (challengeParam) {
      const parts = challengeParam.split('-');
      if (parts.length >= 2) {
        const seed = parts[0];
        const targetScore = parseInt(parts[1], 10) || 1000;
        return {
          seed,
          hostName: decodeURIComponent(hostParam),
          hostAvatar: decodeURIComponent(avatarParam),
          targetScore,
          hostCombo: comboParam,
          createdAt: new Date().toLocaleDateString('ko-KR'),
        };
      }
    }
  } catch {}
  return null;
}
