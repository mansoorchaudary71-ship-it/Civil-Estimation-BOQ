/**
 * lazyWithRetry — stale-chunk recovery for React.lazy routes on GitHub Pages.
 *
 * ROOT CAUSE (Area 4, 2026-11-21): after a GitHub Pages deploy, a browser
 * holding the previous build's index.html (or a cached entry chunk) requests
 * a lazy chunk by its old content hash (e.g. `ProjectManager-*.js`). The new
 * deploy no longer serves that file, so the dynamic import rejects with
 * `TypeError: Failed to fetch dynamically imported module` and the
 * ErrorBoundary shows "Component Rendering Error". A plain reload fixes it
 * (the fresh index.html references the new hashes) — the live
 * ProjectManager chunk returned HTTP 200 when checked, so this is a
 * stale-deploy artifact, not a missing file or a wrong vite `base`.
 *
 * Two layers, both guarded by a single-reload sessionStorage flag so a
 * genuinely missing chunk can never reload-loop:
 *  1. `registerPreloadErrorHandler()` — listens for Vite's `vite:preloadError`
 *     event (fired by `__vitePreload` when a chunk/preload fails) and reloads
 *     once. Wired in main.tsx so it covers every lazy route, including the
 *     ones declared in App.tsx which this area must not edit.
 *  2. `lazyWithRetry()` — wraps a `React.lazy` dynamic import: retries the
 *     import once (transient network blip), then reloads once if the failure
 *     looks like a chunk-load failure; otherwise rethrows so the
 *     ErrorBoundary still shows for real render bugs. Apply to the lazy()
 *     calls in App.tsx (PENDING — App.tsx is off-limits for Area 4).
 */

const RELOAD_FLAG_KEY = 'cep-chunk-reload-at';
/** Only reload again if the last chunk reload was more than 60 s ago. */
const RELOAD_COOLDOWN_MS = 60_000;

function shouldReloadOnce(): boolean {
  try {
    const raw = sessionStorage.getItem(RELOAD_FLAG_KEY);
    const last = raw ? Number(raw) : NaN;
    if (Number.isFinite(last) && Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_FLAG_KEY, String(Date.now()));
    return true;
  } catch {
    // sessionStorage unavailable (private mode, etc.): reload once anyway —
    // the flag is only a loop guard, and a single extra reload is harmless.
    return true;
  }
}

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('Failed to fetch') ||
    message.includes('Importing a module script failed') ||
    message.includes('Loading chunk') ||
    message.includes('error loading dynamically imported module')
  );
}

/** Reload the page once (guarded) to pick up the fresh build's chunk hashes. */
export function reloadForStaleChunk(): boolean {
  if (!shouldReloadOnce()) return false;
  window.location.reload();
  return true;
}

/**
 * Wrap a dynamic import for React.lazy with one retry + one guarded reload.
 * Usage (App.tsx): `lazy(() => lazyWithRetry(() => import('./components/modules/ProjectManager')))`
 */
export function lazyWithRetry<T>(importFn: () => Promise<T>): Promise<T> {
  return importFn().catch((firstError: unknown) => {
    if (!isChunkLoadError(firstError)) throw firstError;
    // Transient failure (network blip / deploy mid-propagation): retry once.
    return importFn().catch((secondError: unknown) => {
      if (isChunkLoadError(secondError) && reloadForStaleChunk()) {
        // Reload in progress — never resolve so React stays on the fallback
        // instead of flashing the error screen first.
        return new Promise<T>(() => {});
      }
      throw secondError;
    });
  });
}

/**
 * Global safety net: Vite's preload helper dispatches `vite:preloadError`
 * on window when a lazy chunk (or its preloaded deps) fail to load. Reload
 * once so the browser fetches the current build's index.html + chunk hashes.
 * Safe to call once at app startup (main.tsx).
 */
export function registerPreloadErrorHandler(): void {
  window.addEventListener('vite:preloadError', () => {
    reloadForStaleChunk();
  });
}
