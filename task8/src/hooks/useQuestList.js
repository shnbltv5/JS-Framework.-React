import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuests, listKey } from "../features/quests/questsThunks.js";
import { selectListState, selectListsVersion, selectVisibleQuests } from "../features/quests/questsSelectors.js";
import { uiStatus } from "../features/shared.js";

/**
 * One page of quests for the given params, from the Redux store.
 * Loads it when the params change or after a mutation made the lists outdated.
 */
export function useQuestList(params) {
  const dispatch = useDispatch();
  const key = listKey(params); // a string: stable between renders while the params are the same

  const list = useSelector((state) => selectListState(state, key));
  const quests = useSelector((state) => selectVisibleQuests(state, key));
  const version = useSelector(selectListsVersion);

  useEffect(() => {
    const request = dispatch(fetchQuests({ params: JSON.parse(key) }));
    // Stale request: new filters or leaving the page cancels the old request
    return () => request.abort();
  }, [dispatch, key, version]);

  function retry() {
    dispatch(fetchQuests({ params: JSON.parse(key), force: true }));
  }

  return {
    status: uiStatus(list.status),
    quests,
    total: list.total,
    totalPages: list.totalPages,
    page: list.page,
    error: list.error,
    retry,
  };
}
