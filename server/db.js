import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pgUser = process.env.POSTGRES_USER || 'alo_admin';
const pgDb = process.env.POSTGRES_DB || 'alodoctor';
const pgHost = process.env.DB_HOST || (process.env.NODE_ENV === 'production' ? 'alo-postgres' : '127.0.0.1');
const pgPort = process.env.DB_PORT || '5432';

// No built-in credentials: DATABASE_URL or POSTGRES_PASSWORD must be supplied by
// the environment. A hardcoded password silently connects to the wrong database.
const pgPassword = process.env.POSTGRES_PASSWORD;
const connectionString =
  process.env.DATABASE_URL ||
  (pgPassword
    ? `postgresql://${pgUser}:${encodeURIComponent(pgPassword)}@${pgHost}:${pgPort}/${pgDb}?schema=public`
    : null);

if (!connectionString) {
  throw new Error('DATABASE_URL or POSTGRES_PASSWORD is required. The server has no built-in database credentials.');
}

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 3000,
});

export default pool;

export async function initDatabase() {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS tenants (
          id VARCHAR(100) PRIMARY KEY,
          name_en VARCHAR(255) NOT NULL,
          name_ar VARCHAR(255) NOT NULL,
          city VARCHAR(100) NOT NULL,
          mci_license_number VARCHAR(100),
          status VARCHAR(50) DEFAULT 'active',
          hospital_admin_name VARCHAR(255),
          hospital_admin_phone VARCHAR(50),
          doctor_count INT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS platform_users (
          id VARCHAR(100) PRIMARY KEY,
          staff_code VARCHAR(50),
          full_name VARCHAR(255) NOT NULL,
          full_name_ar VARCHAR(255),
          role_code VARCHAR(20) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          pin VARCHAR(20),
          hospital_id VARCHAR(100) REFERENCES tenants(id) ON DELETE SET NULL,
          department VARCHAR(100),
          status VARCHAR(50) DEFAULT 'active',
          has_custom_pin BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        ALTER TABLE platform_users ADD COLUMN IF NOT EXISTS has_custom_pin BOOLEAN DEFAULT FALSE;
        ALTER TABLE platform_users ALTER COLUMN pin DROP DEFAULT;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_platform_users_phone ON platform_users(phone);

        CREATE TABLE IF NOT EXISTS clinical_cases (
          id VARCHAR(100) PRIMARY KEY,
          case_number VARCHAR(100),
          current_stage VARCHAR(50) DEFAULT 'INTAKE_RECEIVED',
          stage INT DEFAULT 1,
          patient_name VARCHAR(255),
          patient_name_ar VARCHAR(255),
          patient_name_en VARCHAR(255),
          national_id_masked VARCHAR(50),
          consultation_type VARCHAR(50) DEFAULT 'written',
          case_data JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id VARCHAR(100) PRIMARY KEY,
          timestamp TIMESTAMPTZ DEFAULT NOW(),
          actor_name VARCHAR(255) NOT NULL,
          actor_role VARCHAR(50) NOT NULL,
          hospital_id VARCHAR(100),
          action_type VARCHAR(100) NOT NULL,
          target VARCHAR(255),
          details TEXT,
          ip_address VARCHAR(100)
        );

        CREATE TABLE IF NOT EXISTS admin_catalogs (
          id VARCHAR(50) PRIMARY KEY,
          specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
          lab_tests JSONB NOT NULL DEFAULT '[]'::jsonb,
          medications JSONB NOT NULL DEFAULT '[]'::jsonb,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS sessions (
          token VARCHAR(128) PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          role_code VARCHAR(20) NOT NULL,
          hospital_id VARCHAR(100),
          issued_at TIMESTAMPTZ DEFAULT NOW(),
          expires_at TIMESTAMPTZ NOT NULL,
          revoked_at TIMESTAMPTZ
        );

        -- Migration: older schemas declared token as UUID, but tokens are 64-char hex strings.
        ALTER TABLE sessions ALTER COLUMN token TYPE VARCHAR(128) USING token::text;
        ALTER TABLE sessions ADD COLUMN IF NOT EXISTS phone VARCHAR(30);

        -- Migration: platform_users.id had no default, so JIT patient inserts failed with NOT NULL violation.
        ALTER TABLE platform_users ALTER COLUMN id SET DEFAULT ('patient-' || replace(gen_random_uuid()::text, '-', ''));

        CREATE TABLE IF NOT EXISTS platform_settings (
          id INT PRIMARY KEY DEFAULT 1,
          config JSONB NOT NULL,
          version INT NOT NULL DEFAULT 1,
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          updated_by VARCHAR(100)
        );

        CREATE TABLE IF NOT EXISTS platform_settings_history (
          id BIGSERIAL PRIMARY KEY,
          version INT NOT NULL,
          config JSONB,
          changed_by VARCHAR(100),
          changed_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Data is managed outside the schema bootstrap: no tenant/user/settings
        -- seeding here. Rows are inserted once, intentionally, and never re-applied
        -- on boot. This block previously seeded the demo tenant (and its doctor
        -- count) on every restart.
      `);
      console.log('✅ PostgreSQL database tables initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    // No fallback mode exists: every route reads Postgres directly. Surface the
    // failure instead of booting as if the database were available.
    console.error('❌ PostgreSQL initialisation failed:', err.message);
    throw err;
  }
}
