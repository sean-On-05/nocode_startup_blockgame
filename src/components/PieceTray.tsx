import React from 'react';
import { BlockShape, CellValue } from '../game/types';
import { GEM_COLORS } from '../game/colors';
import { canFitAnywhere } from '../game/engine';

interface PieceTrayProps {
  pieces: (BlockShape | null)[];
  board: CellValue[][];
  selectedPieceIndex: number | null;
  onSelectPiece: (index: number | null) => void;
  onStartDrag: (
    index: number,
    piece: BlockShape,
    clientX: number,
    clientY: number,
    targetRect: DOMRect
  ) => void;
  disabled?: boolean;
}

export const PieceTray: React.FC<PieceTrayProps> = ({
  pieces,
  board,
  selectedPieceIndex,
  onSelectPiece,
  onStartDrag,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-[480px] px-3 py-2 flex items-center justify-around gap-2 select-none">
      {pieces.map((piece, index) => {
        if (!piece) {
          return (
            <div
              key={`empty_slot_${index}`}
              className="flex-1 h-24 sm:h-28 rounded-xl border border-slate-800/40 bg-slate-900/20 flex items-center justify-center opacity-30"
            />
          );
        }

        const canFit = canFitAnywhere(board, piece.matrix);
        const isSelected = selectedPieceIndex === index;
        const gem = GEM_COLORS[piece.colorId];

        const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
          if (disabled || !canFit) return;
          const rect = e.currentTarget.getBoundingClientRect();
          onStartDrag(index, piece, e.clientX, e.clientY, rect);
        };

        const handleClick = (e: React.MouseEvent) => {
          if (disabled || !canFit) return;
          e.stopPropagation();
          onSelectPiece(isSelected ? null : index);
        };

        return (
          <div
            key={piece.id}
            onPointerDown={handlePointerDown}
            onClick={handleClick}
            className={`flex-1 h-24 sm:h-28 rounded-2xl flex items-center justify-center cursor-grab active:cursor-grabbing transition-all duration-200 relative group touch-none p-2 ${
              !canFit
                ? 'opacity-35 grayscale contrast-75 cursor-not-allowed bg-slate-900/30 border border-slate-800/50'
                : isSelected
                ? 'bg-slate-800/80 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)] scale-105'
                : 'bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60 hover:border-slate-600/80 hover:scale-[1.03]'
            }`}
          >
            {/* Visual piece grid */}
            <div
              className="grid gap-[2px] pointer-events-none transition-transform"
              style={{
                gridTemplateRows: `repeat(${piece.matrix.length}, minmax(0, 1fr))`,
                gridTemplateColumns: `repeat(${piece.matrix[0].length}, minmax(0, 1fr))`,
              }}
            >
              {piece.matrix.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  if (!cell) {
                    return <div key={`empty_${rIdx}_${cIdx}`} className="w-5 h-5 sm:w-6 sm:h-6" />;
                  }
                  return (
                    <div
                      key={`cell_${rIdx}_${cIdx}`}
                      style={{
                        background: gem.bgGradient,
                        boxShadow: `0 2px 4px rgba(0,0,0,0.4), inset 0 1.5px 2px rgba(255,255,255,0.6), inset 0 -1.5px 2px rgba(0,0,0,0.4), 0 0 6px ${gem.glow}`,
                        borderColor: gem.border,
                      }}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-[5px] border border-white/40 relative overflow-hidden"
                    >
                      <div className="absolute inset-x-0.5 top-0.5 h-[35%] rounded-t-[3px] bg-gradient-to-b from-white/60 via-white/20 to-transparent" />
                    </div>
                  );
                })
              )}
            </div>

            {/* Cannot fit warning label */}
            {!canFit && (
              <div className="absolute bottom-1 text-[10px] text-rose-400/90 font-medium tracking-tight">
                공간 부족
              </div>
            )}

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute -top-2 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-bold rounded-full shadow-md tracking-tight">
                선택됨
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
