import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchQuestById } from "../features/quests/questsThunks.js";
import { selectDetailsState, selectQuestById } from "../features/quests/questsSelectors.js";
import { uiStatus } from "../features/shared.js";

/** One quest by id (string from the URL). Opens at once if the quest is already in the store. */
export function useQuest(id) {
  const dispatch = useDispatch();
  const quest = useSelector((state) => selectQuestById(state, id));
  const details = useSelector((state) => selectDetailsState(state, id));

  useEffect(() => {
    const request = dispatch(fetchQuestById({ id }));
    return () => request.abort();
  }, [dispatch, id]);

  function retry() {
    dispatch(fetchQuestById({ id, force: true }));
  }

  // A quest in the store is shown even while a newer copy is loading
  const status = quest ? "succeeded" : uiStatus(details.status);
  return { status, quest, error: details.error, retry };
}
