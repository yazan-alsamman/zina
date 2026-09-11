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
  reviewCountOne: "record",
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
  articleCountOne: "article",
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

  /* ---------------------------------------------------------------- brands (Phase 7)
   * Entity vocabulary. Nothing here may describe a commercial relationship: the relationship
   * label is gated on CONFIRMED verification and renders from the record, never from this file.
   */
  brandsIndexIntro:
    "Companies whose products appear in the testing archive. Some were sent; some were bought. Each record says which.",
  brandCount: "brands",
  brandCountOne: "brand",
  brandsNone: "No brand has enough documented records to have a page in this language yet.",
  brandRelationshipHeading: "How these products were obtained",
  brandRelationshipUnconfirmed:
    "No commercial relationship with this company has been confirmed in writing, so none is described here. The disclosure on each record above states how that specific product was obtained.",
  brandRecordsHeading: "Documented records",
  brandRelatedHeading: "Related reading",
  brandNoRecords: "No records in this language yet.",

  /* ---------------------------------------------------------------- work (Phase 7)
   * No results vocabulary beyond the heading: a figure renders only through the Results Figure
   * gate, and carries its own label and source from the record.
   */
  workIndexIntro:
    "Commissioned and editorial projects, with the terms of each engagement stated on the record.",
  workCount: "projects",
  workCountOne: "project",
  workNone: "No projects are documented in this language yet.",
  workTermsHeading: "Terms of this engagement",
  workClient: "Client",
  workRole: "Role",
  workDisclosure: "Disclosure",
  workDeliverables: "What was delivered",
  workResults: "Verified results",
  workRelatedRecords: "Records from this work",
  workPeriod: "Period",

  /* ---------------------------------------------------------------- trust surfaces (Phase 7) */
  contactIntro: "How to reach this publication, and what it can currently receive.",
  contactChannelsHeading: "Where to write",
  contactGeneral: "General",
  contactCollaboration: "Collaboration",
  contactPress: "Press",
  contactPhone: "Phone",
  contactInstagram: "Instagram",
  contactManagement: "Management",
  contactUnavailableHeading: "No contact channel is published yet",
  contactUnavailableBody: "No email address for this site has been confirmed, so none is published here. An address that has not been verified could belong to nobody, and a message sent to it would simply disappear. There is deliberately no contact form either: a form with no destination accepts a message and discards it. This page will carry a real address once one is confirmed.",
  contactElsewhereHeading: "In the meantime",
  contactElsewhereStandards: "How disclosure, corrections and claims are handled",
  contactElsewhereMethod: "How a product is tested before it is written about",
  aboutMockNotice: "The biography on this page is placeholder text written for development. It has not been supplied or approved by Zina Almokri, and nothing in it should be read as a statement about her.",
  aboutPhilosophy: "What this archive is for",
  aboutExpertise: "What the work involves",
  aboutOnwardHeading: "How to check this",
  aboutOnwardMethod: "The testing protocol every record follows",
  aboutOnwardStandards: "How evidence, disclosure and corrections are handled",
  standardsIntro: "How this publication handles evidence, disclosure, corrections and claims.",
  standardsVsMethodHeading: "This is not the Method",
  standardsVsMethodBody: "The Method explains how a product is observed and tested. This page explains how the publication represents that evidence: what is disclosed, how errors are corrected, and what the observations do not prove. If you came here to read how testing works, the Method is the page you want.",
  standardsUnapprovedNotice: "These standards are proposed, not adopted. They were drafted during development and have not been reviewed or approved by Zina Almokri. They describe intended practice and should not yet be relied on as a published commitment.",
  standardsHeading: "The standards",
  standardDisclosure: "Disclosure",
  standardCorrections: "Corrections",
  standardRatings: "Ratings",
  standardAi: "Authorship",
  standardMedical: "Medical boundary",
  standardsLimitsHeading: "What this publication does not do",
  standardsLimitLab: "No laboratory testing is performed, and no independent laboratory verifies any result published here.",
  standardsLimitPeer: "Nothing published here is peer reviewed, scientifically validated, or reviewed by any external body.",
  standardsLimitMedical: "No medical or dermatological professional reviews this content, and none of it is clinical advice.",
  standardsLimitSample: "Every observation is one person's experience of one unit of a product, in the conditions recorded with it. It is not a claim about how the product behaves for anyone else.",
  standardsOnwardHeading: "See it applied",
  standardsOnwardReviews: "Every record carries its disclosure above the content",
  standardsOnwardMethod: "The six stages a record is built from",
  privacyTitle: "Privacy",
  privacyIntro: "What this site does with data, and what cannot be stated yet.",
  termsTitle: "Terms",
  termsIntro: "The terms under which this site is published, and what cannot be stated yet.",
  legalPendingHeading: "This document is not yet operative",
  legalPendingBody: "The jurisdiction this site is published under has not been established, and the applicable privacy regime, consent requirements and governing law all follow from it. Rather than approximate a legal position nobody has chosen, this page records what is missing. Nothing here is legal advice, and nothing here claims compliance with any particular regime.",
  legalPartialHeading: "This document is not yet complete",
  legalPartialBody: "The jurisdiction this site is published under has been established: Syria. The specific privacy regime, a registered legal entity, and the other items below are still required before this document is complete. The site's audience is global; stating a jurisdiction here is not a claim that every visitor's own laws are the same. Nothing here is legal advice, and nothing here claims compliance with any particular regime.",
  legalMissingHeading: "Required from the owner before this can be written",
  legalMissingRegimeSpecifics: "The specific privacy statute or regulation that applies within the stated jurisdiction, and the resulting consent requirements.",
  legalMissingController: "The named data controller, and a contact route for data requests.",
  legalMissingRetention: "Retention periods, and the list of any processors used.",
  legalMissingRights: "The data-subject rights that apply, and how a reader exercises them.",
  legalMissingGoverningLaw: "The governing law and the forum for any dispute.",
  legalMissingEntity: "The legal entity publishing this site, and its registered details.",
  legalMissingLiability: "The limitation of liability appropriate to that entity and jurisdiction.",
  legalFactualHeading: "What this site actually does",
  legalFactNoTracking: "It runs no analytics, no tracking and no third-party scripts of any kind.",
  legalFactNoCookies: "It sets no cookies, and therefore asks for no cookie consent. A banner asking permission for something that does not happen would be misleading.",
  legalFactNoScripts: "It ships no client-side JavaScript at all. Every page is static HTML and CSS.",
  legalFactNoAccounts: "There are no accounts, no logins, no comments and no forms, so it collects nothing a reader types.",
  legalFactFonts: "Fonts are self-hosted and served from this domain, so reading a page makes no request to any other party.",
  legalIdentityHeading: "Who publishes this",
  legalCopyrightHolder: "Copyright",
  legalEntity: "Legal entity",
  legalJurisdiction: "Jurisdiction",
  legalEntityUnknown: "No legal entity has been established for this site yet. When one is, it will be named here.",
  legalOnwardHeading: "Related",
  legalOnwardStandards: "How evidence and disclosure are handled",
  legalOnwardContact: "How to reach this publication",
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
  reviewCountOne: "سجل",
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
  articleCountOne: "مقالات",
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

  /* ---------------------------------------------------------------- brands (Phase 7) */
  brandsIndexIntro:
    "شركات تظهر منتجاتها في أرشيف الاختبار. بعضها أُرسل، وبعضها اشتُري. كل سجل يوضح أيهما.",
  brandCount: "علامة",
  brandCountOne: "علامة",
  brandsNone: "لا توجد علامة لديها سجلات موثقة كافية للحصول على صفحة بهذه اللغة بعد.",
  brandRelationshipHeading: "كيف حُصل على هذه المنتجات",
  brandRelationshipUnconfirmed:
    "لم تُؤكد كتابةً أي علاقة تجارية مع هذه الشركة، لذلك لا توصف أي علاقة هنا. الإفصاح في كل سجل أعلاه يوضح كيف حُصل على ذلك المنتج تحديدًا.",
  brandRecordsHeading: "السجلات الموثقة",
  brandRelatedHeading: "قراءات ذات صلة",
  brandNoRecords: "لا توجد سجلات بهذه اللغة بعد.",

  /* ---------------------------------------------------------------- work (Phase 7) */
  workIndexIntro:
    "مشاريع مكلّفة وتحريرية، مع ذكر شروط كل ارتباط في السجل.",
  workCount: "مشروع",
  workCountOne: "مشروع",
  workNone: "لا توجد مشاريع موثقة بهذه اللغة بعد.",
  workTermsHeading: "شروط هذا الارتباط",
  workClient: "العميل",
  workRole: "الدور",
  workDisclosure: "الإفصاح",
  workDeliverables: "ما تمّ تسليمه",
  workResults: "نتائج موثقة",
  workRelatedRecords: "سجلات من هذا العمل",
  workPeriod: "الفترة",

  /* ---------------------------------------------------------------- trust surfaces (Phase 7) */
  contactIntro: "كيفية التواصل مع هذه المنصة، وما يمكنها استقباله حاليا.",
  contactChannelsHeading: "أين تكتبين",
  contactGeneral: "عام",
  contactCollaboration: "تعاون",
  contactPress: "صحافة",
  contactPhone: "الهاتف",
  contactInstagram: "إنستغرام",
  contactManagement: "الإدارة",
  contactUnavailableHeading: "لا توجد قناة تواصل منشورة بعد",
  contactUnavailableBody: "لم يُؤكد أي بريد إلكتروني لهذا الموقع، لذلك لا يُنشر أي عنوان هنا. العنوان غير المؤكد قد لا يعود لأحد، والرسالة المرسلة إليه ستختفي ببساطة. ولا يوجد نموذج تواصل عمدا: النموذج بلا وجهة يستقبل الرسالة ثم يتخلص منها. ستحمل هذه الصفحة عنوانا حقيقيا فور تأكيده.",
  contactElsewhereHeading: "في هذه الأثناء",
  contactElsewhereStandards: "كيف يُتعامل مع الإفصاح والتصحيحات والادعاءات",
  contactElsewhereMethod: "كيف يُختبر المنتج قبل الكتابة عنه",
  aboutMockNotice: "السيرة الذاتية في هذه الصفحة نص مؤقت كُتب أثناء التطوير. لم تقدمها زينا المقري ولم توافق عليها، ولا ينبغي قراءة أي شيء فيها بوصفه تصريحا عنها.",
  aboutPhilosophy: "ما الغرض من هذا الأرشيف",
  aboutExpertise: "ما الذي يتضمنه العمل",
  aboutOnwardHeading: "كيف تتحققين من هذا",
  aboutOnwardMethod: "بروتوكول الاختبار الذي يتبعه كل سجل",
  aboutOnwardStandards: "كيف يُتعامل مع الأدلة والإفصاح والتصحيحات",
  standardsIntro: "كيف تتعامل هذه المنصة مع الأدلة والإفصاح والتصحيحات والادعاءات.",
  standardsVsMethodHeading: "هذه ليست الطريقة",
  standardsVsMethodBody: "الطريقة تشرح كيف يُلاحظ المنتج ويُختبر. هذه الصفحة تشرح كيف تمثل المنصة ذلك الدليل: ما يُفصح عنه، وكيف تُصحح الأخطاء، وما الذي لا تثبته الملاحظات. إن كنت هنا لقراءة كيفية الاختبار، فصفحة الطريقة هي ما تبحثين عنه.",
  standardsUnapprovedNotice: "هذه المعايير مقترحة وليست معتمدة. صيغت أثناء التطوير ولم تراجعها زينا المقري ولم توافق عليها. تصف ممارسة مقصودة ولا ينبغي الاعتماد عليها بعد بوصفها التزاما منشورا.",
  standardsHeading: "المعايير",
  standardDisclosure: "الإفصاح",
  standardCorrections: "التصحيحات",
  standardRatings: "التقييمات",
  standardAi: "التأليف",
  standardMedical: "الحد الطبي",
  standardsLimitsHeading: "ما لا تفعله هذه المنصة",
  standardsLimitLab: "لا يُجرى أي اختبار مخبري، ولا تتحقق أي جهة مخبرية مستقلة من أي نتيجة تُنشر هنا.",
  standardsLimitPeer: "لا شيء مما يُنشر هنا خاضع لمراجعة الأقران أو التحقق العلمي أو مراجعة أي جهة خارجية.",
  standardsLimitMedical: "لا يراجع هذا المحتوى أي مختص طبي أو جلدي، ولا شيء منه استشارة سريرية.",
  standardsLimitSample: "كل ملاحظة هي تجربة شخص واحد مع وحدة واحدة من المنتج، في الظروف المسجلة معها. وليست ادعاء حول سلوك المنتج مع أي شخص آخر.",
  standardsOnwardHeading: "شاهديها مطبقة",
  standardsOnwardReviews: "كل سجل يحمل إفصاحه أعلى المحتوى",
  standardsOnwardMethod: "المراحل الست التي يُبنى منها السجل",
  privacyTitle: "الخصوصية",
  privacyIntro: "ما يفعله هذا الموقع بالبيانات، وما لا يمكن ذكره بعد.",
  termsTitle: "الشروط",
  termsIntro: "الشروط التي يُنشر بموجبها هذا الموقع، وما لا يمكن ذكره بعد.",
  legalPendingHeading: "هذه الوثيقة غير نافذة بعد",
  legalPendingBody: "لم تُحدد الولاية القضائية التي يُنشر هذا الموقع بموجبها، ومنها يتفرع نظام الخصوصية المطبق ومتطلبات الموافقة والقانون الحاكم. وبدل تقريب موقف قانوني لم يختره أحد، تسجل هذه الصفحة ما هو ناقص. لا شيء هنا استشارة قانونية، ولا شيء هنا يدّعي الامتثال لأي نظام بعينه.",
  legalPartialHeading: "هذه الوثيقة غير مكتملة بعد",
  legalPartialBody: "تحددت الولاية القضائية التي يُنشر هذا الموقع بموجبها: سوريا. لا يزال نظام الخصوصية المحدد، والكيان القانوني المسجَّل، والبنود الأخرى أدناه مطلوبة قبل اكتمال هذه الوثيقة. جمهور الموقع عالمي؛ ذكر ولاية قضائية هنا لا يعني أن قوانين كل زائر مطابقة لها. لا شيء هنا استشارة قانونية، ولا شيء هنا يدّعي الامتثال لأي نظام بعينه.",
  legalMissingHeading: "المطلوب من المالك قبل كتابة هذه الوثيقة",
  legalMissingRegimeSpecifics: "النظام أو التشريع المحدد للخصوصية المطبق ضمن الولاية القضائية المذكورة، ومتطلبات الموافقة الناتجة عنه.",
  legalMissingController: "الجهة المتحكمة بالبيانات، وطريقة تواصل لطلبات البيانات.",
  legalMissingRetention: "مدد الاحتفاظ بالبيانات، وقائمة أي جهات معالجة مستخدمة.",
  legalMissingRights: "حقوق أصحاب البيانات المطبقة، وكيفية ممارستها.",
  legalMissingGoverningLaw: "القانون الحاكم والجهة المختصة بأي نزاع.",
  legalMissingEntity: "الكيان القانوني الناشر لهذا الموقع وبياناته المسجلة.",
  legalMissingLiability: "حدود المسؤولية المناسبة لذلك الكيان وتلك الولاية القضائية.",
  legalFactualHeading: "ما يفعله هذا الموقع فعليا",
  legalFactNoTracking: "لا يشغّل أي تحليلات أو تتبع أو نصوص برمجية من طرف ثالث من أي نوع.",
  legalFactNoCookies: "لا يضع أي ملفات تعريف ارتباط، ولذلك لا يطلب أي موافقة عليها. شريط يطلب الإذن بشيء لا يحدث سيكون مضللا.",
  legalFactNoScripts: "لا يرسل أي جافاسكربت إلى المتصفح إطلاقا. كل صفحة هي HTML وCSS ثابتة.",
  legalFactNoAccounts: "لا توجد حسابات ولا تسجيل دخول ولا تعليقات ولا نماذج، لذلك لا يجمع شيئا مما تكتبينه.",
  legalFactFonts: "الخطوط مستضافة ذاتيا وتُقدّم من هذا النطاق، لذلك قراءة أي صفحة لا ترسل أي طلب إلى أي طرف آخر.",
  legalIdentityHeading: "من ينشر هذا",
  legalCopyrightHolder: "حقوق النشر",
  legalEntity: "الكيان القانوني",
  legalJurisdiction: "الولاية القضائية",
  legalEntityUnknown: "لم يُنشأ أي كيان قانوني لهذا الموقع بعد. وحين يُنشأ، سيُذكر هنا.",
  legalOnwardHeading: "ذات صلة",
  legalOnwardStandards: "كيف يُتعامل مع الأدلة والإفصاح",
  legalOnwardContact: "كيفية التواصل مع هذه المنصة",
} satisfies Record<keyof typeof en, string>;

const dictionaries = { en, ar } as const;

export type UiKey = keyof typeof en;

/** Typed string lookup. A missing key is a compile error, not a runtime blank. */
export function t(locale: Locale, key: UiKey): string {
  return dictionaries[locale][key];
}

/** Bound lookup, so templates read `s("verdict")` rather than `t(locale, "verdict")`. */
export const strings = (locale: Locale) => (key: UiKey): string => t(locale, key);
