import React, { useState } from 'react';
import { PlayerProfile, FriendChallenge } from '../game/types';
import { Trophy, Play, Users, Volume2, VolumeX, Sparkles, Flame, Swords } from 'lucide-react';
import { soundEngine } from '../game/audio';

interface TitleScreenProps {
  onStartGame: (mode: 'CLASSIC' | 'CHALLENGE', customSeed?: string) => void;
  onOpenLeaderboard: () => void;
  playerProfile: PlayerProfile;
  activeChallenge: FriendChallenge | null;
  onClearChallenge: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenLeaderboard,
  playerProfile,
  activeChallenge,
  onClearChallenge,
}) => {
  const [isMuted, setIsMuted] = useState(soundEngine.isMuted());
  const [showChallengeInput, setShowChallengeInput] = useState(false);
  const [customSeedInput, setCustomSeedInput] = useState('');

  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundEngine.playButtonClick();
    }
  };

  const handleStartClassic = () => {
    soundEngine.playButtonClick();
    onStartGame('CLASSIC');
  };

  const handleStartDuel = () => {
    soundEngine.playButtonClick();
    if (activeChallenge) {
      onStartGame('CHALLENGE', activeChallenge.seed);
    } else if (customSeedInput.trim()) {
      onStartGame('CHALLENGE', customSeedInput.trim().toUpperCase());
    } else {
      // Auto-generate challenge seed
      const autoSeed = 'BLAST' + Math.floor(100 + Math.random() * 900);
      onStartGame('CHALLENGE', autoSeed);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 sm:p-6 select-none overflow-hidden">
      {/* Ambient background jewel crystals */}
      <div className="absolute top-1/4 -left-16 w-64 h-64 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-16 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      {/* Top Bar: Profile status & Audio Toggle */}
      <div className="w-full max-w-md flex items-center justify-between z-10">
        <div
          onClick={() => {
            soundEngine.playButtonClick();
            onOpenLeaderboard();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
        >
          <span className="text-base">{playerProfile.avatar}</span>
          <span className="text-xs font-bold text-slate-200">{playerProfile.name}</span>
          <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded font-mono font-bold">
            {playerProfile.highScore > 0 ? `${playerProfile.highScore.toLocaleString()}점` : '0점'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenLeaderboard();
            }}
            className="p-2 rounded-full bg-slate-900/80 border border-slate-800 hover:border-amber-400/50 text-amber-400 transition-colors"
            title="리더보드"
          >
            <Trophy className="w-4 h-4" />
          </button>
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors"
            title={isMuted ? '음소거 해제' : '음소거'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Centerpiece: Bespoke Title Lockup & 3D Gem Cluster */}
      <div className="flex flex-col items-center justify-center text-center my-auto z-10 max-w-sm">
        {/* Animated 3D Jewel Cluster SVG Art */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-900/40 rounded-2xl border border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-700 border border-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.6)]" />
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-700 border border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.6)]" />
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-rose-500 to-rose-700 border border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 border border-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-purple-800 border border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-700 border border-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
          </div>
          <Sparkles className="w-6 h-6 text-amber-400 absolute -top-2 -right-2 animate-bounce" />
        </div>

        {/* Title Lockup */}
        <div className="flex flex-col items-center mb-1">
          <span className="text-[11px] font-extrabold tracking-[0.25em] text-cyan-400 uppercase mb-1">
            THE JEWEL PUZZLE
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300 drop-shadow-md">
            블록블라스트
          </h1>
          <span className="text-sm font-semibold text-slate-400 tracking-wide mt-1">
            BLOCK BLAST
          </span>
        </div>

        {/* Incoming Challenge Banner */}
        {activeChallenge && (
          <div className="w-full mt-4 p-3 bg-blue-950/60 border border-blue-500/50 rounded-xl text-left flex items-center justify-between gap-3 shadow-lg animate-pulse">
            <div>
              <div className="text-[11px] font-bold text-blue-300 flex items-center gap-1">
                <Swords className="w-3.5 h-3.5 text-amber-400" /> 친구의 대결 도전장 도착!
              </div>
              <div className="text-xs text-white font-semibold">
                {activeChallenge.hostAvatar} {activeChallenge.hostName}님의 목표:{' '}
                <strong className="text-amber-400">{activeChallenge.targetScore.toLocaleString()}점</strong>
              </div>
            </div>
            <button
              onClick={onClearChallenge}
              className="text-[11px] text-slate-400 hover:text-rose-400 underline"
            >
              취소
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA Area */}
      <div className="w-full max-w-sm flex flex-col gap-2.5 z-10 mb-2">
        {/* Primary Start CTA */}
        <button
          onClick={handleStartClassic}
          className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-[0_6px_24px_rgba(245,158,11,0.4)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.55)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>게임 시작</span>
        </button>

        {/* Friend Challenge Mode Button */}
        <button
          onClick={() => setShowChallengeInput(!showChallengeInput)}
          className="w-full py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Users className="w-4 h-4 text-cyan-400" />
          <span>친구 대결 모드 (동일 블록 시드)</span>
        </button>

        {/* Expandable Challenge Input */}
        {showChallengeInput && (
          <div className="p-3 bg-slate-900/90 border border-slate-700 rounded-xl flex flex-col gap-2">
            <span className="text-[11px] text-slate-400">
              친구에게 받은 대결 코드 입력 또는 새 대결 생성:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="예: BLAST7 (비워두면 자동 생성)"
                value={customSeedInput}
                onChange={(e) => setCustomSeedInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-amber-400 font-mono"
              />
              <button
                onClick={handleStartDuel}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <Swords className="w-3.5 h-3.5" /> 대결 시작
              </button>
            </div>
          </div>
        )}

        {/* Global Leaderboard CTA */}
        <button
          onClick={() => {
            soundEngine.playButtonClick();
            onOpenLeaderboard();
          }}
          className="w-full py-2 bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 text-slate-300 hover:text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>전 세계 실시간 랭킹 보기</span>
        </button>

        {/* Control hint line */}
        <div className="text-center text-[11px] text-slate-400 tracking-tight pt-1">
          드래그하여 배치 · 탭하여 선택 · 연속 콤보 폭발
        </div>
      </div>
    </div>
  );
};
