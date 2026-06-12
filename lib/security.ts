/**
 * Central security config for the client-side guards
 * (right-click, keyboard shortcuts, console overrides).
 *
 * Toggle behavior:
 *   1. Auto mode (default): enabled in production, disabled in development.
 *      The dev tools stay usable on `localhost` / dev servers automatically.
 *
 *   2. Explicit override via env var `NEXT_PUBLIC_SECURITY_BLOCK_DEVTOOLS`:
 *        - "true"   → force ON in every environment
 *        - "false"  → force OFF in every environment
 *        - unset    → fall back to auto mode (prod on, dev off)
 *
 * Set the env var in `.env.local`, `.env.production`, or your hosting
 * dashboard. Restart the dev server after changing it.
 */

export type SecurityGuardMode = "on" | "off";

function readOverride(): SecurityGuardMode | null {
	const raw = process.env.NEXT_PUBLIC_SECURITY_BLOCK_DEVTOOLS;
	if (raw === undefined || raw === null || raw === "") return null;
	const v = String(raw).trim().toLowerCase();
	if (v === "true" || v === "1" || v === "on" || v === "yes") return "on";
	if (v === "false" || v === "0" || v === "off" || v === "no") return "off";
	return null;
}

function isLocalHost(): boolean {
	if (typeof window === "undefined") return false;
	const host = window.location.hostname;
	return (
		host === "localhost" ||
		host === "127.0.0.1" ||
		host === "0.0.0.0" ||
		host.endsWith(".localhost")
	);
}

/**
 * Returns whether the dev-tools block should be active in the current
 * environment. Reads `NEXT_PUBLIC_SECURITY_BLOCK_DEVTOOLS` for an explicit
 * override; otherwise defaults to ON in production and OFF on local hosts.
 */
export function shouldBlockDevTools(): boolean {
	const override = readOverride();
	if (override === "on") return true;
	if (override === "off") return false;

	// Auto mode: NODE_ENV is replaced at build time. If somehow undefined
	// at runtime (e.g. running the prod build on a machine where we can't
	// tell), fall back to "off" rather than blocking legitimate dev work.
	const isProd = process.env.NODE_ENV === "production";
	if (!isProd) return false;

	// Final safety net: if for some reason the prod build is being served
	// from a local hostname, treat it as local (don't block).
	if (isLocalHost()) return false;

	return true;
}
