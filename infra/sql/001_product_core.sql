BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE tenant_type AS ENUM ('ORGANIZATION', 'CORPORATE');
CREATE TYPE membership_permission AS ENUM ('MEMBER', 'ADMIN');
CREATE TYPE membership_status AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE organization_status AS ENUM ('DRAFT', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE document_review_status AS ENUM ('PENDING', 'CHANGES_REQUESTED', 'APPROVED', 'REJECTED', 'EXPIRED');
CREATE TYPE donation_status AS ENUM ('CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'CANCELLED', 'PARTIALLY_REFUNDED', 'REFUNDED');
CREATE TYPE transfer_status AS ENUM ('NOT_CONFIGURED', 'CREATED', 'PENDING', 'PROCESSED', 'FAILED', 'REVERSED', 'PARTIALLY_REVERSED');
CREATE TYPE item_pledge_status AS ENUM ('PLEDGED', 'CHANGES_REQUESTED', 'ACCEPTED', 'REJECTED', 'SCHEDULED', 'RECEIVED', 'CANCELLED');
CREATE TYPE volunteer_status AS ENUM ('APPLIED', 'APPROVED', 'REJECTED', 'COMPLETED', 'WITHDRAWN');

CREATE TABLE app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cognito_sub text NOT NULL UNIQUE,
  email text NOT NULL,
  display_name text NOT NULL,
  archived_at timestamptz,
  deletion_requested_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type tenant_type NOT NULL,
  legal_name text NOT NULL,
  display_name text NOT NULL,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  status organization_status NOT NULL DEFAULT 'DRAFT',
  suspended_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  user_id uuid NOT NULL REFERENCES app_users(id),
  permission membership_permission NOT NULL,
  status membership_status NOT NULL DEFAULT 'INVITED',
  invited_by uuid REFERENCES app_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id)
);
CREATE INDEX tenant_memberships_user_idx ON tenant_memberships(user_id, status);

CREATE TABLE onboarding_drafts (
  tenant_id uuid PRIMARY KEY REFERENCES tenants(id),
  current_step text NOT NULL,
  completed_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  values jsonb NOT NULL DEFAULT '{}'::jsonb,
  rejected_fields jsonb NOT NULL DEFAULT '{}'::jsonb,
  status organization_status NOT NULL DEFAULT 'DRAFT',
  version integer NOT NULL DEFAULT 1,
  updated_by uuid NOT NULL REFERENCES app_users(id),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE private_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  object_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0),
  scan_status text NOT NULL,
  review_status document_review_status NOT NULL DEFAULT 'PENDING',
  expires_on date,
  created_by uuid NOT NULL REFERENCES app_users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);
CREATE INDEX private_documents_tenant_idx ON private_documents(tenant_id, review_status);

CREATE TABLE organization_review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  document_id uuid REFERENCES private_documents(id),
  decision text NOT NULL,
  external_reason text,
  internal_note text,
  decided_by uuid NOT NULL REFERENCES app_users(id),
  decided_at timestamptz NOT NULL DEFAULT now(),
  CHECK (decision NOT IN ('REJECTED', 'CHANGES_REQUESTED') OR length(trim(external_reason)) > 0)
);

CREATE TABLE causes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text NOT NULL,
  target_paise bigint NOT NULL CHECK (target_paise > 0),
  raised_paise bigint NOT NULL DEFAULT 0 CHECK (raised_paise >= 0),
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_user_id uuid NOT NULL REFERENCES app_users(id),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  cause_id uuid NOT NULL REFERENCES causes(id),
  amount_paise bigint NOT NULL CHECK (amount_paise > 0),
  fee_rate_bps integer NOT NULL DEFAULT 25 CHECK (fee_rate_bps BETWEEN 0 AND 10000),
  platform_fee_paise bigint NOT NULL CHECK (platform_fee_paise >= 0),
  razorpay_fee_paise bigint NOT NULL DEFAULT 0 CHECK (razorpay_fee_paise >= 0),
  net_organization_paise bigint NOT NULL CHECK (net_organization_paise >= 0),
  donor_covers_platform_fee boolean NOT NULL DEFAULT false,
  anonymous boolean NOT NULL DEFAULT false,
  public_name text,
  donor_message text,
  idempotency_key text NOT NULL,
  status donation_status NOT NULL DEFAULT 'CREATED',
  transfer_status transfer_status NOT NULL DEFAULT 'NOT_CONFIGURED',
  refunded_paise bigint NOT NULL DEFAULT 0 CHECK (refunded_paise >= 0 AND refunded_paise <= amount_paise),
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text UNIQUE,
  razorpay_transfer_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX donations_donor_idempotency_idx ON donations(donor_user_id, idempotency_key);
CREATE INDEX donations_donor_idx ON donations(donor_user_id, created_at DESC);
CREATE INDEX donations_tenant_idx ON donations(tenant_id, created_at DESC);
CREATE INDEX donations_cause_idx ON donations(cause_id, created_at DESC);

CREATE TABLE payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL CHECK (provider = 'RAZORPAY'),
  provider_event_id text NOT NULL UNIQUE,
  donation_id uuid REFERENCES donations(id),
  event_type text NOT NULL,
  amount_paise bigint,
  payload_digest text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE accounting_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id uuid NOT NULL REFERENCES donations(id),
  event_id uuid NOT NULL UNIQUE REFERENCES payment_events(id),
  account_code text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('DEBIT', 'CREDIT')),
  amount_paise bigint NOT NULL CHECK (amount_paise >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE item_needs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  title text NOT NULL,
  category text NOT NULL,
  requested_quantity integer NOT NULL CHECK (requested_quantity > 0),
  received_quantity integer NOT NULL DEFAULT 0 CHECK (received_quantity >= 0),
  accepted_condition text NOT NULL,
  deadline date,
  dropoff_address text,
  pickup_available boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE item_pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  need_id uuid NOT NULL REFERENCES item_needs(id),
  donor_user_id uuid NOT NULL REFERENCES app_users(id),
  quantity integer NOT NULL CHECK (quantity > 0),
  item_condition text NOT NULL,
  private_image_key text,
  notes text,
  fulfilment_preference text NOT NULL CHECK (fulfilment_preference IN ('PICKUP', 'DROPOFF')),
  status item_pledge_status NOT NULL DEFAULT 'PLEDGED',
  scheduled_for timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE volunteer_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  capacity integer NOT NULL CHECK (capacity > 0),
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE volunteer_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id uuid NOT NULL REFERENCES volunteer_opportunities(id),
  applicant_user_id uuid NOT NULL REFERENCES app_users(id),
  status volunteer_status NOT NULL DEFAULT 'APPLIED',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (opportunity_id, applicant_user_id)
);

CREATE TABLE user_relationships (
  user_id uuid NOT NULL REFERENCES app_users(id),
  target_type text NOT NULL CHECK (target_type IN ('ORGANIZATION', 'CAUSE')),
  target_id uuid NOT NULL,
  relationship text NOT NULL CHECK (relationship IN ('FOLLOW', 'BOOKMARK')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, target_type, target_id, relationship)
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id),
  type text NOT NULL,
  title text NOT NULL,
  detail text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
