"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageVisit } from "@/lib/analytics";

export function usePageVisit() {
	const pathname = usePathname();

	useEffect(() => {
		trackPageVisit();
	}, [pathname]);
}
