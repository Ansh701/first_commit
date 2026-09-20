import { z } from "zod";

export const publicMediaTypeSchema = z.enum(["IMAGE", "VIDEO", "EMBED"]);
export const publicMediaPermissionSchema = z.enum([
  "OWNER_PROVIDED",
  "LICENSED",
  "PUBLIC_DOMAIN",
  "EMBED_ONLY",
  "LOCAL_FIXTURE",
]);
export const publishingStateSchema = z.enum([
  "DRAFT",
  "IN_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
  "REJECTED",
]);

export const publicMediaSchema = z.object({
  id: z.string().min(1),
  type: publicMediaTypeSchema,
  title: z.string().min(1).max(140),
  alt: z.string().min(1).max(240),
  canonicalUrl: z.string().url().or(z.string().startsWith("/")),
  sourceUrl: z.string().url().or(z.string().startsWith("/")),
  provider: z.string().min(1).max(80),
  attribution: z.string().max(180).optional(),
  permission: publicMediaPermissionSchema,
  publishingState: z.literal("PUBLISHED"),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  posterUrl: z.string().url().or(z.string().startsWith("/")).optional(),
});

export type PublicMedia = z.infer<typeof publicMediaSchema>;

export const publicTrustIndicatorSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(100),
  value: z.string().min(1).max(160),
  meaning: z.string().min(1).max(320),
  scope: z.string().min(1).max(120),
  reviewedAt: z.string().min(1),
  status: z.literal("APPROVED"),
});

export type PublicTrustIndicator = z.infer<typeof publicTrustIndicatorSchema>;

export const publicOrganizationSummarySchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  displayName: z.string().min(2).max(120),
  summary: z.string().min(40).max(420),
  location: z.string().min(2).max(120),
  focusAreas: z.array(z.string().min(2).max(60)).min(1).max(8),
  logoMark: z.string().min(1).max(4),
  disclosure: z.string().min(1).max(240),
  websiteUrl: z.string().url().optional(),
  approvedIndicatorCount: z.number().int().nonnegative(),
});

export type PublicOrganizationSummary = z.infer<
  typeof publicOrganizationSummarySchema
>;

export const publicFeedPostSchema = z.object({
  id: z.string().min(1),
  organizationSlug: z.string().regex(/^[a-z0-9-]+$/),
  organizationName: z.string().min(2).max(120),
  kind: z.enum(["UPDATE", "CAUSE", "EVENT", "MILESTONE"]),
  title: z.string().min(1).max(160),
  body: z.string().min(1).max(500),
  publishedAt: z.string().min(1),
  media: publicMediaSchema.optional(),
  href: z.string().startsWith("/"),
});

export type PublicFeedPost = z.infer<typeof publicFeedPostSchema>;

export const publicCauseSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  organizationSlug: z.string().regex(/^[a-z0-9-]+$/),
  organizationName: z.string().min(2).max(120),
  title: z.string().min(2).max(160),
  summary: z.string().min(40).max(420),
  category: z.string().min(2).max(60),
  targetPaise: z.number().int().positive(),
  raisedPaise: z.number().int().nonnegative(),
  endDate: z.string().date(),
  coverMedia: publicMediaSchema.optional(),
});

export type PublicCause = z.infer<typeof publicCauseSchema>;

export const publicOrganizationProfileSchema = publicOrganizationSummarySchema.extend({
  officialSocials: z.array(
    z.object({
      label: z.string().min(1).max(40),
      href: z.string().url(),
    }),
  ),
  media: z.array(publicMediaSchema),
  posts: z.array(publicFeedPostSchema),
  causes: z.array(publicCauseSchema),
  trustIndicators: z.array(publicTrustIndicatorSchema),
});

export type PublicOrganizationProfile = z.infer<
  typeof publicOrganizationProfileSchema
>;

export const publishedContentPageSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  kicker: z.string().min(1).max(80),
  title: z.string().min(2).max(160),
  intro: z.string().min(20).max(500),
  sections: z.array(
    z.object({
      title: z.string().min(2).max(140),
      body: z.string().min(20).max(900),
      points: z.array(z.string().min(2).max(180)).max(8).optional(),
      category: z.string().min(2).max(60).optional(),
    }),
  ),
});

export type PublishedContentPage = z.infer<typeof publishedContentPageSchema>;

export const publicFeedPageSchema = z.object({
  items: z.array(publicFeedPostSchema),
  nextCursor: z.string().optional(),
});

export type PublicFeedPage = z.infer<typeof publicFeedPageSchema>;

export const publicOrganizationQuerySchema = z.object({
  query: z.string().trim().max(80).optional(),
  focusArea: z.string().trim().max(60).optional(),
});
