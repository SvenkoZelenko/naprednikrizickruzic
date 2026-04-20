import { useI18n } from '../i18n';
import { getWinningLine } from '../game/logic';
import { getPlayerRating, fmtDelta } from '../game/elo';

const P_COLOR = { 1: '#dc3545', 2: '#007bff' };
const P_SYM   = { 1: '✕', 2: '○' };

export default function GameBoard({
  gs,             // game state
  p1name, p2name,
  myNumber = null,     // null = local, 1|2 = online (for click gating)
  onMove,         // (br, bc, r, c) => void
  timerEnabled = false,
  timerSecs = 30,
  onReset,
  onBack,
  result = null,  // { delta1, delta2, rating1, rating2 } after game ends
}) {
  const { t } = useI18n();
  if (!gs) return null;

  const { bigBoard, smallBoards, currentPlayer, nextBoard, winner, draw } = gs;
  const winLine = winner ? getWinningLine(bigBoard, winner) : null;

  const r1 = getPlayerRating(p1name);
  const r2 = getPlayerRating(p2name);
  const gameOver = winner || draw;

  function isActiveBoard(br, bc) {
    if (bigBoard[br][bc] !== null) return false;
    if (!nextBoard) return true;
    return nextBoard.br === br && nextBoard.bc === bc;
  }

  function isWinningBoard(br, bc) {
    return winLine?.some(([r,c]) => r === br && c === bc);
  }

  function canClick(br, bc, r, c) {
    if (gameOver) return false;
    if (myNumber !== null && currentPlayer !== myNumber) return false;
    if (!isActiveBoard(br, bc)) return false;
    return smallBoards[br][bc][r][c] === null;
  }

  const locLabel = nextBoard
    ? `${t.game.board} ${nextBoard.br + 1},${nextBoard.bc + 1}`
    : t.game.anywhere;

  let statusText = '', statusColor = '#888';
  if (winner) {
    const wname = winner === 1 ? p1name : p2name;
    statusText  = t.game.wins(wname);
    statusColor = P_COLOR[winner];
  } else if (draw) {
    statusText  = t.game.draw;
    statusColor = '#6c757d';
  } else {
    const curName = currentPlayer === 1 ? p1name : p2name;
    statusText    = t.game.turn(curName, P_SYM[currentPlayer], locLabel);
    statusColor   = P_COLOR[currentPlayer];
  }

  return (
    <div className="game-area">
      {/* Header */}
      <div className="game-header">
        <PlayerCard name={p1name} score={bigBoard.flat().filter(v=>v===1).length}
          rating={r1} active={!gameOver && currentPlayer===1} color="#dc3545" sym="✕"
          delta={result?.delta1} newRating={result?.rating1} />
        <div className="status-center" style={{ color: statusColor }}>{statusText}</div>
        <PlayerCard name={p2name} score={bigBoard.flat().filter(v=>v===2).length}
          rating={r2} active={!gameOver && currentPlayer===2} color="#007bff" sym="○"
          delta={result?.delta2} newRating={result?.rating2} align="right" />
      </div>

      {/* Timer bar */}
      {timerEnabled && !gameOver && (
        <div className="timer-bar">
          <div
            className="timer-fill"
            style={{
              width: `${(timerSecs / 30) * 100}%`,
              background: timerSecs <= 10 ? '#dc3545' : '#007bff',
            }}
          />
          <span className="timer-text" style={{ color: timerSecs <= 10 ? '#dc3545' : 'var(--timer-color)' }}>
            {timerSecs}s
          </span>
        </div>
      )}

      {/* Mega board */}
      <div className="mega-board">
        {[0,1,2].map(br => [0,1,2].map(bc => {
          const boardResult = bigBoard[br][bc];
          const active  = !gameOver && isActiveBoard(br, bc);
          const winning = isWinningBoard(br, bc);
          return (
            <div
              key={`${br}-${bc}`}
              className={[
                'main-board',
                active   ? 'board-active'   : '',
                !active && !gameOver && !winning ? 'board-inactive' : '',
                boardResult ? 'board-resolved' : '',
                winning  ? 'board-winning'  : '',
              ].join(' ')}
            >
              {/* Small 3×3 grid */}
              <div className="small-grid" style={{ opacity: boardResult ? 0.22 : 1 }}>
                {[0,1,2].map(r => [0,1,2].map(c => {
                  const val     = smallBoards[br][bc][r][c];
                  const clickable = canClick(br, bc, r, c);
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={['small-cell', val ? 'small-cell-played' : '', clickable ? 'small-cell-hover' : ''].join(' ')}
                      onClick={() => clickable && onMove(br, bc, r, c)}
                      style={{ cursor: clickable ? 'pointer' : 'default' }}
                    >
                      {val && <span className={val === 1 ? 'sym-x' : 'sym-o'}>{P_SYM[val]}</span>}
                    </div>
                  );
                }))}
              </div>

              {/* Win overlay */}
              {boardResult && (
                <div className="board-overlay">
                  {boardResult === 'draw'
                    ? <span style={{ color: 'var(--user-bar-color)', fontSize: '2.6rem' }}>—</span>
                    : <span className={boardResult === 1 ? 'sym-x' : 'sym-o'} style={{ fontSize: '3rem' }}>
                        {P_SYM[boardResult]}
                      </span>
                  }
                </div>
              )}
            </div>
          );
        }))}
      </div>

      {/* Controls */}
      {(onReset || onBack) && (
        <div className="game-controls">
          {onReset && <button className="ctrl-btn" onClick={onReset}>{t.game.reset}</button>}
          {onBack  && <button className="ctrl-btn ctrl-btn-secondary" onClick={onBack}>{t.game.back}</button>}
        </div>
      )}
    </div>
  );
}

function PlayerCard({ name, score, rating, active, color, sym, delta, newRating, align = 'left' }) {
  return (
    <div className={['player-card', active ? 'player-card-active' : ''].join(' ')}
      style={{ borderColor: active ? color : 'transparent', textAlign: align }}>
      <div className="player-card-name" style={{ color }}>
        <span>{sym}</span> {name}
      </div>
      <div className="player-card-score" style={{ color }}>{score}</div>
      <div className="player-card-rating">
        {delta != null
          ? <><span style={{ color: delta >= 0 ? '#28a745' : '#dc3545' }}>{delta >= 0 ? '+' : ''}{delta}</span> → {newRating}</>
          : `${rating}`
        }
      </div>
    </div>
  );
}
