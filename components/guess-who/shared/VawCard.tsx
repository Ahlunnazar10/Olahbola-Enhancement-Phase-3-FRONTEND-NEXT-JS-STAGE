"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "panel" | "card" | "active";

export function VawCard({
	children,
	className,
	variant = "panel",
}: {
	children: ReactNode;
	className?: string;
	variant?: Variant;
}) {
	const variantClass =
		variant === "card"
			? "glass-card"
			: variant === "active"
				? "active-glass glass-card"
				: "glass-panel";

	return (
		<div
			className={cn(
				"rounded-3xl",
				variantClass,
				className,
			)}
		>
			{children}
		</div>
	);
}
