import { useCallback, useState } from "react";
import { getQuests } from "../services/service.js";
import { PAGE_SIZE } from "../constants.js";
import { useFetch } from "../hooks/useFetch.js";
import { useQuestFilters } from "../hooks/useQuestFilters.js";
import FilterBar from "../components/FilterBar.jsx";
import QuestList from "../components/QuestList.jsx";
import Pagination from "../components/Pagination.jsx";
import AddQuestForm from "../components/AddQuestForm.jsx";
import StatusMessage from "../components/StatusMessage.jsx";

export default function Quests() {
  const { filters, page, setFilter, setPage, resetFilters } = useQuestFilters();
  const [showForm, setShowForm] = useState(false);

  const { search, region, difficulty, status: questStatus, sort } = filters;

  // A new request function is created only when a filter or the page changes,
  // and only then useFetch sends a new request.
  const fetchQuests = useCallback(
    ({ signal }) =>
      getQuests({ search, region, difficulty, status: questStatus, sort, page, pageSize: PAGE_SIZE }, { signal }),
    [search, region, difficulty, questStatus, sort, page],
  );
  const { status, data: result, error, retry } = useFetch(fetchQuests);

  function handleCreated() {
    setShowForm(false);
    resetFilters(); // newest-first, no filters: the new quest is on page 1
    retry(); // load the list again even if the URL was already empty
  }

  const hasQuests = status === "success" && result.items.length > 0;
  const isEmpty = status === "success" && result.items.length === 0;

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

      {status === "success" && (
        <p className="muted result-count">
          {result.total} {result.total === 1 ? "quest" : "quests"} found
        </p>
      )}

      {status === "loading" && (
        <StatusMessage variant="loading" title="Loading quests..." text="Checking the guild archive." />
      )}

      {status === "error" && (
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
          <QuestList quests={result.items} />
          <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} />
        </>
      )}
    </section>
  );
}
