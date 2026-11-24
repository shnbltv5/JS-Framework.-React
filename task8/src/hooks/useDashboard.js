import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllQuests } from "../features/dashboard/dashboardThunks.js";
import { selectDashboard, selectDashboardStats } from "../features/dashboard/dashboardSelectors.js";

/** Statistics for a region ("all" = every region). */
export function useDashboard(region) {
  const dispatch = useDispatch();
  const dashboard = useSelector(selectDashboard);
  const stats = useSelector((state) => selectDashboardStats(state, region));

  useEffect(() => {
    const request = dispatch(fetchAllQuests());
    return () => request.abort();
  }, [dispatch, dashboard.version]);

  function retry() {
    dispatch(fetchAllQuests({ force: true }));
  }

  let status = "loading";
  if (dashboard.status === "failed") status = "failed";
  else if (dashboard.loaded) status = "succeeded"; // old numbers stay visible while reloading

  return { status, stats, error: dashboard.error, retry };
}
