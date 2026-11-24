import { useState } from "react";
import { PAGE_SIZE } from "../constants.js";
import { useQuestFilters } from "../hooks/useQuestFilters.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { useQuestList } from "../hooks/useQuestList.js";
import FilterBar from "../components/FilterBar.jsx";
import QuestList from "../components/QuestList.jsx";
import Pagination from "../components/Pagination.jsx";
import AddQuestForm from "../components/AddQuestForm.jsx";
import StatusMessage from "../components/StatusMessage.jsx";

export default function Quests() {
  const { filters, page, setFilter, setPage, resetFilters } = useQuestFilters();
  const [showForm, setShowForm] = useState(false); // temporary UI state stays local

  const { search, region, difficulty, status: questStatus, sort } = filters;

  // The search box updates the URL on every letter, the request waits for 400 ms without typing
  const debouncedSearch = useDebouncedValue(search);

  const { status, quests, total, totalPages, page: shownPage, error, retry } = useQuestList({
    search: debouncedSearch,
    region,
    difficulty,
    status: questStatus,
    sort,
    page,
    pageSize: PAGE_SIZE,
  });

  function handleCreated() {
    setShowForm(false);
    resetFilters(); // newest-first, no filters: the new quest is on page 1
    // No manual reload: createQuest.fulfilled marked the lists outdated in the store
  }

  const hasQuests = status === "succeeded" && quests.length > 0;
  const isEmpty = status === "succeeded" && quests.length === 0;

  return (
    <section>
      <div className="toolbar">
        <h2>Open contracts</h2>
        {!showForm && (
          <button type="button" className="btn" onClick={() => setShowForm(true)}>
            Post a quest
          </button>
        )}
      </div>

      {showForm && <AddQuestForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}

      <FilterBar filters={filters} onChange={setFilter} onReset={resetFilters} />

      {status === "succeeded" && (
        <p className="muted result-count">
          {total} {total === 1 ? "quest" : "quests"} found
        </p>
      )}

      {status === "loading" && (
        <StatusMessage variant="loading" title="Loading quests..." text="Checking the guild archive." />
      )}

      {status === "failed" && (
        <StatusMessage
          variant="error"
          title="Could not load quests"
          text={error.message}
          actionLabel="Try again"
          onAction={retry}
        />
      )}

      {isEmpty && (
        <StatusMessage
          variant="empty"
          title="No quests match your filters"
          text="Try a different search or clear the filters."
          actionLabel="Reset filters"
          onAction={resetFilters}
        />
      )}

      {hasQuests && (
        <>
          <QuestList quests={quests} />
          <Pagination page={shownPage} totalPages={totalPages} onChange={setPage} />
        </>
      )}
    </section>
  );
}
