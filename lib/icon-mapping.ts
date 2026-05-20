/**
 * Icon Mapping: Material Symbols → Lucide React
 * This provides a drop-in replacement for Material Symbols Outlined icons
 */

export const iconMapping: Record<string, string> = {
	// Sports Icons
	"sports_soccer": "Circle",
	"sports_basketball": "Circle",
	"sports_football": "Circle",
	"sports_baseball": "Circle",
	"sports_motorsports": "Circle",
	"sports_esports": "Gamepad2",

	// Navigation
	"home": "Home",
	"home_outlined": "Home",
	"search": "Search",
	"menu": "Menu",
	"close": "X",
	"arrow_forward": "ArrowRight",
	"arrow_back": "ArrowLeft",
	"arrow_forward_ios": "ChevronRight",
	"arrow_back_ios": "ChevronLeft",
	"arrow_right": "ArrowRight",
	"arrow_left": "ArrowLeft",
	"chevron_right": "ChevronRight",
	"chevron_left": "ChevronLeft",
	"chevron_down": "ChevronDown",
	"expand_more": "ChevronDown",
	"expand_less": "ChevronUp",
	"arrow_drop_down": "ChevronDown",
	"arrow_drop_up": "ChevronUp",

	// Actions
	"add": "Plus",
	"remove": "Minus",
	"edit": "Edit3",
	"delete": "Trash2",
	"share": "Share2",
	"copy": "Copy",
	"content_copy": "Copy",
	"refresh": "RefreshCw",
	"sync": "RefreshCw",
	"settings": "Settings",
	"check": "Check",
	"check_circle": "CheckCircle",

	// Content
	"play_arrow": "Play",
	"play_circle": "PlayCircle",
	"pause": "Pause",
	"pause_circle": "PauseCircle",
	"stop": "Square",
	"visibility": "Eye",
	"visibility_off": "EyeOff",
	"article": "FileText",
	"description": "FileText",
	"video_library": "Video",
	"photo_library": "Image",
	"image": "Image",

	// Social & People
	"person": "User",
	"person_outline": "User",
	"people": "Users",
	"group": "Users",
	"mail": "Mail",
	"chat": "MessageCircle",
	"chat_bubble": "MessageCircle",
	"public": "Globe",

	// Status & Info
	"error": "AlertCircle",
	"warning": "AlertTriangle",
	"info": "Info",
	"verified": "BadgeCheck",
	"verified_user": "ShieldCheck",

	// Location & Maps
	"location_on": "MapPin",
	"location_on_outlined": "MapPin",
	"map": "Map",
	"near_me": "Navigation",

	// Trending & Stats
	"trending_up": "TrendingUp",
	"trending_down": "TrendingDown",
	"local_fire_department": "Flame",
	"whatshot": "Flame",
	"leaderboard": "BarChart3",
	"bar_chart": "BarChart3",
	"star": "Star",
	"star_outline": "Star",
	"star_half": "StarHalf",

	// Awards & Badges
	"emoji_events": "Trophy",
	"workspace_premium": "Award",
	"military_tech": "Medal",
	"stars": "Sparkles",

	// Time & Schedule
	"schedule": "Clock",
	"clock": "Clock",
	"calendar_today": "Calendar",
	"event": "Calendar",

	// Misc
	"link": "Link",
	"link_off": "Link2Off",
	"bolt": "Zap",
	"flash_on": "Zap",
	"campaign": "Megaphone",
	"notifications": "Bell",
	"notifications_outlined": "Bell",
	"bookmark": "Bookmark",
	"bookmark_border": "Bookmark",
	"favorite": "Heart",
	"favorite_border": "Heart",
	"qr_code": "QrCode",
	"download": "Download",
	"upload": "Upload",
	"login": "LogIn",
	"logout": "LogOut",
	"forum": "MessageSquare",
};

// Get the Lucide icon name for a Material icon
export function getLucideIcon(materialIcon: string): string {
	return iconMapping[materialIcon] || iconMapping[materialIcon.replace(/_outlined|_filled|_rounded/g, "")] || "Circle";
}

// List of all available icon mappings
export const availableMappings = Object.keys(iconMapping);