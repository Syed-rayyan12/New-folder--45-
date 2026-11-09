/** The connected API is available only in this machine's local frontend. */
export function usesLocalBackend() {
  return typeof window!=='undefined'&&['localhost','127.0.0.1','[::1]'].includes(window.location.hostname)
}
