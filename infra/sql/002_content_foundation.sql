BEGIN;

DO $$ BEGIN
  CREATE TYPE content_publishing_state AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED', 'REJECTED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  legal_name text,
  display_name text NOT NULL,
  summary text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  logo_mark text NOT NULL,
  website_url text,
  disclosure text NOT NULL,
  source_url text,
  source_retrieved_on date,
  publishing_state content_publishing_state NOT NULL DEFAULT 'DRAFT',
  search_document tsvector GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(display_name, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(city, '') || ' ' || coalesce(state, ''))
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
CREATE INDEX IF NOT EXISTS public_organizations_search_idx ON public_organizations USING gin(search_document);
CREATE INDEX IF NOT EXISTS public_organizations_publishing_idx ON public_organizations(publishing_state, display_name);

CREATE TABLE IF NOT EXISTS public_organization_focus_areas (
  organization_id uuid NOT NULL REFERENCES public_organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, name)
);

CREATE TABLE IF NOT EXISTS public_organization_socials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public_organizations(id) ON DELETE CASCADE,
  label text NOT NULL,
  href text NOT NULL,
  publishing_state content_publishing_state NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public_organizations(id) ON DELETE SET NULL,
  media_type text NOT NULL CHECK (media_type IN ('IMAGE', 'VIDEO', 'EMBED')),
  title text NOT NULL,
  alt_text text NOT NULL,
  source_url text NOT NULL,
  canonical_url text NOT NULL,
  provider text NOT NULL,
  object_reference text,
  creator text,
  license text,
  permission_status text NOT NULL CHECK (permission_status IN ('OWNER_PROVIDED', 'LICENSED', 'PUBLIC_DOMAIN', 'EMBED_ONLY', 'LOCAL_FIXTURE')),
  attribution text,
  retrieved_on date,
  width integer NOT NULL CHECK (width > 0),
  height integer NOT NULL CHECK (height > 0),
  poster_url text,
  moderation_state text NOT NULL DEFAULT 'PENDING' CHECK (moderation_state IN ('PENDING', 'APPROVED', 'REJECTED')),
  publishing_state content_publishing_state NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS public_media_org_idx ON public_media(organization_id, publishing_state, created_at DESC);

CREATE TABLE IF NOT EXISTS public_feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public_organizations(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('UPDATE', 'CAUSE', 'EVENT', 'MILESTONE')),
  title text NOT NULL,
  body text NOT NULL,
  published_at timestamptz NOT NULL,
  publishing_state content_publishing_state NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS public_feed_posts_published_idx ON public_feed_posts(publishing_state, published_at DESC);

CREATE TABLE IF NOT EXISTS public_causes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public_organizations(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  title text NOT NULL,
  summary text NOT NULL,
  category text NOT NULL,
  target_paise bigint NOT NULL CHECK (target_paise > 0),
  raised_paise bigint NOT NULL DEFAULT 0 CHECK (raised_paise >= 0),
  end_date date NOT NULL,
  publishing_state content_publishing_state NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS public_causes_published_idx ON public_causes(publishing_state, end_date);

CREATE TABLE IF NOT EXISTS public_cause_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cause_id uuid NOT NULL REFERENCES public_causes(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  published_at timestamptz NOT NULL,
  publishing_state content_publishing_state NOT NULL DEFAULT 'DRAFT'
);

CREATE TABLE IF NOT EXISTS public_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public_organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL,
  starts_at timestamptz NOT NULL,
  location text NOT NULL,
  registration_url text,
  publishing_state content_publishing_state NOT NULL DEFAULT 'DRAFT'
);

CREATE TABLE IF NOT EXISTS public_volunteer_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public_organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL,
  location text NOT NULL,
  commitment text NOT NULL,
  open_spots integer NOT NULL CHECK (open_spots >= 0),
  publishing_state content_publishing_state NOT NULL DEFAULT 'DRAFT'
);

CREATE TABLE IF NOT EXISTS public_trust_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public_organizations(id) ON DELETE CASCADE,
  label text NOT NULL,
  value text NOT NULL,
  meaning text NOT NULL,
  scope text NOT NULL,
  reviewed_at date NOT NULL,
  approved_version integer NOT NULL CHECK (approved_version > 0),
  publishing_state content_publishing_state NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS public_trust_indicators_published_idx ON public_trust_indicators(organization_id, publishing_state, reviewed_at DESC);

CREATE TABLE IF NOT EXISTS public_site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  kicker text NOT NULL,
  title text NOT NULL,
  intro text NOT NULL,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  publishing_state content_publishing_state NOT NULL DEFAULT 'DRAFT',
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id uuid REFERENCES app_users(id),
  topic text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'SPAM')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS organization_widget_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  layout text NOT NULL DEFAULT 'feed' CHECK (layout IN ('feed', 'grid', 'compact')),
  cause_filter uuid REFERENCES public_causes(id),
  width text NOT NULL DEFAULT '100%',
  height text NOT NULL DEFAULT '640px',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  public_identifier text NOT NULL UNIQUE,
  secret_hash text,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES app_users(id),
  tenant_id uuid REFERENCES tenants(id),
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  request_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_audit_events_tenant_idx ON admin_audit_events(tenant_id, created_at DESC);

COMMIT;
