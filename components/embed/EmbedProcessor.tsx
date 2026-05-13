'use client';

import { useEffect, useRef, useState } from 'react';

interface EmbedProcessorProps {
	content: string;
	onEmbedsExtracted?: (embeds: SocialEmbed[]) => void;
}

export interface SocialEmbed {
	type: 'instagram' | 'facebook' | 'twitter' | 'youtube' | 'other';
	url: string;
	html: string;
	index: number;
}

export function useEmbedProcessor(content: string): {
	processedContent: string;
	embeds: SocialEmbed[];
	isReady: boolean;
} {
	const [embeds, setEmbeds] = useState<SocialEmbed[]>([]);
	const [isReady, setIsReady] = useState(false);
	const processedContentRef = useRef(content);

	useEffect(() => {
		if (!content) return;

		const foundEmbeds: SocialEmbed[] = [];
		let processedContent = content;

		// Extract Instagram embeds
		const instagramRegex = /<blockquote class="instagram-([^\"]*)"[^>]*>[\s\S]*?<a href="([^"]*)"[^>]*>[\s\S]*?<\/blockquote>/gi;
		let match;
		while ((match = instagramRegex.exec(content)) !== null) {
			foundEmbeds.push({
				type: 'instagram',
				url: match[2] || '',
				html: match[0],
				index: match.index,
			});
		}

		// Extract Twitter embeds
		const twitterRegex = /<blockquote class="twitter-([^\"]*)"[^>]*>[\s\S]*?<a href="([^"]*)"[^>]*>[\s\S]*?<\/blockquote>/gi;
		while ((match = twitterRegex.exec(content)) !== null) {
			foundEmbeds.push({
				type: 'twitter',
				url: match[2] || '',
				html: match[0],
				index: match.index,
			});
		}

		// Extract Facebook embeds
		const facebookRegex = /<div class="fb-([^\"]*)"[^>]*>[\s\S]*?<a href="([^"]*)"[^>]*>[\s\S]*?<\/div>/gi;
		while ((match = facebookRegex.exec(content)) !== null) {
			foundEmbeds.push({
				type: 'facebook',
				url: match[2] || '',
				html: match[0],
				index: match.index,
			});
		}

		// Extract YouTube iframes
		const youtubeRegex = /<iframe[^>]*src="([^"]*youtube[^\"]*)"[^>]*>[\s\S]*?<\/iframe>/gi;
		while ((match = youtubeRegex.exec(content)) !== null) {
			foundEmbeds.push({
				type: 'youtube',
				url: match[1] || '',
				html: match[0],
				index: match.index,
			});
		}

		setEmbeds(foundEmbeds);
		setIsReady(true);
		processedContentRef.current = content;
	}, [content]);

	return {
		processedContent: processedContentRef.current,
		embeds,
		isReady,
	};
}
