export type CellValue = number | null; // null = empty, 0-7 = colorId

export interface BlockShape {
  id: string;
  name: string;
  matrix: number[][]; // 2D array of 0 and 1
  colorId: number;
}

export interface PlacedPiece {
  shape: BlockShape;
  row: number;
  col: number;
}

export interface ClearResult {
  clearedRows: number[];
  clearedCols: number[];
  clearedCellCoords: [number, number][];
  totalLines: number;
  points: number;
  combo: number;
  isAllClear: boolean;
}

export interface ScorePopup {
  id: string;
  x: number;
  y: number;
  points: number;
  text?: string;
  combo?: number;
  color?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  country: string;
  countryCode: string;
  score: number;
  maxCombo: number;
  date: string;
  isUser?: boolean;
  challengeCode?: string;
}

export interface PlayerProfile {
  name: string;
  avatar: string;
  country: string;
  countryCode: string;
  highScore: number;
  maxCombo: number;
  totalGames: number;
  totalLinesCleared: number;
}

export interface FriendChallenge {
  seed: string;
  hostName: string;
  hostAvatar: string;
  targetScore: number;
  hostCombo: number;
  createdAt: string;
}

export type GameMode = 'CLASSIC' | 'CHALLENGE';

export type GameScreen = 'TITLE' | 'PLAYING' | 'LEADERBOARD' | 'PROFILE' | 'SHARE';
