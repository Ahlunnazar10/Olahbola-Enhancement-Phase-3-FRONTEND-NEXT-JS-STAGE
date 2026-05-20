/**
 * Icon Mapping: Material Symbols → Phosphor Icons
 * This provides a drop-in replacement for Material Symbols Outlined icons
 */

export const iconMapping: Record<string, string> = {
	// Sports Icons
	"sports_soccer": "SoccerBall",
	"sports_basketball": "Basketball",
	"sports_football": "Football",
	"sports_baseball": "Baseball",
	"sports_motorsports": "RaceFlag",
	"sports_esports": "GameController",

	// Navigation
	"home": "House",
	"home_outlined": "House",
	"search": "MagnifyingGlass",
	"menu": "List",
	"close": "X",
	"arrow_forward": "ArrowRight",
	"arrow_back": "ArrowLeft",
	"arrow_forward_ios": "CaretRight",
	"arrow_back_ios": "CaretLeft",
	"arrow_right": "ArrowRight",
	"arrow_left": "ArrowLeft",
	"chevron_right": "CaretRight",
	"chevron_left": "CaretLeft",
	"chevron_down": "CaretDown",
	"expand_more": "CaretDown",
	"expand_less": "CaretUp",
	"arrow_drop_down": "CaretDown",
	"arrow_drop_up": "CaretUp",

	// Actions
	"add": "Plus",
	"remove": "Minus",
	"edit": "PencilSimple",
	"delete": "Trash",
	"share": "Share",
	"copy": "Copy",
	"content_copy": "Copy",
	"refresh": "ArrowsClockwise",
	"sync": "ArrowsClockwise",
	"settings": "Gear",
	"check": "Check",
	"check_circle": "CheckCircle",

	// Content
	"play_arrow": "Play",
	"play_circle": "PlayCircle",
	"pause": "Pause",
	"pause_circle": "PauseCircle",
	"stop": "Stop",
	"visibility": "Eye",
	"visibility_off": "EyeSlash",
	"article": "Article",
	"description": "TextAlignLeft",
	"video_library": "VideoCamera",
	"photo_library": "Images",
	"image": "Image",

	// Social & People
	"person": "User",
	"person_outline": "User",
	"people": "Users",
	"group": "Users",
	"mail": "Envelope",
	"chat": "ChatCircle",
	"chat_bubble": "ChatCircle",
	"public": "Globe",

	// Status & Info
	"error": "XCircle",
	"warning": "Warning",
	"info": "Info",
	"verified": "SealCheck",
	"verified_user": "ShieldCheck",

	// Location & Maps
	"location_on": "MapPin",
	"location_on_outlined": "MapPin",
	"map": "MapTrifold",
	"near_me": "NavigationArrow",

	// Trending & Stats
	"trending_up": "TrendUp",
	"trending_down": "TrendDown",
	"local_fire_department": "Fire",
	"whatshot": "Fire",
	"leaderboard": "ChartBar",
	"bar_chart": "ChartBar",
	"star": "Star",
	"star_outline": "Star",
	"star_half": "StarHalf",

	// Awards & Badges
	"emoji_events": "Trophy",
	"workspace_premium": "Medal",
	"military_tech": "Medal",
	"stars": "Sparkle",

	// Time & Schedule
	"schedule": "Clock",
	"clock": "Clock",
	"calendar_today": "CalendarBlank",
	"event": "Calendar",

	// Misc
	"link": "Link",
	"link_off": "LinkBreak",
	"bolt": "Lightning",
	"flash_on": "Lightning",
	"campaign": "Megaphone",
	"notifications": "Bell",
	"notifications_outlined": "Bell",
	"bookmark": "BookmarkSimple",
	"bookmark_border": "BookmarkSimple",
	"favorite": "Heart",
	"favorite_border": "Heart",
	"qr_code": "QrCode",
	"download": "Download",
	"upload": "Upload",
	"login": "SignIn",
	"logout": "SignOut",
	"forum": "ChatText",
	"handshake": "Handshake",
	"open_in_new": "ArrowSquareOut",
	"rocket_launch": "Rocket",
	"call": "Phone",
	"lock": "Lock",
	"lock_clock": "Timer",
};

// Get the Phosphor icon name for a Material icon
export function getPhosphorIcon(materialIcon: string): string {
	return iconMapping[materialIcon] || iconMapping[materialIcon.replace(/_outlined|_filled|_rounded/g, "")] || "Circle";
}

// Alias for backward compatibility
export const getLucideIcon = getPhosphorIcon;

// List of all available icon mappings
export const availableMappings = Object.keys(iconMapping);