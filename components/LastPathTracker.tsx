"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { setLastPathname } from "@/lib/last-path";

export function LastPathTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && pathname !== "/login") {
      setLastPathname(pathname);
    }
  }, [pathname]);

  return null;
}
