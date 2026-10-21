import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Registers the service worker and surfaces offline / update status.
 */
export default function PwaStatus() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (registration) {
        registration.update().catch(() => {});
      }
    },
  });

  if (!offlineReady && !needRefresh) {
    return null;
  }

  const dismiss = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className="pwa-toast" role="status">
      {offlineReady ? (
        <p>App ready to work offline.</p>
      ) : (
        <p>A new version is available.</p>
      )}
      <div className="pwa-toast-actions">
        {needRefresh ? (
          <button type="button" onClick={() => updateServiceWorker(true)}>
            Reload
          </button>
        ) : null}
        <button type="button" className="pwa-toast-dismiss" onClick={dismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
