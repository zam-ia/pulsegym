-- PulseGym DB schema for Supabase / PostgreSQL
-- Includes tenants (gyms), users, roles, plans, memberships, payments,
-- routines, exercises, attendance, progress, community and audit logs.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Roles enum
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('superadmin', 'owner', 'supervisor', 'executive', 'trainer', 'member');
    END IF;
END$$;

-- Users (global profiles). Map to Supabase Auth via auth_id when available.
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid, -- optional mapping to auth.users.id (Supabase)
  name text,
  email text UNIQUE,
  phone text,
  password text, -- only for local/dev seeds; do NOT use in production with Supabase Auth
  global_role user_role,
  status text DEFAULT 'active',
  metadata jsonb DEFAULT '{}'::jsonb,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Plans
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric(10,2) DEFAULT 0,
  limits jsonb DEFAULT '{}'::jsonb,
  features jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Gyms (tenants)
CREATE TABLE IF NOT EXISTS gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES users(id),
  name text NOT NULL,
  slug text UNIQUE,
  logo text,
  city text,
  status text DEFAULT 'pending', -- pending, active, suspended, canceled
  plan_id uuid REFERENCES plans(id),
  trial_ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Mapping users to gym-specific roles (RBAC per tenant)
CREATE TABLE IF NOT EXISTS gym_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  permissions jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE (gym_id, user_id, role)
);

-- Memberships (member subscriptions)
CREATE TABLE IF NOT EXISTS memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  plan_name text,
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Payments (manual in MVP)
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  amount numeric(10,2) NOT NULL,
  method text,
  due_date date,
  paid_at timestamptz,
  status text DEFAULT 'pending', -- pending, paid, late, failed
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Exercises library (global or per-gym)
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid, -- null => global exercise
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
  trainer_id uuid REFERENCES users(id),
  name text NOT NULL,
  level text,
  objective text,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routine_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id uuid REFERENCES routines(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id),
  sets int,
  reps int,
  rest int,
  notes text
);

-- Attendance / Check-ins
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  checkin_at timestamptz DEFAULT now(),
  source text
);

-- Progress logs
CREATE TABLE IF NOT EXISTS progress_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  weight numeric(6,2),
  measurements jsonb,
  photos jsonb,
  date date,
  created_at timestamptz DEFAULT now()
);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  body text,
  media_url text,
  status text DEFAULT 'published',
  created_at timestamptz DEFAULT now()
);

-- Post-workout surveys
CREATE TABLE IF NOT EXISTS post_workout_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  routine_id uuid REFERENCES routines(id),
  energy smallint,
  difficulty smallint,
  satisfaction smallint,
  comments text,
  created_at timestamptz DEFAULT now()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES users(id),
  gym_id uuid REFERENCES gyms(id),
  action text NOT NULL,
  entity text,
  entity_id uuid,
  before jsonb,
  after jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gym_user_roles_gym ON gym_user_roles (gym_id);
CREATE INDEX IF NOT EXISTS idx_memberships_gym ON memberships (gym_id);
CREATE INDEX IF NOT EXISTS idx_payments_gym ON payments (gym_id);
CREATE INDEX IF NOT EXISTS idx_attendance_gym ON attendance (gym_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress_logs (user_id);

-- Example audit trigger function (simple). To record actor, adapt to your JWT claims or use auth.uid().
CREATE OR REPLACE FUNCTION public.audit_changes()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (actor_id, gym_id, action, entity, entity_id, before, after, created_at)
    VALUES (NULL, NEW.gym_id, TG_OP, TG_TABLE_NAME, NEW.id, NULL, row_to_json(NEW)::jsonb, now());
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (actor_id, gym_id, action, entity, entity_id, before, after, created_at)
    VALUES (NULL, COALESCE(NEW.gym_id, OLD.gym_id), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, now());
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (actor_id, gym_id, action, entity, entity_id, before, after, created_at)
    VALUES (NULL, OLD.gym_id, TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD)::jsonb, NULL, now());
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample triggers (enable for core tables)
CREATE TRIGGER trg_audit_gyms AFTER INSERT OR UPDATE OR DELETE ON gyms FOR EACH ROW EXECUTE FUNCTION public.audit_changes();
CREATE TRIGGER trg_audit_users AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

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
  status text DEFAULT 'new',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE SET NULL,
  owner_id uuid REFERENCES users(id) ON DELETE SET NULL,
  gym_name text NOT NULL,
  owner_name text NOT NULL,
  email text NOT NULL,
  phone text,
  desired_plan text NOT NULL,
  amount numeric(10,2),
  currency text DEFAULT 'PEN',
  payment_method text DEFAULT 'Yape',
  reference_code text UNIQUE NOT NULL,
  screenshot_path text,
  status text DEFAULT 'pending',
  rejection_reason text,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_status ON contact_requests (status);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_status ON payment_verifications (status);
CREATE INDEX IF NOT EXISTS idx_payment_verifications_reference ON payment_verifications (reference_code);

CREATE TABLE IF NOT EXISTS platform_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES plans(id) ON DELETE SET NULL,
  status text DEFAULT 'active',
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '1 month'),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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

CREATE INDEX IF NOT EXISTS idx_platform_subscriptions_gym ON platform_subscriptions (gym_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products (featured);

-- Platform configuration and integration registry
CREATE TABLE IF NOT EXISTS platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_gateways (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  logo_url text,
  description text,
  required_fields jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active',
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
  config jsonb DEFAULT '{}'::jsonb,
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
  status text DEFAULT 'requested',
  config jsonb DEFAULT '{}'::jsonb,
  requested_by uuid REFERENCES users(id) ON DELETE SET NULL,
  configured_by uuid REFERENCES users(id) ON DELETE SET NULL,
  configured_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid REFERENCES gyms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  read_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS routine_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  routine_id uuid NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  status text DEFAULT 'active',
  assigned_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  notes text
);

CREATE TABLE IF NOT EXISTS nutrition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  objective text,
  calories integer,
  meals jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS nutrition_recipes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id uuid NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  calories integer,
  ingredients jsonb DEFAULT '[]'::jsonb,
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

DROP TRIGGER IF EXISTS trg_audit_gym_payment_methods ON gym_payment_methods;
CREATE TRIGGER trg_audit_gym_payment_methods AFTER INSERT OR UPDATE OR DELETE ON gym_payment_methods FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

DROP TRIGGER IF EXISTS trg_audit_gym_integrations ON gym_integrations;
CREATE TRIGGER trg_audit_gym_integrations AFTER INSERT OR UPDATE OR DELETE ON gym_integrations FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

DROP TRIGGER IF EXISTS trg_audit_notifications ON notifications;
CREATE TRIGGER trg_audit_notifications AFTER INSERT OR UPDATE OR DELETE ON notifications FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

DROP TRIGGER IF EXISTS trg_audit_routine_assignments ON routine_assignments;
CREATE TRIGGER trg_audit_routine_assignments AFTER INSERT OR UPDATE OR DELETE ON routine_assignments FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

DROP TRIGGER IF EXISTS trg_audit_nutrition_plans ON nutrition_plans;
CREATE TRIGGER trg_audit_nutrition_plans AFTER INSERT OR UPDATE OR DELETE ON nutrition_plans FOR EACH ROW EXECUTE FUNCTION public.audit_changes();

DROP TRIGGER IF EXISTS trg_audit_nutrition_recipes ON nutrition_recipes;
CREATE TRIGGER trg_audit_nutrition_recipes AFTER INSERT OR UPDATE OR DELETE ON nutrition_recipes FOR EACH ROW EXECUTE FUNCTION public.audit_changes();
