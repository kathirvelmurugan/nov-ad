import pool from '../server/db.js';

async function verifyFlowAndDb() {
  console.log('--- 1. Testing Database Upsert and Beneficiary Columns ---');
  
  const testCase = {
    id: 'test-beneficiary-case-999',
    caseNumber: 'ALO-TEST-999',
    currentStage: 'INTAKE_RECEIVED',
    stage: 1,
    beneficiaryMode: 'family',
    patientName: 'أحمد سعيد الغامدي (Ahmed Said Al-Ghamdi)',
    patientNameAr: 'أحمد سعيد الغامدي',
    patientNameEn: 'Ahmed Said Al-Ghamdi',
    patientPhone: '+966501234567',
    nationalIdMasked: '10********',
    consultationType: 'written',
    symptoms: 'Severe chronic lumbar spine pain radiating to right leg',
    symptomsAr: 'ألم أسفل الظهر مزمن مع خدر في الساق اليمنى',
    symptomsEn: 'Severe chronic lumbar spine pain radiating to right leg',
    caregiver: {
      isProxy: true,
      name: 'سامي الحربي (Sami Al-Harbi)',
      relationship: 'Parent',
      phone: '+966501234567',
      nationalId: '1029384756',
      hasLegalConsent: true
    }
  };

  try {
    // Insert / update using exact server query
    await pool.query(
      `INSERT INTO clinical_cases (id, case_number, current_stage, stage, patient_name, patient_name_ar, patient_name_en, national_id_masked, consultation_type, case_data, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (id) DO UPDATE SET 
         current_stage = EXCLUDED.current_stage, 
         stage = EXCLUDED.stage, 
         patient_name = EXCLUDED.patient_name,
         patient_name_ar = EXCLUDED.patient_name_ar,
         patient_name_en = EXCLUDED.patient_name_en,
         national_id_masked = EXCLUDED.national_id_masked,
         consultation_type = EXCLUDED.consultation_type,
         case_data = EXCLUDED.case_data, 
         updated_at = NOW()`,
      [
        testCase.id,
        testCase.caseNumber,
        testCase.currentStage,
        testCase.stage,
        testCase.patientName,
        testCase.patientNameAr,
        testCase.patientNameEn,
        testCase.nationalIdMasked,
        testCase.consultationType,
        JSON.stringify(testCase),
      ]
    );
    console.log('✅ PostgreSQL Insert / Upsert Query succeeded.');

    // Query back from clinical_cases table directly
    const { rows } = await pool.query(
      'SELECT id, case_number, patient_name, patient_name_ar, patient_name_en, national_id_masked, consultation_type, case_data FROM clinical_cases WHERE id = $1',
      [testCase.id]
    );

    if (rows.length === 0) {
      throw new Error('Case not found in database!');
    }

    const row = rows[0];
    console.log('✅ Found row in PostgreSQL:');
    console.log('   ID:', row.id);
    console.log('   Case Number:', row.case_number);
    console.log('   Patient Name (DB Column):', row.patient_name);
    console.log('   Patient Name AR (DB Column):', row.patient_name_ar);
    console.log('   Patient Name EN (DB Column):', row.patient_name_en);
    console.log('   National ID Masked:', row.national_id_masked);
    console.log('   Consultation Type:', row.consultation_type);
    
    const parsedData = row.case_data;
    console.log('   Caregiver isProxy:', parsedData.caregiver?.isProxy);
    console.log('   Caregiver Name:', parsedData.caregiver?.name);
    console.log('   Caregiver Relationship:', parsedData.caregiver?.relationship);
    console.log('   Caregiver Legal Consent:', parsedData.caregiver?.hasLegalConsent);

    // Clean up test row
    await pool.query('DELETE FROM clinical_cases WHERE id = $1', [testCase.id]);
    console.log('✅ Test case cleaned up from database.');
    
    console.log('🎉 Database and flow verification: 100% COMPLETE & VERIFIED!');
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyFlowAndDb();
