'use client';

import { useEffect, useRef, useState } from 'react';

interface TwitterEmbedProps {
	url: string;
	className?: string;
}

export function TwitterEmbed({ url, className = '' }: TwitterEmbedProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		if (!url || !containerRef.current) return;

		const container = containerRef.current;
		let timeoutId: NodeJS.Timeout;

		const processEmbed = () => {
			if (window.twttr) {
				window.twttr?.widgets?.load();
				setIsLoaded(true);
			}
		};

		const loadScript = () => {
			if (window.twttr) {
				processEmbed();
				return;
			}

			const script = document.createElement('script');
			script.src = 'https://platform.twitter.com/widgets.js';
			script.async = true;
			script.setAttribute('charset', 'utf-8');
			script.onload = processEmbed;
			document.head.appendChild(script);
		};

		timeoutId = setTimeout(loadScript, 100);

		return () => {
			clearTimeout(timeoutId);
		};
	}, [url]);

	return (
		<div
			ref={containerRef}
			className={`twitter-embed-container ${className}`}
			style={{
				minHeight: '300px',
				width: '100%',
				borderRadius: '12px',
				overflow: 'hidden',
			}}
		>
			{!isLoaded && (
				<div
					className="flex items-center justify-center bg-gray-100 animate-pulse"
					style={{ height: '300px', borderRadius: '12px' }}
				>
					<svg
						className="w-12 h-12 text-gray-400 animate-pulse"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
					</svg>
				</div>
			)}
		</div>
	);
}

