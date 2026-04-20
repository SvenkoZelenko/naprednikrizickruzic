import { useI18n } from '../i18n';

export default function AuthScreen({ onSignIn, onCancel, loading, error }) {
  const { t } = useI18n();
  return (
    <div className="screen screen-center">
      <div className="menu-content">
        <div className="game-logo">{t.app_title}</div>
        <p className="auth-message">{loading ? t.auth.loading : (error ?? t.auth.message)}</p>
        <div className="menu-buttons">
          <button className="menu-btn" onClick={onSignIn} disabled={loading}>
            {t.auth.sign_in}
          </button>
          <button className="menu-btn btn-ghost" onClick={onCancel} disabled={loading}>
            {t.auth.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}
