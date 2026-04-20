import Dialog from './Dialog';
import { useI18n } from '../i18n';

export default function RulesDialog({ show, onClose }) {
  const { t } = useI18n();
  return (
    <Dialog show={show} maxWidth={460}>
      <h2 style={{ textAlign: 'center' }}>{t.rules.title}</h2>
      {[t.rules.p1, t.rules.p2, t.rules.p3, t.rules.p4].map((p, i) => (
        <p key={i} style={{ fontSize: '0.92rem', lineHeight: 1.65, margin: '0 0 10px' }}>{p}</p>
      ))}
      <div className="dialog-buttons" style={{ marginTop: 14 }}>
        <button className="btn-primary" onClick={onClose}>{t.rules.close}</button>
      </div>
    </Dialog>
  );
}
