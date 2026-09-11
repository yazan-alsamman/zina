/**
 * INTERFACE STRINGS
 *
 * Chrome, not content. Section headings, labels and navigation words — the words the interface
 * says about itself, as distinct from the words Zina wrote, which live in `content/`.
 *
 * ============================================================================
 * PROVENANCE — read before editing
 * ============================================================================
 *
 * VERIFIED FROM SPECIFICATION. These Arabic strings are not invented here; they are the ones
 * written into the Phase 2 and Phase 3 specifications, or drawn from `content/mock/site.json`:
 *
 *   الحكم              docs/EVIDENCE_LANGUAGE.md section 2 (verdict label)
 *   تدّعي العلامة       docs/EVIDENCE_LANGUAGE.md section 2 (claim label)
 *   لوحة               docs/EVIDENCE_LANGUAGE.md section 5 (plate)
 *   الساعة             docs/BILINGUAL_TYPE_TEST.md section 6 (hour marker)
 *   المراجعات، الطريقة، المجلة، الأعمال، عن زينا، تعاون   site.json navigation
 *   كيف أختبر           site.json footer ("How I test")
 *
 * NEEDS NATIVE REVIEW. The remaining Arabic section headings were composed for this
 * implementation. They are ordinary interface vocabulary rather than claims about testing, but
 * they have NOT been reviewed by a native Arabic reader. This is open question Q3-2, and
 * Q3-6 asks specifically whether `الساعة 6` is the natural idiom for a timed observation.
 *
 * NOTHING HERE MAY MAKE A CLAIM. No string in this file may describe the testing as clinical,
 * validated, certified, proven or scientific, in either language, and none does.
 */

import type { Locale } from "../../content/schema/types.ts";

type Strings = Record<string, string>;

const en = {
  /* document + navigation */
  skipToContent: "Skip to content",
  primaryNavigation: "Primary",
  footerNavigation: "Footer",
  breadcrumb: "Breadcrumb",
  home: "Home",
  reviews: "Reviews",
  method: "Method",
  journal: "Journal",
  work: "Work",
  about: "About",
  collaborate: "Collaborate",
  howITest: "How I test",
  brands: "Brands",
  editorialStandards: "Editorial standards",
  privacy: "Privacy",
  terms: "Terms",
  openMenu: "Menu",
  closeMenu: "Close",
  languageSwitcher: "Language",

  /* review page — section headings */
  disclosure: "Disclosure",
  testingSummary: "Testing summary",
  wearWindow: "Wear window",
  timesTested: "Times tested",
  shade: "Shade",
  baseline: "Baseline",
  baselinePhotographed: "Photographed",
  baselineNotPhotographed: "Not photographed",
  introduction: "Introduction",
  testingContext: "Testing context",
  testingConditions: "Testing conditions",
  howItWasApplied: "How it was applied",
  methodStages: "Method stages applied",
  observations: "Observations",
  visualEvidence: "Visual evidence",
  assessment: "Assessment",
  strengths: "Strengths",
  limitations: "Limitations",
  suitability: "Suitability",
  suitsWell: "Suits well",
  mayNotSuit: "May not suit",
  verdict: "The verdict",
  bestFor: "Best for",
  wouldRepurchase: "Would repurchase",
  conclusion: "Conclusion",
  updateLog: "Update log",
  productDetails: "Product details",
  claimedByTheBrand: "Claimed by the brand",
  related: "Related",
  relatedReviews: "Related reviews",
  fromTheJournal: "From the journal",
  relatedWork: "Related work",
  testedAgainst: "Tested against",

  /* record vocabulary */
  plate: "Plate",
  stageApplied: "applied in this test",
  stageNotApplied: "not applied in this test",

  /* product details */
  shadeRange: "Shades",
  size: "Size",
  priceTier: "Price",
  officialSite: "Official site",
  opensExternalSite: "opens the brand's own site",

  /* dates */
  published: "Published",
  updated: "Updated",
  tested: "Tested",

  /* method */
  readTheMethod: "Read how these products are tested",
  projectMockMethod: "Project mock method",

  /* reviews index */
  reviewsIndexTitle: "Reviews",
  reviewsIndexIntro:
    "Every product here was worn, timed and photographed, and the conditions of each test are published with it. These are testing records, not recommendations.",
  browseByCategory: "Browse by category",
  browseByBrand: "Browse by brand",
  allReviewsLabel: "All reviews",
  reviewCount: "records",
  inThisCategory: "in this category",
  inThisLocale: "available in this language",
  navigationOnly: "This is a navigation view.",
  categoryIndexIntro: "Testing records in this category.",
  brandIndexIntro: "Testing records for this brand.",
  noReviewsHere: "No reviews in this category yet.",

  /* method */
  methodIntroLabel: "What this is",
  methodStagesHeading: "The six stages",
  whatThisCannotTell: "What this cannot tell you",
  whatIsObserved: "What is observed",
  whatIsRecorded: "What is recorded",
  doesNotProve: "What this stage does not prove",
  reviewsUsingStage: "Reviews that used this stage",
  projectMockMethodNotice:
    "PROJECT MOCK METHOD. This six-stage protocol was drafted for this project and has not been confirmed as Zina Almokri's practice. It is not a verified methodology, and nothing here is clinical, medical or laboratory testing.",

  /* homepage */
  featuredReview: "The most recent record",
  readTheReview: "Read the review",
  viewAllReviews: "All testing records",
  homeMethodLead: "Six stages, the same six every time.",

  /* journal */
  journalIndexTitle: "Journal",
  journalIndexIntro:
    "Writing about how testing works, and what it can and cannot establish. Every article points at the records that evidence it.",
  articleCount: "articles",
  browseByFormat: "Browse by format",
  allArticles: "All articles",
  formatIndexIntro: "Articles in this editorial format.",
  readingTime: "min read",
  contents: "Contents",
  citedRecord: "Documented in",
  referencedReviews: "Records referenced in this article",
  relatedArticles: "Related reading",
  relatedMethodStage: "The stage this explains",
  editorialNote: "Editorial note",
  editorialBoundary: "Where this stops",
  articleCategoryPillar: "Pillar",
  articleCategorySupporting: "Supporting",
  publishedOn: "Published",
  updatedOn: "Updated",
  byline: "Written by",

  /* journal categories — editorial FORMATS, never product categories */
  categoryTestingNotes: "Testing notes",
  categoryGuides: "Guides",
  categoryComparisons: "Comparisons",
  categoryEssays: "Essays",

  /* states */
  noCounterpart: "This review is not available in Arabic. Here are the reviews that are.",
  notFoundTitle: "That page is not here.",
  notFoundBody: "The link may be old, or the page may have moved.",
  recentReviews: "Recent reviews",
  allReviews: "All reviews",
} satisfies Strings;

const ar = {
  /* document + navigation */
  skipToContent: "تخطَّ إلى المحتوى",
  primaryNavigation: "التنقل الرئيسي",
  footerNavigation: "روابط التذييل",
  breadcrumb: "مسار التنقل",
  home: "الرئيسية",
  reviews: "المراجعات",
  method: "الطريقة",
  journal: "المجلة",
  work: "الأعمال",
  about: "عن زينا",
  collaborate: "تعاون",
  howITest: "كيف أختبر",
  brands: "العلامات",
  editorialStandards: "المعايير التحريرية",
  privacy: "الخصوصية",
  terms: "الشروط",
  openMenu: "القائمة",
  closeMenu: "إغلاق",
  languageSwitcher: "اللغة",

  /* review page — section headings */
  disclosure: "الإفصاح",
  testingSummary: "ملخص الاختبار",
  wearWindow: "مدة الثبات",
  timesTested: "عدد مرات الاختبار",
  shade: "الدرجة",
  baseline: "الصورة المرجعية",
  baselinePhotographed: "مصوَّرة",
  baselineNotPhotographed: "غير مصوَّرة",
  introduction: "المقدمة",
  testingContext: "سياق الاختبار",
  testingConditions: "ظروف الاختبار",
  howItWasApplied: "طريقة التطبيق",
  methodStages: "مراحل الطريقة المطبَّقة",
  observations: "الملاحظات",
  visualEvidence: "الأدلة المصورة",
  assessment: "التقييم",
  strengths: "نقاط القوة",
  limitations: "الحدود",
  suitability: "لمن يناسب",
  suitsWell: "يناسب",
  mayNotSuit: "قد لا يناسب",
  verdict: "الحكم",
  bestFor: "الأفضل لـ",
  wouldRepurchase: "هل أعيد شراءه",
  conclusion: "الخلاصة",
  updateLog: "سجل التحديثات",
  productDetails: "تفاصيل المنتج",
  claimedByTheBrand: "تدّعي العلامة",
  related: "ذات صلة",
  relatedReviews: "مراجعات ذات صلة",
  fromTheJournal: "من المجلة",
  relatedWork: "أعمال ذات صلة",
  testedAgainst: "قورن بـ",

  /* record vocabulary */
  plate: "لوحة",
  stageApplied: "مطبَّقة في هذا الاختبار",
  stageNotApplied: "غير مطبَّقة في هذا الاختبار",

  /* product details */
  shadeRange: "الدرجات",
  size: "الحجم",
  priceTier: "الفئة السعرية",
  officialSite: "الموقع الرسمي",
  opensExternalSite: "يفتح موقع العلامة",

  /* dates */
  published: "نُشر",
  updated: "حُدّث",
  tested: "اختُبر",

  /* method */
  readTheMethod: "اقرأ كيف تُختبر هذه المنتجات",
  projectMockMethod: "طريقة مبدئية للمشروع",

  /* reviews index */
  reviewsIndexTitle: "المراجعات",
  reviewsIndexIntro:
    "كل منتج هنا استُخدم وقيست مدته وصُوّر، وتُنشر ظروف كل اختبار معه. هذه سجلات اختبار، لا توصيات.",
  browseByCategory: "تصفح حسب الفئة",
  browseByBrand: "تصفح حسب العلامة",
  allReviewsLabel: "كل المراجعات",
  reviewCount: "سجل",
  inThisCategory: "في هذه الفئة",
  inThisLocale: "متوفرة بهذه اللغة",
  navigationOnly: "هذه صفحة تصفح.",
  categoryIndexIntro: "سجلات الاختبار في هذه الفئة.",
  brandIndexIntro: "سجلات الاختبار لهذه العلامة.",
  noReviewsHere: "لا توجد مراجعات في هذه الفئة بعد.",

  /* method */
  methodIntroLabel: "ما هذا",
  methodStagesHeading: "المراحل الست",
  whatThisCannotTell: "ما لا يمكن أن يخبرك به",
  whatIsObserved: "ما يُلاحَظ",
  whatIsRecorded: "ما يُوثَّق",
  doesNotProve: "ما لا تثبته هذه المرحلة",
  reviewsUsingStage: "مراجعات استخدمت هذه المرحلة",
  projectMockMethodNotice:
    "طريقة مبدئية للمشروع. صيغت هذه المراحل الست لأغراض هذا المشروع ولم تُؤكَّد بعد بوصفها ممارسة زينا المقري الفعلية. ليست منهجية موثقة، ولا شيء هنا اختبار سريري أو طبي أو مخبري.",

  /* homepage */
  featuredReview: "أحدث سجل",
  readTheReview: "اقرأ المراجعة",
  viewAllReviews: "كل سجلات الاختبار",
  homeMethodLead: "ست مراحل، المراحل نفسها في كل مرة.",

  /* journal */
  journalIndexTitle: "المجلة",
  journalIndexIntro:
    "كتابة عن كيفية عمل الاختبار، وعمّا يمكنه وما لا يمكنه إثباته. كل مقال يشير إلى السجلات التي تسنده.",
  articleCount: "مقالات",
  browseByFormat: "تصفح حسب الشكل التحريري",
  allArticles: "كل المقالات",
  formatIndexIntro: "مقالات في هذا الشكل التحريري.",
  readingTime: "دقيقة قراءة",
  contents: "المحتويات",
  citedRecord: "موثق في",
  referencedReviews: "سجلات مذكورة في هذا المقال",
  relatedArticles: "قراءات ذات صلة",
  relatedMethodStage: "المرحلة التي يشرحها",
  editorialNote: "ملاحظة تحريرية",
  editorialBoundary: "أين يتوقف هذا",
  articleCategoryPillar: "مقال أساسي",
  articleCategorySupporting: "مقال مساند",
  publishedOn: "نُشر في",
  updatedOn: "حُدّث في",
  byline: "بقلم",

  /* journal categories — editorial FORMATS, never product categories */
  categoryTestingNotes: "ملاحظات الاختبار",
  categoryGuides: "أدلة عملية",
  categoryComparisons: "مقارنات",
  categoryEssays: "مقالات رأي",

  /* states */
  noCounterpart: "هذه المراجعة غير متوفرة بالإنجليزية. هذه هي المراجعات المتوفرة.",
  notFoundTitle: "هذه الصفحة غير موجودة.",
  notFoundBody: "قد يكون الرابط قديما، أو تكون الصفحة قد نُقلت.",
  recentReviews: "أحدث المراجعات",
  allReviews: "كل المراجعات",
} satisfies Record<keyof typeof en, string>;

const dictionaries = { en, ar } as const;

export type UiKey = keyof typeof en;

/** Typed string lookup. A missing key is a compile error, not a runtime blank. */
export function t(locale: Locale, key: UiKey): string {
  return dictionaries[locale][key];
}

/** Bound lookup, so templates read `s("verdict")` rather than `t(locale, "verdict")`. */
export const strings = (locale: Locale) => (key: UiKey): string => t(locale, key);
