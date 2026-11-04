import { useSearchParams } from "react-router";
import { INITIAL_FILTERS, REGIONS, SORT_OPTIONS, STATUS_LABELS } from "../constants.js";

const DIFFICULTIES = ["1", "2", "3", "4", "5"];

// A value from the URL is used only if it is allowed, otherwise the default.
// So "?sort=abc" or "?page=-5" can't break the page.
function allowed(value, options, fallback) {
  return options.includes(value) ? value : fallback;
}

/**
 * Filters, sorting and page live in the URL (?search=&region=&page=...),
 * so they survive refresh, can be shared and work with Back / Forward.
 */
export function useQuestFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    search: searchParams.get("search") ?? INITIAL_FILTERS.search,
    region: allowed(searchParams.get("region"), REGIONS, INITIAL_FILTERS.region),
    difficulty: allowed(searchParams.get("difficulty"), DIFFICULTIES, INITIAL_FILTERS.difficulty),
    status: allowed(searchParams.get("status"), Object.keys(STATUS_LABELS), INITIAL_FILTERS.status),
    sort: allowed(
      searchParams.get("sort"),
      SORT_OPTIONS.map((o) => o.value),
      INITIAL_FILTERS.sort,
    ),
  };
  const page = Math.max(1, Number.parseInt(searchParams.get("page"), 10) || 1);

  // Default values are removed from the URL to keep it short
  function setFilter(name, value) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === "" || value === INITIAL_FILTERS[name]) next.delete(name);
        else next.set(name, value);
        next.delete("page"); // any filter change goes back to the first page
        return next;
      },
      // typing in search should not add a history entry for every letter
      { replace: name === "search" },
    );
  }

  function setPage(newPage) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (newPage === 1) next.delete("page");
      else next.set("page", String(newPage));
      return next;
    });
  }

  function resetFilters() {
    setSearchParams({});
  }

  return { filters, page, setFilter, setPage, resetFilters };
}
