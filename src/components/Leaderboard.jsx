import Dialog from './Dialog';
import { useI18n } from '../i18n';
import { getAllPlayers } from '../game/elo';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ show, onClose, players: propPlayers = null }) {
  const { t } = useI18n();
  const players = propPlayers ?? getAllPlayers();

  const podium = players.slice(0, 3);
  const rest   = players.slice(3);

  // Podium display order: 2nd (index 1), 1st (index 0), 3rd (index 2)
  const podiumOrder = [1, 0, 2].map(i => (i < podium.length ? { player: podium[i], rank: i } : null)).filter(Boolean);

  return (
    <Dialog show={show} maxWidth={440}>
      <h2 style={{ textAlign: 'center' }}>{t.leaderboard.title}</h2>

      {players.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t.leaderboard.empty}</p>
      ) : (
        <>
          {/* Podium for top 3 */}
          {podium.length > 0 && (
            <div className="lb-podium">
              {podiumOrder.map(({ player: p, rank }) => (
                <div key={rank} className={`lb-podium-card lb-podium-rank-${rank + 1}`}>
                  <div className="lb-podium-medal">{MEDALS[rank]}</div>
                  <div className="lb-podium-name">{p.displayName ?? p.name ?? ''}</div>
                  <div className="lb-podium-rating">{p.rating}</div>
                  <div className="lb-podium-wdl">{p.wins ?? 0}W {p.draws ?? 0}D {p.losses ?? 0}L</div>
                </div>
              ))}
            </div>
          )}

          {/* Remaining players table */}
          {rest.length > 0 && (
            <div style={{ overflowY: 'auto', maxHeight: '30vh' }}>
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
                  {rest.map((p, i) => (
                    <tr key={i + 3}>
                      <td className="rank-cell">{i + 4}</td>
                      <td className="name-cell">{p.displayName ?? p.name ?? ''}</td>
                      <td className="rating-cell">{p.rating}</td>
                      <td className="wdl-cell">{p.wins ?? 0} / {p.draws ?? 0} / {p.losses ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Show table for all if no podium displayed (shouldn't happen but safety) */}
          {podium.length === 0 && (
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
                    <tr key={i} className={i < 3 ? `top-${i + 1}` : ''}>
                      <td className="rank-cell">{i + 1}</td>
                      <td className="name-cell">{p.displayName ?? p.name ?? ''}</td>
                      <td className="rating-cell">{p.rating}</td>
                      <td className="wdl-cell">{p.wins ?? 0} / {p.draws ?? 0} / {p.losses ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <div className="dialog-buttons" style={{ marginTop: 16 }}>
        <button className="btn-primary" onClick={onClose}>{t.leaderboard.close}</button>
      </div>
    </Dialog>
  );
}
