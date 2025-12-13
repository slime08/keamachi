-- 003_update_auth_and_facilities_schema.sql
-- Goal:
-- - users: password -> password_hash, drop facility_name, add auth_provider/provider_id/phone_number/user_type/desired_services
-- - facilities: remove duplicate user_id rows (keep newest by id), enforce UNIQUE(user_id), ensure single FK to users(id)
-- - add facility extra columns idempotently
-- Notes:
-- - Current DB uses integer ids (users.id / facilities.user_id are integer).
-- - Existing duplicate FKs exist: facilities_user_id_fkey and facilities_user_id_fkey1.
-- - facilities.name already NOT NULL, but we guard anyway.

BEGIN;

-- -----------------------------
-- users table adjustments (idempotent)
-- -----------------------------

-- 1) Rename users.password -> users.password_hash only if "password" exists and "password_hash" does not.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'password'
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'password_hash'
  ) THEN
    EXECUTE 'ALTER TABLE public.users RENAME COLUMN password TO password_hash';
  END IF;
END $$;

-- 2) Drop users.facility_name if exists
ALTER TABLE public.users
  DROP COLUMN IF EXISTS facility_name;

-- 3) Add new columns if not exists
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS user_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS desired_services JSONB;

-- 4) Provider unique index (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_provider
  ON public.users (auth_provider, provider_id)
  WHERE provider_id IS NOT NULL;


-- -----------------------------
-- facilities table: clean duplicates + constraints (idempotent)
-- -----------------------------

DO $$
BEGIN
  -- A) Drop duplicate/legacy foreign keys if they exist
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'facilities_user_id_fkey1'
      AND conrelid = 'public.facilities'::regclass
      AND contype = 'f'
  ) THEN
    EXECUTE 'ALTER TABLE public.facilities DROP CONSTRAINT facilities_user_id_fkey1';
  END IF;

  -- Drop fk_user if it exists (from earlier attempts)
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_user'
      AND conrelid = 'public.facilities'::regclass
      AND contype = 'f'
  ) THEN
    EXECUTE 'ALTER TABLE public.facilities DROP CONSTRAINT fk_user';
  END IF;

  -- Drop facilities_user_id_fkey if it exists (we will re-add cleanly)
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'facilities_user_id_fkey'
      AND conrelid = 'public.facilities'::regclass
      AND contype = 'f'
  ) THEN
    EXECUTE 'ALTER TABLE public.facilities DROP CONSTRAINT facilities_user_id_fkey';
  END IF;

  -- Drop UNIQUE constraint if exists (we will re-add after cleanup)
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'facilities_user_id_unique'
      AND conrelid = 'public.facilities'::regclass
      AND contype = 'u'
  ) THEN
    EXECUTE 'ALTER TABLE public.facilities DROP CONSTRAINT facilities_user_id_unique';
  END IF;

  -- B) Data cleanup: for every user_id, keep newest facility (max id), delete the rest.
  --    (FK refs to facilities.id 1-10 were checked: none in matching/reviews/matching_suggestions)
  EXECUTE $SQL$
    DELETE FROM public.facilities f
    USING (
      SELECT id
      FROM (
        SELECT id,
               user_id,
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY id DESC) AS rn
        FROM public.facilities
        WHERE user_id IS NOT NULL
      ) t
      WHERE t.rn > 1
    ) d
    WHERE f.id = d.id
  $SQL$;

  -- C) Add UNIQUE(user_id) idempotently
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'facilities_user_id_unique'
      AND conrelid = 'public.facilities'::regclass
      AND contype = 'u'
  ) THEN
    EXECUTE 'ALTER TABLE public.facilities ADD CONSTRAINT facilities_user_id_unique UNIQUE (user_id)';
  END IF;

  -- D) Re-add single FK(user_id) -> users(id) ON DELETE CASCADE
  EXECUTE 'ALTER TABLE public.facilities
           ADD CONSTRAINT facilities_user_id_fkey
           FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE';
END $$;


-- -----------------------------
-- facilities: add extra columns idempotently
-- -----------------------------

ALTER TABLE public.facilities
  ADD COLUMN IF NOT EXISTS prefecture VARCHAR(255),
  ADD COLUMN IF NOT EXISTS city VARCHAR(255),
  ADD COLUMN IF NOT EXISTS address_detail TEXT,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS service_types JSONB,
  ADD COLUMN IF NOT EXISTS capacity INT,
  ADD COLUMN IF NOT EXISTS operating_days VARCHAR(255)[],
  ADD COLUMN IF NOT EXISTS shuttle_service BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS lunch_provided BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS trial_booking_available BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS pc_work_available BOOLEAN DEFAULT FALSE;

-- Guard: prevent NOT NULL set if NULL exists (stop migration)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.facilities WHERE name IS NULL) THEN
    RAISE EXCEPTION 'Cannot set facilities.name to NOT NULL: NULL values exist. Fix data first.';
  END IF;

  -- If it is already NOT NULL, this is harmless.
  EXECUTE 'ALTER TABLE public.facilities ALTER COLUMN name SET NOT NULL';
END $$;

COMMIT;