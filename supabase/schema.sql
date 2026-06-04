-- Supabase/Postgres schema for PulseGym
-- Tables, indexes and audit trigger

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Helper: profiles (maps to auth.users in production)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid, -- optional link to auth.users(id)
  full_name text,
  email text,
  role text NOT NULL CHECK (role IN ('superadmin','owner','supervisor','executive','trainer','member')) DEFAULT 'member',
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Plans
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  limits_json jsonb DEFAULT '{}'::jsonb,
  features_json jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gyms (tenants)
CREATE TABLE IF NOT EXISTS gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo text,
  city text,
  status text NOT NULL DEFAULT 'pending', -- pending, trial, active, suspended, cancelled
  plan_id uuid REFERENCES plans(id),
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gym user roles
CREATE TABLE IF NOT EXISTS gym_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner','supervisor','executive','trainer','member','staff')),
  permissions_json jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE (gym_id, user_id)
);

-- Memberships
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_name text,
  start_date date,
  end_date date,
  status text CHECK(status IN ('active','pending','cancelled','expired')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  method text,
  due_date date,
  paid_at timestamptz,
  status text CHECK(status IN ('paid','due','overdue')) DEFAULT 'due',
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Exercises library
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  name text NOT NULL,
  muscle_group text,
  video_url text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Routines
CREATE TABLE IF NOT EXISTS routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  trainer_id uuid REFERENCES profiles(id),
  name text,
  level text,
  objective text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Routine exercises
CREATE TABLE IF NOT EXISTS routine_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id) ON DELETE SET NULL,
  sets integer,
  reps integer,
  rest integer,
  notes text
);

-- Attendance (check-ins)
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  checkin_at timestamptz DEFAULT now(),
  source text
);

-- Progress logs
CREATE TABLE IF NOT EXISTS progress_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  weight numeric(6,2),
  measurements_json jsonb,
  photos_json jsonb,
  date date DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  body text,
  media_url text,
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now()
);

-- Post-workout surveys
CREATE TABLE IF NOT EXISTS post_workout_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  routine_id uuid REFERENCES routines(id) ON DELETE SET NULL,
  energy integer,
  difficulty integer,
  satisfaction integer,
  comments text,
  created_at timestamptz DEFAULT now()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  gym_id uuid,
  action text,
  entity text,
  entity_id uuid,
  before_json jsonb,
  after_json jsonb,
  created_at timestamptz DEFAULT now()
);

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  flag text NOT NULL,
  enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_memberships_gym_user ON memberships (gym_id, user_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym_user ON payments (gym_id, user_id);
CREATE INDEX IF NOT EXISTS idx_routines_gym ON routines (gym_id);
CREATE INDEX IF NOT EXISTS idx_attendance_gym ON attendance (gym_id);
CREATE INDEX IF NOT EXISTS idx_progress_logs_gym ON progress_logs (gym_id);

-- Audit trigger function (safe: uses JWT claims if available)
CREATE OR REPLACE FUNCTION public.log_audit() RETURNS trigger AS $$
DECLARE
  _actor text;
BEGIN
  BEGIN
    _actor := (current_setting('request.jwt.claims', true))::json ->> 'sub';
  EXCEPTION WHEN others THEN
    _actor := NULL;
  END;

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (actor_id, gym_id, action, entity, entity_id, before_json, after_json, created_at)
    VALUES (CASE WHEN _actor IS NOT NULL THEN _actor::uuid ELSE NULL END, NEW.gym_id, 'insert', TG_TABLE_NAME, NEW.id, NULL, row_to_json(NEW)::jsonb, now());
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (actor_id, gym_id, action, entity, entity_id, before_json, after_json, created_at)
    VALUES (CASE WHEN _actor IS NOT NULL THEN _actor::uuid ELSE NULL END, COALESCE(NEW.gym_id, OLD.gym_id), 'update', TG_TABLE_NAME, NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, now());
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (actor_id, gym_id, action, entity, entity_id, before_json, after_json, created_at)
    VALUES (CASE WHEN _actor IS NOT NULL THEN _actor::uuid ELSE NULL END, OLD.gym_id, 'delete', TG_TABLE_NAME, OLD.id, row_to_json(OLD)::jsonb, NULL, now());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach audit triggers to selected tables
DROP TRIGGER IF EXISTS audit_gyms ON gyms;
CREATE TRIGGER audit_gyms AFTER INSERT OR UPDATE OR DELETE ON gyms FOR EACH ROW EXECUTE PROCEDURE public.log_audit();

DROP TRIGGER IF EXISTS audit_memberships ON memberships;
CREATE TRIGGER audit_memberships AFTER INSERT OR UPDATE OR DELETE ON memberships FOR EACH ROW EXECUTE PROCEDURE public.log_audit();

DROP TRIGGER IF EXISTS audit_payments ON payments;
CREATE TRIGGER audit_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE PROCEDURE public.log_audit();

DROP TRIGGER IF EXISTS audit_routines ON routines;
CREATE TRIGGER audit_routines AFTER INSERT OR UPDATE OR DELETE ON routines FOR EACH ROW EXECUTE PROCEDURE public.log_audit();

-- Public registration and manual payment verification
CREATE TABLE IF NOT EXISTS contact_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_name text,
  owner_name text,
  email text,
  phone text,
  desired_plan text,
  message text,
  source text DEFAULT 'landing',
  status text CHECK(status IN ('new','contacted','converted','discarded')) DEFAULT 'new',
  metadata_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  gym_name text NOT NULL,
  owner_name text NOT NULL,
  email text NOT NULL,
  phone text,
  desired_plan text NOT NULL,
  amount numeric(10,2),
  currency text DEFAULT 'PEN',
  payment_method text CHECK(payment_method IN ('Yape','Plin','WhatsApp','Transferencia')) DEFAULT 'Yape',
  reference_code text UNIQUE NOT NULL,
  screenshot_path text,
  status text CHECK(status IN ('pending','approved','rejected','whatsapp')) DEFAULT 'pending',
  rejection_reason text,
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  metadata_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests (status);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_status ON payment_verifications (status);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_reference ON payment_verifications (reference_code);

DROP TRIGGER IF EXISTS audit_payment_verifications ON payment_verifications;
CREATE TRIGGER audit_payment_verifications AFTER INSERT OR UPDATE OR DELETE ON payment_verifications FOR EACH ROW EXECUTE PROCEDURE public.log_audit();

-- Platform subscriptions created after payment approval
CREATE TABLE IF NOT EXISTS platform_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES plans(id) ON DELETE SET NULL,
  status text CHECK(status IN ('trial','active','past_due','cancelled')) DEFAULT 'active',
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '1 month'),
  metadata_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_gym ON platform_subscriptions (gym_id);
CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_status ON platform_subscriptions (status);

DROP TRIGGER IF EXISTS audit_platform_subscriptions ON platform_subscriptions;
CREATE TRIGGER audit_platform_subscriptions AFTER INSERT OR UPDATE OR DELETE ON platform_subscriptions FOR EACH ROW EXECUTE PROCEDURE public.log_audit();

-- Marketplace products and static discount codes
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  base_price numeric(10,2) NOT NULL,
  discount_price numeric(10,2) NOT NULL,
  discount_code text NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  featured boolean DEFAULT false,
  image_url text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_products_active ON products (active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (featured);
CREATE INDEX IF NOT EXISTS idx_products_discount_code ON products (discount_code);

DROP TRIGGER IF EXISTS audit_products ON products;
-- Product audit should be written by admin APIs because products are global and do not have gym_id.

-- Storage buckets expected in Supabase:
-- comprobantes: private read, server-side upload to pending/, moved to approved/ after review.
-- productos: public read for active product images, admin-only writes.

-- Platform configuration and integration registry
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  logo_url text,
  description text,
  required_fields_json jsonb DEFAULT '[]'::jsonb,
  status text CHECK(status IN ('active','inactive','pending')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gym_payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  gateway_id uuid REFERENCES payment_gateways(id) ON DELETE SET NULL,
  name text NOT NULL,
  method_type text,
  public_label text,
  config_json jsonb DEFAULT '{}'::jsonb,
  instructions text,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gym_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  provider text NOT NULL,
  category text,
  status text CHECK(status IN ('requested','configured','active','paused','rejected')) DEFAULT 'requested',
  config_json jsonb DEFAULT '{}'::jsonb,
  requested_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  configured_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  configured_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  read_at timestamptz,
  metadata_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routine_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  routine_id uuid NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text CHECK(status IN ('active','completed','paused','archived')) DEFAULT 'active',
  assigned_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  notes text
);

CREATE TABLE IF NOT EXISTS nutrition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  name text NOT NULL,
  objective text,
  calories integer,
  meals_json jsonb DEFAULT '[]'::jsonb,
  status text CHECK(status IN ('active','archived')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nutrition_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  calories integer,
  ingredients_json jsonb DEFAULT '[]'::jsonb,
  instructions text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_gateways_status ON payment_gateways (status);
CREATE INDEX IF NOT EXISTS idx_gym_payment_methods_gym ON gym_payment_methods (gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_integrations_gym ON gym_integrations (gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_integrations_status ON gym_integrations (status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications (user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_routine_assignments_member ON routine_assignments (gym_id, member_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_gym ON nutrition_plans (gym_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_recipes_gym ON nutrition_recipes (gym_id);

DROP TRIGGER IF EXISTS audit_gym_payment_methods ON gym_payment_methods;
CREATE TRIGGER audit_gym_payment_methods AFTER INSERT OR UPDATE OR DELETE ON gym_payment_methods FOR EACH ROW EXECUTE PROCEDURE public.log_audit();

DROP TRIGGER IF EXISTS audit_gym_integrations ON gym_integrations;
CREATE TRIGGER audit_gym_integrations AFTER INSERT OR UPDATE OR DELETE ON gym_integrations FOR EACH ROW EXECUTE PROCEDURE public.log_audit();

DROP TRIGGER IF EXISTS audit_notifications ON notifications;
CREATE TRIGGER audit_notifications AFTER INSERT OR UPDATE OR DELETE ON notifications FOR EACH ROW EXECUTE PROCEDURE public.log_audit();

DROP TRIGGER IF EXISTS audit_routine_assignments ON routine_assignments;
CREATE TRIGGER audit_routine_assignments AFTER INSERT OR UPDATE OR DELETE ON routine_assignments FOR EACH ROW EXECUTE PROCEDURE public.log_audit();

DROP TRIGGER IF EXISTS audit_nutrition_plans ON nutrition_plans;
CREATE TRIGGER audit_nutrition_plans AFTER INSERT OR UPDATE OR DELETE ON nutrition_plans FOR EACH ROW EXECUTE PROCEDURE public.log_audit();

DROP TRIGGER IF EXISTS audit_nutrition_recipes ON nutrition_recipes;
CREATE TRIGGER audit_nutrition_recipes AFTER INSERT OR UPDATE OR DELETE ON nutrition_recipes FOR EACH ROW EXECUTE PROCEDURE public.log_audit();
