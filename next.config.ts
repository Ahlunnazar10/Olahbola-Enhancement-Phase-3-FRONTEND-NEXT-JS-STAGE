import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "*.googleusercontent.com",
			},
			{
				protocol: "https",
				hostname: "accounts.google.com",
			},
			{
				protocol: "https",
				hostname: "*.google.com",
			},
			{
				protocol: "https",
				hostname: "cms.olahbola.com",
			},
			{
				protocol: "https",
				hostname: "olahbola.com",
			},
		],
	},
};

export default nextConfig;
