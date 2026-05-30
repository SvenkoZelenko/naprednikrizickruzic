import { useState } from 'react';
import { useI18n } from '../i18n';
import ModeSelector from './ModeSelector';

export default function Menu({ onNewGame, onOnline, onLeaderboard }) {
  const { t } = useI18n();
  const [selectedMode, setSelectedMode] = useState('classic');

  return (
    <div className="screen screen-menu">
      <div className="menu-content menu-content-wide">
        <div className="game-logo">{t.app_title}</div>

        {/* Rules-variant selector */}
        <ModeSelector value={selectedMode} onChange={setSelectedMode} />

        {/* Action buttons */}
        <div className="menu-buttons" style={{ marginTop: 20 }}>
          <button className="menu-btn menu-btn-primary" onClick={() => onNewGame(selectedMode)}>
            {t.menu.new_game}
          </button>
          <button className="menu-btn" onClick={onOnline}>{t.menu.online}</button>
          <button className="menu-btn" onClick={onLeaderboard}>{t.menu.leaderboard}</button>
        </div>
      </div>
    </div>
  );
}
