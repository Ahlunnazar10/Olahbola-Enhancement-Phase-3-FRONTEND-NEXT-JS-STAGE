import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, locale = "id-ID"): string {
	return new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(new Date(date));
}

export function formatDateTime(date: string | Date, locale = "id-ID"): string {
	return new Intl.DateTimeFormat(locale, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	}).format(new Date(date));
}

export function formatRelativeTime(
	date: string | Date,
	locale = "id-ID",
): string {
	const now = new Date();
	const target = new Date(date);
	const diffInSeconds = Math.floor((now.getTime() - target.getTime()) / 1000);

	if (diffInSeconds < 60) {
		return "baru saja";
	}

	const diffInMinutes = Math.floor(diffInSeconds / 60);
	if (diffInMinutes < 60) {
		return `${diffInMinutes} menit yang lalu`;
	}

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) {
		return `${diffInHours} jam yang lalu`;
	}

	const diffInDays = Math.floor(diffInHours / 24);
	if (diffInDays < 7) {
		return `${diffInDays} hari yang lalu`;
	}

	return formatDate(date, locale);
}

export function truncate(str: string, length: number): string {
	if (str.length <= length) return str;
	return str.slice(0, length) + "...";
}

export function slugify(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
	func: T,
	wait: number,
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
}

export function generateId(): string {
	return Math.random().toString(36).substring(2, 15);
}

export function getImageUrl(path: string | null | undefined): string {
	if (!path) return "/placeholder.png";
	if (path.startsWith("http")) return path;
	// /images/ is served by Next.js public folder, not Laravel
	if (path.startsWith("/images/")) return path;
	return `${process.env.NEXT_PUBLIC_API_URL || "https://cms.olahbola.com"}${path}`;
}

export function getProfilePictureUrl(path: string | null | undefined): string {
	if (!path) return "/icons/football-player.png";
	if (path.startsWith("http")) return path;
	return `${process.env.NEXT_PUBLIC_API_URL || "https://cms.olahbola.com"}${path}`;
}
