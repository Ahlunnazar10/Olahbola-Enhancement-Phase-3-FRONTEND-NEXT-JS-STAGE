"use client";

import { useEffect } from "react";

type LazyScriptsProps = {
  adsenseClient: string;
  gtmId: string;
  adsenseDelay?: number;
  gtmDelay?: number;
};

function injectScript(src: string, id?: string) {
  if (id && document.getElementById(id)) return;
  if (document.querySelector(`script[src="${src}"]`)) return;

  const s = document.createElement("script");
  s.src = src;
  if (id) s.id = id;
  s.async = true;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);
}

function scheduleAfterIdleOrDelay(
  src: string,
  id: string | undefined,
  delay: number,
  userTriggered: { triggered: boolean },
  onTrigger: () => void,
) {
  if (typeof window === "undefined") return;

  const tryLoad = () => injectScript(src, id);

  const ric =
    (window as any).requestIdleCallback ||
    ((cb: IdleRequestCallback) =>
      setTimeout(
        () => cb({ didTimeout: false, timeRemaining: () => 50 } as IdleDeadline),
        1,
      ));

  let idleId: number | undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined;

  const start = () => {
    if (userTriggered.triggered) {
      tryLoad();
      return;
    }
    idleId = ric(() => tryLoad());
  };

  timerId = setTimeout(start, delay);

  const events: Array<keyof WindowEventMap> = [
    "scroll",
    "keydown",
    "pointerdown",
    "touchstart",
  ];

  const onUserInteract = () => {
    userTriggered.triggered = true;
    if (timerId) clearTimeout(timerId);
    if (idleId !== undefined && (window as any).cancelIdleCallback) {
      (window as any).cancelIdleCallback(idleId);
    }
    tryLoad();
    events.forEach((ev) => window.removeEventListener(ev, onUserInteract));
    onTrigger();
  };

  events.forEach((ev) =>
    window.addEventListener(ev, onUserInteract, {
      once: true,
      passive: true,
    }),
  );
}

export function LazyScripts({
  adsenseClient,
  gtmId,
  adsenseDelay = 5000,
  gtmDelay = 6500,
}: LazyScriptsProps) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!("IntersectionObserver" in window)) {
      injectScript(
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`,
        "adsbygoogle-script",
      );
      injectScript(
        `https://www.googletagmanager.com/gtm.js?id=${gtmId}`,
        "gtm-script",
      );
      return;
    }

    const adScriptSrc = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`;
    const gtmScriptSrc = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;

    const adTriggered = { triggered: false };
    const gtmTriggered = { triggered: false };

    scheduleAfterIdleOrDelay(
      adScriptSrc,
      "adsbygoogle-script",
      adsenseDelay,
      adTriggered,
      () => {
        adTriggered.triggered = true;
      },
    );
    scheduleAfterIdleOrDelay(
      gtmScriptSrc,
      "gtm-script",
      gtmDelay,
      gtmTriggered,
      () => {
        gtmTriggered.triggered = true;
      },
    );
  }, [adsenseClient, gtmId, adsenseDelay, gtmDelay]);

  return null;
}