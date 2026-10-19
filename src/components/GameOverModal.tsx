import React from 'react';
import { PlayerProfile, FriendChallenge } from '../game/types';
import { RotateCcw, Share2, Trophy, Flame, Zap, Award } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  maxCombo: number;
  linesCleared: number;
  isNewHigh: boolean;
  profile: PlayerProfile;
  activeChallenge: FriendChallenge | null;
  onRestart: () => void;
  onOpenShare: () => void;
  onOpenLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  maxCombo,
  linesCleared,
  isNewHigh,
  profile,
  activeChallenge,
  onRestart,
  onOpenShare,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  const challengeWon = activeChallenge && score > activeChallenge.targetScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="bg-[#101726] border border-slate-700/80 rounded-2xl w-full max-w-sm shadow-[0_25px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col text-center p-5 relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500" />

        {/* Title */}
        <div className="mt-2 mb-1">
          {isNewHigh ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-300 text-xs font-bold mb-2 animate-bounce">
              <Award className="w-4 h-4 text-amber-400" />
              <span>최고 기록 경신 달성!</span>
            </div>
          ) : challengeWon ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/40 text-emerald-300 text-xs font-bold mb-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span>친구 대결 승리! 목표 돌파!</span>
            </div>
          ) : (
            <div className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">
              GAME OVER
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            게임 종료
          </h2>
        </div>

        {/* Score display */}
        <div className="my-4 py-3 bg-slate-900/80 rounded-2xl border border-slate-800 flex flex-col items-center">
          <span className="text-xs text-slate-400 mb-0.5">최종 점수</span>
          <div className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight tabular-nums drop-shadow-[0_2px_10px_rgba(251,191,36,0.4)]">
            {score.toLocaleString()}
          </div>
          {activeChallenge && (
            <div className="text-xs mt-1 text-slate-300">
              도전 목표: <strong className="text-slate-100">{activeChallenge.targetScore.toLocaleString()}</strong>점 ({activeChallenge.hostName})
            </div>
          )}
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400 shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">최대 연속 콤보</span>
              <span className="text-sm font-bold text-white tabular-nums">{maxCombo} 콤보</span>
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-2.5 flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 flex items-center justify-center text-cyan-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">폭발시킨 라인</span>
              <span className="text-sm font-bold text-white tabular-nums">{linesCleared} 줄</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onRestart();
            }}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm rounded-xl transition-all shadow-[0_4px_16px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 도전하기</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenShare();
            }}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>친구에게 점수 공유 &amp; 대결</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenLeaderboard();
            }}
            className="w-full py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-semibold rounded-xl border border-slate-700/80 transition-colors flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>글로벌 리더보드 확인</span>
          </button>
        </div>
      </div>
    </div>
  );
};
