import { useState } from 'react';
import { useI18n } from '../i18n';
import Leaderboard from './Leaderboard';

export default function OnlineLobby({
  user, onBack, onSignOut,
  onCreateCasual, onCreateRanked, onJoin,
  fetchLeaderboard,
}) {
  const { t } = useI18n();
  const [view, setView]       = useState('menu'); // menu|create|join
  const [createMode, setCreateMode] = useState('casual');
  const [timer, setTimer]     = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [lbPlayers, setLbPlayers] = useState(null);
  const [lbOpen, setLbOpen]   = useState(false);

  async function handleCreate() {
    if (createMode === 'casual') onCreateCasual(timer);
    else onCreateRanked(true);
  }

  async function handleJoin() {
    setJoinError('');
    if (joinCode.trim().length < 4) { setJoinError('Unesite ispravan kod.'); return; }
    const result = await onJoin(joinCode);
    if (result === 'not_found') setJoinError('Soba nije pronađena ili je već popunjena.');
    else if (result === 'self')  setJoinError('Ne možete se pridružiti vlastitoj sobi.');
  }

  async function openLeaderboard() {
    const data = await fetchLeaderboard();
    setLbPlayers(data);
    setLbOpen(true);
  }

  return (
    <div className="screen screen-center">
      <div className="menu-content">
        <div className="game-logo">{t.app_title}</div>

        {/* User bar */}
        <div className="user-bar">
          <span>{user?.displayName || user?.email}</span>
          <button className="btn-ghost btn-sm" onClick={onSignOut}>{t.lobby.sign_out}</button>
        </div>

        {view === 'menu' && (
          <div className="menu-buttons">
            <button className="menu-btn" onClick={() => { setCreateMode('casual'); setView('create'); }}>
              {t.lobby.casual}
            </button>
            <button className="menu-btn" onClick={() => { setCreateMode('ranked'); setView('create'); }}>
              {t.lobby.ranked}
            </button>
            <button className="menu-btn" onClick={() => setView('join')}>{t.lobby.join}</button>
            <button className="menu-btn" onClick={openLeaderboard}>{t.lobby.leaderboard}</button>
            <button className="menu-btn btn-ghost" onClick={onBack}>{t.lobby.back}</button>
          </div>
        )}

        {view === 'create' && (
          <div className="lobby-form">
            <p className="lobby-subtitle">
              {createMode === 'casual' ? t.lobby.casual : t.lobby.ranked}
            </p>
            {createMode === 'casual' && (
              <label className="checkbox-label">
                <input type="checkbox" checked={timer} onChange={e => setTimer(e.target.checked)} />
                {t.lobby.timer_label}
              </label>
            )}
            {createMode === 'ranked' && (
              <p style={{ fontSize: '0.88rem', color: 'var(--user-bar-color)', margin: '0 0 12px' }}>
                Timer uključen &nbsp;·&nbsp; Standardna ploča
              </p>
            )}
            <div className="dialog-buttons">
              <button className="btn-primary" onClick={handleCreate}>{t.lobby.create}</button>
              <button className="btn-secondary" onClick={() => setView('menu')}>{t.lobby.cancel}</button>
            </div>
          </div>
        )}

        {view === 'join' && (
          <div className="lobby-form">
            <p className="lobby-subtitle">{t.lobby.join}</p>
            <label className="field-label">{t.lobby.room_code}</label>
            <input
              className="text-input text-input-code"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder={t.lobby.room_input}
              maxLength={6}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
              autoFocus
            />
            {joinError && <p className="error-text">{joinError}</p>}
            <div className="dialog-buttons">
              <button className="btn-primary" onClick={handleJoin}>{t.lobby.join_btn}</button>
              <button className="btn-secondary" onClick={() => { setView('menu'); setJoinError(''); setJoinCode(''); }}>
                {t.lobby.cancel}
              </button>
            </div>
          </div>
        )}
      </div>

      <Leaderboard show={lbOpen} onClose={() => setLbOpen(false)} players={lbPlayers} />
    </div>
  );
}
