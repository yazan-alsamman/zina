/**
 * PHOTOGRAPHY REGISTRY — Phase 11.
 *
 * The project owner supplied 22 photographs of Zina Almokri (the untracked `pics/` directory).
 * Eleven were selected and copied into `src/assets/photography/` under descriptive names; the
 * rest were deliberately left out:
 *
 *   - the night-time automotive series (photo 1, 3, 12, 17–20, 22) reads as lifestyle rather than
 *     beauty, competes with the pink identity through saturated red interiors, and one frame shows
 *     a legible licence plate
 *   - near-duplicates of selected frames (photo 11 duplicates the red editorial)
 *
 * PHASE 12 RE-REVIEW. Two of the eleven exclusions were reconsidered and reversed, because the
 * Phase 12 compositions ask for two things the original eleven could not supply:
 *
 *   - `beautyCloseup` (photo 16) was filed as a duplicate of the red editorial. It is not: the
 *     red editorial is a wide, full-length fashion frame, and this is a tight BEAUTY frame —
 *     complexion, brow, lash and highlighter legible at full-bleed width. For a publication whose
 *     whole subject is how a formula behaves on skin, it is the single most on-brief photograph
 *     in the set, and nothing else in the eleven can carry a full-bleed band.
 *   - `studioFullLength` (photo 6) was filed as a duplicate of the monochrome studio series. The
 *     series is waist-up; this is the only full-length frame, and the only one with enough empty
 *     ground for oversized type to cross it without covering her.
 *
 * The automotive series remains excluded, unchanged and for the original reasons.
 *
 * Every photograph is imported through astro:assets, so the build emits AVIF and WebP at several
 * widths with intrinsic dimensions — no layout shift, no oversized download.
 *
 * ALT TEXT DESCRIBES WHAT IS VISIBLE. It never asserts a fact about Zina's career, products she
 * is wearing, or anything the photograph cannot show.
 */
import type { ImageMetadata } from "astro";
import type { Locale } from "../../content/schema/types";

import portraitGlow from "../assets/photography/zina-portrait-glow.jpg";
import portraitGoldenHour from "../assets/photography/zina-portrait-golden-hour.jpg";
import closeupComplexion from "../assets/photography/zina-closeup-complexion.jpg";
import portraitRadiant from "../assets/photography/zina-portrait-radiant.jpg";
import editorialRed from "../assets/photography/zina-editorial-red.jpg";
import studioWarmProfile from "../assets/photography/zina-studio-warm-profile.jpg";
import studioBlazer from "../assets/photography/zina-studio-blazer.jpg";
import studioMonochrome from "../assets/photography/zina-studio-monochrome.jpg";
import studioSeated from "../assets/photography/zina-studio-seated.jpg";
import studioMonochromeProfile from "../assets/photography/zina-studio-monochrome-profile.jpg";
import studioWarmSeated from "../assets/photography/zina-studio-warm-seated.jpg";
import beautyCloseup from "../assets/photography/zina-beauty-closeup.jpg";
import studioFullLength from "../assets/photography/zina-studio-full-length.jpg";

export interface Photograph {
  src: ImageMetadata;
  alt: Record<Locale, string>;
  /** CSS object-position — keeps the face inside every art-directed crop. */
  focus: string;
}

export const photography = {
  /** HOME HERO. The strongest beauty frame: warm skin, direct gaze, soft window light. */
  portraitGlow: {
    src: portraitGlow,
    alt: {
      en: "Zina Almokri in a warm, softly lit beauty portrait, looking at the camera with her hand resting on her shoulder",
      ar: "زينا المقري في صورة جمالية بإضاءة دافئة وناعمة، تنظر إلى الكاميرا ويدها على كتفها",
    },
    focus: "50% 30%",
  },
  portraitGoldenHour: {
    src: portraitGoldenHour,
    alt: {
      en: "Zina Almokri glancing over her shoulder in warm golden light",
      ar: "زينا المقري تنظر من فوق كتفها في ضوء ذهبي دافئ",
    },
    focus: "55% 28%",
  },
  /** The complexion close-up: used where the page talks about testing on skin. */
  closeupComplexion: {
    src: closeupComplexion,
    alt: {
      en: "Close-up portrait of Zina Almokri showing her complexion and eye makeup in detail",
      ar: "صورة مقربة لزينا المقري تظهر بشرتها ومكياج العينين بالتفصيل",
    },
    focus: "50% 35%",
  },
  portraitRadiant: {
    src: portraitRadiant,
    alt: {
      en: "Zina Almokri smiling softly in a bright close-up portrait",
      ar: "زينا المقري بابتسامة هادئة في صورة مقربة مشرقة",
    },
    focus: "50% 32%",
  },
  editorialRed: {
    src: editorialRed,
    alt: {
      en: "Zina Almokri in a red embellished dress, posing against a pale wall",
      ar: "زينا المقري بفستان أحمر مزين، تقف أمام جدار فاتح",
    },
    focus: "45% 25%",
  },
  studioWarmProfile: {
    src: studioWarmProfile,
    alt: {
      en: "Studio portrait of Zina Almokri in a black blazer, turned in profile against a warm brown backdrop",
      ar: "صورة استوديو لزينا المقري بسترة سوداء، بوضعية جانبية أمام خلفية بنية دافئة",
    },
    focus: "45% 30%",
  },
  studioBlazer: {
    src: studioBlazer,
    alt: {
      en: "Studio portrait of Zina Almokri in a black blazer against a warm brown backdrop",
      ar: "صورة استوديو لزينا المقري بسترة سوداء أمام خلفية بنية دافئة",
    },
    focus: "50% 25%",
  },
  studioMonochrome: {
    src: studioMonochrome,
    alt: {
      en: "Black and white studio portrait of Zina Almokri in a tailored blazer",
      ar: "صورة استوديو بالأبيض والأسود لزينا المقري بسترة مفصلة",
    },
    focus: "50% 25%",
  },
  studioSeated: {
    src: studioSeated,
    alt: {
      en: "Black and white studio photograph of Zina Almokri seated on a stool",
      ar: "صورة استوديو بالأبيض والأسود لزينا المقري جالسة على كرسي",
    },
    focus: "50% 40%",
  },
  studioMonochromeProfile: {
    src: studioMonochromeProfile,
    alt: {
      en: "Black and white studio portrait of Zina Almokri in profile",
      ar: "صورة استوديو بالأبيض والأسود لزينا المقري بوضعية جانبية",
    },
    focus: "45% 30%",
  },
  studioWarmSeated: {
    src: studioWarmSeated,
    alt: {
      en: "Studio photograph of Zina Almokri seated against a warm brown backdrop",
      ar: "صورة استوديو لزينا المقري جالسة أمام خلفية بنية دافئة",
    },
    focus: "50% 35%",
  },
  /** PHASE 12. The beauty frame: the only photograph where the makeup itself is legible. */
  beautyCloseup: {
    src: beautyCloseup,
    alt: {
      en: "Close-up beauty portrait of Zina Almokri in a red beaded dress, her makeup and complexion visible in detail",
      ar: "صورة جمالية مقربة لزينا المقري بفستان أحمر مطرز، يظهر فيها مكياجها وبشرتها بالتفصيل",
    },
    focus: "42% 26%",
  },
  /** PHASE 12. The only full-length frame — the one with room for type to cross it. */
  studioFullLength: {
    src: studioFullLength,
    alt: {
      en: "Full-length black and white studio photograph of Zina Almokri in a tailored blazer and trousers, leaning against a stool",
      ar: "صورة استوديو كاملة بالأبيض والأسود لزينا المقري بسترة وبنطال مفصلين، تستند إلى كرسي",
    },
    focus: "50% 45%",
  },
} satisfies Record<string, Photograph>;

export type PhotographKey = keyof typeof photography;
