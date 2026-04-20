import Dialog from './Dialog';
import { useI18n } from '../i18n';
import { fmtDelta } from '../game/elo';

export default function GameOverDialog({ show, p1name, p2name, winner, draw, abandoned,
  delta1, delta2, newRating1, newRating2, onNewGame, onMenu }) {
  const { t } = useI18n();
  if (!show) return null;

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
    <Dialog show={show}>
      <h2 style={{ textAlign: 'center' }}>{t.game.game_over}</h2>
      <p style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.05rem', margin: '0 0 6px' }}>
        {headline}
      </p>
      {sub && <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--user-bar-color)', margin: '0 0 18px' }}>{sub}</p>}
      <div className="dialog-buttons">
        <button className="btn-primary" onClick={onNewGame}>{t.game.new_game_btn}</button>
        <button className="btn-secondary" onClick={onMenu}>{t.game.menu_btn}</button>
      </div>
    </Dialog>
  );
}
