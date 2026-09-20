import "server-only";

import postgres from "postgres";
import {
  publicCauseSchema,
  publicFeedPageSchema,
  publicOrganizationProfileSchema,
  publicOrganizationQuerySchema,
  publicOrganizationSummarySchema,
  publishedContentPageSchema,
  type PublicCause,
  type PublicFeedPage,
  type PublicOrganizationProfile,
  type PublicOrganizationSummary,
  type PublishedContentPage,
} from "@insips/contracts";
import { seedCauses, seedContentPages, seedOrganizations, seedPosts } from "./content-seed";

type SqlClient = ReturnType<typeof postgres>;

let client: SqlClient | undefined;

function seedMode() {
  return process.env.INSIPS_CONTENT_MODE !== "postgres" || !process.env.DATABASE_URL;
}

function db(): SqlClient {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required when INSIPS_CONTENT_MODE=postgres.");
  }
  client ??= postgres(process.env.DATABASE_URL, {
    max: 3,
    idle_timeout: 5,
    connect_timeout: 5,
    prepare: false,
  });
  return client;
}

async function withLocalFallback<T>(fallback: () => T, query: () => Promise<T>): Promise<T> {
  if (seedMode()) return fallback();
  try {
    return await query();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Content database unavailable; using local seed adapter.", error);
      return fallback();
    }
    throw error;
  }
}

const matchesQuery = (organization: PublicOrganizationSummary, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [organization.displayName, organization.summary, organization.location, ...organization.focusAreas]
    .join(" ")
    .toLowerCase()
    .includes(normalized);
};

export async function getPublicOrganizations(options: {
  query?: string;
  focusArea?: string;
} = {}): Promise<PublicOrganizationSummary[]> {
  const parsedOptions = publicOrganizationQuerySchema.parse(options);
  const fallback = () => seedOrganizations
    .map((organization) => {
      const { trustIndicators, ...summary } = organization;
      return { ...summary, approvedIndicatorCount: trustIndicators.length };
    })
    .filter((organization) => matchesQuery(organization, parsedOptions.query ?? ""))
    .filter((organization) => !parsedOptions.focusArea || organization.focusAreas.includes(parsedOptions.focusArea));

  return withLocalFallback(fallback, async () => {
    const rows = await db()`
      SELECT
        o.slug,
        o.display_name,
        o.summary,
        concat_ws(', ', o.city, o.state) AS location,
        o.logo_mark,
        o.disclosure,
        o.website_url,
        COALESCE(array_agg(DISTINCT f.name) FILTER (WHERE f.name IS NOT NULL), '{}') AS focus_areas,
        COUNT(DISTINCT ti.id)::int AS approved_indicator_count
      FROM public_organizations o
      LEFT JOIN public_organization_focus_areas f ON f.organization_id = o.id
      LEFT JOIN public_trust_indicators ti ON ti.organization_id = o.id AND ti.publishing_state = 'PUBLISHED'
      WHERE o.publishing_state = 'PUBLISHED'
        AND (${parsedOptions.query ?? ""} = '' OR o.search_document @@ plainto_tsquery('simple', ${parsedOptions.query ?? ""}))
        AND (${parsedOptions.focusArea ?? ""} = '' OR EXISTS (
          SELECT 1 FROM public_organization_focus_areas filter_f
          WHERE filter_f.organization_id = o.id AND filter_f.name = ${parsedOptions.focusArea ?? ""}
        ))
      GROUP BY o.id
      ORDER BY o.display_name
    `;
    return rows.map((row) => publicOrganizationSummarySchema.parse({
      slug: row.slug,
      displayName: row.display_name,
      summary: row.summary,
      location: row.location,
      focusAreas: row.focus_areas,
      logoMark: row.logo_mark,
      disclosure: row.disclosure,
      websiteUrl: row.website_url ?? undefined,
      approvedIndicatorCount: row.approved_indicator_count,
    }));
  });
}

export async function getPublicOrganization(slug: string): Promise<PublicOrganizationProfile | null> {
  const normalizedSlug = publicOrganizationSummarySchema.shape.slug.parse(slug.trim());
  const fallback = () => seedOrganizations.find((organization) => organization.slug === normalizedSlug) ?? null;
  return withLocalFallback(fallback, async () => {
    const rows = await db()`
      SELECT
        o.slug,
        o.display_name,
        o.summary,
        concat_ws(', ', o.city, o.state) AS location,
        o.logo_mark,
        o.disclosure,
        o.website_url,
        COALESCE(array_agg(DISTINCT f.name) FILTER (WHERE f.name IS NOT NULL), '{}') AS focus_areas,
        COALESCE((SELECT jsonb_agg(jsonb_build_object('label', s.label, 'href', s.href) ORDER BY s.label)
          FROM public_organization_socials s WHERE s.organization_id = o.id AND s.publishing_state = 'PUBLISHED'), '[]'::jsonb) AS official_socials,
        COALESCE((SELECT jsonb_agg(jsonb_build_object(
          'id', m.id, 'type', m.media_type, 'title', m.title, 'alt', m.alt_text,
          'canonicalUrl', m.canonical_url, 'sourceUrl', m.source_url, 'provider', m.provider,
          'attribution', m.attribution, 'permission', m.permission_status,
          'publishingState', m.publishing_state, 'width', m.width, 'height', m.height,
          'posterUrl', m.poster_url) ORDER BY m.created_at DESC)
          FROM public_media m WHERE m.organization_id = o.id AND m.publishing_state = 'PUBLISHED'), '[]'::jsonb) AS media,
        COALESCE((SELECT jsonb_agg(jsonb_build_object(
          'id', p.id, 'organizationSlug', o.slug, 'organizationName', o.display_name,
          'kind', p.kind, 'title', p.title, 'body', p.body, 'publishedAt', to_char(p.published_at, 'DD FMMonth YYYY'),
          'href', concat('/organizations/', o.slug)) ORDER BY p.published_at DESC)
          FROM public_feed_posts p WHERE p.organization_id = o.id AND p.publishing_state = 'PUBLISHED'), '[]'::jsonb) AS posts,
        COALESCE((SELECT jsonb_agg(jsonb_build_object(
          'id', c.id, 'slug', c.slug, 'organizationSlug', o.slug, 'organizationName', o.display_name,
          'title', c.title, 'summary', c.summary, 'category', c.category,
          'targetPaise', c.target_paise, 'raisedPaise', c.raised_paise, 'endDate', c.end_date)
          ORDER BY c.end_date)
          FROM public_causes c WHERE c.organization_id = o.id AND c.publishing_state = 'PUBLISHED'), '[]'::jsonb) AS causes,
        COALESCE((SELECT jsonb_agg(jsonb_build_object(
          'id', ti.id, 'label', ti.label, 'value', ti.value, 'meaning', ti.meaning,
          'scope', ti.scope, 'reviewedAt', to_char(ti.reviewed_at, 'DD FMMonth YYYY'),
          'status', 'APPROVED') ORDER BY ti.reviewed_at DESC)
          FROM public_trust_indicators ti WHERE ti.organization_id = o.id AND ti.publishing_state = 'PUBLISHED'), '[]'::jsonb) AS trust_indicators
      FROM public_organizations o
      LEFT JOIN public_organization_focus_areas f ON f.organization_id = o.id
      WHERE o.slug = ${normalizedSlug} AND o.publishing_state = 'PUBLISHED'
      GROUP BY o.id
    `;
    const row = rows[0];
    if (!row) return null;
    return publicOrganizationProfileSchema.parse({
      slug: row.slug,
      displayName: row.display_name,
      summary: row.summary,
      location: row.location,
      focusAreas: row.focus_areas,
      logoMark: row.logo_mark,
      disclosure: row.disclosure,
      websiteUrl: row.website_url ?? undefined,
      approvedIndicatorCount: row.trust_indicators.length,
      officialSocials: row.official_socials,
      media: row.media,
      posts: row.posts,
      causes: row.causes,
      trustIndicators: row.trust_indicators,
    });
  });
}

export async function getPublishedCauses(options: { limit?: number } = {}): Promise<PublicCause[]> {
  const limit = Math.min(Math.max(options.limit ?? 12, 1), 50);
  return withLocalFallback(
    () => seedCauses.slice(0, limit).map((cause) => publicCauseSchema.parse(cause)),
    async () => {
      const rows = await db()`
        SELECT c.id, c.slug, o.slug AS organization_slug, o.display_name AS organization_name,
          c.title, c.summary, c.category, c.target_paise, c.raised_paise, c.end_date
        FROM public_causes c
        JOIN public_organizations o ON o.id = c.organization_id
        WHERE c.publishing_state = 'PUBLISHED' AND o.publishing_state = 'PUBLISHED'
        ORDER BY c.end_date
        LIMIT ${limit}
      `;
      return rows.map((row) => publicCauseSchema.parse({
        id: row.id,
        slug: row.slug,
        organizationSlug: row.organization_slug,
        organizationName: row.organization_name,
        title: row.title,
        summary: row.summary,
        category: row.category,
        targetPaise: row.target_paise,
        raisedPaise: row.raised_paise,
        endDate: row.end_date,
      }));
    },
  );
}

export async function getPublishedFeed(options: { cursor?: string; limit?: number } = {}): Promise<PublicFeedPage> {
  const limit = Math.min(Math.max(options.limit ?? 12, 1), 50);
  const fallback = () => publicFeedPageSchema.parse({
    items: seedPosts.slice(0, limit),
    nextCursor: seedPosts.length > limit ? String(limit) : undefined,
  });
  return withLocalFallback(fallback, async () => {
    const cursor = options.cursor ? Number.parseInt(options.cursor, 10) : 0;
    const rows = await db()`
      SELECT p.id, o.slug AS organization_slug, o.display_name AS organization_name,
        p.kind, p.title, p.body, to_char(p.published_at, 'DD FMMonth YYYY') AS published_at,
        concat('/organizations/', o.slug) AS href
      FROM public_feed_posts p
      JOIN public_organizations o ON o.id = p.organization_id
      WHERE p.publishing_state = 'PUBLISHED' AND o.publishing_state = 'PUBLISHED'
      ORDER BY p.published_at DESC
      OFFSET ${Number.isFinite(cursor) ? cursor : 0}
      LIMIT ${limit + 1}
    `;
    const hasNext = rows.length > limit;
    return publicFeedPageSchema.parse({
      items: rows.slice(0, limit).map((row) => ({
        id: row.id,
        organizationSlug: row.organization_slug,
        organizationName: row.organization_name,
        kind: row.kind,
        title: row.title,
        body: row.body,
        publishedAt: row.published_at,
        href: row.href,
      })),
      nextCursor: hasNext ? String((Number.isFinite(cursor) ? cursor : 0) + limit) : undefined,
    });
  });
}

export async function getPublishedSiteContent(slug: string): Promise<PublishedContentPage | null> {
  const fallback = () => seedContentPages.find((page) => page.slug === slug) ?? null;
  return withLocalFallback(fallback, async () => {
    const rows = await db()`
      SELECT slug, kicker, title, intro, sections
      FROM public_site_content
      WHERE slug = ${slug} AND publishing_state = 'PUBLISHED'
      LIMIT 1
    `;
    return rows[0] ? publishedContentPageSchema.parse(rows[0]) : null;
  });
}
