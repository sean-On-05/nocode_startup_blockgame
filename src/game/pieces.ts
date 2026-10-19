import { BlockShape } from './types';

// Color themes: 0: Blue, 1: Green, 2: Red, 3: Gold/Amber, 4: Purple, 5: Cyan, 6: Orange, 7: Pink
export const SHAPE_TEMPLATES: { name: string; matrix: number[][]; preferredColor: number }[] = [
  // 1x1 Dot
  { name: 'dot', matrix: [[1]], preferredColor: 3 },

  // Lines
  { name: 'line_h_2', matrix: [[1, 1]], preferredColor: 5 },
  { name: 'line_v_2', matrix: [[1], [1]], preferredColor: 5 },
  { name: 'line_h_3', matrix: [[1, 1, 1]], preferredColor: 0 },
  { name: 'line_v_3', matrix: [[1], [1], [1]], preferredColor: 0 },
  { name: 'line_h_4', matrix: [[1, 1, 1, 1]], preferredColor: 1 },
  { name: 'line_v_4', matrix: [[1], [1], [1], [1]], preferredColor: 1 },
  { name: 'line_h_5', matrix: [[1, 1, 1, 1, 1]], preferredColor: 6 },
  { name: 'line_v_5', matrix: [[1], [1], [1], [1], [1]], preferredColor: 6 },

  // Squares
  { name: 'square_2x2', matrix: [[1, 1], [1, 1]], preferredColor: 3 },
  { name: 'square_3x3', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], preferredColor: 2 },

  // Small Corner 2x2 (3 blocks)
  { name: 'corner_small_tl', matrix: [[1, 1], [1, 0]], preferredColor: 7 },
  { name: 'corner_small_tr', matrix: [[1, 1], [0, 1]], preferredColor: 7 },
  { name: 'corner_small_bl', matrix: [[1, 0], [1, 1]], preferredColor: 7 },
  { name: 'corner_small_br', matrix: [[0, 1], [1, 1]], preferredColor: 7 },

  // Standard L 3x2 (4 blocks)
  { name: 'L_3x2_0', matrix: [[1, 0], [1, 0], [1, 1]], preferredColor: 6 },
  { name: 'L_3x2_1', matrix: [[0, 1], [0, 1], [1, 1]], preferredColor: 6 },
  { name: 'L_3x2_2', matrix: [[1, 1], [1, 0], [1, 0]], preferredColor: 6 },
  { name: 'L_3x2_3', matrix: [[1, 1], [0, 1], [0, 1]], preferredColor: 6 },
  { name: 'L_2x3_0', matrix: [[1, 1, 1], [1, 0, 0]], preferredColor: 6 },
  { name: 'L_2x3_1', matrix: [[1, 1, 1], [0, 0, 1]], preferredColor: 6 },
  { name: 'L_2x3_2', matrix: [[1, 0, 0], [1, 1, 1]], preferredColor: 6 },
  { name: 'L_2x3_3', matrix: [[0, 0, 1], [1, 1, 1]], preferredColor: 6 },

  // Big Corner 3x3 (5 blocks)
  { name: 'corner_big_tl', matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], preferredColor: 4 },
  { name: 'corner_big_tr', matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], preferredColor: 4 },
  { name: 'corner_big_bl', matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], preferredColor: 4 },
  { name: 'corner_big_br', matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], preferredColor: 4 },

  // T shapes
  { name: 'T_2x3_up', matrix: [[0, 1, 0], [1, 1, 1]], preferredColor: 4 },
  { name: 'T_2x3_down', matrix: [[1, 1, 1], [0, 1, 0]], preferredColor: 4 },
  { name: 'T_3x2_left', matrix: [[0, 1], [1, 1], [0, 1]], preferredColor: 4 },
  { name: 'T_3x2_right', matrix: [[1, 0], [1, 1], [1, 0]], preferredColor: 4 },

  // S and Z shapes
  { name: 'Z_2x3', matrix: [[1, 1, 0], [0, 1, 1]], preferredColor: 2 },
  { name: 'S_2x3', matrix: [[0, 1, 1], [1, 1, 0]], preferredColor: 1 },
  { name: 'Z_3x2', matrix: [[0, 1], [1, 1], [1, 0]], preferredColor: 2 },
  { name: 'S_3x2', matrix: [[1, 0], [1, 1], [0, 1]], preferredColor: 1 },

  // Diagonal 2-dots
  { name: 'diag_tl_br', matrix: [[1, 0], [0, 1]], preferredColor: 5 },
  { name: 'diag_tr_bl', matrix: [[0, 1], [1, 0]], preferredColor: 5 },

  // Plus / Cross
  { name: 'cross', matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], preferredColor: 7 },
];

// Simple fast PRNG (Mulberry32) for deterministic seed challenges
export function createRNG(seedStr?: string): () => number {
  if (!seedStr) {
    return Math.random;
  }
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let s = h >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRoundPieces(rng: () => number, roundIndex: number): BlockShape[] {
  const result: BlockShape[] = [];

  // Categorize shapes by size so we give balanced sets
  const smallShapes = SHAPE_TEMPLATES.filter(
    (s) => countBlocks(s.matrix) <= 3 && s.name !== 'square_3x3'
  );
  const mediumShapes = SHAPE_TEMPLATES.filter(
    (s) => countBlocks(s.matrix) === 4
  );
  const largeShapes = SHAPE_TEMPLATES.filter(
    (s) => countBlocks(s.matrix) >= 5
  );

  // Pick 3 shapes: at most one large shape to prevent instant board clogs
  const pool = [
    // 1st slot: small or medium
    rng() > 0.4 ? smallShapes : mediumShapes,
    // 2nd slot: medium or large (or small)
    rng() > 0.6 ? largeShapes : (rng() > 0.5 ? mediumShapes : smallShapes),
    // 3rd slot: small or medium
    rng() > 0.5 ? smallShapes : mediumShapes,
  ];

  for (let i = 0; i < 3; i++) {
    const category = pool[i];
    const picked = category[Math.floor(rng() * category.length)];
    // Randomize or use preferred color with occasional tint
    const colorId = (picked.preferredColor + Math.floor(rng() * 2)) % 8;
    result.push({
      id: `p_${roundIndex}_${i}_${Date.now()}_${Math.floor(rng() * 10000)}`,
      name: picked.name,
      matrix: picked.matrix.map((row) => [...row]),
      colorId,
    });
  }

  return result;
}

export function countBlocks(matrix: number[][]): number {
  return matrix.reduce((acc, row) => acc + row.reduce((rAcc, cell) => rAcc + (cell ? 1 : 0), 0), 0);
}
