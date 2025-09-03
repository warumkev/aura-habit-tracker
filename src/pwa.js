/**
 * Registers the service worker for Progressive Web App functionality.
 */
export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((reg) => console.log("Service Worker registered:", reg))
        .catch((err) =>
          console.error("Service Worker registration failed:", err)
        );
    });
  }
}
