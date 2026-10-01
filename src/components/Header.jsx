export default function Header({ visibleCount, totalCount }) {
  console.log("[render] Header");

  return (
    <header className="board-header">
      <div className="board-title">
        <span className="board-emblem">⚔</span>
        <div>
          <h1>Quest Board</h1>
          <p className="board-tagline">Track quests. Manage heroes. Claim rewards.</p>
        </div>
      </div>

      <div className="board-count">
        {totalCount === 0 ? (
          <span>The board is empty. Post a quest to get started.</span>
        ) : (
          <span>
            Showing <strong>{visibleCount}</strong> of <strong>{totalCount}</strong> quests
          </span>
        )}
      </div>
    </header>
  );
}
