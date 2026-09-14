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

// Matches the full opening tag of a social-embed container.
// Captures the tag name (div or blockquote) in group 1 and the full
// opening tag string (for length calculation) in group 0.
const OPEN_EMBED_RE =
	/<(div|blockquote)([^>]*class="[^"]*(?:social-embed|instagram-media|instagram-embed|twitter-tweet|twitter-embed|fb-post|fb-video|fb-page|facebook-embed-wrapper)[^"]*"[^>]*)>/gi;

/**
 * Deduplicate social media embeds in article HTML content.
 *
 * When multiple embed blocks contain an iframe with the same src,
 * only the first occurrence is kept.  Pure-string operation — no
 * DOMParser needed — safe to call from both server and client.
 */
export function deduplicateSocialEmbeds(html: string): string {
	const seenSrcs = new Set<string>();
	const allBlocks: Array<{ start: number; end: number; keep: boolean }> = [];

	let m: RegExpExecArray | null;
	while ((m = OPEN_EMBED_RE.exec(html)) !== null) {
		const tagName = m[1]!.toLowerCase();
		const tagEnd = m.index! + m[0]!.length; // position right after the opening ">"

		// Find the matching closing tag by counting nesting depth.
		const closeTag = `</${tagName}>`;
		let depth = 1;
		let searchFrom = tagEnd;
		let closingIdx = -1;

		while (depth > 0) {
			const nextOpen = html.search(
				new RegExp(`<${tagName}[^>]*>`, "i"),
			);
			const nextClose = html.indexOf(closeTag, searchFrom);

			if (nextClose === -1) break;
			if (
				nextOpen !== -1 &&
				nextOpen < nextClose &&
				nextOpen >= searchFrom
			) {
				depth++;
				searchFrom = nextOpen + tagName.length + 2;
			} else {
				depth--;
				if (depth === 0) closingIdx = nextClose;
				else searchFrom = nextClose + closeTag.length;
			}
		}

		if (closingIdx === -1) continue;

		const blockStart = m.index!;
		const blockEnd = closingIdx + closeTag.length;
		const blockHtml = html.slice(blockStart, blockEnd);

		// Extract iframe src for dedup key.
		const srcMatch = blockHtml.match(/src="([^"]+)"/);
		const src = srcMatch ? srcMatch[1] : "";

		if (src && seenSrcs.has(src)) {
			// Duplicate — mark for removal.
			allBlocks.push({ start: blockStart, end: blockEnd, keep: false });
		} else {
			if (src) seenSrcs.add(src);
			allBlocks.push({ start: blockStart, end: blockEnd, keep: true });
		}
	}

	// Rebuild HTML, omitting blocks that should be removed.
	let result = "";
	let cursor = 0;
	for (const block of allBlocks) {
		result += html.slice(cursor, block.start);
		if (block.keep) result += html.slice(block.start, block.end);
		cursor = block.end;
	}
	result += html.slice(cursor);

	return result;
}
