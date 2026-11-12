export default function StatusMessage({ variant, title, text, actionLabel, onAction }) {
  return (
    <div className={`status-message status-${variant}`} role={variant === "error" ? "alert" : "status"}>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {actionLabel && (
        <button type="button" className="btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
