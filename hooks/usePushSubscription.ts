"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { endpoints, API_BASE_URL } from "@/lib/api/endpoints";

type PermissionState = NotificationPermission | "unsupported";

function base64urlToUint8Array(b64: string): Uint8Array {
	const pad = "=".repeat((4 - (b64.length % 4)) % 4);
	const b = b64.replace(/-/g, "+").replace(/_/g, "/") + pad;
	const raw = atob(b);
	const out = new Uint8Array(raw.length);
	for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
	return out;
}

const VAPID_KEY =
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
	"BP_I_Vn0nih2gbtgzcC12dGe8qznBPY0b9fBEmjGkUiWIXku6_tT_YDPUNXbsWX3IhrktUSGOz_tcc_2z8EumxQ";

function isPushSupported(): boolean {
	return (
		typeof window !== "undefined" &&
		"serviceWorker" in navigator &&
		"PushManager" in window &&
		"Notification" in window
	);
}

/**
 * Register the SW and subscribe the push manager, then upsert the
 * subscription on the backend. Idempotent — safe to call repeatedly.
 */
async function subscribeOnce(): Promise<void> {
	if (!isPushSupported()) return;

	const reg = await navigator.serviceWorker.register("/sw.js");
	const subscription = await reg.pushManager.subscribe({
		userVisibleOnly: true,
		applicationServerKey: base64urlToUint8Array(VAPID_KEY) as unknown as BufferSource,
	});

	const json = subscription.toJSON();
	const authToken = localStorage.getItem("auth_token");
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Accept: "application/json",
	};
	if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

	// Fire-and-forget backend upsert; a missing row is a soft failure.
	fetch(`${API_BASE_URL}${endpoints.pushSubscribe}`, {
		method: "POST",
		headers,
		credentials: "include",
		mode: "cors",
		body: JSON.stringify({
			endpoint: json.endpoint,
			keys: json.keys,
			expirationTime: json.expirationTime ?? undefined,
		}),
	}).catch(() => {});
}

export function usePushSubscription() {
	const [state, setState] = useState<PermissionState>("unsupported");
	const [registering, setRegistering] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const autoHandled = useRef(false);

	// Determine the initial permission/subscription state.
	useEffect(() => {
		if (typeof window === "undefined") return;
		if (!isPushSupported()) {
			setState("unsupported");
			return;
		}

		navigator.serviceWorker
			.getRegistration()
			.then((reg) => {
				if (!reg) {
					setState(Notification.permission);
					return;
				}
				return reg.pushManager
					.getSubscription()
					.then((sub) => {
						setState(sub ? "granted" : Notification.permission);
					});
			})
			.catch(() => setState(Notification.permission));
	}, []);

	const subscribe = useCallback(async () => {
		setError(null);
		if (!isPushSupported()) {
			setState("unsupported");
			return;
		}

		try {
			setRegistering(true);
			// Trigger the native permission prompt here (only on this button
			// click). If the user denies, subscribe() below will throw
			// NotAllowedError and we fall through to the catch block.
			const perm = await Notification.requestPermission();
			if (perm !== "granted") {
				setRegistering(false);
				setState(perm); // "denied" or "default"
				return;
			}
			await subscribeOnce();
			setRegistering(false);
			setState("granted");
		} catch (e) {
			setRegistering(false);
			const msg = e instanceof Error ? e.message : String(e);
			if (
				msg.toLowerCase().includes("denied") ||
				(e as { name?: string }).name === "NotAllowedError"
			) {
				setState("denied");
			} else {
				setState(Notification.permission);
				setError(msg);
			}
		}
	}, []);

	const unsubscribe = useCallback(async () => {
		try {
			const reg = await navigator.serviceWorker.getRegistration();
			if (reg) {
				const sub = await reg.pushManager.getSubscription();
				if (sub) await sub.unsubscribe();
			}
			// Best-effort backend cleanup.
			await fetch(`${API_BASE_URL}${endpoints.pushUnsubscribe}`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Accept: "application/json" },
				credentials: "include",
				body: JSON.stringify({}),
			}).catch(() => {});
			setState("denied");
		} catch {
			setState(Notification.permission);
		}
	}, []);

	// --- No auto-flow: the native permission prompt only fires on the
	// explicit user click of the "AKTIFKAN SEKARANG" button. If the user
	// had already granted permission in a previous visit, we auto-subscribe
	// silently (no prompt) so the banner straight shows "aktif".
	useEffect(() => {
		if (!isPushSupported() || autoHandled.current) return;
		autoHandled.current = true;

		// Silent subscribe only — never call requestPermission() here.
		// requestPermission() is reserved for the button click.
		if (Notification.permission === "granted") {
			subscribeOnce()
				.then(() => setState("granted"))
				.catch(() => {});
		}
	}, []);

	return { state, registering, error, subscribe, unsubscribe };
}
