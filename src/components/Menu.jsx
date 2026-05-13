import { useState } from 'react';
import { useI18n } from '../i18n';

const ClassicIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M7 1v20M15 1v20M1 7h20M1 15h20"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ZRulesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M5 4h12L5 18h12"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const StealIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2"/>
    <path d="M11 1v4M11 17v4M1 11h4M17 11h4"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const MODES = [
  {
    id: 'classic',
    icon: <ClassicIcon />,
    accentVar: '--mode-classic',
    labelKey: 'mode_classic',
    descKey: 'mode_classic_desc',
  },
  {
    id: 'zrules',
    icon: <ZRulesIcon />,
    accentVar: '--mode-zrules',
    labelKey: 'mode_zrules',
    descKey: 'mode_zrules_desc',
  },
  {
    id: 'steal',
    icon: <StealIcon />,
    accentVar: '--mode-steal',
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
                <span className="mode-icon" style={{ color: `var(${m.accentVar})` }}>
                  {m.icon}
                </span>
                <span className="mode-card-text">
                  <span className="mode-name">{t.modes[m.labelKey]}</span>
                  <span className="mode-desc">{t.modes[m.descKey]}</span>
                </span>
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
