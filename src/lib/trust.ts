/**
 * TRUST SURFACES — contact channels, editorial standards and the legal foundation.
 *
 * ============================================================================
 * ONE RULE GOVERNS THIS ENTIRE FILE
 * ============================================================================
 *
 *     An unverified value is not a value. It is an ABSENCE, and it renders as one.
 *
 * Everything here returns `undefined`/`[]` rather than a placeholder, because each of these
 * surfaces is a promise to the reader:
 *
 *   a contact address says "mail sent here reaches a person"
 *   a legal entity says   "this is who you are dealing with"
 *   a jurisdiction says   "these are the laws that apply to you"
 *
 * A plausible-looking wrong value on any of those is worse than a stated gap. Mail vanishes; a
 * reader relies on a legal position that does not exist. So the gates are deliberately blunt: if
 * `_verification` is not CONFIRMED, the caller gets nothing and must say so.
 *
 * ============================================================================
 * WHAT THIS MEANS IN THE CURRENT BUILD
 * ============================================================================
 *   contact emails   all three are MOCK (`@zinaalmokri.example.com`) -> NONE render
 *   phone            null, NEEDS_VERIFICATION                        -> absent
 *   management       represented: false, NEEDS_VERIFICATION          -> absent
 *   legal entity     null, NEEDS_VERIFICATION                        -> absent
 *   jurisdiction     null, NEEDS_VERIFICATION (unknown U-03)         -> absent, and BLOCKING
 *   social profiles  every one has `sameAsEligible: false`           -> NONE render anywhere
 */

import type { Locale } from "../../content/schema/types.ts";
import { site, verified } from "./content.ts";

/* ------------------------------------------------------------------ contact */

export interface ContactChannel {
  /** Which channel this is, so the page can label it from its own vocabulary. */
  key: "general" | "collaboration" | "press";
  address: string;
}

type VerifiableString = { value: string | null; _verification: string } | undefined;

/**
 * The contact channels that may actually be published.
 *
 * `verified()` returns the value only when `_verification === "CONFIRMED"`, so a MOCK address can
 * never reach a template. There is deliberately no fallback and no "coming soon" address.
 */
export const contactChannels = (): ContactChannel[] => {
  const contact = site().contact as Record<string, unknown> | undefined;
  if (!contact) return [];

  const channels: Array<[ContactChannel["key"], VerifiableString]> = [
    ["general", contact["generalEmail"] as VerifiableString],
    ["collaboration", contact["collaborationEmail"] as VerifiableString],
    ["press", contact["pressEmail"] as VerifiableString],
  ];

  return channels
    .map(([key, field]) => ({ key, address: verified(field) ?? "" }))
    .filter((c): c is ContactChannel => c.address.length > 0);
};

/** Whether ANY contact channel can be published. False in this build. */
export const hasContactChannel = (): boolean => contactChannels().length > 0;

/**
 * Management/agency representation, only when confirmed.
 *
 * `represented: false` is itself an unverified claim here (`NEEDS_VERIFICATION`), so this returns
 * undefined rather than asserting "not represented" — which would be a statement about Zina's
 * business arrangements that nobody has confirmed.
 */
export const management = (): { agencyName: string; agencyEmail: string } | undefined => {
  // `SiteConfig.contact` is typed `unknown` in the schema, so every read narrows explicitly.
  const contact = site().contact as Record<string, unknown> | undefined;
  const m = contact?.["management"] as
    | { represented?: boolean; agencyName?: string | null; agencyEmail?: string | null; _verification?: string }
    | undefined;
  if (!m || m._verification !== "CONFIRMED" || !m.represented) return undefined;
  return m.agencyName && m.agencyEmail
    ? { agencyName: m.agencyName, agencyEmail: m.agencyEmail }
    : undefined;
};

/* ------------------------------------------------------------------ editorial standards */

export type StandardKey =
  | "disclosurePolicy"
  | "correctionsPolicy"
  | "medicalBoundary"
  | "aiPolicy"
  | "ratingsPolicy";

/**
 * The order the standards are presented in. Disclosure first: it is the one a reader most needs
 * before reading a review, and the one this publication is most often judged on.
 */
export const STANDARD_ORDER: StandardKey[] = [
  "disclosurePolicy",
  "correctionsPolicy",
  "ratingsPolicy",
  "aiPolicy",
  "medicalBoundary",
];

export interface EditorialStandard {
  key: StandardKey;
  statement: string;
}

/**
 * The published editorial standards for a locale.
 *
 * These come from `site.json → editorialStandards`, which carries `_verification: "MOCK"` and the
 * note: "Proposed standards, not Zina's stated positions. Each must be approved before
 * publication."
 *
 * They ARE rendered — a standards page with no standards would be pointless — but the page must
 * state their status. That is the page's own responsibility, and `standardsAreApproved()` is how
 * it asks.
 */
export const editorialStandards = (locale: Locale): EditorialStandard[] => {
  const block = site().editorialStandards as Record<string, unknown> | undefined;
  const localised = block?.[locale] as Record<string, string> | undefined;
  if (!localised) return [];

  return STANDARD_ORDER.map((key) => ({ key, statement: localised[key] ?? "" })).filter(
    (s) => s.statement.length > 0
  );
};

/** Whether the standards have been approved by their subject. False in this build. */
export const standardsAreApproved = (): boolean =>
  (site().editorialStandards as { _verification?: string } | undefined)?._verification ===
  "CONFIRMED";

/* ------------------------------------------------------------------ legal */

export interface LegalIdentity {
  entityName?: string;
  jurisdiction?: string;
  copyrightHolder: string;
}

/**
 * The legal facts that may be published.
 *
 * `entityName` and `jurisdiction` are both null and NEEDS_VERIFICATION, so neither renders.
 * `copyrightHolder` is a plain string on the record rather than a verifiable value — it names the
 * author of the work, which is a fact the project already asserts everywhere, so it is published.
 *
 * NOTHING here may be inferred. A missing jurisdiction does not default to anywhere: the applicable
 * privacy regime, the consent behaviour and the governing law all follow from it, and guessing
 * would publish a legal position nobody chose.
 */
export const legalIdentity = (): LegalIdentity => {
  const legal = site().legal as
    | {
        entityName?: VerifiableString;
        jurisdiction?: VerifiableString;
        copyrightHolder?: string;
      }
    | undefined;

  const entityName = verified(legal?.entityName) ?? undefined;
  const jurisdiction = verified(legal?.jurisdiction) ?? undefined;

  return {
    ...(entityName ? { entityName } : {}),
    ...(jurisdiction ? { jurisdiction } : {}),
    copyrightHolder: legal?.copyrightHolder ?? "",
  };
};

/**
 * U-03. Whether a jurisdiction is known.
 *
 * This is the gate on every legal page: without it the site cannot state which privacy regime
 * applies, so it must not claim compliance with any. It is also why no cookie policy exists —
 * see `docs/LEGAL_ARCHITECTURE.md`.
 */
export const jurisdictionIsKnown = (): boolean => legalIdentity().jurisdiction !== undefined;

/**
 * Whether this build sets any non-essential cookie or runs any tracking.
 *
 * Hardcoded `false`, and deliberately so: there is no analytics, no tag manager, no embed, no
 * third-party request and zero client JavaScript in the entire site. If that ever changes, this
 * constant is the single place the legal pages read, and `tests/trust.test.mjs` asserts the
 * build actually matches it.
 */
export const USES_TRACKING = false;
