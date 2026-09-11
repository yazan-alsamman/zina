/**
 * JOURNAL RSS FEED — /{locale}/journal/rss.xml
 *
 * Content built by `journalFeed()` and rendered by `renderJournalFeedXml()`, both in
 * src/lib/feed.ts — see that file's header for the syndication-vs-browsing distinction that
 * governs why this is gated by `IS_INDEXABLE_BUILD` the same way the sitemap is, and for why the
 * mock marker is handled differently here than in the sitemap. This file is only the Response
 * wrapper.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import type { Locale } from "../../../../content/schema/types";
import { journalFeed, renderJournalFeedXml } from "../../../lib/feed";

export const getStaticPaths = (() => [
  { params: { locale: "en" } },
  { params: { locale: "ar" } },
]) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const locale = params.locale as Locale;
  return new Response(renderJournalFeedXml(journalFeed(locale)), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
