// A small in-memory cache for server data (no library).
// It lives in JavaScript memory, so it is cleared when the page is reloaded.
//
// Every entry is stored under a query key, for example ["quests", "detail", "12"].
// An entry looks like: { key, data, updatedAt, promise }
//   data      — the last successful response
//   updatedAt — when it was saved (used for TTL)
//   promise   — the request that is running right now (or null)

const DEFAULT_TTL_MS = 60 * 1000; // cached data is fresh for 60 seconds

const cache = new Map();

function log(type, id) {
  console.info(`[cache] ${type} ${id}`);
}

function isFresh(entry, ttl) {
  return entry.updatedAt !== null && Date.now() - entry.updatedAt < ttl;
}

// The request itself is shared by everyone who asks for the same key,
// so one screen leaving must not cancel it. Each caller gets its own
// promise that rejects with AbortError when that caller's signal aborts.
function withSignal(promise, signal) {
  if (!signal) return promise;
  return new Promise((resolve, reject) => {
    const abort = () => reject(new DOMException("Request aborted", "AbortError"));
    if (signal.aborted) {
      abort();
      return;
    }
    signal.addEventListener("abort", abort, { once: true });
    promise.then(resolve, reject).finally(() => signal.removeEventListener("abort", abort));
  });
}

/**
 * Returns cached data for `key` if it is still fresh (cache hit),
 * otherwise calls `queryFn` and saves the result (cache miss).
 */
export function cachedQuery(key, queryFn, { signal, ttl = DEFAULT_TTL_MS } = {}) {
  const id = JSON.stringify(key);
  const entry = cache.get(id);

  // 1. Cache hit: fresh data, no request at all
  if (entry && entry.data !== undefined && isFresh(entry, ttl)) {
    log("HIT", id);
    return withSignal(Promise.resolve(entry.data), signal);
  }

  // 2. The same request is already running: reuse it instead of sending a second one
  if (entry && entry.promise) {
    log("WAIT", id);
    return withSignal(entry.promise, signal);
  }

  // 3. Cache miss (or the data is older than the TTL): send a new request
  log(entry ? "STALE" : "MISS", id);
  const promise = queryFn()
    .then((data) => {
      // Save only if this entry was not invalidated while we were waiting
      if (cache.get(id)?.promise === promise) {
        cache.set(id, { key, data, updatedAt: Date.now(), promise: null });
      }
      return data;
    })
    .catch((error) => {
      // A failed request is never kept in the cache: the next call tries again
      if (cache.get(id)?.promise === promise) cache.delete(id);
      throw error;
    });

  cache.set(id, { key, data: undefined, updatedAt: null, promise });
  return withSignal(promise, signal);
}

/**
 * Removes every entry whose key starts with `prefix`.
 * invalidateQueries(["quests"]) clears all lists, details and the dashboard data.
 */
export function invalidateQueries(prefix) {
  for (const [id, entry] of cache) {
    if (prefix.every((part, i) => entry.key[i] === part)) {
      cache.delete(id);
      log("INVALIDATE", id);
    }
  }
}
