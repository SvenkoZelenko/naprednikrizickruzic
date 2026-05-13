import { useI18n } from '../i18n';
import { getWinningLine } from '../game/logic';
import { getPlayerRating, fmtDelta } from '../game/elo';

const P_COLOR = { 1: '#e02020', 2: '#2060e8' };
const P_SYM   = { 1: '✕', 2: '○' };

export default function GameBoard({
  gs,
  p1name, p2name,
  myNumber = null,
  onMove,
  timerEnabled = false,
  timerSecs = 30,
  onReset,
  onBack,
  result = null,
}) {
  const { t } = useI18n();
  if (!gs) return null;

  const { bigBoard, smallBoards, currentPlayer, nextBoard, winner, draw, mode = 'classic' } = gs;
  const winLine  = winner ? getWinningLine(bigBoard, winner) : null;
  const r1       = getPlayerRating(p1name);
  const r2       = getPlayerRating(p2name);
  const gameOver = winner || draw;

  // ── Board / cell logic per mode ──────────────────────────────────────────
  function isBoardClosed(br, bc) {
    if (mode === 'classic') return bigBoard[br][bc] !== null;
    return smallBoards[br][bc].every(row => row.every(v => v !== null));
  }

  function isActiveBoardPos(br, bc) {
    if (isBoardClosed(br, bc)) return false;
    if (!nextBoard) return true;
    return nextBoard.br === br && nextBoard.bc === bc;
  }

  function canClick(br, bc, r, c) {
    if (gameOver) return false;
    if (myNumber !== null && currentPlayer !== myNumber) return false;
    if (!isActiveBoardPos(br, bc)) return false;
    const val = smallBoards[br][bc][r][c];
    if (mode === 'steal') return val !== currentPlayer;
    return val === null;
  }

  function isWinningBoard(br, bc) {
    return winLine?.some(([r, c]) => r === br && c === bc);
  }

  // ── Status text ──────────────────────────────────────────────────────────
  const locLabel = nextBoard
    ? `${t.game.board} ${nextBoard.br + 1},${nextBoard.bc + 1}`
    : t.game.anywhere;

  let statusText = '', statusColor = '#888';
  if (winner) {
    statusText  = t.game.wins(winner === 1 ? p1name : p2name);
    statusColor = P_COLOR[winner];
  } else if (draw) {
    statusText  = t.game.draw;
    statusColor = '#6c757d';
  } else {
    statusText  = t.game.turn(currentPlayer === 1 ? p1name : p2name, P_SYM[currentPlayer], locLabel);
    statusColor = P_COLOR[currentPlayer];
  }

  const p1score = bigBoard.flat().filter(v => v === 1).length;
  const p2score = bigBoard.flat().filter(v => v === 2).length;

  const modeBadgeClass = { classic: 'badge-classic', zrules: 'badge-zrules', steal: 'badge-steal' }[mode] ?? '';
  const modeLabel = t.modes?.['mode_' + mode] ?? mode;

  return (
    <div className="game-area">
      {/* Header */}
      <div className="game-header">
        <PlayerCard name={p1name} score={p1score} rating={r1}
          active={!gameOver && currentPlayer === 1} playerNum={1} color={P_COLOR[1]} sym="✕"
          delta={result?.delta1} newRating={result?.rating1} />

        <div className="status-center-col">
          <div className={['mode-badge', modeBadgeClass].join(' ')}>{modeLabel}</div>
          <div className="status-text" style={{ color: statusColor }}>{statusText}</div>
        </div>

        <PlayerCard name={p2name} score={p2score} rating={r2}
          active={!gameOver && currentPlayer === 2} playerNum={2} color={P_COLOR[2]} sym="○"
          delta={result?.delta2} newRating={result?.rating2} align="right" />
      </div>

      {/* Timer bar */}
      {timerEnabled && !gameOver && (
        <div className="timer-bar">
          <span className="timer-text">{timerSecs}s</span>
          <div className="timer-track">
            <div
              className={['timer-fill', timerSecs <= 8 ? 'timer-fill-urgent' : ''].join(' ')}
              style={{ width: `${(timerSecs / 30) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Mega board */}
      <div className="mega-board">
        {[0, 1, 2].map(br => [0, 1, 2].map(bc => {
          const boardResult = bigBoard[br][bc];
          const active  = !gameOver && isActiveBoardPos(br, bc);
          const closed  = isBoardClosed(br, bc);
          const winning = isWinningBoard(br, bc);

          return (
            <div
              key={`${br}-${bc}`}
              className={[
                'main-board',
                active  ? (currentPlayer === 1 ? 'board-active-p1' : 'board-active-p2') : '',
                closed  ? 'board-resolved' : '',
                winning ? 'board-winning'  : '',
              ].join(' ')}
            >
              <div className="small-grid">
                {[0, 1, 2].map(r => [0, 1, 2].map(c => {
                  const val = smallBoards[br][bc][r][c];
                  const clickable = canClick(br, bc, r, c);
                  const dimGrid = closed && !winning;

                  return (
                    <div
                      key={`${r}-${c}`}
                      className={[
                        'small-cell',
                        val ? 'small-cell-played' : '',
                        clickable ? 'small-cell-hover' : '',
                        dimGrid ? 'small-cell-dim' : '',
                      ].join(' ')}
                      onClick={() => clickable && onMove(br, bc, r, c)}
                      style={{ cursor: clickable ? 'pointer' : 'default' }}
                    >
                      {val && (
                        <span
                          key={`placed-${val}`}
                          className={[val === 1 ? 'sym-x' : 'sym-o', 'cell-placed'].join(' ')}
                        >
                          {P_SYM[val]}
                        </span>
                      )}
                      {mode === 'steal' && !gameOver && active && val && val !== currentPlayer && (
                        <span className="steal-indicator" />
                      )}
                    </div>
                  );
                }))}
              </div>

              {boardResult && (mode === 'classic' || closed) && (
                <div className="board-overlay">
                  {boardResult === 'draw'
                    ? <span style={{ color: 'var(--text-muted)', fontSize: '2.6rem' }}>—</span>
                    : <span className={boardResult === 1 ? 'sym-x' : 'sym-o'}>
                        {P_SYM[boardResult]}
                      </span>
                  }
                </div>
              )}

              {boardResult && mode !== 'classic' && !closed && (
                <div className={['corner-badge', boardResult === 1 ? 'sym-x' : boardResult === 2 ? 'sym-o' : ''].join(' ')}>
                  {boardResult !== 'draw' ? P_SYM[boardResult] : '—'}
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

function PlayerCard({ name, score, rating, active, playerNum, color, sym, delta, newRating, align = 'left' }) {
  const activeClass = active
    ? playerNum === 1 ? 'player-card-active player-card-active-p1' : 'player-card-active player-card-active-p2'
    : '';
  return (
    <div
      className={['player-card', activeClass].join(' ')}
      style={{ borderColor: active ? color : 'transparent', textAlign: align }}
    >
      <div className="player-card-name" style={{ color }}>
        <span>{sym}</span> {name}
      </div>
      <div className="player-card-score" style={{ color }}>{score}</div>
      <div className="player-card-rating">
        {delta != null
          ? <><span style={{ color: delta >= 0 ? '#16a34a' : 'var(--red)' }}>{delta >= 0 ? '+' : ''}{delta}</span> → {newRating}</>
          : `${rating}`}
      </div>
    </div>
  );
}
