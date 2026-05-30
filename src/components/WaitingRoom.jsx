import { useI18n } from '../i18n';

const BADGE_CLASS = { classic: 'badge-classic', zrules: 'badge-zrules', steal: 'badge-steal' };

export default function WaitingRoom({ roomCode, variant, onCancel }) {
  const { t } = useI18n();
  return (
    <div className="screen screen-center">
      <div className="menu-content" style={{ textAlign: 'center' }}>
        <div className="game-logo" style={{ marginBottom: 20 }}>Čekanje...</div>
        <p style={{ color: 'var(--user-bar-color)', marginBottom: 8 }}>{t.lobby.waiting}</p>
        <div className="room-code-display">{roomCode}</div>
        {variant && (
          <div className={['mode-badge', BADGE_CLASS[variant] ?? ''].join(' ')} style={{ marginBottom: 12 }}>
            {t.modes['mode_' + variant]}
          </div>
        )}
        <p style={{ fontSize: '0.82rem', color: 'var(--user-bar-color)', marginBottom: 24 }}>
          Podijelite ovaj kod s protivnikom
        </p>
        <button className="menu-btn btn-ghost" onClick={onCancel}>{t.lobby.cancel}</button>
      </div>
    </div>
  );
}
