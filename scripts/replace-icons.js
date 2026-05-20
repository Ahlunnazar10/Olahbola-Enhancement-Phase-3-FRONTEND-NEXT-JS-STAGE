/**
 * Script to replace Material Symbols with Lucide Icons
 * Run with: node replace-icons.js
 */

const fs = require('fs');
const path = require('path');

// Files to process
const files = [
	'app/(main)/page.tsx',
	'components/banner-slider/BannerSlider.tsx',
	'components/layouts/NavigationBar.tsx',
	'app/(main)/artikel/page.tsx',
	'app/(main)/interview/page.tsx',
	'app/not-found.tsx',
];

// Icon mapping from Material name to display name
const iconMap = {
	'sports_soccer': 'Circle',
	'arrow_forward': 'ArrowRight',
	'arrow_back': 'ArrowLeft',
	'chevron_right': 'ChevronRight',
	'chevron_left': 'ChevronLeft',
	'expand_more': 'ChevronDown',
	'arrow_right': 'ArrowRight',
	'arrow_left': 'ArrowLeft',
	'home': 'Home',
	'menu': 'Menu',
	'play_arrow': 'Play',
	'visibility': 'Eye',
	'check_circle': 'CheckCircle',
	'error': 'AlertCircle',
	'info': 'Info',
	'warning': 'AlertTriangle',
	'star': 'Star',
	'favorite': 'Heart',
	'bookmark': 'Bookmark',
	'location_on': 'MapPin',
	'trending_up': 'TrendingUp',
	'schedule': 'Clock',
	'calendar_today': 'Calendar',
	'bar_chart': 'BarChart',
	'campaign': 'Megaphone',
	'bolt': 'Zap',
	'workspace_premium': 'Award',
	'emoji_events': 'Trophy',
	'leaderboard': 'BarChart3',
	'military_tech': 'Medal',
	'chat': 'MessageCircle',
	'mail': 'Mail',
	'person': 'User',
	'people': 'Users',
	'search': 'Search',
	'refresh': 'RefreshCw',
	'settings': 'Settings',
	'share': 'Share2',
	'copy': 'Copy',
	'close': 'X',
	'add': 'Plus',
	'remove': 'Minus',
	'edit': 'Edit3',
	'delete': 'Trash2',
	'verified': 'BadgeCheck',
	'public': 'Globe',
	'notifications': 'Bell',
	'download': 'Download',
	'upload': 'Upload',
	'link': 'Link',
	'qr_code': 'QrCode',
	'content_copy': 'Copy',
	'local_fire_department': 'Flame',
	'whatshot': 'Flame',
	'stars': 'Sparkles',
	'local_offer': 'Tag',
	'label': 'Tag',
	'tag': 'Tag',
	'build': 'Wrench',
	'flash_on': 'Zap',
	'shield': 'Shield',
	'notifications_none': 'Bell',
	'notifications_outlined': 'Bell',
	'language': 'Globe',
	'login': 'LogIn',
	'logout': 'LogOut',
	'favorite_border': 'Heart',
	'bookmark_border': 'Bookmark',
	'star_outline': 'Star',
	'star_half': 'StarHalf',
	'check': 'Check',
	'pause': 'Pause',
	'stop': 'Square',
	'forum': 'MessageSquare',
	'call': 'Phone',
	'phone': 'Phone',
	'email': 'Mail',
	'event': 'Calendar',
	'place': 'MapPin',
	'fitness_center': 'Dumbbell',
	'pets': 'Heart',
	'celebration': 'Sparkles',
	'emoji_events': 'Trophy',
	'grade': 'Star',
	'paid': 'DollarSign',
	'money': 'DollarSign',
	'card_giftcard': 'Gift',
	'loyalty': 'Heart',
	'security': 'Shield',
	'thumb_up': 'ThumbsUp',
	'thumb_down': 'ThumbsDown',
	'new_releases': 'AlertCircle',
	'radio_button_unchecked': 'Circle',
	'check_box': 'CheckSquare',
	'radio_button_checked': 'Circle',
	'indeterminate_check_box': 'Square',
	'square': 'Square',
	'circle': 'Circle',
	'layers': 'Layers',
	'cloud': 'Cloud',
	'cloud_queue': 'Cloud',
	'cloud_download': 'DownloadCloud',
	'cloud_upload': 'UploadCloud',
	'backup': 'Archive',
	'restore': 'RotateCcw',
	'analytics': 'BarChart',
	'insights': 'TrendingUp',
	'work': 'Briefcase',
	'engineering': 'Wrench',
	'code': 'Code',
	'terminal': 'Terminal',
	'storage': 'Database',
	'folder': 'Folder',
	'folder_open': 'FolderOpen',
	'attach_file': 'Paperclip',
	'attachment': 'Paperclip',
	'picture_as_pdf': 'FileText',
	'picture': 'Image',
	'video_library': 'Video',
	'image': 'Image',
	'audiotrack': 'Music',
	'music_note': 'Music',
	'movie': 'Film',
	'tv': 'Tv',
	'games': 'Gamepad2',
	'palette': 'Palette',
	'brush': 'Brush',
	'format_paint': 'Brush',
	'text_fields': 'Type',
	'format_size': 'Type',
	'format_bold': 'Bold',
	'format_italic': 'Italic',
	'format_underlined': 'Underline',
	'format_list_bulleted': 'List',
	'format_list_numbered': 'ListOrdered',
	'list': 'List',
	'list_alt': 'List',
	'dns': 'Server',
	'wifi': 'Wifi',
	'signal_cellular_4_bar': 'Signal',
	'battery_full': 'Battery',
	'battery_charging_full': 'Battery',
	'brightness_high': 'Sun',
	'brightness_low': 'Sun',
	'settings_brightness': 'Sun',
	'settings_ethernet': 'Network',
	'developer_mode': 'Code',
	'web': 'Globe',
	'public_apps': 'App',
	'http': 'Globe',
	'https': 'Lock',
	'lock': 'Lock',
	'lock_open': 'Unlock',
	'vpn_lock': 'Shield',
	'security': 'Shield',
	'vpn_key': 'Key',
	'key': 'Key',
	'payment': 'CreditCard',
	'credit_card': 'CreditCard',
	'shopping_cart': 'ShoppingCart',
	'shopping_basket': 'ShoppingBasket',
	'shopping_bag': 'ShoppingBag',
	'local_shipping': 'Truck',
	'local_cafe': 'Coffee',
	'local_bar': 'Wine',
	'local_restaurant': 'UtensilsCrossed',
	'restaurant': 'UtensilsCrossed',
	'fastfood': 'Hamburger',
	'local_pizza': 'Pizza',
	'local_cafe': 'Coffee',
	'local_grocery_store': 'ShoppingBasket',
	'local_hospital': 'Building',
	'local_hotel': 'Building',
	'local_parking': 'ParkingCircle',
	'local_gas_station': 'Fuel',
	'ev_station': 'Zap',
	'local_car_wash': 'Droplet',
	'car_repair': 'Wrench',
	'directions_car': 'Car',
	'directions': 'Navigation',
	'directions_bike': 'Bike',
	'directions_bus': 'Bus',
	'directions_boat': 'Ship',
	'flight': 'Plane',
	'local_taxi': 'Car',
	'commute': 'Compass',
	'near_me': 'Navigation',
	'map': 'Map',
	'edit_location': 'MapPin',
	'add_location': 'MapPin',
	'gps_fixed': 'Navigation',
	'gps_not_fixed': 'Navigation',
	'cell_wifi': 'Wifi',
};

// Process each file
files.forEach(file => {
	const filePath = path.join(__dirname, '..', file);

	if (!fs.existsSync(filePath)) {
		console.log(`File not found: ${file}`);
		return;
	}

	let content = fs.readFileSync(filePath, 'utf-8');
	let originalContent = content;

	// Replace Material Symbols spans with Icon component
	// Pattern: <span className="material-symbols-outlined ..." style={...}>icon_name</span>

	// Replace patterns like:
	// <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>sports_soccer</span>
	// With:
	// <Icon name="sports_soccer" size={24} className="text-lg" />

	const spanPattern = /<span\s+className="material-symbols-outlined([^"]*)"([^>]*)>([^<]+)<\/span>/g;

	content = content.replace(spanPattern, (match, classAttr, styleAttr, iconName) => {
		const iconNameClean = iconName.trim();
		const lucideIcon = iconMap[iconNameClean] || iconNameClean;

		// Extract size from className
		let size = 24;
		const sizeMatch = classAttr.match(/text-(\d)/);
		if (sizeMatch) {
			const textSize = parseInt(sizeMatch[1]);
			size = textSize * 4; // Convert text size to pixels
		}

		// Check if it's filled
		let filled = false;
		if (styleAttr && styleAttr.includes("'FILL' 1")) {
			filled = true;
		}

		// Extract color from style
		let color = undefined;
		const colorMatch = styleAttr.match(/color:\s*([^,}]+)/);
		if (colorMatch) {
			color = colorMatch[1].trim();
		}

		// Build Icon component
		const props = [`name="${iconNameClean}"`];
		if (size !== 24) props.push(`size={${size}}`);
		if (classAttr) {
			const cleanClass = classAttr.replace(/text-\d+/g, '').trim();
			if (cleanClass) props.push(`className="${cleanClass.trim()}"`);
		}
		if (filled) props.push('filled');
		if (color) props.push(`color={${color}}`);

		return `<Icon ${props.join(' ')} />`;
	});

	// Replace CSS for material-symbols-outlined
	content = content.replace(/\.material-symbols-outlined\s*\{[^}]+\}/g, '');

	if (content !== originalContent) {
		fs.writeFileSync(filePath, content);
		console.log(`Updated: ${file}`);
	} else {
		console.log(`No changes: ${file}`);
	}
});

console.log('\nDone! Import the Icon component in files that need it:');