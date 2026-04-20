// ── Pure Ultimate Tic-Tac-Toe logic ──────────────────────────────────────────

export function emptyBigBoard() {
  return Array.from({ length: 3 }, () => Array(3).fill(null));
}

export function emptySmallBoards() {
  return Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => Array(3).fill(null))
    )
  );
}

/** Returns 1 | 2 | null — checks standard 3×3 TTT board */
export function checkWinner(board) {
  const lines = [
    [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
    [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
    [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]],
  ];
  for (const [[r0,c0],[r1,c1],[r2,c2]] of lines) {
    const v = board[r0][c0];
    if (v && v !== 'draw' && v === board[r1][c1] && v === board[r2][c2]) return v;
  }
  return null;
}

/** True if every cell in a 3×3 board is filled */
export function isFull(board) {
  return board.every(row => row.every(v => v !== null));
}

/**
 * Apply a move and return the new game state.
 * Returns null if the move is illegal.
 */
export function applyMove(state, br, bc, r, c) {
  const { bigBoard, smallBoards, currentPlayer, nextBoard } = state;

  // Must play on the required board (if not resolved)
  if (nextBoard && (nextBoard.br !== br || nextBoard.bc !== bc)) return null;
  if (bigBoard[br][bc] !== null) return null;
  if (smallBoards[br][bc][r][c] !== null) return null;

  // Deep clone
  const newSmall = smallBoards.map(bRow =>
    bRow.map(b => b.map(row => [...row]))
  );
  const newBig = bigBoard.map(row => [...row]);

  newSmall[br][bc][r][c] = currentPlayer;

  // Check small board result
  const smallWinner = checkWinner(newSmall[br][bc]);
  if (smallWinner) {
    newBig[br][bc] = smallWinner;
  } else if (isFull(newSmall[br][bc])) {
    newBig[br][bc] = 'draw';
  }

  // Check big board result
  const bigWinner = checkWinner(newBig);
  const bigFull   = isFull(newBig);

  // Next board: position (r,c) = next board index
  const nb = (newBig[r][c] !== null) ? null : { br: r, bc: c };

  return {
    bigBoard:     newBig,
    smallBoards:  newSmall,
    currentPlayer: currentPlayer === 1 ? 2 : 1,
    nextBoard:    nb,
    winner:       bigWinner,   // 1 | 2 | null
    draw:         !bigWinner && bigFull,
    lastMove:     { br, bc, r, c },
  };
}

/** Returns the winning line cells on bigBoard for a given winner, or null */
export function getWinningLine(bigBoard, winner) {
  const lines = [
    [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
    [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
    [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]],
  ];
  for (const line of lines) {
    if (line.every(([r,c]) => bigBoard[r][c] === winner)) return line;
  }
  return null;
}

export function initialGameState() {
  return {
    bigBoard:      emptyBigBoard(),
    smallBoards:   emptySmallBoards(),
    currentPlayer: 1,
    nextBoard:     null,
    winner:        null,
    draw:          false,
    lastMove:      null,
  };
}
