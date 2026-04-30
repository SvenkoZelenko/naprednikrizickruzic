// ── Pure Ultimate Tic-Tac-Toe logic ──────────────────────────────────────────
// Modes:
//   'classic' — won small board is locked, cannot be played
//   'zrules'  — won board stays playable until all 9 cells are filled
//   'steal'   — like zrules, plus you can overwrite opponent's cells (not your own)

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

export function isFull(board) {
  return board.every(row => row.every(v => v !== null));
}

function isBoardClosed(br, bc, smallBoards, bigBoard, mode) {
  if (mode === 'classic') return bigBoard[br][bc] !== null;
  return isFull(smallBoards[br][bc]);
}

function isCellAvailable(val, currentPlayer, mode) {
  if (mode === 'steal') return val !== currentPlayer;
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
  if (!isCellAvailable(cellVal, currentPlayer, mode)) return null;

  const newSmall = smallBoards.map(bRow =>
    bRow.map(b => b.map(row => [...row]))
  );
  const newBig = bigBoard.map(row => [...row]);

  newSmall[br][bc][r][c] = currentPlayer;

  const smallWinner = checkWinner(newSmall[br][bc]);
  if (smallWinner) {
    newBig[br][bc] = smallWinner;
  } else if (isFull(newSmall[br][bc])) {
    newBig[br][bc] = 'draw';
  } else {
    newBig[br][bc] = null;
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
