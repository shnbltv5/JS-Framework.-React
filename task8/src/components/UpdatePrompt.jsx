import { useEffect, useState } from "react";
import { activateUpdate } from "../pwa/registerServiceWorker.js";

// Shown when a new version of the app is installed and waiting.
// "Update now" activates it and the page reloads with the new files.
export default function UpdatePrompt() {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const handleUpdate = (event) => setWaitingWorker(event.detail);
    window.addEventListener("sw-update-ready", handleUpdate);
    return () => window.removeEventListener("sw-update-ready", handleUpdate);
  }, []);

  if (!waitingWorker) return null;

  function handleUpdateClick() {
    setUpdating(true);
    activateUpdate(waitingWorker);
  }

  return (
    <div className="update-prompt" role="alert">
      <p>
        <strong>A new version of Quest Board is available.</strong> Update to get the latest changes.
      </p>
      <div className="update-actions">
        <button type="button" className="btn" onClick={handleUpdateClick} disabled={updating}>
          {updating ? "Updating..." : "Update now"}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setWaitingWorker(null)} disabled={updating}>
          Later
        </button>
      </div>
    </div>
  );
}
