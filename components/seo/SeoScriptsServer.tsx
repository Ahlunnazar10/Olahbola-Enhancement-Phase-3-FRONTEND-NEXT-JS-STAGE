import { OrganizationSchemaServer, WebsiteSchemaServer } from "./SchemaServer";

/**
 * Global SEO Scripts - Server Component Version
 * Place this in the root layout to render JSON-LD on server side
 */
export function GlobalSeoScripts() {
	return (
		<>
			<OrganizationSchemaServer />
			<WebsiteSchemaServer />
		</>
	);
}