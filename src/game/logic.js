// ── Pure Ultimate Tic-Tac-Toe logic ──────────────────────────────────────────
// Modes:
//   'classic' — won small board is locked; its result is final.
//   'zrules'  — a won board stays playable until all 9 cells are filled, but its
//               result is LOCKED to the FIRST 3-in-a-row and never changes.
//               Boards stay open only to allow longer play.
//   'steal'   — like zrules, but a small board's result CAN change: completing
//               your own 3-in-a-row in a board the opponent controls flips the
//               result to you. You still play only on empty cells; existing
//               marks are never overwritten.

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

const WIN_LINES = [
  [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
  [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
  [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]],
];

export function checkWinner(board) {
  for (const [[r0,c0],[r1,c1],[r2,c2]] of WIN_LINES) {
    const v = board[r0][c0];
    if (v && v !== 'draw' && v === board[r1][c1] && v === board[r2][c2]) return v;
  }
  return null;
}

export function isFull(board) {
  return board.every(row => row.every(v => v !== null));
}

function isBoardClosed(br, bc, smallBoards, bigBoard, mode) {
  if (mode === 'classic') return bigBoard[br][bc] !== null;
  return isFull(smallBoards[br][bc]);
}

// A cell can only ever be played on if it is empty — no mode overwrites marks.
function isCellAvailable(val) {
  return val === null;
}

function isGameTerminal(smallBoards, bigBoard, mode) {
  if (mode === 'classic') return isFull(bigBoard);
  for (let br = 0; br < 3; br++)
    for (let bc = 0; bc < 3; bc++)
      if (!isFull(smallBoards[br][bc])) return false;
  return true;
}

export function applyMove(state, br, bc, r, c) {
  const { bigBoard, smallBoards, currentPlayer, nextBoard, mode = 'classic' } = state;

  if (nextBoard && (nextBoard.br !== br || nextBoard.bc !== bc)) return null;
  if (isBoardClosed(br, bc, smallBoards, bigBoard, mode)) return null;
  const cellVal = smallBoards[br][bc][r][c];
  if (!isCellAvailable(cellVal)) return null;

  const newSmall = smallBoards.map(bRow =>
    bRow.map(b => b.map(row => [...row]))
  );
  const newBig = bigBoard.map(row => [...row]);

  newSmall[br][bc][r][c] = currentPlayer;

  // Resolve this small board's result on the big board.
  const cells = newSmall[br][bc];
  if (mode === 'steal') {
    // The result can be STOLEN: if this move completes a 3-in-a-row for the
    // current player, they claim the board — even if the opponent controlled it.
    const justWon = WIN_LINES.some(line =>
      line.some(([lr, lc]) => lr === r && lc === c) &&
      line.every(([lr, lc]) => cells[lr][lc] === currentPlayer)
    );
    if (justWon) {
      newBig[br][bc] = currentPlayer;            // take or steal the board
    } else if (newBig[br][bc] === null && isFull(cells)) {
      newBig[br][bc] = 'draw';
    }
    // Otherwise keep the existing result (opponent's mark, or still open).
  } else {
    // classic & zrules: the FIRST 3-in-a-row locks the result permanently.
    if (newBig[br][bc] === null) {
      const smallWinner = checkWinner(cells);
      if (smallWinner) newBig[br][bc] = smallWinner;
      else if (isFull(cells)) newBig[br][bc] = 'draw';
    }
  }

  const bigWinner = checkWinner(newBig);
  const terminal  = isGameTerminal(newSmall, newBig, mode);
  const targetClosed = isBoardClosed(r, c, newSmall, newBig, mode);
  const nb = targetClosed ? null : { br: r, bc: c };

  return {
    bigBoard:      newBig,
    smallBoards:   newSmall,
    currentPlayer: currentPlayer === 1 ? 2 : 1,
    nextBoard:     nb,
    winner:        bigWinner,
    draw:          !bigWinner && terminal,
    lastMove:      { br, bc, r, c },
    mode,
  };
}

export function getWinningLine(bigBoard, winner) {
  for (const line of WIN_LINES) {
    if (line.every(([r,c]) => bigBoard[r][c] === winner)) return line;
  }
  return null;
}

export function initialGameState(mode = 'classic') {
  return {
    bigBoard:      emptyBigBoard(),
    smallBoards:   emptySmallBoards(),
    currentPlayer: 1,
    nextBoard:     null,
    winner:        null,
    draw:          false,
    lastMove:      null,
    mode,
  };
}
