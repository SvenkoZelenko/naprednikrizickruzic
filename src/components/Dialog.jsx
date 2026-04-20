export default function Dialog({ show, children, maxWidth = 340 }) {
  if (!show) return null;
  return (
    <div className="dialog-overlay">
      <div className="dialog-box" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}
