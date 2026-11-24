// Tells the user that the data on the screen came from the offline cache
export default function CachedNotice({ cachedAt }) {
  const savedTime = cachedAt
    ? new Date(cachedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : "earlier";

  return (
    <p className="cached-notice" role="status">
      <span aria-hidden="true">📦</span> You are viewing saved data from {savedTime}. It may be out of date and
      will refresh when the connection is back.
    </p>
  );
}
