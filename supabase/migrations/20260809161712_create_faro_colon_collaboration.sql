/*
# Create Faro a Colón collaboration tables

1. New Tables
- `volunteers`: shared volunteer directory for people offering time, skills, zone, and contact details.
- `community_groups`: public organizing groups by Dominican Republic zone, with a coordinator and purpose.

2. Security
- Row Level Security is enabled on both tables.
- This is an intentionally public, no-sign-in coordination page, so anon and authenticated visitors can read and submit records.
- Four separate CRUD policies are defined for each table.

3. Important Notes
- Contact fields are displayed only as voluntarily submitted collaboration details.
- The page does not require account creation so people can join quickly during the 40-day fast.
*/

CREATE TABLE IF NOT EXISTS volunteers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  email text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254),
  phone text,
  zone text NOT NULL CHECK (char_length(zone) BETWEEN 2 AND 80),
  support_type text NOT NULL CHECK (support_type IN ('Flyers y diseño', 'Logística', 'Comunicación', 'Oración y acompañamiento', 'Donaciones', 'Transporte')),
  availability text NOT NULL CHECK (availability IN ('Entre semana', 'Fines de semana', 'Ambos')),
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 3 AND 120),
  zone text NOT NULL CHECK (char_length(zone) BETWEEN 2 AND 80),
  coordinator text NOT NULL CHECK (char_length(coordinator) BETWEEN 2 AND 120),
  contact text NOT NULL CHECK (char_length(contact) BETWEEN 5 AND 254),
  purpose text NOT NULL CHECK (char_length(purpose) BETWEEN 10 AND 500),
  members_count integer NOT NULL DEFAULT 1 CHECK (members_count BETWEEN 1 AND 10000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_volunteers" ON volunteers;
CREATE POLICY "public_read_volunteers" ON volunteers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_volunteers" ON volunteers;
CREATE POLICY "public_insert_volunteers" ON volunteers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_volunteers" ON volunteers;
CREATE POLICY "public_update_volunteers" ON volunteers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_volunteers" ON volunteers;
CREATE POLICY "public_delete_volunteers" ON volunteers FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "public_read_groups" ON community_groups;
CREATE POLICY "public_read_groups" ON community_groups FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "public_insert_groups" ON community_groups;
CREATE POLICY "public_insert_groups" ON community_groups FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "public_update_groups" ON community_groups;
CREATE POLICY "public_update_groups" ON community_groups FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "public_delete_groups" ON community_groups;
CREATE POLICY "public_delete_groups" ON community_groups FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS volunteers_zone_idx ON volunteers(zone);
CREATE INDEX IF NOT EXISTS volunteers_support_type_idx ON volunteers(support_type);
CREATE INDEX IF NOT EXISTS community_groups_zone_idx ON community_groups(zone);
