/**
 * JOURNAL RSS FEED — computed from the same source of truth as the Journal archive.
 *
 * ============================================================================
 * WHY THIS IS GATED THE SAME WAY THE SITEMAP IS
 * ============================================================================
 * docs/JOURNAL_SEO.md (Phase 6) deferred this explicitly: "RSS/Atom. Not built. It would be a
 * second content surface with its own escaping and locale rules." This module is that surface,
 * and the rule it must not violate is the one already governing every other one:
 *
 *     an unverified value is an absence, and it renders as one.
 *
 * A webpage a human deliberately navigates to is one thing — the journal index already renders
 * mock articles for browsing, marked noindex and carrying the __MOCK_DATA__ envelope marker so
 * the mock guard catches it. An RSS feed is a different kind of surface: its entire purpose is
 * EXTERNAL SYNDICATION — a feed reader or aggregator ingests it and may republish it elsewhere
 * without a human choosing to visit the site first. That is a stronger claim than a webpage
 * makes, and it deserves the stronger gate: feed items are populated ONLY when
 * `IS_INDEXABLE_BUILD` is true, exactly like the sitemap. While the source is mock, the feed is a
 * structurally valid, empty channel — present, well-formed, and honestly empty.
 *
 * ============================================================================
 * WHAT AN ITEM CONTAINS, AND WHY
 * ============================================================================
 * title, link, guid, pubDate, category — read verbatim from the same `journalArticles(locale)`
 * the archive page renders, so the two surfaces cannot disagree about what is published.
 *
 * description = the article's own `excerpt`. Not the full MDX body: rendering MDX outside its
 * page (Astro's Content component) would need a second rendering path with its own escaping
 * rules, which is the exact risk the Phase 6 deferral named. An excerpt is real, authored,
 * already-reviewed copy — never generated, never truncated body text pretending to be a summary.
 *
 * dc:creator = the person record's CONFIRMED display name. No email is emitted anywhere in this
 * feed: RSS's native <author> element requires one by spec, and no email address has been
 * confirmed for this project (Phase 7 D7-6) — inventing one to satisfy a feed reader would be
 * exactly the fabrication the whole architecture refuses. dc:creator (Dublin Core) needs only a
 * name, so it is used instead.
 */

import type { JournalArticle, Locale } from "../../content/schema/types.ts";
import { IS_INDEXABLE_BUILD, journalArticles, person } from "./content.ts";
import { categoryLabel } from "./journal-labels.ts";
import { absoluteUrl, machinePath, path, siteName } from "./routing.ts";
import { localeTag } from "./format.ts";
import { t } from "./ui-strings.ts";
import { escapeXml } from "./xml.ts";

export interface FeedItem {
  title: string;
  link: string;
  guid: string;
  /** RFC-822, per the RSS 2.0 spec — never the record's own ISO string used verbatim. */
  pubDate: string;
  description: string;
  category: string;
  creator: string;
}

export interface FeedChannel {
  title: string;
  link: string;
  feedUrl: string;
  description: string;
  language: string;
  items: FeedItem[];
}

/** `new Date(iso).toUTCString()` is RFC-1123, a strict subset of the RFC-822 the spec asks for. */
const toRfc822 = (iso: string): string => new Date(`${iso}T00:00:00Z`).toUTCString();

const feedItem = (article: JournalArticle, locale: Locale): FeedItem | undefined => {
  const content = article.locales[locale];
  if (!content?.slug) return undefined;

  const url = absoluteUrl(path.journal(locale, content.slug));
  return {
    title: content.title,
    link: url,
    guid: url,
    pubDate: toRfc822(article.dates.publishedAt),
    description: content.excerpt,
    category: categoryLabel(locale, article.category),
    creator: person().name.display,
  };
};

/**
 * The channel for one locale's feed.
 *
 * `indexableBuild` defaults to the real IS_INDEXABLE_BUILD, exactly like sitemap.ts, and for the
 * same reason: the production endpoint never overrides it, and tests pass `true` explicitly to
 * prove the item-building logic against the real corpus without that override ever reaching a
 * shipped feed.
 */
export function journalFeed(
  locale: Locale,
  indexableBuild: boolean = IS_INDEXABLE_BUILD
): FeedChannel {
  const items = indexableBuild
    ? journalArticles(locale)
        .map((a) => feedItem(a, locale))
        .filter((i): i is FeedItem => Boolean(i))
    : [];

  return {
    title: `${siteName(locale)} — ${t(locale, "journalIndexTitle")}`,
    link: absoluteUrl(path.journalIndex(locale)),
    feedUrl: absoluteUrl(machinePath.journalRss(locale)),
    description: t(locale, "journalIndexIntro"),
    language: localeTag(locale),
    items,
  };
}

/* ------------------------------------------------------------------ rendering
 *
 * Pure string builder, same reasoning as src/lib/sitemap.ts's renderLocaleSitemapXml(): the
 * endpoint is a thin Response wrapper, and this is directly callable from a test with no build
 * step, so the "forced indexable" branch (never reached by the real endpoint) can be rendered and
 * parsed exactly like production output would be.
 *
 * THE MOCK MARKER: emitted as an XML comment whenever there is at least one item, matching the
 * __MOCK_DATA__ marker every HTML page already carries — see src/pages/[locale]/journal/rss.xml.ts
 * for why an RSS feed needs this and a sitemap does not.
 */
export function renderJournalFeedXml(channel: FeedChannel): string {
  const items = channel.items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <dc:creator>${escapeXml(item.creator)}</dc:creator>
      <description>${escapeXml(item.description)}</description>
    </item>`
    )
    .join("\n");

  const mockMarker = channel.items.length > 0 ? "  <!-- __MOCK_DATA__ -->\n" : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
${mockMarker}  <channel>
    <title>${escapeXml(channel.title)}</title>
    <link>${escapeXml(channel.link)}</link>
    <atom:link href="${escapeXml(channel.feedUrl)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(channel.description)}</description>
    <language>${escapeXml(channel.language)}</language>
${items}
  </channel>
</rss>
`;
}
