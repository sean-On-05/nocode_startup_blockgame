export interface GemColorDef {
  id: number;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  glow: string;
  hex: string;
  bgGradient: string;
}

export const GEM_COLORS: Record<number, GemColorDef> = {
  // 0: Sapphire Blue
  0: {
    id: 0,
    name: '사파이어',
    primary: '#2563eb',
    secondary: '#1d4ed8',
    accent: '#60a5fa',
    border: '#93c5fd',
    glow: 'rgba(59, 130, 246, 0.6)',
    hex: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 70%, #172554 100%)',
  },
  // 1: Emerald Green
  1: {
    id: 1,
    name: '에메랄드',
    primary: '#10b981',
    secondary: '#059669',
    accent: '#34d399',
    border: '#a7f3d0',
    glow: 'rgba(16, 185, 129, 0.6)',
    hex: '#10b981',
    bgGradient: 'linear-gradient(135deg, #10b981 0%, #047857 70%, #064e3b 100%)',
  },
  // 2: Ruby Crimson
  2: {
    id: 2,
    name: '루비',
    primary: '#f43f5e',
    secondary: '#e11d48',
    accent: '#fb7185',
    border: '#fecdd3',
    glow: 'rgba(244, 63, 94, 0.6)',
    hex: '#f43f5e',
    bgGradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 70%, #4c0519 100%)',
  },
  // 3: Topaz / Amber Gold
  3: {
    id: 3,
    name: '토파즈',
    primary: '#f59e0b',
    secondary: '#d97706',
    accent: '#fbbf24',
    border: '#fef3c7',
    glow: 'rgba(245, 158, 11, 0.6)',
    hex: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 70%, #78350f 100%)',
  },
  // 4: Amethyst Purple
  4: {
    id: 4,
    name: '자수정',
    primary: '#a855f7',
    secondary: '#9333ea',
    accent: '#c084fc',
    border: '#e9d5ff',
    glow: 'rgba(168, 85, 247, 0.6)',
    hex: '#a855f7',
    bgGradient: 'linear-gradient(135deg, #c084fc 0%, #7e22ce 70%, #3b0764 100%)',
  },
  // 5: Aquamarine Cyan
  5: {
    id: 5,
    name: '아쿠아마린',
    primary: '#06b6d4',
    secondary: '#0891b2',
    accent: '#22d3ee',
    border: '#cffafe',
    glow: 'rgba(6, 182, 212, 0.6)',
    hex: '#06b6d4',
    bgGradient: 'linear-gradient(135deg, #22d3ee 0%, #0e7490 70%, #164e63 100%)',
  },
  // 6: Sunset Carnelian
  6: {
    id: 6,
    name: '카넬리안',
    primary: '#f97316',
    secondary: '#ea580c',
    accent: '#fb923c',
    border: '#ffedd5',
    glow: 'rgba(249, 115, 22, 0.6)',
    hex: '#f97316',
    bgGradient: 'linear-gradient(135deg, #fb923c 0%, #c2410c 70%, #431407 100%)',
  },
  // 7: Rose Quartz
  7: {
    id: 7,
    name: '로즈쿼츠',
    primary: '#ec4899',
    secondary: '#db2777',
    accent: '#f472b6',
    border: '#fce7f3',
    glow: 'rgba(236, 72, 153, 0.6)',
    hex: '#ec4899',
    bgGradient: 'linear-gradient(135deg, #f472b6 0%, #be185d 70%, #500724 100%)',
  },
};
