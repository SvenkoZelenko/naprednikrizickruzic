import { useState } from 'react';
import { useI18n } from '../i18n';

const MODES = [
  {
    id: 'classic',
    //icon: '♟',
    labelKey: 'mode_classic',
    descKey: 'mode_classic_desc',
  },
  {
    id: 'zrules',
    //icon: '⚡',
    labelKey: 'mode_zrules',
    descKey: 'mode_zrules_desc',
  },
  {
    id: 'steal',
    //icon: '🗡',
    labelKey: 'mode_steal',
    descKey: 'mode_steal_desc',
  },
];

export default function Menu({ onNewGame, onOnline, onLeaderboard }) {
  const { t } = useI18n();
  const [selectedMode, setSelectedMode] = useState('classic');

  return (
    <div className="screen screen-menu">
      <div className="menu-content menu-content-wide">
        <div className="game-logo">{t.app_title}</div>

        {/* Mode selector */}
        <div className="mode-selector">
          <p className="mode-selector-label">{t.menu.game_mode}</p>
          <div className="mode-cards">
            {MODES.map(m => (
              <button
                key={m.id}
                className={['mode-card', selectedMode === m.id ? 'mode-card-active' : ''].join(' ')}
                onClick={() => setSelectedMode(m.id)}
              >
                <span className="mode-icon">{m.icon}</span>
                <span className="mode-name">{t.modes[m.labelKey]}</span>
                <span className="mode-desc">{t.modes[m.descKey]}</span>
              </button>
            ))}
          </div>
        </div>

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
