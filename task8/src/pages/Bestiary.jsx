import { Link, useSearchParams } from "react-router";
import { useMonsters } from "../hooks/useMonsters.js";
import Pagination from "../components/Pagination.jsx";
import StatusMessage from "../components/StatusMessage.jsx";
import CachedNotice from "../components/CachedNotice.jsx";

const PAGE_SIZE = 24;

export default function Bestiary() {
  // The search and the page are kept in the URL: /bestiary?q=dragon&page=2
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";
  const page = Number(searchParams.get("page")) || 1;

  // The API returns all 334 names at once: the memoized selector selectFilteredMonsters
  // searches them, the page is cut out here
  const { status, monsters: found, isSavedCopy, savedAt, error, retry } = useMonsters(search);
  const isOffline = error?.kind === "offline";

  const totalPages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = found.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleSearch(e) {
    const value = e.target.value;
    setSearchParams(value ? { q: value } : {}, { replace: true }); // a new search starts on page 1
  }

  function handlePage(nextPage) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
    window.scrollTo(0, 0);
  }

  return (
    <section>
      <div className="toolbar">
        <h2>Bestiary</h2>
        <p className="muted">Monsters from the public D&amp;D 5e API · they stay available offline</p>
      </div>

      <div className="filters">
        <label className="field field-wide">
          Search monsters
          <input type="search" value={search} onChange={handleSearch} placeholder="Dragon, goblin, lich..." />
        </label>
      </div>

      {status === "loading" && <StatusMessage variant="loading" title="Opening the bestiary..." />}

      {status === "failed" && (
        <StatusMessage
          variant="error"
          title={isOffline ? "Not available offline" : "Could not load the bestiary"}
          text={error.message}
          actionLabel="Try again"
          onAction={retry}
        >
          {isOffline && (
            <a className="btn btn-ghost" href="/offline">
              Offline page
            </a>
          )}
        </StatusMessage>
      )}

      {status === "succeeded" && (
        <>
          {isSavedCopy && <CachedNotice cachedAt={savedAt} />}

          <p className="muted result-count">
            {found.length} {found.length === 1 ? "monster" : "monsters"} found
          </p>

          {found.length === 0 ? (
            <StatusMessage variant="empty" title="No monsters found" text="Try another name." />
          ) : (
            <ul className="grid monster-grid">
              {visible.map((monster) => (
                <li key={monster.index}>
                  <Link to={`/bestiary/${monster.index}`} className="card monster-card">
                    <span className="monster-letter" aria-hidden="true">
                      {monster.name[0]}
                    </span>
                    <span className="monster-name">{monster.name}</span>
                    <span className="monster-open" aria-hidden="true">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && <Pagination page={currentPage} totalPages={totalPages} onChange={handlePage} />}
        </>
      )}
    </section>
  );
}
