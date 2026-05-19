"use client";

import { OrganizationSchema, WebsiteSchema } from "./JsonLd";

/**
 * Global SEO Scripts Component
 * Renders JSON-LD structured data for the entire site
 * Place this in the root layout body
 */
export function GlobalSeoScripts() {
	return (
		<>
			<OrganizationSchema />
			<WebsiteSchema />
		</>
	);
}
