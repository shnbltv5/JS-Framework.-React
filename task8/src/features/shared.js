// Helpers used by all slices.

// Loaded data stays fresh for 60 seconds: a new request is not sent during this time
export const CACHE_TTL_MS = 60 * 1000;

export function isFresh(time) {
  return time !== null && time !== undefined && Date.now() - time < CACHE_TTL_MS;
}

// Redux state must be plain data, so an Error object is turned into { message, kind }.
// kind lets the UI choose the text: "Quest not found", "Not available offline", "Try again".
export function toErrorPayload(error) {
  const kinds = { NotFoundError: "not-found", OfflineError: "offline" };
  return { message: error.message, kind: kinds[error.name] ?? "error" };
}

// Before the first request the status is "idle"; for the UI this is the same as "loading"
export function uiStatus(status) {
  return status === "idle" ? "loading" : status;
}
