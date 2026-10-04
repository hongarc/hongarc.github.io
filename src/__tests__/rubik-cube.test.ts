import { describe, expect, it } from 'vitest';

import {
  applyMove,
  applyMoves,
  FACES,
  isSolved,
  MOVES,
  SOLVED,
  type Face,
  type Move,
} from '@/domain/rubik/cube';

const DISTINCT = Array.from({ length: 54 }, (_, i) => String.fromCodePoint(0x41 + i)).join('');
const SEXY: readonly Move[] = ['R', 'U', "R'", "U'"];

describe('Rubik cube', () => {
  it('has a solved state and 18 moves', () => {
    expect(SOLVED).toBe('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
    expect(FACES).toEqual(['U', 'R', 'F', 'D', 'L', 'B']);
    expect(MOVES.join(' ')).toBe("U U' U2 R R' R2 F F' F2 D D' D2 L L' L2 B B' B2");
    expect(isSolved(SOLVED)).toBe(true);
    for (const move of MOVES) {
      expect(isSolved(applyMove(SOLVED, move))).toBe(false);
    }
  });

  it('matches the reference strings', () => {
    expect(applyMove(SOLVED, 'U')).toBe('UUUUUUUUUBBBRRRRRRRRRFFFFFFDDDDDDDDDFFFLLLLLLLLLBBBBBB');
    expect(applyMove(SOLVED, 'R')).toBe('UUFUUFUUFRRRRRRRRRFFDFFDFFDDDBDDBDDBLLLLLLLLLUBBUBBUBB');
    expect(applyMove(SOLVED, 'F')).toBe('UUUUUULLLURRURRURRFFFFFFFFFRRRDDDDDDLLDLLDLLDBBBBBBBBB');
    expect(applyMoves(SOLVED, SEXY)).toBe('UULUUFUUFRRUBRRURRFFDFFUFFFDDRDDDDDDBLLLLLLLLBRRBBBBBB');
  });

  it('returns to solved after four of any move', () => {
    for (const move of MOVES) {
      expect(applyMoves(SOLVED, [move, move, move, move])).toBe(SOLVED);
    }
  });

  it('has inverses and half turns consistent with quarter turns', () => {
    for (const face of FACES) {
      const quarter: Move = face;
      const anti: Move = `${face}'`;
      const half: Move = `${face}2`;
      expect(applyMoves(DISTINCT, [quarter, anti])).toBe(DISTINCT);
      expect(applyMoves(DISTINCT, [anti, quarter])).toBe(DISTINCT);
      expect(applyMove(DISTINCT, half)).toBe(applyMoves(DISTINCT, [quarter, quarter]));
    }
  });

  it("returns to solved after six repetitions of R U R' U'", () => {
    const sixTimes = Array.from({ length: 6 }, () => SEXY).flat();
    expect(applyMoves(SOLVED, sixTimes)).toBe(SOLVED);
    expect(applyMoves(SOLVED, sixTimes.slice(0, 20))).not.toBe(SOLVED);
  });

  it('moves exactly 20 positions per move and keeps the centres', () => {
    for (const move of MOVES) {
      const result = applyMove(DISTINCT, move);
      const changed = Array.from(DISTINCT, (ch, i) => (ch === result[i] ? -1 : i)).filter(
        (i) => i >= 0
      );
      expect(changed).toHaveLength(20);
      const faceStart = FACES.indexOf(move.charAt(0) as Face) * 9;
      expect(changed.filter((i) => i >= faceStart && i < faceStart + 9)).toHaveLength(8);
      for (let f = 0; f < 6; f++) {
        expect(result[f * 9 + 4]).toBe(DISTINCT[f * 9 + 4]);
      }
    }
  });

  it('does not mutate its input and rejects wrong-length states', () => {
    applyMove(SOLVED, 'R');
    expect(SOLVED).toBe('UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB');
    expect(() => applyMove(SOLVED.slice(0, 53), 'R')).toThrow(RangeError);
    expect(() => applyMove(`${SOLVED}U`, 'R')).toThrow(RangeError);
  });

  it('returns the state unchanged for an empty move list', () => {
    expect(applyMoves(DISTINCT, [])).toBe(DISTINCT);
  });
});
