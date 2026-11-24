// Registers the service worker and tells the app when a new version is ready.
// Only in the production build: in `npm run dev` files change all the time,
// and a cache would show old code.

let userAskedForUpdate = false;

export function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      // updateViaCache: "none" — the browser always checks the server for a new sw.js
      const registration = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });

      // A new version was downloaded earlier and is still waiting
      if (registration.waiting && navigator.serviceWorker.controller) {
        announceUpdate(registration.waiting);
      }

      // A new version is being downloaded right now
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          // "installed" + a controller exists = this is an update, not the first install
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            announceUpdate(worker);
          }
        });
      });

      // The app can stay open for hours: check for a new version every 30 minutes
      setInterval(() => registration.update(), 30 * 60 * 1000);
    } catch (error) {
      console.error("Service worker registration failed", error);
    }
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    // After "Update": the new worker took control -> reload once to use the new files
    if (userAskedForUpdate) window.location.reload();
    // First install: the worker now controls this page, so it can save it for offline use
    else rememberPage(window.location.href);
  });
}

// UpdatePrompt listens for this event and shows the "New version" message
function announceUpdate(worker) {
  window.dispatchEvent(new CustomEvent("sw-update-ready", { detail: worker }));
}

// Called by the "Update" button: the waiting worker activates (skipWaiting in sw.js)
export function activateUpdate(worker) {
  userAskedForUpdate = true;
  worker.postMessage({ type: "SKIP_WAITING" });
}

// Tells the worker which page is open, so it can open offline later
export function rememberPage(url) {
  navigator.serviceWorker?.controller?.postMessage({ type: "PAGE_VISITED", url });
}
