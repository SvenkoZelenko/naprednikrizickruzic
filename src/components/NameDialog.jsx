import { useState } from 'react';
import Dialog from './Dialog';
import { useI18n } from '../i18n';

export default function NameDialog({ show, onStart, onCancel, defaultP1 = '', defaultP2 = '' }) {
  const { t } = useI18n();
  const [p1, setP1] = useState(defaultP1);
  const [p2, setP2] = useState(defaultP2);
  const [timer, setTimer] = useState(false);

  function handleStart() {
    if (!p1.trim() || !p2.trim()) return;
    onStart({ p1: p1.trim(), p2: p2.trim(), timer });
  }

  return (
    <Dialog show={show}>
      <h2>{t.game.new_game_title}</h2>

      <label className="field-label">{t.game.player1} <span className="sym-x">✕</span></label>
      <input className="text-input" value={p1} onChange={e => setP1(e.target.value)}
        placeholder={t.game.player1} autoFocus />

      <label className="field-label">{t.game.player2} <span className="sym-o">○</span></label>
      <input className="text-input" value={p2} onChange={e => setP2(e.target.value)}
        placeholder={t.game.player2}
        onKeyDown={e => e.key === 'Enter' && handleStart()} />

      <label className="checkbox-label">
        <input type="checkbox" checked={timer} onChange={e => setTimer(e.target.checked)} />
        {t.game.timer}
      </label>

      <div className="dialog-buttons">
        <button className="btn-primary" onClick={handleStart}>{t.game.start}</button>
        <button className="btn-secondary" onClick={onCancel}>{t.game.cancel}</button>
      </div>
    </Dialog>
  );
}
