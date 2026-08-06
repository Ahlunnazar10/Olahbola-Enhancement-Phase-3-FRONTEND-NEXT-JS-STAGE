"use client";

import { getImageUrl } from "@/lib/utils";
import { useState } from "react";

export function JerseyDisplay({
	imageUrl,
	jerseyNumber,
}: {
	imageUrl: string;
	jerseyNumber: number | null;
}) {
	const [imgError, setImgError] = useState(false);
	const src = imgError ? undefined : getImageUrl(imageUrl);

	return (
		<div className="relative w-full max-w-xs mx-auto aspect-square">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img
				src={src}
				alt="Jersey pemain"
				className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl"
				onError={() => setImgError(true)}
			/>
			{jerseyNumber !== null && (
				<div
					className="absolute inset-0 flex items-center justify-center pointer-events-none"
					style={{ paddingBottom: "8%" }}
				>
					<span
						className="text-[3rem] md:text-[6rem]"
						style={{
							color: "#FFD700",
							textShadow:
								"0 0 20px rgba(255, 215, 0, 0.6), 0 4px 8px rgba(0,0,0,0.7)",
							fontFamily: "'Impact', 'Arial Black', system-ui, sans-serif",
						}}
					>
						{jerseyNumber}
					</span>
				</div>
			)}
		</div>
	);
}
