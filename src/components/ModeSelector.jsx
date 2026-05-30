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

export const GAME_MODES = [
  { id: 'classic', icon: <ClassicIcon />, accentVar: '--mode-classic', labelKey: 'mode_classic', descKey: 'mode_classic_desc' },
  { id: 'zrules',  icon: <ZRulesIcon  />, accentVar: '--mode-zrules',  labelKey: 'mode_zrules',  descKey: 'mode_zrules_desc' },
  { id: 'steal',   icon: <StealIcon   />, accentVar: '--mode-steal',   labelKey: 'mode_steal',   descKey: 'mode_steal_desc' },
];

// Shared rules-variant picker used by both the local menu and the online lobby.
// Pass label={null} to hide the heading.
export default function ModeSelector({ value, onChange, label }) {
  const { t } = useI18n();
  const showLabel = label !== null;
  return (
    <div className="mode-selector">
      {showLabel && <p className="mode-selector-label">{label ?? t.menu.game_mode}</p>}
      <div className="mode-cards">
        {GAME_MODES.map(m => (
          <button
            key={m.id}
            type="button"
            className={['mode-card', value === m.id ? 'mode-card-active' : ''].join(' ')}
            onClick={() => onChange(m.id)}
          >
            <span className="mode-icon" style={{ color: `var(${m.accentVar})` }}>{m.icon}</span>
            <span className="mode-card-text">
              <span className="mode-name">{t.modes[m.labelKey]}</span>
              <span className="mode-desc">{t.modes[m.descKey]}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
