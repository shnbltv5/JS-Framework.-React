import { useEffect, useState } from "react";

/**
 * Loads data with the given request function and returns the request state:
 * { status: "loading" | "success" | "error", data, error, retry }
 *
 * `fetcher` must be stable (a module function or wrapped in useCallback).
 * A new fetcher (new filters, new id) starts a new request.
 */
export function useFetch(fetcher) {
  const [status, setStatus] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");
    setError(null);

    fetcher({ signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return; // outdated response
        setData(result);
        setStatus("success");
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // cancelled by cleanup, not a real error
        setError(err);
        setStatus("error");
      });

    // Cleanup runs before the next request and on unmount: cancel the old request
    return () => controller.abort();
  }, [fetcher, retryCount]);

  function retry() {
    setRetryCount((c) => c + 1);
  }

  return { status, data, error, retry };
}
