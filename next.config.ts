import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// Disable polyfills for modern browsers (fixes "Legacy JavaScript" warning)
	reactCompiler: false,

	// Optimize bundle for modern browsers
	experimental: {
		// Don't transpile modern JS features for older browsers
		optimizePackageImports: ["phosphor-react"],
	},

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
		],
		// Performance optimizations
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		formats: ["image/avif", "image/webp"],
		// Minimum cache TTL for optimized images
		minimumCacheTTL: 60 * 60 * 4, // 4 hours
	},
	// Compiler optimizations
	compiler: {
		// Remove console logs in production
		removeConsole: process.env.NODE_ENV === "production",
	},
};

export default nextConfig;