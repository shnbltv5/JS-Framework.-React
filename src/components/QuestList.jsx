import QuestCard from "./QuestCard.jsx";

export default function QuestList({ quests, season, keyMode, onStatusChange, onRemove }) {
  console.log("[render] QuestList");

  if (quests.length === 0) {
    return <p className="empty-state">No quests match this filter. Try a different one.</p>;
  }

  return (
    <div className="quest-grid">
      {quests.map((quest, index) => {
        // `season` is folded into every key on purpose: bumping it (the
        // "Start New Season" button) changes every key at once, which tells
        // React "these are new components", so it unmounts the old QuestCard
        // instances and mounts fresh ones — an INTENTIONAL full state reset.
        //
        // In "id" mode the rest of the key is the quest's own id, which does
        // NOT change when the list is filtered/sorted/reversed, so React
        // keeps matching each quest to the SAME component instance and its
        // local state (reps, notesOpen) survives.
        //
        // In "index" mode the rest of the key is the item's position in
        // THIS rendered array. Filtering/sorting/reversing changes which
        // quest sits at a given index, so React thinks a different card
        // is now there, and remounts it — wiping its local state. That is
        // the classic "don't use array index as key" bug, made visible here
        // on purpose for the defense.
        const key = keyMode === "id" ? `s${season}-${quest.id}` : `s${season}-idx${index}`;

        return (
          <QuestCard
            key={key}
            quest={quest}
            onStatusChange={onStatusChange}
            onRemove={onRemove}
          />
        );
      })}
    </div>
  );
}
