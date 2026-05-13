import { useMemo } from 'react';
import { useI18n } from '../i18n';
import { fmtDelta } from '../game/elo';

const CONFETTI_COLORS = ['#a855f7', '#f43f5e', '#fbbf24', '#34d399', '#60a5fa', '#f97316'];

function Confetti({ show }) {
  const pieces = useMemo(() => Array.from({ length: 30 }, (_, i) => ({
    id:       i,
    left:     `${5 + Math.random() * 90}%`,
    delay:    `${Math.random() * 0.6}s`,
    duration: `${0.9 + Math.random() * 0.8}s`,
    color:    CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size:     `${6 + Math.random() * 8}px`,
    rotation: `${Math.random() * 720 - 360}deg`,
  })), []);

  if (!show) return null;

  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left:       p.left,
            width:      p.size,
            height:     p.size,
            background: p.color,
            '--cdur':   p.duration,
            '--cdelay': p.delay,
            '--crot':   p.rotation,
          }}
        />
      ))}
    </div>
  );
}

export default function GameOverDialog({ show, p1name, p2name, winner, draw, abandoned,
  delta1, delta2, newRating1, newRating2, onNewGame, onMenu }) {
  const { t } = useI18n();
  if (!show) return null;

  const showConfetti = !!winner && !draw && !abandoned;

  let headline = '', sub = '';
  if (abandoned) {
    headline = 'Protivnik je napustio igru. Pobjeda!';
  } else if (draw) {
    headline = t.game.draw;
  } else if (winner) {
    const wname = winner === 1 ? p1name : p2name;
    headline = t.game.wins(wname);
  }

  if (delta1 != null && delta2 != null && !abandoned) {
    sub = t.game.rating_line(
      p1name, fmtDelta(delta1), newRating1 ?? '?',
      p2name, fmtDelta(delta2), newRating2 ?? '?'
    );
  }

  return (
    <div className="dialog-overlay">
      <Confetti show={showConfetti} />

      <div className="dialog-box" style={{ maxWidth: 340 }}>
        <h2 style={{
          textAlign: 'center',
          fontFamily: "'Syne', system-ui, sans-serif",
          fontWeight: 800,
        }}>
          {t.game.game_over}
        </h2>

        {/* Big symbol or emoji */}
        {showConfetti && (
          <div style={{
            textAlign: 'center',
            fontSize: '2.8rem',
            lineHeight: 1,
            marginBottom: 10,
            color: winner === 1 ? 'var(--red)' : 'var(--blue)',
            animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            {winner === 1 ? '✕' : '○'}
          </div>
        )}
        {draw && (
          <div style={{ textAlign: 'center', fontSize: '2.2rem', marginBottom: 10 }}>🤝</div>
        )}

        <p style={{
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '1.05rem',
          margin: '0 0 6px',
          ...(showConfetti ? {
            background: 'var(--grad-brand)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          } : {}),
        }}>
          {headline}
        </p>

        {sub && (
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 18px' }}>
            {sub}
          </p>
        )}

        <div className="dialog-buttons">
          <button className="btn-primary" onClick={onNewGame}>{t.game.new_game_btn}</button>
          <button className="btn-secondary" onClick={onMenu}>{t.game.menu_btn}</button>
        </div>
      </div>
    </div>
  );
}
