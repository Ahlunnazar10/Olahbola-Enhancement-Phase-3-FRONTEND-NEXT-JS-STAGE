'use client';

import { useEffect, useRef, useState } from 'react';

interface FacebookEmbedProps {
	url: string;
	className?: string;
}

export function FacebookEmbed({ url, className = '' }: FacebookEmbedProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		if (!url || !containerRef.current) return;

		const container = containerRef.current;
		let timeoutId: NodeJS.Timeout;

		const processEmbed = () => {
			if (window.FB) {
				window.FB?.XFBML?.parse();
				setIsLoaded(true);
			}
		};

		const loadScript = () => {
			if (window.FB) {
				processEmbed();
				return;
			}

			const script = document.createElement('script');
			script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v17.0';
			script.async = true;
			script.defer = true;
			script.crossOrigin = 'anonymous';
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
			className={`facebook-embed-container ${className}`}
			style={{
				minHeight: '400px',
				width: '100%',
				borderRadius: '12px',
				overflow: 'hidden',
			}}
		>
			{!isLoaded && (
				<div
					className="flex items-center justify-center bg-gray-100 animate-pulse"
					style={{ height: '400px', borderRadius: '12px' }}
				>
					<svg
						className="w-12 h-12 text-gray-400 animate-pulse"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h2.773l-.443 3.47h-2.33v8.385C19.612 23.027 24 18.062 24 12.073z" />
					</svg>
				</div>
			)}
		</div>
	);
}

