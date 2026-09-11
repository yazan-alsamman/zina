/**
 * SITE CONFIG — narrowed types.
 *
 * The Phase 1 schema (`content/schema/types.ts`) declares `navigation`, `seoDefaults`, `contact`,
 * `legal` and `editorialStandards` as `unknown`. That was correct for Phase 1: the shapes were
 * still being decided, and a wrong type is worse than no type.
 *
 * Phase 4 needs them. Rather than EDIT the Phase 1 file — which is the contract three phases and
 * one validator depend on — the concrete shapes are declared here and narrowed in exactly one
 * place (`src/lib/content.ts`), so there is a single cast to audit rather than one per template.
 *
 * If `content/mock/site.json` ever drifts from these shapes, `tests/site-config.test.mjs` fails.
 */

import type { Locale } from "../../content/schema/types.ts";

export type LocalisedText = Record<Locale, string>;

export interface NavItem {
  key: string;
  routeKey: string;
  label: LocalisedText;
}

export interface FooterGroup {
  group: LocalisedText;
  links: Array<{ routeKey: string; label: LocalisedText }>;
}

export interface SiteNavigation {
  primary: NavItem[];
  cta: NavItem;
  footer: FooterGroup[];
}

export interface SeoDefaults {
  titleTemplate: LocalisedText;
  defaultTitle: LocalisedText;
  defaultDescription: LocalisedText;
  openGraphImage: string;
  twitterCard: string;
  themeColor: string;
}
