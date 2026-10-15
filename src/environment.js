// Hypernova's VM sandbox (used by createVM and createGetComponent) only
// exposes a few Node globals. React 19's server renderer calls
// queueMicrotask when it loads and performance.now() while rendering, so
// provide both there. This module must be imported before react-dom/server.
if (typeof queueMicrotask !== "function") {
  globalThis.queueMicrotask = (callback) => {
    Promise.resolve()
      .then(callback)
      .catch((error) =>
        setTimeout(() => {
          throw error;
        })
      );
  };
}

if (typeof performance === "undefined") {
  globalThis.performance = { now: () => Date.now() };
}
