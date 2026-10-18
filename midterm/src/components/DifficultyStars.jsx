export default function DifficultyStars({ level }) {
  return (
    <span className="stars" aria-label={`Difficulty ${level} of 5`}>
      {"★".repeat(level)}
      <span className="stars-empty">{"★".repeat(5 - level)}</span>
    </span>
  );
}
