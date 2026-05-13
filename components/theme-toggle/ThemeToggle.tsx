"use client";

import { useUIStore } from "@/stores/uiStore";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
	const { theme, toggleTheme } = useUIStore();

	return (
		<button
			onClick={toggleTheme}
			aria-label={
				theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
			}
			className={`fixed bottom-6 right-6 z-99 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
				theme === "dark"
					? "bg-[#43decc] text-[#003732] hover:bg-[#5ef0e0] hover:scale-110"
					: "bg-[#0f1412] text-[#43decc] hover:bg-[#1c211e] hover:scale-110"
			}`}
			style={{
				boxShadow:
					theme === "dark"
						? "0 0 20px rgba(67, 222, 204, 0.4)"
						: "0 0 20px rgba(0, 0, 0, 0.3)",
			}}
		>
			{theme === "dark" ? (
				<Sun className="size-6" />
			) : (
				<Moon className="size-6" />
			)}
		</button>
	);
}
