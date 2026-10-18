import { useEffect, useState } from "react";
import { getQuests } from "../api/questsApi.js";
import { INITIAL_FILTERS, PAGE_SIZE } from "../constants.js";
import FilterBar from "./FilterBar.jsx";
import QuestList from "./QuestList.jsx";
import Pagination from "./Pagination.jsx";
import AddQuestForm from "./AddQuestForm.jsx";
import StatusMessage from "./StatusMessage.jsx";

export default function QuestBoard({ version, onSelect, onChanged }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  // Request state: loading | success | error
  const [status, setStatus] = useState("loading");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    getQuests({ ...filters, page, pageSize: PAGE_SIZE }, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return; // outdated response
        setResult(data);
        setStatus("success");
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // cancelled by cleanup, not a real error
        setError(err.message);
        setStatus("error");
      });

    // Cleanup runs before the next effect and on unmount: cancel the old request
    return () => controller.abort();
  }, [filters, page, version, retryCount]);

  function handleFilterChange(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1); // any filter change goes back to the first page
  }

  function handleReset() {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  function handleCreated() {
    setShowForm(false);
    handleReset(); // newest-first, no filters: the new quest is on page 1
    onChanged();
  }

  const hasQuests = status === "success" && result.items.length > 0;
  const isEmpty = status === "success" && result.items.length === 0;

  return (
    <main>
      <div className="toolbar">
        <h2>Open contracts</h2>
        {!showForm && (
          <button type="button" className="btn" onClick={() => setShowForm(true)}>
            Post a quest
          </button>
        )}
      </div>

      {showForm && <AddQuestForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />}

      <FilterBar filters={filters} onChange={handleFilterChange} onReset={handleReset} />

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
          text={error}
          actionLabel="Try again"
          onAction={() => setRetryCount((c) => c + 1)}
        />
      )}

      {isEmpty && (
        <StatusMessage
          variant="empty"
          title="No quests match your filters"
          text="Try a different search or clear the filters."
          actionLabel="Reset filters"
          onAction={handleReset}
        />
      )}

      {hasQuests && (
        <>
          <QuestList quests={result.items} onSelect={onSelect} />
          <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} />
        </>
      )}
    </main>
  );
}
