export type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';
export type Move = Face | `${Face}'` | `${Face}2`;
export type CubeState = string;

export const FACES: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

export const MOVES: readonly Move[] = FACES.flatMap((face): Move[] => [
  face,
  `${face}'`,
  `${face}2`,
]);

export const SOLVED: CubeState = FACES.map((face) => face.repeat(9)).join('');

const STICKER_COUNT = 54;

type Vec = readonly [number, number, number];

// Where sticker (row, col) of each face sits in space (x right, y up, z towards the viewer),
// and which way the face points, following the facelet reading order of each face.
const FACE_GEOMETRY: Record<Face, { normal: Vec; position: (row: number, col: number) => Vec }> = {
  U: { normal: [0, 1, 0], position: (r, c) => [c - 1, 1, r - 1] },
  R: { normal: [1, 0, 0], position: (r, c) => [1, 1 - r, 1 - c] },
  F: { normal: [0, 0, 1], position: (r, c) => [c - 1, 1 - r, 1] },
  D: { normal: [0, -1, 0], position: (r, c) => [c - 1, -1, 1 - r] },
  L: { normal: [-1, 0, 0], position: (r, c) => [-1, 1 - r, c - 1] },
  B: { normal: [0, 0, -1], position: (r, c) => [1 - c, 1 - r, -1] },
};

const dot = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

// Rotates v a quarter turn clockwise as seen looking at the face whose outward normal is n.
const rotateClockwise = (v: Vec, n: Vec): Vec => {
  const along = dot(n, v);
  const side = cross(n, v);
  return [n[0] * along - side[0], n[1] * along - side[1], n[2] * along - side[2]];
};

const keyOf = (position: Vec, normal: Vec): string => `${position.join(',')}|${normal.join(',')}`;

const stickers = FACES.flatMap((face) => {
  const { normal, position } = FACE_GEOMETRY[face];
  return Array.from({ length: 9 }, (_, i) => ({
    position: position(Math.floor(i / 3), i % 3),
    normal,
  }));
});

const indexByKey = new Map(stickers.map((s, i) => [keyOf(s.position, s.normal), i]));

// source[j] is the index whose sticker ends up at index j after the move.
type Permutation = readonly number[];

const compose = (first: Permutation, second: Permutation): Permutation =>
  second.map((from) => first[from] ?? from);

const quarterTurn = (face: Face): Permutation => {
  const { normal } = FACE_GEOMETRY[face];
  const source = stickers.map((_, i) => i);
  for (const [i, sticker] of stickers.entries()) {
    if (dot(sticker.position, normal) !== 1) continue;
    const target = indexByKey.get(
      keyOf(rotateClockwise(sticker.position, normal), rotateClockwise(sticker.normal, normal))
    );
    if (target === undefined) throw new Error(`No sticker for turn ${face} at ${String(i)}`);
    source[target] = i;
  }
  return source;
};

const PERMUTATIONS = Object.fromEntries(
  FACES.flatMap((face) => {
    const quarter = quarterTurn(face);
    const half = compose(quarter, quarter);
    return [
      [face, quarter],
      [`${face}'`, compose(half, quarter)],
      [`${face}2`, half],
    ];
  })
) as Record<Move, Permutation>;

export function applyMove(state: CubeState, move: Move): CubeState {
  if (state.length !== STICKER_COUNT) {
    throw new RangeError(
      `Cube state must be ${String(STICKER_COUNT)} characters long, got ${String(state.length)}`
    );
  }
  return PERMUTATIONS[move].map((from) => state.charAt(from)).join('');
}

export function applyMoves(state: CubeState, moves: readonly Move[]): CubeState {
  return moves.reduce((current, move) => applyMove(current, move), state);
}

export function isSolved(state: CubeState): boolean {
  if (state.length !== STICKER_COUNT) return false;
  return FACES.every((_, f) => {
    const face = state.slice(f * 9, f * 9 + 9);
    return face === face.charAt(0).repeat(9);
  });
}
