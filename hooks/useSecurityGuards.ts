"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { shouldBlockDevTools, isOnGameRoute } from "@/lib/security";

/**
 * Single entry point that activates the client-side security guards
 * (right-click, keyboard shortcuts, console overrides) only when the
 * central config says we should — production by default, dev/local off —
 * AND the current page is a game route.
 *
 * Mount this once near the root of the app (e.g. inside Providers).
 */
export function useSecurityGuards() {
	const pathname = usePathname();
	const enabled = shouldBlockDevTools() && isOnGameRoute(pathname);

	useEffect(() => {
		if (!enabled) return;

		// 1) Block DevTools / view-source keyboard shortcuts
		const blockedKeys = new Set(["F12", "F11"]);

		const onKeyDown = (e: KeyboardEvent) => {
			const key = e.key;

			if (blockedKeys.has(key)) {
				e.preventDefault();
				e.stopPropagation();
				return;
			}

			if (e.ctrlKey && e.shiftKey) {
				const k = key.toUpperCase();
				if (k === "I" || k === "J" || k === "C" || k === "K" || k === "S") {
					e.preventDefault();
					e.stopPropagation();
					return;
				}
			}

			if (e.ctrlKey && key.toUpperCase() === "U") {
				e.preventDefault();
				e.stopPropagation();
				return;
			}

			if (e.ctrlKey && key.toUpperCase() === "P") {
				e.preventDefault();
				e.stopPropagation();
				return;
			}

			if (e.ctrlKey && key.toUpperCase() === "S") {
				e.preventDefault();
				e.stopPropagation();
				return;
			}
		};

		// 2) Disable right-click on document and window (defense in depth)
		const onContextMenu = (e: MouseEvent) => {
			e.preventDefault();
		};

		// 3) Block copy/cut/drag outside of form inputs
		const isEditable = (el: HTMLElement) => {
			const tag = el.tagName;
			if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
			if (el.isContentEditable) return true;
			return false;
		};
		const onCopy = (e: ClipboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (target && isEditable(target)) return;
			e.preventDefault();
		};
		const onCut = (e: ClipboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (target && isEditable(target)) return;
			e.preventDefault();
		};
		const onDragStart = (e: DragEvent) => {
			const target = e.target as HTMLElement | null;
			if (target && isEditable(target)) return;
			e.preventDefault();
		};

		// 4) Override console methods to no-op
		const noop = () => {};
		const consoleMethods: Array<keyof Console> = [
			"log",
			"info",
			"warn",
			"error",
			"debug",
			"table",
			"group",
			"groupCollapsed",
			"groupEnd",
			"time",
			"timeEnd",
			"timeLog",
			"trace",
			"assert",
			"count",
			"countReset",
			"dir",
			"dirxml",
			"profile",
			"profileEnd",
		];
		const originalMethods: Partial<Record<keyof Console, (...args: unknown[]) => void>> = {};
		for (const m of consoleMethods) {
			originalMethods[m] = console[m] as (...args: unknown[]) => void;
			try {
				(console as unknown as Record<string, unknown>)[m] = noop;
			} catch {
				// some methods are read-only; ignore
			}
		}

		document.addEventListener("keydown", onKeyDown, { capture: true });
		document.addEventListener("contextmenu", onContextMenu);
		document.addEventListener("copy", onCopy);
		document.addEventListener("cut", onCut);
		document.addEventListener("dragstart", onDragStart);
		window.addEventListener("contextmenu", onContextMenu);

		return () => {
			document.removeEventListener("keydown", onKeyDown, { capture: true });
			document.removeEventListener("contextmenu", onContextMenu);
			document.removeEventListener("copy", onCopy);
			document.removeEventListener("cut", onCut);
			document.removeEventListener("dragstart", onDragStart);
			window.removeEventListener("contextmenu", onContextMenu);

			// Restore console methods on unmount
			for (const m of consoleMethods) {
				const original = originalMethods[m];
				if (original) {
					try {
						(console as unknown as Record<string, unknown>)[m] =
							original.bind(console);
					} catch {
						// ignore
					}
				}
			}
		};
	}, [enabled, pathname]);
}
