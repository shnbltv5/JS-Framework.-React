import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMonster, fetchMonsters } from "../features/bestiary/bestiaryThunks.js";
import { selectFilteredMonsters, selectMonster, selectMonsterList } from "../features/bestiary/bestiarySelectors.js";
import { uiStatus } from "../features/shared.js";
import { useOnlineStatus } from "./useOnlineStatus.js";

// Is the user looking at a saved copy? Yes if the service worker answered from its cache,
// or if we are offline and show data that Redux loaded earlier.
function savedCopyInfo(saved, hasData, isOnline) {
  return {
    isSavedCopy: hasData && (saved.fromCache || !isOnline),
    savedAt: saved.fromCache ? saved.cachedAt : saved.loadedAt,
  };
}

// Back online -> load again, so an offline copy or an error is replaced with fresh data
function useReloadWhenOnline(reload) {
  useEffect(() => {
    window.addEventListener("online", reload);
    return () => window.removeEventListener("online", reload);
  }, [reload]);
}

/** All monsters, filtered by the search text. */
export function useMonsters(search) {
  const dispatch = useDispatch();
  const isOnline = useOnlineStatus();
  const list = useSelector(selectMonsterList);
  const monsters = useSelector((state) => selectFilteredMonsters(state, search));

  useEffect(() => {
    const request = dispatch(fetchMonsters());
    return () => request.abort();
  }, [dispatch]);

  // useCallback: the same function between renders, so the "online" listener is not re-added every time
  const retry = useCallback(() => dispatch(fetchMonsters({ force: true })), [dispatch]);
  useReloadWhenOnline(retry);

  return {
    status: uiStatus(list.status),
    monsters,
    ...savedCopyInfo(list, list.items.length > 0, isOnline),
    error: list.error,
    retry,
  };
}

/** One monster by its index from the URL. */
export function useMonster(index) {
  const dispatch = useDispatch();
  const isOnline = useOnlineStatus();
  const monster = useSelector((state) => selectMonster(state, index));

  useEffect(() => {
    const request = dispatch(fetchMonster({ index }));
    return () => request.abort();
  }, [dispatch, index]);

  const retry = useCallback(() => dispatch(fetchMonster({ index, force: true })), [dispatch, index]);
  useReloadWhenOnline(retry);

  return {
    status: uiStatus(monster.status),
    monster: monster.data,
    ...savedCopyInfo(monster, monster.data !== null, isOnline),
    error: monster.error,
    retry,
  };
}
