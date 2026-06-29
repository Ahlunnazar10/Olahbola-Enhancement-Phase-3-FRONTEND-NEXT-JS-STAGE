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
			{
				protocol: "https",
				hostname: "www.olahbola.com",
			},
			// Local backend for development
			{
				protocol: "http",
				hostname: "127.0.0.1",
			},
			{
				protocol: "http",
				hostname: "localhost",
			},
		],
		deviceSizes: [640, 750, 828, 1080, 1200, 1920],
		imageSizes: [36, 48, 64, 96, 128, 256, 384],
		formats: ["image/webp"],
		dangerouslyAllowSVG: true,
		contentDispositionType: "inline",
		unoptimized: process.env.NODE_ENV === "development",
		minimumCacheTTL: 60,
	},
	transpilePackages: ["swiper"],

	// Tree-shake known packages with many sub-export paths
	experimental: {
		optimizePackageImports: ["lucide-react", "swiper", "react-intersection-observer"],
	},

	compress: true,
	reactStrictMode: true,
};

export default nextConfig;
