/**
 * Server-safe JSON-LD Component
 * Renders structured data on server for Googlebot to discover
 * No client-side mounting check - always renders on server
 */
interface JsonLdProps {
	data: object;
}

export function JsonLdServer({ data }: JsonLdProps) {
	// Always render on server - Google needs to see this during SSR
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}