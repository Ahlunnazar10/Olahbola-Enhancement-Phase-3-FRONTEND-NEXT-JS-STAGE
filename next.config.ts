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
		deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
		imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
		formats: ["image/avif", "image/webp"],
	},
	// Transpile swiper package for better tree-shaking
	transpilePackages: ["swiper"],
	// Experimental features for better performance
	experimental: {
		optimizeCss: true,
	},
};

export default nextConfig;
