import { CellValue, ClearResult } from './types';

export const BOARD_SIZE = 8;

export function createEmptyBoard(): CellValue[][] {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}

export function cloneBoard(board: CellValue[][]): CellValue[][] {
  return board.map((row) => [...row]);
}

export function canPlacePiece(
  board: CellValue[][],
  matrix: number[][],
  startRow: number,
  startCol: number
): boolean {
  const rows = matrix.length;
  const cols = matrix[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 1) {
        const targetR = startRow + r;
        const targetC = startCol + c;

        // Out of board bounds
        if (targetR < 0 || targetR >= BOARD_SIZE || targetC < 0 || targetC >= BOARD_SIZE) {
          return false;
        }

        // Cell is already occupied
        if (board[targetR][targetC] !== null) {
          return false;
        }
      }
    }
  }

  return true;
}

export function placePiece(
  board: CellValue[][],
  matrix: number[][],
  startRow: number,
  startCol: number,
  colorId: number
): CellValue[][] {
  const newBoard = cloneBoard(board);
  const rows = matrix.length;
  const cols = matrix[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 1) {
        newBoard[startRow + r][startCol + c] = colorId;
      }
    }
  }

  return newBoard;
}

export function checkLineClears(board: CellValue[][], currentCombo: number): ClearResult {
  const clearedRows: number[] = [];
  const clearedCols: number[] = [];

  // Check rows
  for (let r = 0; r < BOARD_SIZE; r++) {
    let full = true;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      clearedRows.push(r);
    }
  }

  // Check columns
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) {
      clearedCols.push(c);
    }
  }

  const totalLines = clearedRows.length + clearedCols.length;
  const clearedCellCoords: [number, number][] = [];
  const coordsSet = new Set<string>();

  clearedRows.forEach((r) => {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const key = `${r},${c}`;
      if (!coordsSet.has(key)) {
        coordsSet.add(key);
        clearedCellCoords.push([r, c]);
      }
    }
  });

  clearedCols.forEach((c) => {
    for (let r = 0; r < BOARD_SIZE; r++) {
      const key = `${r},${c}`;
      if (!coordsSet.has(key)) {
        coordsSet.add(key);
        clearedCellCoords.push([r, c]);
      }
    }
  });

  if (totalLines === 0) {
    return {
      clearedRows: [],
      clearedCols: [],
      clearedCellCoords: [],
      totalLines: 0,
      points: 0,
      combo: 0, // Reset combo if no line cleared
      isAllClear: false,
    };
  }

  // Base points calculation
  // 1 line: 10, 2 lines: 30, 3 lines: 60, 4 lines: 100, etc.
  const lineMultiplier = (totalLines * (totalLines + 1) / 2) * 10;
  const nextCombo = currentCombo + 1;
  const comboBonus = nextCombo > 1 ? (nextCombo * 20) : 0;
  const basePoints = lineMultiplier + comboBonus;

  // New board with lines cleared
  const newBoard = cloneBoard(board);
  clearedCellCoords.forEach(([r, c]) => {
    newBoard[r][c] = null;
  });

  // Check All Clear
  let isAllClear = true;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (newBoard[r][c] !== null) {
        isAllClear = false;
        break;
      }
    }
    if (!isAllClear) break;
  }

  const points = basePoints + (isAllClear ? 500 : 0);

  return {
    clearedRows,
    clearedCols,
    clearedCellCoords,
    totalLines,
    points,
    combo: nextCombo,
    isAllClear,
  };
}

export function canFitAnywhere(board: CellValue[][], matrix: number[][]): boolean {
  const rows = matrix.length;
  const cols = matrix[0].length;

  for (let r = 0; r <= BOARD_SIZE - rows; r++) {
    for (let c = 0; c <= BOARD_SIZE - cols; c++) {
      if (canPlacePiece(board, matrix, r, c)) {
        return true;
      }
    }
  }

  return false;
}

export function isGameOver(board: CellValue[][], trayPieces: (import('./types').BlockShape | null)[]): boolean {
  const remainingPieces = trayPieces.filter((p): p is import('./types').BlockShape => p !== null);
  if (remainingPieces.length === 0) {
    return false; // Still waiting for new round
  }

  for (const piece of remainingPieces) {
    if (canFitAnywhere(board, piece.matrix)) {
      return false; // At least one piece can still be placed
    }
  }

  return true; // No piece can be placed anywhere!
}

export function getBlastPreview(
  board: CellValue[][],
  matrix: number[][],
  startRow: number,
  startCol: number
): { valid: boolean; wouldClearRows: number[]; wouldClearCols: number[] } {
  if (!canPlacePiece(board, matrix, startRow, startCol)) {
    return { valid: false, wouldClearRows: [], wouldClearCols: [] };
  }

  // Simulate placing piece
  const tempBoard = cloneBoard(board);
  const rows = matrix.length;
  const cols = matrix[0].length;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 1) {
        tempBoard[startRow + r][startCol + c] = 99; // temp mark
      }
    }
  }

  const wouldClearRows: number[] = [];
  const wouldClearCols: number[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    let full = true;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (tempBoard[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) wouldClearRows.push(r);
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (tempBoard[r][c] === null) {
        full = false;
        break;
      }
    }
    if (full) wouldClearCols.push(c);
  }

  return {
    valid: true,
    wouldClearRows,
    wouldClearCols,
  };
}
