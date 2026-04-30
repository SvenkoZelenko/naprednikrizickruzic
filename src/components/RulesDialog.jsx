import Dialog from './Dialog';
import { useI18n } from '../i18n';

export default function RulesDialog({ show, onClose }) {
  const { t } = useI18n();
  return (
    <Dialog show={show} maxWidth={500}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>{t.rules.title}</h2>

      <div className="rules-section">
        <div className="rules-mode-header badge-classic">♟ {t.modes.mode_classic}</div>
        <p className="rules-p">{t.rules.classic}</p>
      </div>

      <div className="rules-section">
        <div className="rules-mode-header badge-zrules">⚡ {t.modes.mode_zrules}</div>
        <p className="rules-p">{t.rules.zrules}</p>
      </div>

      <div className="rules-section">
        <div className="rules-mode-header badge-steal">🗡 {t.modes.mode_steal}</div>
        <p className="rules-p">{t.rules.steal}</p>
      </div>

      <div className="rules-section" style={{ borderLeft: 'none', paddingLeft: 0 }}>
        <p className="rules-p" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{t.rules.common}</p>
      </div>

      <div className="dialog-buttons" style={{ marginTop: 14 }}>
        <button className="btn-primary" onClick={onClose}>{t.rules.close}</button>
      </div>
    </Dialog>
  );
}
