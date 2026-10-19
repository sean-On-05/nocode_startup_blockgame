/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CellValue,
  BlockShape,
  PlayerProfile,
  FriendChallenge,
  ScorePopup,
  GameMode,
} from './game/types';
import {
  createEmptyBoard,
  placePiece,
  checkLineClears,
  isGameOver as checkIsGameOver,
  getBlastPreview,
  BOARD_SIZE,
} from './game/engine';
import { createRNG, generateRoundPieces, countBlocks } from './game/pieces';
import { GEM_COLORS } from './game/colors';
import { soundEngine } from './game/audio';
import {
  getPlayerProfile,
  updateGameStats,
  parseChallengeFromUrl,
} from './services/leaderboard';

import { GameBoard, GameBoardHandle } from './components/GameBoard';
import { PieceTray } from './components/PieceTray';
import { ParticleCanvas, ParticleCanvasHandle } from './components/ParticleCanvas';
import { ScorePopups } from './components/ScorePopups';
import { TitleScreen } from './components/TitleScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ShareModal } from './components/ShareModal';
import { GameOverModal } from './components/GameOverModal';

import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Share2,
  Flame,
  Home,
  Swords,
  CheckCircle2,
} from 'lucide-react';

interface DragState {
  piece: BlockShape;
  pieceIndex: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isTouch: boolean;
}

export default function App() {
  // Screen state
  const [screen, setScreen] = useState<'TITLE' | 'PLAYING'>('TITLE');

  // Player & Challenge state
  const [profile, setProfile] = useState<PlayerProfile>(getPlayerProfile());
  const [activeChallenge, setActiveChallenge] = useState<FriendChallenge | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('CLASSIC');
  const [gameSeed, setGameSeed] = useState<string>('');
  const rngRef = useRef<() => number>(Math.random);

  // Gameplay state
  const [board, setBoard] = useState<CellValue[][]>(createEmptyBoard());
  const [trayPieces, setTrayPieces] = useState<(BlockShape | null)[]>([null, null, null]);
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(profile.highScore);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [linesCleared, setLinesCleared] = useState<number>(0);
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [clearingCells, setClearingCells] = useState<Set<string>>(new Set());
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);
  const [challengeTargetSurpassed, setChallengeTargetSurpassed] = useState<boolean>(false);

  // Modals state
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.isMuted());

  // Interaction: Drag & Drop / Tap-to-select
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [previewPlacement, setPreviewPlacement] = useState<{
    row: number;
    col: number;
    piece: BlockShape;
    valid: boolean;
    wouldClearRows: number[];
    wouldClearCols: number[];
  } | null>(null);

  // Screen shake style offset
  const [shakeOffset, setShakeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Refs for board measurements and particle canvas
  const boardRef = useRef<GameBoardHandle | null>(null);
  const particleCanvasRef = useRef<ParticleCanvasHandle | null>(null);

  // Parse challenge from URL on mount
  useEffect(() => {
    const challenge = parseChallengeFromUrl();
    if (challenge) {
      setActiveChallenge(challenge);
    }
  }, []);

  // Sync profile on mount
  useEffect(() => {
    const p = getPlayerProfile();
    setProfile(p);
    setHighScore(p.highScore);
  }, []);

  // Initialize and start game
  const startGame = useCallback(
    (mode: GameMode = 'CLASSIC', customSeed?: string) => {
      const seed = customSeed || (mode === 'CHALLENGE' ? 'BLAST' + Math.floor(100 + Math.random() * 900) : '');
      const rng = createRNG(seed || undefined);
      rngRef.current = rng;

      const newBoard = createEmptyBoard();
      const firstPieces = generateRoundPieces(rng, 0);

      setGameMode(mode);
      setGameSeed(seed);
      setBoard(newBoard);
      setTrayPieces(firstPieces);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setLinesCleared(0);
      setRoundIndex(0);
      setClearingCells(new Set());
      setScorePopups([]);
      setIsGameOverModalOpen(false);
      setIsNewHigh(false);
      setChallengeTargetSurpassed(false);
      setSelectedPieceIndex(null);
      setPreviewPlacement(null);
      setDragState(null);
      setScreen('PLAYING');
    },
    []
  );

  // Trigger floating score popup
  const addScorePopup = (
    points: number,
    text?: string,
    comboCount?: number,
    coords?: { x: number; y: number }
  ) => {
    let px = coords?.x;
    let py = coords?.y;

    if (!px || !py) {
      const boardRect = boardRef.current?.getBoardRect();
      if (boardRect) {
        px = boardRect.left + boardRect.width / 2;
        py = boardRect.top + boardRect.height / 2;
      } else {
        px = window.innerWidth / 2;
        py = window.innerHeight / 2;
      }
    }

    const newPopup: ScorePopup = {
      id: `popup_${Date.now()}_${Math.random()}`,
      x: px,
      y: py,
      points,
      text,
      combo: comboCount,
    };

    setScorePopups((prev) => [...prev, newPopup]);
    setTimeout(() => {
      setScorePopups((prev) => prev.filter((p) => p.id !== newPopup.id));
    }, 1000);
  };

  // Place piece execution
  const executePlacePiece = useCallback(
    (pieceIndex: number, piece: BlockShape, targetRow: number, targetCol: number) => {
      // Place piece on board
      const nextBoard = placePiece(board, piece.matrix, targetRow, targetCol, piece.colorId);
      soundEngine.playDrop();

      // Add points for placing piece blocks
      const piecePoints = countBlocks(piece.matrix);
      let newScore = score + piecePoints;

      // Update tray: remove used piece
      const nextTray = [...trayPieces];
      nextTray[pieceIndex] = null;

      // Check line clears
      const clearResult = checkLineClears(nextBoard, combo);

      let finalBoard = nextBoard;
      let nextCombo = combo;
      let nextLinesCleared = linesCleared;

      if (clearResult.totalLines > 0) {
        // Line clear happened!
        nextCombo = clearResult.combo;
        nextLinesCleared += clearResult.totalLines;
        newScore += clearResult.points;

        // Sound & Screen Shake
        soundEngine.playLineClear(clearResult.totalLines, nextCombo);
        if (nextCombo >= 3) {
          soundEngine.playComboFanfare(nextCombo);
        }

        // Screen shake intensity scaled by lines and combo
        const shakeIntensity = Math.min(10, 3 + clearResult.totalLines * 1.5 + nextCombo);
        particleCanvasRef.current?.triggerScreenShake(shakeIntensity);

        // Flash clearing cells
        const clearingKeys = new Set(
          clearResult.clearedCellCoords.map(([r, c]) => `${r},${c}`)
        );
        setClearingCells(clearingKeys);

        // Particle burst
        const cellBursts = clearResult.clearedCellCoords.map(([r, c]) => {
          const center = boardRef.current?.getCellCenter(r, c) || {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
          };
          return {
            x: center.x,
            y: center.y,
            colorId: piece.colorId,
          };
        });
        particleCanvasRef.current?.burstLines(cellBursts, nextCombo);

        // Floating score indicator
        let cheerText = '';
        if (clearResult.isAllClear) cheerText = '🌟 PERFECT ALL CLEAR!';
        else if (nextCombo >= 5) cheerText = `🔥 COMBO x${nextCombo}! UNSTOPPABLE!`;
        else if (nextCombo >= 3) cheerText = `⚡ COMBO x${nextCombo}!`;
        else if (clearResult.totalLines >= 4) cheerText = '💎 QUADRUPLE BLAST!';
        else if (clearResult.totalLines >= 3) cheerText = '✨ TRIPLE BLAST!';
        else if (clearResult.totalLines >= 2) cheerText = '🎉 DOUBLE BLAST!';

        addScorePopup(clearResult.points, cheerText, nextCombo);

        // Delayed board update for visual blast ping
        setTimeout(() => {
          setClearingCells(new Set());
        }, 180);

        // Actual board cleared state
        finalBoard = nextBoard.map((rowArr, r) =>
          rowArr.map((cVal, c) => (clearingKeys.has(`${r},${c}`) ? null : cVal))
        );
      } else {
        // No line clear; reset combo streak
        nextCombo = 0;
      }

      // Check friend challenge surpass
      if (
        activeChallenge &&
        !challengeTargetSurpassed &&
        newScore > activeChallenge.targetScore
      ) {
        setChallengeTargetSurpassed(true);
        soundEngine.playComboFanfare(5);
        addScorePopup(0, '⚔️ 친구 대결 목표 돌파 성공!', 0);
      }

      // Update max combo in current game
      const newMaxCombo = Math.max(maxCombo, nextCombo);
      setMaxCombo(newMaxCombo);

      // Check high score
      if (newScore > highScore) {
        setHighScore(newScore);
      }

      // Check if tray is empty (all 3 pieces placed)
      let updatedTray = nextTray;
      let nextRoundIndex = roundIndex;

      if (updatedTray.every((p) => p === null)) {
        nextRoundIndex = roundIndex + 1;
        updatedTray = generateRoundPieces(rngRef.current, nextRoundIndex);
      }

      // Check Game Over
      const gameOver = checkIsGameOver(finalBoard, updatedTray);

      // Apply state updates
      setBoard(finalBoard);
      setTrayPieces(updatedTray);
      setScore(newScore);
      setCombo(nextCombo);
      setLinesCleared(nextLinesCleared);
      setRoundIndex(nextRoundIndex);
      setSelectedPieceIndex(null);
      setPreviewPlacement(null);

      if (gameOver) {
        soundEngine.playGameOver();
        const { isNewHigh: newHighFlag, profile: updatedProfile } = updateGameStats(
          newScore,
          newMaxCombo,
          nextLinesCleared
        );
        setIsNewHigh(newHighFlag);
        setProfile(updatedProfile);
        setTimeout(() => {
          setIsGameOverModalOpen(true);
        }, 400);
      }
    },
    [
      board,
      trayPieces,
      combo,
      score,
      highScore,
      maxCombo,
      linesCleared,
      roundIndex,
      activeChallenge,
      challengeTargetSurpassed,
    ]
  );

  // Handle Drag Start from PieceTray
  const handleStartDrag = (
    index: number,
    piece: BlockShape,
    clientX: number,
    clientY: number,
    targetRect: DOMRect
  ) => {
    soundEngine.playPick();
    setSelectedPieceIndex(null);
    setDragState({
      piece,
      pieceIndex: index,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      isTouch: false,
    });
  };

  // Global Pointer / Touch Move for Dragging
  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      const isTouch = e.pointerType === 'touch';
      setDragState((prev) =>
        prev
          ? {
              ...prev,
              currentX: e.clientX,
              currentY: e.clientY,
              isTouch,
            }
          : null
      );

      // Compute board hover coordinates
      const boardHandle = boardRef.current;
      if (!boardHandle) return;

      const boardRect = boardHandle.getBoardRect();
      if (!boardRect) return;

      const cellSize = boardHandle.getCellSize();
      const piece = dragState.piece;
      const pieceRows = piece.matrix.length;
      const pieceCols = piece.matrix[0].length;

      // Finger offset: on touch devices, raise piece ~75px above touch point so it's visible
      const touchOffsetY = isTouch ? -75 : 0;
      const effectivePointerX = e.clientX;
      const effectivePointerY = e.clientY + touchOffsetY;

      // Center piece around effective pointer
      const targetCol = Math.round(
        (effectivePointerX - boardRect.left) / cellSize - pieceCols / 2
      );
      const targetRow = Math.round(
        (effectivePointerY - boardRect.top) / cellSize - pieceRows / 2
      );

      if (
        targetRow >= 0 &&
        targetRow <= BOARD_SIZE - pieceRows &&
        targetCol >= 0 &&
        targetCol <= BOARD_SIZE - pieceCols
      ) {
        const preview = getBlastPreview(board, piece.matrix, targetRow, targetCol);
        setPreviewPlacement({
          row: targetRow,
          col: targetCol,
          piece,
          valid: preview.valid,
          wouldClearRows: preview.wouldClearRows,
          wouldClearCols: preview.wouldClearCols,
        });
      } else {
        setPreviewPlacement(null);
      }
    };

    const handlePointerUp = () => {
      if (previewPlacement && previewPlacement.valid) {
        executePlacePiece(
          dragState.pieceIndex,
          dragState.piece,
          previewPlacement.row,
          previewPlacement.col
        );
      }
      setDragState(null);
      setPreviewPlacement(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [dragState, previewPlacement, board, executePlacePiece]);

  // Tap-to-Place fallback: placing selected piece onto cell
  const handleCellClick = (row: number, col: number) => {
    if (selectedPieceIndex === null) return;
    const piece = trayPieces[selectedPieceIndex];
    if (!piece) return;

    // Check if placeable starting at (row, col)
    const preview = getBlastPreview(board, piece.matrix, row, col);
    if (preview.valid) {
      executePlacePiece(selectedPieceIndex, piece, row, col);
    } else {
      soundEngine.playButtonClick();
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (screen === 'TITLE') {
          startGame('CLASSIC');
        }
      } else if (e.code === 'Escape') {
        if (isLeaderboardOpen) setIsLeaderboardOpen(false);
        else if (isShareOpen) setIsShareOpen(false);
        else if (isGameOverModalOpen) setIsGameOverModalOpen(false);
        else if (screen === 'PLAYING') setScreen('TITLE');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, isLeaderboardOpen, isShareOpen, isGameOverModalOpen, startGame]);

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
    if (!muted) soundEngine.playButtonClick();
  };

  return (
    <div
      style={{
        transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
      }}
      className="relative w-screen h-screen overflow-hidden bg-[#0a0f1d] text-slate-100 flex flex-col justify-between items-center select-none"
    >
      {/* 60fps Particle Canvas overlay */}
      <ParticleCanvas
        ref={particleCanvasRef}
        onShakeChange={(x, y) => setShakeOffset({ x, y })}
      />

      {/* Floating score text overlay */}
      <ScorePopups popups={scorePopups} />

      {/* VIEW: TITLE SCREEN */}
      {screen === 'TITLE' && (
        <TitleScreen
          onStartGame={startGame}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          playerProfile={profile}
          activeChallenge={activeChallenge}
          onClearChallenge={() => setActiveChallenge(null)}
        />
      )}

      {/* VIEW: ACTIVE GAMEPLAY */}
      {screen === 'PLAYING' && (
        <div className="w-full h-full flex flex-col items-center justify-between p-2 sm:p-4 max-w-lg mx-auto">
          {/* Top HUD: Score, Streak, Controls */}
          <div className="w-full flex flex-col gap-1.5 z-20">
            {/* Upper Action Bar */}
            <div className="flex items-center justify-between w-full px-1">
              <button
                onClick={() => {
                  soundEngine.playButtonClick();
                  setScreen('TITLE');
                }}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="메인으로"
              >
                <Home className="w-4 h-4" />
              </button>

              {/* Combo Streak Flame Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800">
                <Flame
                  className={`w-4 h-4 transition-colors ${
                    combo >= 2 ? 'text-amber-400 animate-bounce' : 'text-slate-500'
                  }`}
                />
                <span className="text-xs font-bold text-slate-300">
                  {combo > 0 ? (
                    <span className="text-amber-400 font-extrabold">{combo} 콤보!</span>
                  ) : (
                    '콤보 대기'
                  )}
                </span>
              </div>

              {/* Top Action Icons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setIsShareOpen(true);
                  }}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-400/50 text-amber-400 transition-colors cursor-pointer"
                  title="친구에게 공유"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    soundEngine.playButtonClick();
                    setIsLeaderboardOpen(true);
                  }}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="글로벌 리더보드"
                >
                  <Trophy className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleSound}
                  className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title={isMuted ? '소리 켜기' : '소리 끄기'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Score & High Score Cluster */}
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-slate-900/80 via-slate-900/95 to-slate-900/80 border border-slate-800/80 rounded-2xl shadow-md">
              <div>
                <span className="text-[11px] text-slate-400 font-semibold block">현재 점수</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-400 tabular-nums tracking-tight">
                  {score.toLocaleString()}
                </span>
              </div>

              {/* Challenge Mode Target Tracker */}
              {activeChallenge && (
                <div className="text-center px-2 py-0.5 rounded-lg bg-blue-950/60 border border-blue-500/40">
                  <span className="text-[10px] text-blue-300 font-semibold flex items-center justify-center gap-1">
                    <Swords className="w-3 h-3 text-amber-400" /> 친구 목표
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-white tabular-nums">
                    {activeChallenge.targetScore.toLocaleString()}점
                  </span>
                  {challengeTargetSurpassed && (
                    <span className="text-[9px] text-emerald-400 font-bold block flex items-center justify-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> 돌파 완료!
                    </span>
                  )}
                </div>
              )}

              <div className="text-right">
                <span className="text-[11px] text-slate-400 font-semibold block">최고 기록</span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-200 tabular-nums tracking-tight">
                  {highScore.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Center Playfield: 8x8 Jewel Board */}
          <div className="my-auto relative flex items-center justify-center w-full px-2">
            <GameBoard
              ref={boardRef}
              board={board}
              previewPlacement={previewPlacement}
              clearingCells={clearingCells}
              onCellClick={handleCellClick}
            />
          </div>

          {/* Bottom Piece Tray */}
          <div className="w-full flex flex-col items-center gap-1 z-20">
            <PieceTray
              pieces={trayPieces}
              board={board}
              selectedPieceIndex={selectedPieceIndex}
              onSelectPiece={setSelectedPieceIndex}
              onStartDrag={handleStartDrag}
            />
          </div>
        </div>
      )}

      {/* Floating Ghost Element during Active Drag */}
      {dragState && (
        <div
          style={{
            position: 'fixed',
            left: dragState.currentX,
            top: dragState.currentY + (dragState.isTouch ? -75 : 0),
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 100,
          }}
          className="opacity-90 scale-105 filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
        >
          <div
            className="grid gap-1"
            style={{
              gridTemplateRows: `repeat(${dragState.piece.matrix.length}, minmax(0, 1fr))`,
              gridTemplateColumns: `repeat(${dragState.piece.matrix[0].length}, minmax(0, 1fr))`,
            }}
          >
            {dragState.piece.matrix.map((rowArr, r) =>
              rowArr.map((cell, c) => {
                if (!cell) {
                  return <div key={`drag_${r}_${c}`} className="w-9 h-9" />;
                }
                const gem = GEM_COLORS[dragState.piece.colorId];
                return (
                  <div
                    key={`drag_${r}_${c}`}
                    style={{
                      background: gem.bgGradient,
                      borderColor: gem.border,
                      boxShadow: `0 4px 10px rgba(0,0,0,0.5), inset 0 2px 2px rgba(255,255,255,0.7), 0 0 12px ${gem.glow}`,
                    }}
                    className="w-9 h-9 rounded-lg border border-white/50 relative overflow-hidden"
                  >
                    <div className="absolute inset-x-1 top-0.5 h-[35%] rounded-t-[4px] bg-gradient-to-b from-white/60 via-white/20 to-transparent" />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        playerProfile={profile}
        onProfileUpdated={(updated) => {
          setProfile(updated);
          setHighScore(updated.highScore);
        }}
        onChallengeFriend={() => {
          setIsLeaderboardOpen(false);
          setIsShareOpen(true);
        }}
      />

      {/* Score Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        score={score > 0 ? score : profile.highScore}
        maxCombo={maxCombo > 0 ? maxCombo : profile.maxCombo}
        linesCleared={linesCleared > 0 ? linesCleared : profile.totalLinesCleared}
        profile={profile}
        seed={gameSeed || 'BLAST9'}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        score={score}
        maxCombo={maxCombo}
        linesCleared={linesCleared}
        isNewHigh={isNewHigh}
        profile={profile}
        activeChallenge={activeChallenge}
        onRestart={() => startGame(gameMode, gameSeed)}
        onOpenShare={() => {
          setIsGameOverModalOpen(false);
          setIsShareOpen(true);
        }}
        onOpenLeaderboard={() => {
          setIsGameOverModalOpen(false);
          setIsLeaderboardOpen(true);
        }}
      />
    </div>
  );
}
