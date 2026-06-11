export function getLastPathname(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("last_pathname") || null;
}

export function setLastPathname(pathname: string) {
  if (typeof window === "undefined") return;
  // Don't store login, callback, or verify-email paths
  if (pathname === "/login" || pathname.startsWith("/auth/callback")) return;
  if (pathname.startsWith("/verify-email")) return;
  localStorage.setItem("last_pathname", pathname);
}
