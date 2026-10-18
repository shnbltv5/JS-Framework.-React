export default function Header() {
  return (
    <header className="board-header">
      <div className="board-title">
        <span className="board-emblem" aria-hidden="true">⚔</span>
        <div>
          <h1>Quest Board</h1>
          <p className="board-tagline">Browse contracts. Search the archive. Claim rewards.</p>
        </div>
      </div>
    </header>
  );
}
