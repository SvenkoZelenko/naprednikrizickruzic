import { useI18n } from '../i18n';

export default function Menu({ onNewGame, onOnline, onLeaderboard }) {
  const { t, lang, toggle: toggleLang } = useI18n();

  return (
    <div className="screen screen-menu">
      <div className="menu-content">
        <div className="game-logo">{t.app_title}</div>
        <div className="menu-buttons">
          <button className="menu-btn" onClick={onNewGame}>{t.menu.new_game}</button>
          <button className="menu-btn" onClick={onOnline}>{t.menu.online}</button>
          <button className="menu-btn" onClick={onLeaderboard}>{t.menu.leaderboard}</button>
        </div>
      </div>
    </div>
  );
}
