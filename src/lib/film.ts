/**
 * THE FILM'S SHOOTING ORDER — one source of truth, two places it is mounted.
 *
 * ============================================================================
 * WHY THIS IS A LIBRARY AND NOT A PAGE
 * ============================================================================
 * The cinematic sequence now opens the HOMEPAGE as well as standing on its own at
 * `/{locale}/film/`. Those are two routes that must show the same film — not two films that happen
 * to look alike. The moment the beat list is written out twice, the two copies begin to drift:
 * someone re-times a beat on one route, the other keeps the old cut, and nothing fails.
 *
 * So the beats are built here, from the same records the rest of the site reads, and both routes
 * call this function. The renderer (`src/scripts/cinema/*`) was already shared; this closes the
 * last place a second copy could have appeared.
 *
 * ============================================================================
 * EVERY LINE OF TYPE IS AN EXISTING RECORD
 * ============================================================================
 * The title card is Zina's own tagline and her professional title. The six lines after it are the
 * six stages of her testing method, in the order `content/` declares them. Nothing here is written
 * for the occasion, and nothing claims anything about a product.
 */
import type { Locale } from "../../content/schema/types";
import type { PhotographKey } from "./photography";
import { method, person } from "./content";
import { t } from "./ui-strings";

/**
 * One beat of the film, as the storyboard renders it.
 *
 * Declared here rather than in `FilmStage.astro` so that a page can build a beat list without
 * importing a component, and so the component and the builder cannot disagree about the shape.
 */
export interface Beat {
  /** Matches the `key` in src/scripts/cinema/timeline.ts, for readability at both ends. */
  key: string;
  /** The small tracked line above the caption — a real stage of the method, or a chapter mark. */
  label: string;
  /** One line. The film's typography is deliberately almost nothing. */
  line: string;
  /** Present only on the beats that introduce a new photograph. */
  photo?: PhotographKey;
  /** Emphasis: the title card and the closing frame are set larger than the rest. */
  scale?: "normal" | "large";
  /**
   * Whether the title card carries an `<h1>`.
   *
   * TRUE ON THE DEDICATED FILM ROUTE, where the film's own typography IS the document outline and
   * there is no other heading on the page.
   *
   * FALSE ON THE HOMEPAGE, where the existing opening section already carries the page's `h1`.
   * Every page on this site has exactly one `h1` and the suite asserts it (tests/global.test.mjs);
   * mounting the film above a page that already has one would have produced two, both containing
   * the same tagline. The film still shows the same line of type — it is simply not the heading.
   */
  heading?: boolean;
}

export interface FilmBeatOptions {
  /** See `Beat.heading`. Defaults to true, which is the dedicated route's behaviour. */
  heading?: boolean;
}

/**
 * THE SEVEN BEATS.
 *
 * Matching `SCENES` in src/scripts/cinema/timeline.ts one for one — the `key` on each side is the
 * same word so the two files can be read together.
 *
 * Only five beats carry a photograph. The opening three share one frame, because the camera is
 * moving through a single space in those beats rather than cutting between three.
 */
export function filmBeats(locale: Locale, options: FilmBeatOptions = {}): Beat[] {
  const personRecord = person();
  const personLocale = personRecord.locales[locale]!;
  const methodRecord = method();
  const methodLocale = methodRecord.locales[locale]!;

  /** The six stages, in the order the record declares — never re-ordered for the composition. */
  const stages = methodRecord.stageOrder
    .map((key) => methodLocale.stages.find((stage) => stage.key === key))
    .filter((stage): stage is NonNullable<typeof stage> => Boolean(stage));

  const ordinal = (index: number) => `${t(locale, "chapterLabel")} ${String(index + 1).padStart(2, "0")}`;
  const stageName = (index: number) => stages[index]?.name ?? methodLocale.name;

  return [
    {
      key: "awakening",
      label: personLocale.professionalTitle,
      line: personLocale.tagline,
      photo: "portraitGlow",
      scale: "large",
      heading: options.heading ?? true,
    },
    { key: "reveal", label: ordinal(0), line: stageName(0) },
    { key: "product", label: ordinal(1), line: stageName(1) },
    { key: "together", label: ordinal(2), line: stageName(2), photo: "closeupComplexion" },
    { key: "beauty", label: ordinal(3), line: stageName(3), photo: "beautyCloseup" },
    { key: "transformation", label: ordinal(4), line: stageName(4), photo: "editorialRed" },
    {
      key: "final",
      label: ordinal(5),
      line: stageName(5),
      photo: "portraitRadiant",
      scale: "large",
    },
  ];
}

/** The package the film casts. Named here so both mounts stage the same object. */
export const FILM_PRODUCT = { kind: "serum", tint: "rose" } as const;
