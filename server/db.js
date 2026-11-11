import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://alo_admin:alo_secure_postgres_pass_2026@127.0.0.1:5432/alodoctor?schema=public',
  max: 10,
  idleTimeoutMillis: 30000,
});

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
          pin VARCHAR(20) DEFAULT '1234',
          hospital_id VARCHAR(100) REFERENCES tenants(id) ON DELETE SET NULL,
          department VARCHAR(100),
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

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
      `);
      console.log('✅ PostgreSQL database tables initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('⚠️ PostgreSQL connection failed, operating with fallback mode:', err.message);
  }
}
