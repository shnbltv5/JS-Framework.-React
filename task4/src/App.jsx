import { useState, useEffect } from "react";
import {
  getItemsList,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from "./api/fakeApi.js";
import QuestList from "./components/QuestList.jsx";
import QuestDetails from "./components/QuestDetails.jsx";
import QuestForm from "./components/QuestForm.jsx";

// The list only stores the short version of a quest (what the list endpoint
// returns). The full quest is loaded separately when it is selected.
function toSummary(quest) {
  return {
    id: quest.id,
    title: quest.title,
    hero: quest.hero,
    difficulty: quest.difficulty,
    status: quest.status,
  };
}

export default function App() {
  // ---- list state ----
  const [quests, setQuests] = useState([]);
  const [listStatus, setListStatus] = useState("loading"); // loading | error | success
  const [listError, setListError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  // ---- selected quest + its details ----
  const [selectedId, setSelectedId] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsStatus, setDetailsStatus] = useState("idle"); // idle | loading | error | success
  const [detailsError, setDetailsError] = useState("");
  const [detailsAttempt, setDetailsAttempt] = useState(0);

  // ---- forms and actions ----
  const [formMode, setFormMode] = useState(null); // null | { type: "create" } | { type: "edit", id }
  const [pending, setPending] = useState(null); // null | { type, id } — the action currently running
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  // Effect 1: load the quest list on mount and every time "Reload" is pressed.
  useEffect(() => {
    let ignore = false;

    setListStatus("loading");
    setListError("");

    getItemsList()
      .then((result) => {
        if (!ignore) {
          setQuests(result.data);
          setListStatus("success");
        }
      })
      .catch((error) => {
        if (!ignore) {
          setListError(error.message);
          setListStatus("error");
        }
      });

    // Cleanup: if Reload is pressed again (or the component unmounts) the
    // previous request is outdated, so its answer must be ignored.
    return () => {
      ignore = true;
    };
  }, [reloadCount]);

  // Effect 2: load the details of the selected quest.
  // Runs on every selection change (and on "Try again" in the details panel).
  useEffect(() => {
    if (selectedId === null) {
      return;
    }

    let ignore = false;

    setDetails(null);
    setDetailsStatus("loading");
    setDetailsError("");

    getItem(selectedId)
      .then((quest) => {
        if (!ignore) {
          setDetails(quest);
          setDetailsStatus("success");
        }
      })
      .catch((error) => {
        if (!ignore) {
          setDetailsError(error.message);
          setDetailsStatus("error");
        }
      });

    // Cleanup runs BEFORE the next effect and when the component unmounts.
    // Switching to another quest flips `ignore` of the previous request, so a
    // slow response for the old quest can never overwrite the new details.
    return () => {
      ignore = true;
    };
  }, [selectedId, detailsAttempt]);

  // ---- event handlers ----

  function handleSelect(id) {
    setSelectedId(id);
    setFormMode(null);
    setActionError("");
    setNotice("");
  }

  function handleReload() {
    setActionError("");
    setNotice("");
    setReloadCount((count) => count + 1);
  }

  function handleOpenCreate() {
    setFormMode({ type: "create" });
    setActionError("");
    setNotice("");
  }

  function handleOpenEdit(quest) {
    // The id is captured in state at the moment the form is opened.
    setFormMode({ type: "edit", id: quest.id });
    setActionError("");
    setNotice("");
  }

  async function handleCreate(values) {
    setPending({ type: "create", id: null });
    setActionError("");
    setNotice("");

    try {
      const created = await createItem(values);
      setQuests((prev) => [...prev, toSummary(created)]);
      setFormMode(null);
      setNotice(`Quest "${created.title}" was created.`);
    } catch (error) {
      setActionError(`Could not create the quest: ${error.message}`);
    } finally {
      setPending(null);
    }
  }

  async function handleUpdate(id, values) {
    setPending({ type: "edit", id });
    setActionError("");
    setNotice("");

    try {
      const updated = await updateItem(id, values);
      setQuests((prev) => prev.map((q) => (q.id === id ? toSummary(updated) : q)));
      setDetails((prev) => (prev && prev.id === id ? updated : prev));
      setFormMode(null);
      setNotice(`Quest "${updated.title}" was updated.`);
    } catch (error) {
      setActionError(`Could not update the quest: ${error.message}`);
    } finally {
      setPending(null);
    }
  }

  // The "complete" action. The quest is passed in, so its id and title are
  // captured when the click happens. After `await`, this function still
  // works with that captured `id` — not with whatever is selected NOW.
  async function handleComplete(quest) {
    const id = quest.id;
    const title = quest.title;

    setPending({ type: "complete", id });
    setActionError("");
    setNotice("");

    try {
      const updated = await updateItem(id, {
        status: "Completed",
        completedAt: new Date().toISOString(),
      });
      // Update the list row of the quest we started with.
      setQuests((prev) => prev.map((q) => (q.id === id ? toSummary(updated) : q)));
      // Update the open details only if they still belong to that quest.
      setDetails((prev) => (prev && prev.id === id ? updated : prev));
      setNotice(`Quest "${title}" was completed.`);
    } catch (error) {
      setActionError(`Could not complete "${title}": ${error.message}`);
    } finally {
      setPending(null);
    }
  }

  async function handleRemove(quest) {
    const id = quest.id;
    const title = quest.title;

    if (!window.confirm(`Remove the quest "${title}"?`)) {
      return;
    }

    setPending({ type: "remove", id });
    setActionError("");
    setNotice("");

    try {
      await deleteItem(id);
      setQuests((prev) => prev.filter((q) => q.id !== id));
      // Deselect only if the removed quest is still the selected one.
      setSelectedId((prev) => (prev === id ? null : prev));
      setNotice(`Quest "${title}" was removed.`);
    } catch (error) {
      setActionError(`Could not remove "${title}": ${error.message}`);
    } finally {
      setPending(null);
    }
  }

  // Only one action may run at a time: every action button is disabled
  // while `pending` is set (prevents conflicting actions).
  const busy = pending !== null;

  const editing = formMode !== null && formMode.type === "edit";

  return (
    <div className="page">
      <header className="topbar">
        <div className="board-title">
          <span className="board-emblem">⚔</span>
          <div>
            <h1>Quest Board</h1>
            <p className="subtitle">Track quests. Manage heroes. Claim rewards.</p>
          </div>
        </div>
        <div className="toolbar">
          <button
            type="button"
            className="btn"
            onClick={handleReload}
            disabled={busy || listStatus === "loading"}
          >
            {listStatus === "loading" ? "Loading…" : "Reload"}
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={handleOpenCreate}
            disabled={busy || listStatus !== "success"}
          >
            + New quest
          </button>
        </div>
      </header>

      {notice && (
        <div className="banner success" role="status">
          <span>{notice}</span>
          <button type="button" className="banner-close" onClick={() => setNotice("")}>
            ×
          </button>
        </div>
      )}
      {actionError && (
        <div className="banner error" role="alert">
          <span>{actionError}</span>
          <button type="button" className="banner-close" onClick={() => setActionError("")}>
            ×
          </button>
        </div>
      )}

      <main className="layout">
        <section className="panel">
          <h2>Quests{listStatus === "success" ? ` (${quests.length})` : ""}</h2>
          <QuestList
            quests={quests}
            status={listStatus}
            error={listError}
            selectedId={selectedId}
            onSelect={handleSelect}
            onRetry={handleReload}
          />
        </section>

        <section className="panel">
          {formMode && formMode.type === "create" && (
            <QuestForm
              key="create"
              title="New quest"
              submitLabel="Create quest"
              initialValues={null}
              busy={busy}
              saving={pending !== null && pending.type === "create"}
              onSubmit={handleCreate}
              onCancel={() => setFormMode(null)}
            />
          )}

          {editing && details && (
            <QuestForm
              key={`edit-${formMode.id}`}
              title="Edit quest"
              submitLabel="Save changes"
              initialValues={details}
              busy={busy}
              saving={pending !== null && pending.type === "edit"}
              onSubmit={(values) => handleUpdate(formMode.id, values)}
              onCancel={() => setFormMode(null)}
            />
          )}

          {!formMode && (
            <QuestDetails
              status={selectedId === null ? "idle" : detailsStatus}
              error={detailsError}
              quest={details}
              pending={pending}
              onComplete={handleComplete}
              onEdit={handleOpenEdit}
              onRemove={handleRemove}
              onRetry={() => setDetailsAttempt((count) => count + 1)}
            />
          )}
        </section>
      </main>

      <footer className="board-footer">
        <p>Quest Board · React SPA · Fall 2026</p>
      </footer>
    </div>
  );
}
