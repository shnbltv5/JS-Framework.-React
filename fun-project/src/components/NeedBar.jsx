// A rounded progress bar for fullness / happiness
export default function NeedBar({ label, icon, value, tone }) {
  const rounded = Math.round(value);
  return (
    <div className={`need need-${tone} ${rounded < 30 ? "is-low" : ""}`}>
      <span className="need-label">
        <span aria-hidden="true">{icon}</span> {label}
      </span>
      <div className="need-track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={rounded}>
        <div className="need-fill" style={{ width: `${rounded}%` }} />
      </div>
      <span className="need-value">{rounded}%</span>
    </div>
  );
}
