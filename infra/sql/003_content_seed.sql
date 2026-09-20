BEGIN;

-- Local/early-environment seed only. Production publication requires reviewed source records.
INSERT INTO public_organizations (id, slug, display_name, summary, city, state, logo_mark, website_url, disclosure, source_url, source_retrieved_on, publishing_state)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'udaan-learning-foundation', 'Udaan Learning Foundation', 'Community-led learning centres helping first-generation students build foundational literacy and stay in school.', 'Pune', 'Maharashtra', 'UL', 'https://example.org/udaan-learning-foundation', 'Independent public directory record. Not an INSIPS endorsement.', 'https://example.org/udaan-learning-foundation', CURRENT_DATE, 'PUBLISHED'),
  ('10000000-0000-4000-8000-000000000002', 'jal-saathi-collective', 'Jal Saathi Collective', 'A local demonstration organization coordinating safe-water access with village partners in Rajasthan.', 'Udaipur', 'Rajasthan', 'JS', 'https://example.org/jal-saathi-collective', 'Independent public directory record. Not an INSIPS endorsement.', 'https://example.org/jal-saathi-collective', CURRENT_DATE, 'PUBLISHED'),
  ('10000000-0000-4000-8000-000000000003', 'sahaara-health-network', 'Sahaara Health Network', 'A local demonstration public-health network supporting preventive care and referrals across peri-urban communities.', 'Bengaluru', 'Karnataka', 'SH', 'https://example.org/sahaara-health-network', 'Independent public directory record. Not an INSIPS endorsement.', 'https://example.org/sahaara-health-network', CURRENT_DATE, 'PUBLISHED')
ON CONFLICT (slug) DO UPDATE SET display_name = EXCLUDED.display_name, summary = EXCLUDED.summary, updated_at = now();

INSERT INTO public_organization_focus_areas (organization_id, name)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'Education'),
  ('10000000-0000-4000-8000-000000000001', 'Youth'),
  ('10000000-0000-4000-8000-000000000001', 'Community learning'),
  ('10000000-0000-4000-8000-000000000002', 'Water'),
  ('10000000-0000-4000-8000-000000000002', 'Rural development'),
  ('10000000-0000-4000-8000-000000000003', 'Health'),
  ('10000000-0000-4000-8000-000000000003', 'Women'),
  ('10000000-0000-4000-8000-000000000003', 'Preventive care')
ON CONFLICT DO NOTHING;

INSERT INTO public_causes (id, organization_id, slug, title, summary, category, target_paise, raised_paise, end_date, publishing_state)
VALUES
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'learning-kits-2026', 'Learning kits for first-generation students', 'Support books, learning materials, and guided practice sessions across community learning centres.', 'Education', 1200000, 684500, '2026-12-15', 'PUBLISHED'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'village-water-testing', 'Village water-quality testing and local training', 'Equip volunteer teams with field test kits and practical training for local safe-water monitoring.', 'Water', 850000, 291000, '2027-01-31', 'PUBLISHED'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'preventive-health-camps', 'Preventive health camps for peri-urban communities', 'Support screening, referral coordination, and community health education through a mobile clinic programme.', 'Healthcare', 2000000, 430000, '2027-03-20', 'PUBLISHED')
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, summary = EXCLUDED.summary, raised_paise = EXCLUDED.raised_paise, end_date = EXCLUDED.end_date, publishing_state = EXCLUDED.publishing_state, updated_at = now();

INSERT INTO public_trust_indicators (id, organization_id, label, value, meaning, scope, reviewed_at, approved_version, publishing_state)
VALUES
  ('30000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'Organization registration', 'Section 8 company', 'A reviewer matched the organization-confirmed value to submitted evidence.', 'Organization registration', '2026-09-12', 1, 'PUBLISHED'),
  ('30000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', '12A status', 'Active at last review', 'A reviewer matched the organization-confirmed value to submitted evidence.', '12A status', '2026-09-08', 1, 'PUBLISHED')
ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value, reviewed_at = EXCLUDED.reviewed_at, publishing_state = EXCLUDED.publishing_state;

INSERT INTO public_feed_posts (id, organization_id, kind, title, body, published_at, publishing_state)
VALUES
  ('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'MILESTONE', 'The first learning-kit distribution is ready to report', 'A public update can show what changed, when it changed, and which cause it belongs to without exposing private participant details.', '2026-09-18T09:00:00Z', 'PUBLISHED'),
  ('40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'CAUSE', 'A water-testing cause with a visible next step', 'The public cause view keeps the target, current progress, end date, and organization context together.', '2026-09-15T09:00:00Z', 'PUBLISHED'),
  ('40000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000003', 'EVENT', 'Community preventive-health orientation', 'Events are public records with a date, host, and clear action. They do not rely on invented engagement numbers.', '2026-09-12T09:00:00Z', 'PUBLISHED')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body, published_at = EXCLUDED.published_at, publishing_state = EXCLUDED.publishing_state;

INSERT INTO public_site_content (slug, kicker, title, intro, sections, publishing_state)
VALUES
  ('security-privacy', 'Security and privacy', 'Clear public context without public documents.', 'INSIPS separates public signals from restricted evidence and explains what each review does and does not mean.', '[{"title":"Public by projection","body":"Only current approved indicators and permissioned public media appear outside the workspace. Private evidence, reviewer notes, and signed access URLs stay restricted."},{"title":"Human decisions stay visible","body":"Compass can prepare candidates, but an organization confirms the value and an independent reviewer decides whether the current version can be projected."}]'::jsonb, 'PUBLISHED')
ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, intro = EXCLUDED.intro, sections = EXCLUDED.sections, publishing_state = EXCLUDED.publishing_state, updated_at = now();

COMMIT;
