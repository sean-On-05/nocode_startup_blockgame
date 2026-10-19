import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { CellValue, BlockShape } from '../game/types';
import { JewelCell } from './JewelCell';
import { BOARD_SIZE, canPlacePiece } from '../game/engine';

export interface GameBoardHandle {
  getBoardRect: () => DOMRect | null;
  getCellSize: () => number;
  getCellCenter: (row: number, col: number) => { x: number; y: number } | null;
}

interface GameBoardProps {
  board: CellValue[][];
  previewPlacement: {
    row: number;
    col: number;
    piece: BlockShape;
    valid: boolean;
    wouldClearRows: number[];
    wouldClearCols: number[];
  } | null;
  clearingCells: Set<string>;
  onCellClick?: (row: number, col: number) => void;
}

export const GameBoard = forwardRef<GameBoardHandle, GameBoardProps>(
  ({ board, previewPlacement, clearingCells, onCellClick }, ref) => {
    const gridRef = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(ref, () => ({
      getBoardRect: () => {
        if (!gridRef.current) return null;
        return gridRef.current.getBoundingClientRect();
      },
      getCellSize: () => {
        if (!gridRef.current) return 40;
        return gridRef.current.offsetWidth / BOARD_SIZE;
      },
      getCellCenter: (row: number, col: number) => {
        if (!gridRef.current) return null;
        const rect = gridRef.current.getBoundingClientRect();
        const cellSize = rect.width / BOARD_SIZE;
        return {
          x: rect.left + (col + 0.5) * cellSize,
          y: rect.top + (row + 0.5) * cellSize,
        };
      },
    }));

    return (
      <div className="relative p-2.5 sm:p-3.5 bg-gradient-to-b from-[#161f36] to-[#0d1322] rounded-2xl border border-slate-700/60 shadow-[0_12px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.1)] w-full max-w-[420px] aspect-square select-none">
        <div
          ref={gridRef}
          className="grid grid-cols-8 grid-rows-8 gap-1 sm:gap-1.5 w-full h-full relative"
        >
          {board.map((rowArr, r) =>
            rowArr.map((cellValue, c) => {
              const cellKey = `${r},${c}`;
              const isClearing = clearingCells.has(cellKey);

              // Check if cell is covered by preview piece
              let isPreviewCell = false;
              let isPreviewValid = true;
              let previewColorId = 0;

              if (previewPlacement) {
                const { row: pr, col: pc, piece, valid } = previewPlacement;
                const relR = r - pr;
                const relC = c - pc;

                if (
                  relR >= 0 &&
                  relR < piece.matrix.length &&
                  relC >= 0 &&
                  relC < piece.matrix[0].length &&
                  piece.matrix[relR][relC] === 1
                ) {
                  isPreviewCell = true;
                  isPreviewValid = valid;
                  previewColorId = piece.colorId;
                }
              }

              // Check if this row or column is previewed to be cleared
              const isRowOrColClear =
                previewPlacement?.valid &&
                (previewPlacement.wouldClearRows.includes(r) || previewPlacement.wouldClearCols.includes(c));

              return (
                <div key={cellKey} className="relative w-full h-full">
                  <JewelCell
                    colorId={cellValue}
                    isClearing={isClearing}
                    isRowOrColClearPreview={cellValue === null && isRowOrColClear}
                    onClick={() => onCellClick?.(r, c)}
                  />

                  {/* Ghost preview placement overlay */}
                  {isPreviewCell && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                      <JewelCell
                        colorId={previewColorId}
                        isPreview
                        isValidPreview={isPreviewValid}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }
);
