const RETRY_KEY = "rms-rhone:page-download-retry";
const RETRY_WINDOW_MS = 60_000;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  return /failed to fetch dynamically imported module|importing a module script failed|failed to load module script|loading chunk .+ failed/i.test(message);
}

export function recoverChunkLoad(error: unknown): boolean {
  if (typeof window === "undefined" || !isChunkLoadError(error)) return false;
  try {
    const lastRetry = Number(window.sessionStorage.getItem(RETRY_KEY));
    const now = Date.now();
    if (lastRetry && now - lastRetry < RETRY_WINDOW_MS) return false;
    window.sessionStorage.setItem(RETRY_KEY, String(now));
    window.location.reload();
    return true;
  } catch {
    // When storage is unavailable, leave the manual retry visible instead of looping.
    return false;
  }
}

let registered = false;

export function registerChunkRecovery() {
  if (typeof window === "undefined" || registered) return;
  registered = true;
  window.addEventListener("vite:preloadError", (event) => {
    const error = (event as Event & { payload?: unknown }).payload;
    if (recoverChunkLoad(error)) event.preventDefault();
  });
}