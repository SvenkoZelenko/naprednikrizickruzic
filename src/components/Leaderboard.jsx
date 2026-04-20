import Dialog from './Dialog';
import { useI18n } from '../i18n';
import { getAllPlayers } from '../game/elo';

function escHtml(v) {
  return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

export default function Leaderboard({ show, onClose, players: propPlayers = null }) {
  const { t } = useI18n();
  const players = propPlayers ?? getAllPlayers();

  return (
    <Dialog show={show} maxWidth={420}>
      <h2 style={{ textAlign: 'center' }}>{t.leaderboard.title}</h2>
      {players.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--user-bar-color)' }}>{t.leaderboard.empty}</p>
      ) : (
        <div style={{ overflowY: 'auto', maxHeight: '50vh' }}>
          <table className="lb-table">
            <thead>
              <tr>
                <th>{t.leaderboard.rank}</th>
                <th>{t.leaderboard.name}</th>
                <th>{t.leaderboard.rating}</th>
                <th>{t.leaderboard.wdl}</th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={i} className={i < 3 ? `top-${i+1}` : ''}>
                  <td className="rank-cell">{i+1}</td>
                  <td className="name-cell">{escHtml(p.displayName ?? p.name ?? '')}</td>
                  <td className="rating-cell">{p.rating}</td>
                  <td className="wdl-cell">{p.wins ?? 0} / {p.draws ?? 0} / {p.losses ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="dialog-buttons" style={{ marginTop: 16 }}>
        <button className="btn-primary" onClick={onClose}>{t.leaderboard.close}</button>
      </div>
    </Dialog>
  );
}
