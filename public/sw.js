const CACHE_NAME = "olahbola-v1";
const urlsToCache = [
	"/",
	"/images/home/banner-bg.webp",
	"/images/home/banner-bg2.webp",
	"/images/home/about-bg.webp",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
	);
});
