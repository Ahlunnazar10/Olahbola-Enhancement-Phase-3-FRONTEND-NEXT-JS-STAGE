"use client";

import * as LucideIcons from "lucide-react";
import { getLucideIcon } from "@/lib/icon-mapping";
import { cn } from "@/lib/utils";

interface IconProps {
	/** Material icon name (e.g., "sports_soccer", "arrow_forward") */
	name: string;
	/** Icon size */
	size?: number;
	/** Additional CSS classes */
	className?: string;
	/** Fill the icon (stroke = 0) */
	filled?: boolean;
	/** Icon color */
	color?: string;
	/** Stroke width */
	strokeWidth?: number;
	/** Additional inline styles */
	style?: React.CSSProperties;
	/** aria-label for accessibility */
	"aria-label"?: string;
}

/**
 * Material Icon - Drop-in replacement for Material Symbols Outlined
 *
 * Usage:
 * <Icon name="sports_soccer" size={24} />
 * <Icon name="arrow_forward" className="text-primary" />
 * <Icon name="star" filled />
 */
export function Icon({
	name,
	size = 24,
	className,
	filled = false,
	color,
	strokeWidth = 2,
	style,
	"aria-label": ariaLabel,
}: IconProps) {
	// Get the Lucide icon name
	const lucideName = getLucideIcon(name);

	// Get the icon component from Lucide
	// Use 'any' type to avoid TypeScript issues with Lucide icons
	const iconMap: Record<string, any> = LucideIcons;
	const IconComponent = iconMap[lucideName];

	// Fallback to Circle if not found
	const FinalIcon = IconComponent || LucideIcons.Circle;

	return (
		<FinalIcon
			size={size}
			className={className}
			color={color}
			strokeWidth={filled ? 0 : strokeWidth}
			fill={filled ? color || "currentColor" : undefined}
			style={style}
			aria-label={ariaLabel}
		/>
	);
}

/**
 * Pre-built icon components for common icons
 * Provides better autocomplete and type safety
 */
export const Icons = {
	// Sports
	SportsSoccer: (props: Omit<IconProps, "name">) => <Icon name="sports_soccer" {...props} />,

	// Navigation
	ArrowForward: (props: Omit<IconProps, "name">) => <Icon name="arrow_forward" {...props} />,
	ArrowBack: (props: Omit<IconProps, "name">) => <Icon name="arrow_back" {...props} />,
	ArrowRight: (props: Omit<IconProps, "name">) => <Icon name="arrow_forward" {...props} />,
	ArrowLeft: (props: Omit<IconProps, "name">) => <Icon name="arrow_back" {...props} />,
	Menu: (props: Omit<IconProps, "name">) => <Icon name="menu" {...props} />,
	Close: (props: Omit<IconProps, "name">) => <Icon name="close" {...props} />,
	Home: (props: Omit<IconProps, "name">) => <Icon name="home" {...props} />,

	// Actions
	Plus: (props: Omit<IconProps, "name">) => <Icon name="add" {...props} />,
	Minus: (props: Omit<IconProps, "name">) => <Icon name="remove" {...props} />,
	Edit: (props: Omit<IconProps, "name">) => <Icon name="edit" {...props} />,
	Delete: (props: Omit<IconProps, "name">) => <Icon name="delete" {...props} />,
	Share: (props: Omit<IconProps, "name">) => <Icon name="share" {...props} />,
	Copy: (props: Omit<IconProps, "name">) => <Icon name="copy" {...props} />,
	Settings: (props: Omit<IconProps, "name">) => <Icon name="settings" {...props} />,
	Check: (props: Omit<IconProps, "name">) => <Icon name="check" {...props} />,
	CheckCircle: (props: Omit<IconProps, "name">) => <Icon name="check_circle" {...props} />,
	Refresh: (props: Omit<IconProps, "name">) => <Icon name="refresh" {...props} />,

	// Content
	Play: (props: Omit<IconProps, "name">) => <Icon name="play_arrow" {...props} />,
	PlayCircle: (props: Omit<IconProps, "name">) => <Icon name="play_circle" {...props} />,
	Pause: (props: Omit<IconProps, "name">) => <Icon name="pause" {...props} />,
	Eye: (props: Omit<IconProps, "name">) => <Icon name="visibility" {...props} />,
	EyeOff: (props: Omit<IconProps, "name">) => <Icon name="visibility_off" {...props} />,

	// Social
	User: (props: Omit<IconProps, "name">) => <Icon name="person" {...props} />,
	Users: (props: Omit<IconProps, "name">) => <Icon name="people" {...props} />,
	Mail: (props: Omit<IconProps, "name">) => <Icon name="mail" {...props} />,
	Chat: (props: Omit<IconProps, "name">) => <Icon name="chat" {...props} />,
	Globe: (props: Omit<IconProps, "name">) => <Icon name="public" {...props} />,

	// Status
	Error: (props: Omit<IconProps, "name">) => <Icon name="error" {...props} />,
	Warning: (props: Omit<IconProps, "name">) => <Icon name="warning" {...props} />,
	Info: (props: Omit<IconProps, "name">) => <Icon name="info" {...props} />,
	Verified: (props: Omit<IconProps, "name">) => <Icon name="verified" {...props} />,

	// Location
	MapPin: (props: Omit<IconProps, "name">) => <Icon name="location_on" {...props} />,

	// Trending
	TrendingUp: (props: Omit<IconProps, "name">) => <Icon name="trending_up" {...props} />,
	TrendingDown: (props: Omit<IconProps, "name">) => <Icon name="trending_down" {...props} />,
	Flame: (props: Omit<IconProps, "name">) => <Icon name="local_fire_department" {...props} />,
	Trophy: (props: Omit<IconProps, "name">) => <Icon name="emoji_events" {...props} />,
	Star: (props: Omit<IconProps, "name">) => <Icon name="star" {...props} />,
	Award: (props: Omit<IconProps, "name">) => <Icon name="workspace_premium" {...props} />,

	// Time
	Clock: (props: Omit<IconProps, "name">) => <Icon name="schedule" {...props} />,
	Calendar: (props: Omit<IconProps, "name">) => <Icon name="calendar_today" {...props} />,

	// Misc
	Zap: (props: Omit<IconProps, "name">) => <Icon name="bolt" {...props} />,
	Heart: (props: Omit<IconProps, "name">) => <Icon name="favorite" {...props} />,
	ChevronRight: (props: Omit<IconProps, "name">) => <Icon name="chevron_right" {...props} />,
	ChevronLeft: (props: Omit<IconProps, "name">) => <Icon name="chevron_left" {...props} />,
	ChevronDown: (props: Omit<IconProps, "name">) => <Icon name="expand_more" {...props} />,
	BarChart: (props: Omit<IconProps, "name">) => <Icon name="bar_chart" {...props} />,
	Link: (props: Omit<IconProps, "name">) => <Icon name="link" {...props} />,
	Search: (props: Omit<IconProps, "name">) => <Icon name="search" {...props} />,
};

export default Icon;