/**
 * XML ESCAPING — the one function every generated XML file in this project shares.
 *
 * Titles, excerpts and descriptions are authored prose and may one day contain `&`, `<`, `>` or
 * quotes (an em dash, a product name with an ampersand, a quoted phrase). None of that exists in
 * the current mock corpus, but the sitemap and the RSS feed are the first two places in this
 * project that emit XML from record-derived text, so escaping is not optional defensive code —
 * it is required for the output to remain valid the day content does contain one of those
 * characters. Astro's own `.astro` templates never need this: JSX-style templating escapes text
 * nodes automatically. A hand-built XML string does not get that for free.
 */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
