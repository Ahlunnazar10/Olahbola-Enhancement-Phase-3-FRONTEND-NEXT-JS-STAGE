import { ArticleSchemaServer } from "./SchemaServer";

/**
 * Article SEO - Server Component Wrapper
 * Renders structured data on server side so Googlebot can see it
 */
interface ArticleSeoProps {
	title: string;
	description: string;
	slug: string;
	author: string;
	publishedAt: string;
	image?: string;
	category?: string;
}

export function ArticleSeo({
	title,
	description,
	slug,
	author,
	publishedAt,
	image,
	category,
}: ArticleSeoProps) {
	return (
		<>
			{/* JSON-LD Structured Data - Server Rendered */}
			<ArticleSchemaServer
				title={title}
				description={description}
				slug={slug}
				author={author}
				publishedAt={publishedAt}
				image={image}
				category={category}
			/>
		</>
	);
}