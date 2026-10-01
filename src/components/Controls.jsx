import { useState } from "react";
import { STATUSES, pickAvatar } from "../data.js";

const EMPTY_FORM = { title: "", hero: "", difficulty: "Easy", reward: "" };

export default function Controls({
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
  reversed,
  onToggleReversed,
  keyMode,
  onKeyModeChange,
  onNewSeason,
  onAddQuest,
}) {
  console.log("[render] Controls");

  // This form's fields are LOCAL state, private to Controls. App never sees
  // a half-typed title — it only learns about a new quest once the form is
  // submitted, via onAddQuest(...).
  const [form, setForm] = useState(EMPTY_FORM);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.hero.trim()) return;

    onAddQuest({
      title: form.title.trim(),
      hero: form.hero.trim(),
      difficulty: form.difficulty,
      reward: Number(form.reward) || 0,
      avatar: pickAvatar(),
      flavor: "A freshly posted quest. No one has written its legend yet.",
    });

    setForm(EMPTY_FORM); // reset this component's own local state
  }

  return (
    <section className="controls">
      <form className="add-quest-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Quest title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
        <input
          type="text"
          placeholder="Hero"
          value={form.hero}
          onChange={(e) => updateField("hero", e.target.value)}
        />
        <select
          value={form.difficulty}
          onChange={(e) => updateField("difficulty", e.target.value)}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <input
          type="number"
          min="0"
          placeholder="Reward"
          value={form.reward}
          onChange={(e) => updateField("reward", e.target.value)}
        />
        <button type="submit" className="btn primary">
          Post Quest
        </button>
      </form>

      <div className="filters-row">
        <label>
          Status
          <select value={filterStatus} onChange={(e) => onFilterChange(e.target.value)}>
            <option value="All">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sort by
          <select value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <option value="default">Board order</option>
            <option value="reward-desc">Reward (high → low)</option>
            <option value="reward-asc">Reward (low → high)</option>
            <option value="difficulty">Difficulty (easy → hard)</option>
            <option value="title">Title (A → Z)</option>
          </select>
        </label>

        <button type="button" className="btn ghost" onClick={onToggleReversed}>
          {reversed ? "Un-reverse list" : "Reverse list"}
        </button>

        <button type="button" className="btn ghost" onClick={onNewSeason}>
          Start New Season
        </button>

        <label className="key-mode-toggle" title="For the defense demo: see how state behaves with each key strategy">
          <input
            type="checkbox"
            checked={keyMode === "index"}
            onChange={(e) => onKeyModeChange(e.target.checked ? "index" : "id")}
          />
          Key by index (bug demo)
        </label>
      </div>
    </section>
  );
}
