import {
  publicCauseSchema,
  publicFeedPostSchema,
  publicMediaSchema,
  publicOrganizationProfileSchema,
  publishedContentPageSchema,
  type PublicCause,
  type PublicFeedPost,
  type PublicMedia,
  type PublicOrganizationProfile,
  type PublishedContentPage,
} from "@insips/contracts";

const localScreenshot = (
  id: string,
  title: string,
  alt: string,
  sourceUrl: string,
): PublicMedia =>
  publicMediaSchema.parse({
    id,
    type: "IMAGE",
    title,
    alt,
    canonicalUrl: sourceUrl,
    sourceUrl,
    provider: "INSIPS local product capture",
    permission: "LOCAL_FIXTURE",
    publishingState: "PUBLISHED",
    width: 1440,
    height: 900,
  });

const udaanMedia = localScreenshot(
  "media-udaan-workspace",
  "Organization workspace preview",
  "Local product screenshot showing an organization evidence workspace.",
  "/admin-org-marketing-1440.png",
);

const corporateMedia = localScreenshot(
  "media-corporate-discovery",
  "Corporate discovery preview",
  "Local product screenshot showing a corporate organization discovery workspace.",
  "/corporate-discovery-dark.png",
);

const localAsset = (
  id: string,
  title: string,
  alt: string,
  sourceUrl: string,
  width: number,
  height: number,
): PublicMedia =>
  publicMediaSchema.parse({
    id,
    type: "IMAGE",
    title,
    alt,
    canonicalUrl: sourceUrl,
    sourceUrl,
    provider: "INSIPS supplied local asset",
    permission: "LOCAL_FIXTURE",
    publishingState: "PUBLISHED",
    width,
    height,
  });

const learningCauseMedia = localAsset(
  "asset-cause-learning",
  "Community learning session",
  "Children gathered for an outdoor learning session with a facilitator and school materials.",
  "/media/home/cause-learning.png",
  1024,
  757,
);

const waterCauseMedia = localAsset(
  "asset-cause-water",
  "Community water access work",
  "A community gathered around a local water point during a field programme.",
  "/media/home/cause-water-testing.png",
  1280,
  960,
);

const healthCauseMedia = localAsset(
  "asset-cause-health",
  "Community health camp",
  "A community health camp with a clinician, supplies, and people receiving care.",
  "/media/home/cause-health-camp.png",
  1188,
  802,
);

export const seedCauses: PublicCause[] = [
  publicCauseSchema.parse({
    id: "cause-learning-kits",
    slug: "learning-kits-2026",
    organizationSlug: "udaan-learning-foundation",
    organizationName: "Udaan Learning Foundation",
    title: "Learning kits for first-generation students",
    summary:
      "Support books, learning materials, and guided practice sessions across community learning centres.",
    category: "Education",
    targetPaise: 1_200_000,
    raisedPaise: 684_500,
    endDate: "2026-12-15",
    coverMedia: learningCauseMedia,
  }),
  publicCauseSchema.parse({
    id: "cause-water-testing",
    slug: "village-water-testing",
    organizationSlug: "jal-saathi-collective",
    organizationName: "Jal Saathi Collective",
    title: "Village water-quality testing and local training",
    summary:
      "Equip volunteer teams with field test kits and practical training for local safe-water monitoring.",
    category: "Water",
    targetPaise: 850_000,
    raisedPaise: 291_000,
    endDate: "2027-01-31",
    coverMedia: waterCauseMedia,
  }),
  publicCauseSchema.parse({
    id: "cause-mobile-health",
    slug: "preventive-health-camps",
    organizationSlug: "sahaara-health-network",
    organizationName: "Sahaara Health Network",
    title: "Preventive health camps for peri-urban communities",
    summary:
      "Support screening, referral coordination, and community health education through a mobile clinic programme.",
    category: "Healthcare",
    targetPaise: 2_000_000,
    raisedPaise: 430_000,
    endDate: "2027-03-20",
    coverMedia: healthCauseMedia,
  }),
];

const seedPosts: PublicFeedPost[] = [
  publicFeedPostSchema.parse({
    id: "post-udaan-kits",
    organizationSlug: "udaan-learning-foundation",
    organizationName: "Udaan Learning Foundation",
    kind: "MILESTONE",
    title: "The first learning-kit distribution is ready to report",
    body: "A public update can show what changed, when it changed, and which cause it belongs to without exposing private participant details.",
    publishedAt: "18 September 2026",
    media: udaanMedia,
    href: "/organizations/udaan-learning-foundation",
  }),
  publicFeedPostSchema.parse({
    id: "post-jal-testing",
    organizationSlug: "jal-saathi-collective",
    organizationName: "Jal Saathi Collective",
    kind: "CAUSE",
    title: "A water-testing cause with a visible next step",
    body: "The public cause view keeps the target, current progress, end date, and organization context together.",
    publishedAt: "15 September 2026",
    media: corporateMedia,
    href: "/causes/village-water-testing",
  }),
  publicFeedPostSchema.parse({
    id: "post-sahaara-event",
    organizationSlug: "sahaara-health-network",
    organizationName: "Sahaara Health Network",
    kind: "EVENT",
    title: "Community preventive-health orientation",
    body: "Events are public records with a date, host, and clear action. They do not rely on invented engagement numbers.",
    publishedAt: "12 September 2026",
    href: "/organizations/sahaara-health-network",
  }),
];

export const seedOrganizations: PublicOrganizationProfile[] = [
  publicOrganizationProfileSchema.parse({
    slug: "udaan-learning-foundation",
    displayName: "Udaan Learning Foundation",
    summary:
      "Community-led learning centres helping first-generation students build foundational literacy and stay in school.",
    location: "Pune, Maharashtra",
    focusAreas: ["Education", "Youth", "Community learning"],
    logoMark: "UL",
    disclosure: "Independent public directory record. Not an INSIPS endorsement.",
    websiteUrl: "https://example.org/udaan-learning-foundation",
    approvedIndicatorCount: 1,
    officialSocials: [],
    media: [udaanMedia],
    posts: seedPosts.filter((post) => post.organizationSlug === "udaan-learning-foundation"),
    causes: seedCauses.filter((cause) => cause.organizationSlug === "udaan-learning-foundation"),
    trustIndicators: [
      {
        id: "indicator-udaan-registration",
        label: "Organization registration",
        value: "Section 8 company",
        meaning: "A reviewer matched the organization-confirmed value to submitted evidence.",
        scope: "Organization registration",
        reviewedAt: "12 September 2026",
        status: "APPROVED",
      },
    ],
  }),
  publicOrganizationProfileSchema.parse({
    slug: "jal-saathi-collective",
    displayName: "Jal Saathi Collective",
    summary:
      "A local demonstration organization coordinating safe-water access with village partners in Rajasthan.",
    location: "Udaipur, Rajasthan",
    focusAreas: ["Water", "Rural development"],
    logoMark: "JS",
    disclosure: "Independent public directory record. Not an INSIPS endorsement.",
    approvedIndicatorCount: 1,
    officialSocials: [],
    media: [corporateMedia],
    posts: seedPosts.filter((post) => post.organizationSlug === "jal-saathi-collective"),
    causes: seedCauses.filter((cause) => cause.organizationSlug === "jal-saathi-collective"),
    trustIndicators: [
      {
        id: "indicator-jal-12a",
        label: "12A status",
        value: "Active at last review",
        meaning: "A reviewer matched the organization-confirmed value to submitted evidence.",
        scope: "12A status",
        reviewedAt: "08 September 2026",
        status: "APPROVED",
      },
    ],
  }),
  publicOrganizationProfileSchema.parse({
    slug: "sahaara-health-network",
    displayName: "Sahaara Health Network",
    summary:
      "A local demonstration public-health network supporting preventive care and referrals across peri-urban communities.",
    location: "Bengaluru, Karnataka",
    focusAreas: ["Health", "Women", "Preventive care"],
    logoMark: "SH",
    disclosure: "Independent public directory record. Not an INSIPS endorsement.",
    approvedIndicatorCount: 0,
    officialSocials: [],
    media: [],
    posts: seedPosts.filter((post) => post.organizationSlug === "sahaara-health-network"),
    causes: seedCauses.filter((cause) => cause.organizationSlug === "sahaara-health-network"),
    trustIndicators: [],
  }),
];

const contentPage = (input: PublishedContentPage): PublishedContentPage => publishedContentPageSchema.parse(input);

export const seedContentPages: PublishedContentPage[] = [
  contentPage({ slug: "about", kicker: "About INSIPS", title: "Make social-impact work easier to understand.", intro: "INSIPS connects public discovery, contribution, evidence preparation, and independent review without flattening a nuanced organization into one score.", sections: [{ title: "The product thesis", body: "Organizations should prepare evidence once and communicate reviewed facts with clear scope, meaning, and date." }, { title: "Responsible assistance", body: "Automation may prepare work, but people remain responsible for claims, review, and publication." }] }),
  contentPage({ slug: "for-organizations", kicker: "For organizations", title: "Prepare evidence once. Stay in control of every fact.", intro: "A clear workspace for evidence readiness, human confirmation, transparent review, and a public profile that stays current.", sections: [{ title: "A next action, not another empty dashboard", body: "See what is ready, what is missing, and the single most useful thing to do next.", points: ["Save and resume your organization profile", "Keep evidence restricted by default", "Track each claim independently"] }, { title: "Compass helps you prepare", body: "AI-assisted candidates reduce repetitive typing while source references and clear uncertainty keep you in control.", points: ["Accept, edit, or dismiss every suggestion", "No silent publication", "No legitimacy or compliance score"] }, { title: "Your public profile stays current", body: "Only the approved version of a claim appears publicly. Editing it requires a new review." }] }),
  contentPage({ slug: "for-corporate-teams", kicker: "For corporate and CSR teams", title: "Compare causes without replacing due diligence.", intro: "Build shortlists from specific public indicators, current causes, contribution history, and evidence context.", sections: [{ title: "Discovery with edges", body: "Search organizations and causes through explained public records rather than popularity or a black-box score." }, { title: "Shortlists for teams", body: "Save organizations, keep internal notes private, and compare current indicators before a matching commitment." }] }),
  contentPage({ slug: "for-csr-teams", kicker: "For CSR teams", title: "Understand why a claim is trusted, not just whether it has a badge.", intro: "Discover organizations through specific, dated, human-reviewed indicators and keep further due diligence in your own process.", sections: [{ title: "Specific indicators", body: "Registration, tax status, and other claims remain separate so each one can carry its own meaning and review date." }, { title: "A focused shortlist", body: "Save organizations for comparison without turning the trust workflow into a marketplace or automated funding decision." }, { title: "Questions that travel", body: "Carry the source context and open questions into the next internal review instead of treating a public signal as a final decision." }] }),
  contentPage({ slug: "how-trust-works", kicker: "How it works", title: "A visible path from private evidence to approved public facts.", intro: "Six understandable stages keep safety, assistance, organization ownership, independent review, and publication separate.", sections: [{ title: "Upload privately", body: "A supported document enters a restricted workspace with controlled file identity and clear format rules." }, { title: "Safety check", body: "The document stays blocked until the required safety result is known." }, { title: "Read the evidence", body: "The system prepares bounded, page-aware context while keeping the underlying file restricted." }, { title: "Review suggestions", body: "Compass returns candidate facts and source references. The organization accepts, edits, or dismisses each suggestion." }, { title: "Human decision", body: "An independent reviewer compares confirmed claims with source context and records a decision." }, { title: "Publish approved facts", body: "Only approved current versions appear publicly, with meaning and review date." }] }),
  contentPage({ slug: "trust-methodology", kicker: "Trust methodology", title: "A claim has a lifecycle, not a magic badge.", intro: "Understand scope, review standards, version changes, and the limits of what a public indicator can say.", sections: [{ title: "Claim lifecycle", body: "Draft, confirmation, submission, review, approval, rejection, and change requests remain separate states." }, { title: "Review standards", body: "A reviewer matches a specific organization-confirmed value to permitted evidence. Approval is scoped to that claim version." }, { title: "Limitations", body: "A reviewed indicator does not certify future conduct, replace due diligence, or create a universal trust score." }] }),
  contentPage({ slug: "compass", kicker: "Compass", title: "Assistive extraction with a person at every decision.", intro: "Compass can prepare candidates and source references. It cannot approve, publish, certify, or hide uncertainty.", sections: [{ title: "Accept, edit, or dismiss", body: "Every candidate remains visible alongside its source context until a person decides what to submit." }, { title: "What Compass cannot do", body: "The assistant cannot determine legitimacy, fraud, funding eligibility, or publication. Malformed output fails closed." }] }),
  contentPage({ slug: "resources", kicker: "Resources", title: "Understand the workflow before you trust the output.", intro: "Plain-language guides explain how evidence moves, what each indicator means, and where human judgment remains essential.", sections: [{ title: "How the workflow works", body: "Follow the path from private upload through confirmation, independent review, and approved publication." }, { title: "Security and privacy", body: "See which information is public, internal, confidential, or restricted and how those boundaries remain visible." }, { title: "Help and questions", body: "Find concise answers for organizations, reviewers, donors, and CSR users." }] }),
  contentPage({ slug: "faq", kicker: "Frequently asked questions", title: "Straight answers about evidence, AI, and review.", intro: "Private documents stay private, AI prepares candidates, and people remain responsible for every decision.", sections: [{ title: "Does INSIPS verify an organization?", body: "No. INSIPS presents specific human-reviewed claims and their meaning. It does not provide a universal legitimacy or fraud verdict." }, { title: "Can Compass publish a claim?", body: "No. An organization must confirm it and an independent reviewer must approve the current version." }, { title: "Who can see uploaded evidence?", body: "Only appropriately authorized people in the restricted workflow. Public and CSR views receive a narrow approved projection." }] }),
  contentPage({ slug: "security-privacy", kicker: "Security and privacy", title: "Clear public context without public documents.", intro: "INSIPS separates public signals from restricted evidence and explains what each review does and does not mean.", sections: [{ title: "Public by projection", body: "Only current approved indicators and permissioned public media appear outside the workspace. Private evidence, reviewer notes, and signed access URLs stay restricted." }, { title: "Human decisions stay visible", body: "Compass can prepare candidates, but an organization confirms the value and an independent reviewer decides whether the current version can be projected." }] }),
  contentPage({ slug: "security", kicker: "Security", title: "Boundaries are part of the product.", intro: "INSIPS is designed around tenant isolation, private evidence, safe processing, and recoverable decisions.", sections: [{ title: "Deny by default", body: "Identity, role, membership, and resource state are derived on the server before protected actions are allowed." }, { title: "Safe processing", body: "Files are validated and scanned before extraction. AI candidates are schema-checked and never approve or publish claims." }] }),
  contentPage({ slug: "help", kicker: "Help and contact", title: "Know what happened and what to do next.", intro: "Find a safe next step for account access, evidence preparation, contributions, volunteering, and team workflows.", sections: [{ title: "A document is blocked", body: "Keep it restricted. Correct the file or account issue, then retry only the failed safe stage. Never skip a required check.", category: "Troubleshooting" }, { title: "A public indicator disappeared", body: "The underlying value may have changed. This is expected until a reviewer approves the new version.", category: "Trust workflow" }, { title: "Recover account access", body: "Use the email recovery flow when you cannot sign in. Verification codes expire, and a new code can be requested after the resend timer completes.", category: "Account and access" }, { title: "Start an organization profile", body: "Save the organization profile as you go, add evidence only when you are authorized to share it, and invite teammates after the basics are complete.", category: "Organizations" }, { title: "Make an item contribution", body: "Choose an organization need, confirm the requested quantity and condition, then follow the pickup or drop-off instructions shown in your pledge timeline.", category: "Donations and items" }, { title: "Apply for a volunteer opportunity", body: "Review the time commitment and location before applying. The organization can approve, decline, or send an instruction update from its workspace.", category: "Volunteers" }, { title: "Use discovery with your corporate team", body: "Search public organizations, save a shortlist, and keep internal notes separate from the organization’s approved public information.", category: "Corporate teams" }] }),
  contentPage({ slug: "contact", kicker: "Contact", title: "Send the right question to the right team.", intro: "Use the validated contact form for support, onboarding, security, payments, or public-content questions.", sections: [{ title: "Choose a topic", body: "A topic helps route the request without asking you to expose private documents or payment secrets." }, { title: "What happens next", body: "The submission receives a safe status and remains visible only to authorized support staff." }] }),
  contentPage({ slug: "privacy", kicker: "Privacy policy", title: "Your information has a place and a boundary.", intro: "This product separates public, internal, confidential, and restricted information and describes how each class is handled.", sections: [{ title: "Public projection", body: "Only current approved claims and permissioned public media are intended for public responses." }, { title: "Restricted workflow", body: "Evidence, extracted text, reviewer notes, tokens, and signed access URLs remain restricted." }] }),
  contentPage({ slug: "terms", kicker: "Terms of use", title: "Use the platform with care and context.", intro: "These terms describe responsible use of public discovery, contribution flows, evidence workflows, and review decisions.", sections: [{ title: "No universal guarantee", body: "A reviewed indicator has a defined scope and date. It is not a promise about future conduct." }, { title: "Keep access personal", body: "Do not share credentials, bypass tenant boundaries, or upload data you are not authorized to provide." }] }),
  contentPage({ slug: "acceptable-use", kicker: "Acceptable use", title: "Keep people, evidence, and decisions safe.", intro: "Do not abuse public discovery, payments, media, uploads, identity, or reviewer workflows.", sections: [{ title: "Do not bypass controls", body: "Attempts to evade malware scans, role boundaries, rate limits, or publication states are prohibited." }, { title: "Do not misrepresent", body: "Do not claim endorsement, verification, partnership, or impact results without documented permission and source." }] }),
  contentPage({ slug: "cookies", kicker: "Cookie notice", title: "Use only the storage the experience needs.", intro: "The product should explain local theme preferences, session storage, consent-aware embeds, and necessary security controls plainly.", sections: [{ title: "Necessary storage", body: "Session and security storage support authentication and safe actions." }, { title: "Preference storage", body: "Theme and local demonstration preferences can be changed from the browser." }] }),
  contentPage({ slug: "donation-refund-policy", kicker: "Donation and refund policy", title: "Know what happens to a contribution.", intro: "Donation records distinguish pending, captured, failed, refunded, and transfer states.", sections: [{ title: "Captured progress", body: "A cause total changes only after a verified payment event. A browser redirect alone does not increase public progress." }, { title: "Refunds and fees", body: "Refunds create compensating ledger entries. The 25-basis-point INSIPS fee remains separate from provider processing fees." }] }),
  contentPage({ slug: "accessibility", kicker: "Accessibility", title: "The trust trail should be usable by more people.", intro: "INSIPS aims for WCAG 2.2 AA behavior across keyboard, touch, zoom, contrast, motion, and screen-reader use.", sections: [{ title: "Every interaction has a route", body: "Carousels, sliders, feeds, dialogs, lightboxes, and drawers provide keyboard and gesture alternatives." }, { title: "Motion respects preference", body: "Reduced-motion mode removes looping movement, parallax, and unnecessary transitions." }] }),
  contentPage({ slug: "hackathon", kicker: "Project story", title: "A product idea made tangible.", intro: "The local experience shows how an evidence-to-trust workflow can make public context more specific without exposing private documents.", sections: [{ title: "What the product explores", body: "Preparation, confirmation, review, public discovery, contribution, and role-specific workspaces share one clear trail." }, { title: "What remains to configure", body: "Live identity providers, payments, media permissions, and cloud resources require the production setup documented for this repository." }] }),
];

export { seedPosts };
