import React, { useRef, useState } from 'react';
import { PlayerProfile } from '../game/types';
import { generateChallengeCode } from '../services/leaderboard';
import { soundEngine } from '../game/audio';
import { Share2, Download, Copy, Check, X, Swords, Flame, Trophy, Sparkles } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  maxCombo: number;
  linesCleared: number;
  profile: PlayerProfile;
  seed: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  score,
  maxCombo,
  linesCleared,
  profile,
  seed,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const challengeCode = generateChallengeCode(score, seed);
  const appBaseUrl = window.location.origin + window.location.pathname;
  const challengeUrl = `${appBaseUrl}?challenge=${challengeCode}&host=${encodeURIComponent(
    profile.name
  )}&avatar=${encodeURIComponent(profile.avatar)}&combo=${maxCombo}`;

  const shareText = `💎 블록블라스트(Block Blast)에서 ${score.toLocaleString()}점을 달성했습니다!\n🔥 최고 ${maxCombo}연속 콤보 / ${linesCleared}줄 폭발!\n⚔️ 저와 동일한 블록으로 실력 대결해보세요:\n${challengeUrl}`;

  // Copy Duel Link
  const handleCopyLink = async () => {
    soundEngine.playButtonClick();
    try {
      await navigator.clipboard.writeText(challengeUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Copy Full Share Message
  const handleCopyText = async () => {
    soundEngine.playButtonClick();
    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {}
  };

  // Native Web Share API
  const handleNativeShare = async () => {
    soundEngine.playButtonClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: '블록블라스트 친구 대결 도전장!',
          text: `[블록블라스트] ${profile.name}님이 ${score.toLocaleString()}점(${maxCombo}콤보)을 달성하고 대결을 신청했습니다!`,
          url: challengeUrl,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopyText();
    }
  };

  // Generate Score Card PNG image using Canvas
  const handleDownloadImage = () => {
    soundEngine.playButtonClick();
    setIsGeneratingImage(true);

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsGeneratingImage(false);
      return;
    }

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1000);
    bgGrad.addColorStop(0, '#0c1322');
    bgGrad.addColorStop(0.5, '#131b2e');
    bgGrad.addColorStop(1, '#090d18');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 800, 1000);

    // Decorative ambient circles
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.beginPath();
    ctx.arc(200, 250, 300, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.beginPath();
    ctx.arc(600, 750, 280, 0, Math.PI * 2);
    ctx.fill();

    // Outer card border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 720, 920);

    // Brand Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BLOCK BLAST', 400, 120);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('공식 챌린지 스코어 카드', 400, 155);

    // Jewel Accent blocks illustration
    const gemColors = ['#3b82f6', '#10b981', '#f43f5e', '#f59e0b', '#a855f7'];
    gemColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillRect(270 + i * 55, 185, 45, 45);
    });
    ctx.shadowBlur = 0; // reset

    // Player badge box
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(100, 270, 600, 100);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 270, 600, 100);

    ctx.font = '48px serif';
    ctx.textAlign = 'left';
    ctx.fillText(profile.avatar, 130, 338);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(profile.name, 205, 320);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${profile.country} · 블록블라스트 도전자`, 205, 350);

    // Main Score Display
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('최종 점수 (FINAL SCORE)', 400, 440);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 84px "Plus Jakarta Sans", sans-serif';
    ctx.shadowColor = 'rgba(251, 191, 36, 0.4)';
    ctx.shadowBlur = 20;
    ctx.fillText(score.toLocaleString(), 400, 530);
    ctx.shadowBlur = 0;

    // Stat boxes row
    // Stat 1: Max Combo
    ctx.fillStyle = '#172033';
    ctx.fillRect(100, 580, 280, 120);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(100, 580, 280, 120);

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`🔥 ${maxCombo} COMBO`, 240, 645);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('최고 연속 콤보', 240, 680);

    // Stat 2: Lines Cleared
    ctx.fillStyle = '#172033';
    ctx.fillRect(420, 580, 280, 120);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(420, 580, 280, 120);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 36px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`⚡ ${linesCleared} 줄`, 560, 645);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('폭발시킨 라인 수', 560, 680);

    // Challenge Code footer
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(100, 740, 600, 120);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 740, 600, 120);

    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('⚔️ 친구 대결 챌린지 코드', 400, 780);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px monospace';
    ctx.fillText(challengeCode, 400, 830);

    // Date & URL footer
    ctx.fillStyle = '#64748b';
    ctx.font = '14px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `생성일자: ${new Date().toLocaleDateString('ko-KR')} · 블록블라스트 웹 게임`,
      400,
      920
    );

    // Trigger download
    const link = document.createElement('a');
    link.download = `block_blast_score_${score}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setIsGeneratingImage(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]">
      <div className="bg-[#101726] border border-slate-700/80 rounded-2xl w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              점수 공유 &amp; 친구 대결
            </h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual Score Card Preview */}
        <div className="p-4 sm:p-5 flex flex-col items-center">
          <div
            ref={cardRef}
            className="w-full bg-gradient-to-b from-[#18233c] to-[#0d1424] border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden flex flex-col items-center text-center"
          >
            {/* Ambient background glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-blue-500/15 blur-2xl pointer-events-none" />

            {/* Title badge */}
            <div className="text-[11px] font-bold text-slate-400 tracking-wider flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>BLOCK BLAST SCORE CARD</span>
            </div>

            {/* Player badge */}
            <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 px-3 py-1 rounded-full mb-3">
              <span className="text-lg">{profile.avatar}</span>
              <span className="text-xs font-bold text-slate-200">{profile.name}</span>
              <span className="text-xs">{profile.country}</span>
            </div>

            {/* Score */}
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight drop-shadow-[0_2px_12px_rgba(251,191,36,0.35)] tabular-nums mb-3">
              {score.toLocaleString()}
              <span className="text-sm font-semibold text-slate-400 ml-1">점</span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2 w-full mb-3">
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" /> 최대 콤보
                </span>
                <span className="text-base font-extrabold text-rose-400 tabular-nums">
                  {maxCombo} 콤보
                </span>
              </div>
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-cyan-400" /> 클리어 라인
                </span>
                <span className="text-base font-extrabold text-cyan-400 tabular-nums">
                  {linesCleared} 줄
                </span>
              </div>
            </div>

            {/* Challenge code highlight */}
            <div className="w-full bg-blue-950/40 border border-blue-500/30 rounded-xl p-2.5 flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] text-blue-300 font-semibold block flex items-center gap-1">
                  <Swords className="w-3 h-3 text-blue-400" /> 동일 블록 대결 코드
                </span>
                <span className="text-xs font-mono font-bold text-white tracking-wider">
                  {challengeCode}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                {copiedLink ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedLink ? '복사됨!' : '링크 복사'}</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="w-full mt-4 flex flex-col gap-2">
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>친구에게 바로 공유하기</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleCopyText}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? '텍스트 복사됨!' : '결과 텍스트 복사'}</span>
              </button>

              <button
                onClick={handleDownloadImage}
                disabled={isGeneratingImage}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isGeneratingImage ? '생성 중...' : '이미지 저장'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
