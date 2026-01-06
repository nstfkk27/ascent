/**
 * Component to inject Schema.org structured data (JSON-LD) into pages
 * This helps search engines understand your content better
 */
export default function StructuredData({ data }: { data: object | object[] }) {
  const schemas = Array.isArray(data) ? data : [data];
  
  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 0), // Minified for production
          }}
        />
      ))}
    </>
  );
}
