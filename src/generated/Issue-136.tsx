import React, { useState, useEffect, useCallback } from 'react';

// ============================================================================
// ALO DOCTOR v2.4 Saudi Edition - Stage Transition Endpoints Implementation
// Lead Clinical Software Engineer Build Artifact
// Pinterest-Teal Palette | Cairo RTL/LTR | 11 Persona Compatible
// ============================================================================

const PALETTE = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  textDark: '#1A1A1A',
  textLight: '#FFFFFF',
  error: '#D32F2F'
};

const PERSONAS = [
  { id: 'AD', labelAr: 'مدير النظام', labelEn: 'Admin', role: 'AD' },
  { id: 'C', labelAr: 'المنسق', labelEn: 'Coordinator', role: 'C' },
  { id: 'K', labelAr: 'الاستشاري', labelEn: 'Consultant', role: 'K' },
  { id: 'P', labelAr: 'المريض', labelEn: 'Patient', role: 'P' },
  { id: 'N', labelAr: 'الممرض', labelEn: 'Nurse', role: 'N' },
  { id: 'PH', labelAr: 'الصيدلي', labelEn: 'Pharmacist', role: 'PH' },
  { id: 'L', labelAr: 'المختبر', labelEn: 'Lab Tech', role: 'L' },
  { id: 'R', labelAr: 'الأشعة', labelEn: 'Radiologist', role: 'R' },
  { id: 'F', labelAr: 'المالية', labelEn: 'Finance', role: 'F' },
  { id: 'S', labelAr: 'الدعم', labelEn: 'Support', role: 'S' },
  { id: 'G', labelAr: 'ضيف', labelEn: 'Guest', role: 'G' }
];

const getSaudiAstTimestamp = () => {
  return new Date().toLocaleString('en-US', { timeZone: 'Asia/Riyadh' });
};

const generateServerRouteCode = () => `
// server/routes/cases.js
// ALO DOCTOR v2.4 Saudi Edition - Atomic Stage Transitions
const express = require('express');
const router = express.Router();

const getSaudiAstTimestamp = () => new Date().toISOString().replace('Z', '+03:00');

// Fallback memory store if DB pool fails
let memoryCases = [];

const executeTransaction = async (pool, queryFn) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await queryFn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * 1. POST /api/cases/:id/pay
 */
router.post('/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { method, amountSar, transactionRef } = req.body;

  if (!method || !amountSar || !transactionRef) {
    return res.status(400).json({ error: 'Missing payment payload fields' });
  }

  try {
    if (req.app.locals.pool) {
      await executeTransaction(req.app.locals.pool, async (client) => {
        const caseRes = await client.query('SELECT case_data FROM cases WHERE id = $1 FOR UPDATE', [id]);
        if (caseRes.rows.length === 0) throw new Error('Case not found');
        
        const caseData = caseRes.rows[0].case_data;
        caseData.pricing = caseData.pricing || {};
        caseData.pricing.paid = true;
        caseData.zatcaInvoice = {
          method,
          amountSar,
          transactionRef,
          timestamp: getSaudiAstTimestamp(),
          compliance: 'ZATCA_E_INVOICING_PHASE_2'
        };
        caseData.milestones = caseData.milestones || [];
        // Keeps currentStage as AWAITING_PAYMENT with paymentVerified = false
        caseData.paymentVerified = false;

        await client.query(
          'UPDATE cases SET case_data = $1::jsonb, updated_at = NOW() WHERE id = $2',
          [JSON.stringify(caseData), id]
        );
      });
    } else {
      const memCase = memoryCases.find(c => c.id === id);
      if (!memCase) return res.status(404).json({ error: 'Not found' });
      memCase.case_data.pricing = memCase.case_data.pricing || {};
      memCase.case_data.pricing.paid = true;
      memCase.case_data.zatcaInvoice = { method, amountSar, transactionRef, timestamp: getSaudiAstTimestamp() };
      memCase.case_data.paymentVerified = false;
    }
    res.json({ success: true, message: 'Payment recorded, awaiting verification.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 2. POST /api/cases/:id/verify-payment
 */
router.post('/:id/verify-payment', async (req, res) => {
  const { id } = req.params;
  const userRole = req.headers['x-user-role'];

  if (userRole !== 'C' && userRole !== 'AD') {
    return res.status(403).json({ error: 'Forbidden: Coordinator or Admin role required' });
  }

  try {
    if (req.app.locals.pool) {
      await executeTransaction(req.app.locals.pool, async (client) => {
        const caseRes = await client.query('SELECT case_data, current_stage FROM cases WHERE id = $1 FOR UPDATE', [id]);
        if (caseRes.rows.length === 0) throw new Error('Case not found');
        
        const caseData = caseRes.rows[0].case_data;
        caseData.paymentVerified = true;
        caseData.milestones = caseData.milestones || [];
        caseData.milestones.push({
          code: 'M04',
          description: 'Payment Verified by Coordinator',
          timestamp: getSaudiAstTimestamp(),
          actor: userRole
        });

        await client.query(
          'UPDATE cases SET case_data = $1::jsonb, current_stage = $2, stage = $3, updated_at = NOW() WHERE id = $4',
          [JSON.stringify(caseData), 'WITH_CONSULTANT', 5, id]
        );
      });
    } else {
      const memCase = memoryCases.find(c => c.id === id);
      if (!memCase) return res.status(404).json({ error: 'Not found' });
      memCase.case_data.paymentVerified = true;
      memCase.currentStage = 'WITH_CONSULTANT';
      memCase.stage = 5;
      memCase.case_data.milestones = memCase.case_data.milestones || [];
      memCase.case_data.milestones.push({ code: 'M04', timestamp: getSaudiAstTimestamp() });
    }
    res.json({ success: true, stage: 'WITH_CONSULTANT', milestone: 'M04' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 3. POST /api/cases/:id/opinion
 */
router.post('/:id/opinion', async (req, res) => {
  const { id } = req.params;
  const userRole = req.headers['x-user-role'];
  const { focusAnswers, clinicalSynthesis } = req.body;

  if (userRole !== 'K') {
    return res.status(403).json({ error: 'Forbidden: Consultant role required' });
  }

  if (!Array.isArray(focusAnswers) || focusAnswers.length !== 3 || typeof clinicalSynthesis !== 'string') {
    return res.status(400).json({ error: 'Invalid opinion payload. Requires focusAnswers[3] and clinicalSynthesis.' });
  }

  try {
    if (req.app.locals.pool) {
      await executeTransaction(req.app.locals.pool, async (client) => {
        const caseRes = await client.query('SELECT case_data FROM cases WHERE id = $1 FOR UPDATE', [id]);
        if (caseRes.rows.length === 0) throw new Error('Case not found');
        
        const caseData = caseRes.rows[0].case_data;
        caseData.consultantOpinion = { focusAnswers, clinicalSynthesis, submittedAt: getSaudiAstTimestamp() };
        caseData.milestones = caseData.milestones || [];
        caseData.milestones.push({
          code: 'M05',
          description: 'Consultant Opinion Submitted',
          timestamp: getSaudiAstTimestamp(),
          actor: 'K'
        });

        await client.query(
          'UPDATE cases SET case_data = $1::jsonb, current_stage = $2, stage = $3, updated_at = NOW() WHERE id = $4',
          [JSON.stringify(caseData), 'OPINION_READY', 6, id]
        );
      });
    } else {
      const memCase = memoryCases.find(c => c.id === id);
      if (!memCase) return res.status(404).json({ error: 'Not found' });
      memCase.case_data.consultantOpinion = { focusAnswers, clinicalSynthesis };
      memCase.currentStage = 'OPINION_READY';
      memCase.stage = 6;
      memCase.case_data.milestones = memCase.case_data.milestones || [];
      memCase.case_data.milestones.push({ code: 'M05', timestamp: getSaudiAstTimestamp() });
    }
    res.json({ success: true, stage: 'OPINION_READY', milestone: 'M05' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * 4. POST /api/cases/:id/close
 */
router.post('/:id/close', async (req, res) => {
  const { id } = req.params;
  const userRole = req.headers['x-user-role'];

  if (userRole !== 'C' && userRole !== 'AD') {
    return res.status(403).json({ error: 'Forbidden: Coordinator or Admin role required' });
  }

  try {
    if (req.app.locals.pool) {
      await executeTransaction(req.app.locals.pool, async (client) => {
        const caseRes = await client.query('SELECT case_data FROM cases WHERE id = $1 FOR UPDATE', [id]);
        if (caseRes.rows.length === 0) throw new Error('Case not found');
        
        const caseData = caseRes.rows[0].case_data;
        caseData.reportsReleased = true;

        await client.query(
          'UPDATE cases SET case_data = $1::jsonb, current_stage = $2, stage = $3, status = $4, updated_at = NOW() WHERE id = $5',
          [JSON.stringify(caseData), 'CLOSED', 9, 'closed', id]
        );
      });
    } else {
      const memCase = memoryCases.find(c => c.id === id);
      if (!memCase) return res.status(404).json({ error: 'Not found' });
      memCase.case_data.reportsReleased = true;
      memCase.currentStage = 'CLOSED';
      memCase.stage = 9;
      memCase.status = 'closed';
    }
    res.json({ success: true, stage: 'CLOSED', status: 'closed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
`;

export default function CasesApiImplementationView() {
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);
  const [isRtl, setIsRtl] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [mockCase, setMockCase] = useState({
    id: 'CASE-2024-001',
    currentStage: 'AWAITING_PAYMENT',
    stage: 4,
    status: 'open',
    case_data: {
      pricing: { paid: false, amountSar: 1500 },
      paymentVerified: false,
      reportsReleased: false,
      milestones: []
    }
  });

  const handlePersonaSwitch = useCallback((personaId: string) => {
    const selected = PERSONAS.find(p => p.id === personaId);
    if (selected) setActivePersona(selected);
  }, []);

  const simulatePay = () => {
    setMockCase(prev => ({
      ...prev,
      case_data: {
        ...prev.case_data,
        pricing: { ...prev.case_data.pricing, paid: true },
        zatcaInvoice: {
          method: 'MADA',
          amountSar: 1500,
          transactionRef: 'TXN-' + Date.now(),
          timestamp: getSaudiAstTimestamp()
        }
      }
    }));
  };

  const simulateVerify = () => {
    if (activePersona.role !== 'C' && activePersona.role !== 'AD') {
      alert(isRtl ? 'ممنوع: دور المنسق مطلوب' : 'Forbidden: Coordinator role required');
      return;
    }
    setMockCase(prev => ({
      ...prev,
      currentStage: 'WITH_CONSULTANT',
      stage: 5,
      case_data: {
        ...prev.case_data,
        paymentVerified: true,
        milestones: [...prev.case_data.milestones, { code: 'M04', timestamp: getSaudiAstTimestamp() }]
      }
    }));
  };

  const simulateOpinion = () => {
    if (activePersona.role !== 'K') {
      alert(isRtl ? 'ممنوع: دور الاستشاري مطلوب' : 'Forbidden: Consultant role required');
      return;
    }
    setMockCase(prev => ({
      ...prev,
      currentStage: 'OPINION_READY',
      stage: 6,
      case_data: {
        ...prev.case_data,
        consultantOpinion: {
          focusAnswers: ['Answer 1', 'Answer 2', 'Answer 3'],
          clinicalSynthesis: 'Clinical synthesis provided by consultant.'
        },
        milestones: [...prev.case_data.milestones, { code: 'M05', timestamp: getSaudiAstTimestamp() }]
      }
    }));
  };

  const simulateClose = () => {
    if (activePersona.role !== 'C' && activePersona.role !== 'AD') {
      alert(isRtl ? 'ممنوع: دور المنسق مطلوب' : 'Forbidden: Coordinator role required');
      return;
    }
    setMockCase(prev => ({
      ...prev,
      currentStage: 'CLOSED',
      stage: 9,
      status: 'closed',
      case_data: {
        ...prev.case_data,
        reportsReleased: true
      }
    }));
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        fontFamily: "'Cairo', sans-serif",
        backgroundColor: PALETTE.background,
        minHeight: '100vh',
        color: PALETTE.textDark,
        padding: '2rem',
        direction: isRtl ? 'rtl' : 'ltr'
      }}
    >
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        borderBottom: `2px solid ${PALETTE.primary}`,
        paddingBottom: '1rem'
      }}>
        <div>
          <h1 style={{ color: PALETTE.primary, margin: 0, fontSize: '1.8rem' }}>
            {isRtl ? 'نظام إدارة الحالات - انتقالات المراحل' : 'Cases API - Stage Transitions'}
          </h1>
          <p style={{ color: PALETTE.secondary, margin: '0.5rem 0 0 0', fontWeight: 600 }}>
            ALO DOCTOR v2.4 Saudi Edition
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setIsRtl(!isRtl)}
            style={{
              background: 'none',
              border: `1px solid ${PALETTE.primary}`,
              color: PALETTE.primary,
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700
            }}
          >
            {isRtl ? 'EN' : 'عربي'}
          </button>

          <select
            value={activePersona.id}
            onChange={(e) => handlePersonaSwitch(e.target.value)}
            aria-label={isRtl ? 'تبديل الشخصية' : 'Switch Persona'}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: `2px solid ${PALETTE.primary}`,
              backgroundColor: PALETTE.textLight,
              color: PALETTE.primary,
              fontFamily: "'Cairo', sans-serif",
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {PERSONAS.map(p => (
              <option key={p.id} value={p.id}>
                {isRtl ? p.labelAr : p.labelEn} ({p.role})
              </option>
            ))}
          </select>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('preview')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'preview' ? PALETTE.primary : 'transparent',
            color: activeTab === 'preview' ? PALETTE.textLight : PALETTE.primary,
            border: `2px solid ${PALETTE.primary}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            transition: 'all 0.2s ease'
          }}
        >
          {isRtl ? 'معاينة تفاعلية' : 'Interactive Preview'}
        </button>
        <button
          onClick={() => setActiveTab('code')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'code' ? PALETTE.primary : 'transparent',
            color: activeTab === 'code' ? PALETTE.textLight : PALETTE.primary,
            border: `2px solid ${PALETTE.primary}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontFamily: "'Cairo', sans-serif",
            fontWeight: 700,
            transition: 'all 0.2s ease'
          }}
        >
          {isRtl ? 'كود الخادم' : 'Server Code'}
        </button>
      </nav>

      {activeTab === 'preview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <section style={{
            backgroundColor: PALETTE.textLight,
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 123, 110, 0.08)',
            border: `1px solid ${PALETTE.secondary}`
          }}>
            <h2 style={{ color: PALETTE.primary, marginTop: 0 }}>
              {isRtl ? 'حالة الحالة الحالية' : 'Current Case State'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${PALETTE.background}` }}>
                <span style={{ fontWeight: 700 }}>{isRtl ? 'المعرف:' : 'ID:'}</span>
                <span>{mockCase.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${PALETTE.background}` }}>
                <span style={{ fontWeight: 700 }}>{isRtl ? 'المرحلة الحالية:' : 'Current Stage:'}</span>
                <span style={{ color: PALETTE.primary, fontWeight: 800 }}>{mockCase.currentStage}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${PALETTE.background}` }}>
                <span style={{ fontWeight: 700 }}>{isRtl ? 'رقم المرحلة:' : 'Stage Number:'}</span>
                <span>{mockCase.stage}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${PALETTE.background}` }}>
                <span style={{ fontWeight: 700 }}>{isRtl ? 'الحالة:' : 'Status:'}</span>
                <span>{mockCase.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${PALETTE.background}` }}>
                <span style={{ fontWeight: 700 }}>{isRtl ? 'تم الدفع:' : 'Paid:'}</span>
                <span>{mockCase.case_data.pricing.paid ? (isRtl ? 'نعم' : 'Yes') : (isRtl ? 'لا' : 'No')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${PALETTE.background}` }}>
                <span style={{ fontWeight: 700 }}>{isRtl ? 'تم التحقق من الدفع:' : 'Payment Verified:'}</span>
                <span>{mockCase.case_data.paymentVerified ? (isRtl ? 'نعم' : 'Yes') : (isRtl ? 'لا' : 'No')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <span style={{ fontWeight: 700 }}>{isRtl ? 'التقارير المنشورة:' : 'Reports Released:'}</span>
                <span>{mockCase.case_data.reportsReleased ? (isRtl ? 'نعم' : 'Yes') : (isRtl ? 'لا' : 'No')}</span>
              </div>
            </div>

            {mockCase.case_data.milestones.length > 0 && (
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: PALETTE.secondary, fontSize: '1.1rem' }}>
                  {isRtl ? 'الأحداث المسجلة' : 'Milestones'}
                </h3>
                {mockCase.case_data.milestones.map((m, i) => (
                  <div key={i} style={{
                    backgroundColor: PALETTE.background,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    borderRight: isRtl ? `4px solid ${PALETTE.whatsapp}` : 'none',
                    borderLeft: !isRtl ? `4px solid ${PALETTE.whatsapp}` : 'none'
                  }}>
                    <strong>{m.code}</strong> - {m.timestamp}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section style={{
            backgroundColor: PALETTE.textLight,
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 123, 110, 0.08)',
            border: `1px solid ${PALETTE.secondary}`
          }}>
            <h2 style={{ color: PALETTE.primary, marginTop: 0 }}>
              {isRtl ? 'إجراءات الانتقال الذرية' : 'Atomic Transition Actions'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
              {isRtl 
                ? `الشخصية النشطة: ${activePersona.labelAr} (${activePersona.role}). سيتم فرض قيود الأدوار.`
                : `Active Persona: ${activePersona.labelEn} (${activePersona.role}). Role constraints will be enforced.`
              }
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={simulatePay}
                disabled={mockCase.case_data.pricing.paid}
                style={{
                  padding: '1rem',
                  backgroundColor: mockCase.case_data.pricing.paid ? '#ccc' : PALETTE.secondary,
                  color: PALETTE.textLight,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: mockCase.case_data.pricing.paid ? 'not-allowed' : 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: '1rem',
                  transition: 'transform 0.1s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isRtl ? 'flex-end' : 'flex-start'
                }}
              >
                <span>1. POST /api/cases/:id/pay</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>
                  {isRtl ? 'تسجيل الدفع وفاتورة ZATCA' : 'Record Payment & ZATCA Invoice'}
                </span>
              </button>

              <button
                onClick={simulateVerify}
                disabled={!mockCase.case_data.pricing.paid || mockCase.case_data.paymentVerified}
                style={{
                  padding: '1rem',
                  backgroundColor: (!mockCase.case_data.pricing.paid || mockCase.case_data.paymentVerified) ? '#ccc' : PALETTE.primary,
                  color: PALETTE.textLight,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: (!mockCase.case_data.pricing.paid || mockCase.case_data.paymentVerified) ? 'not-allowed' : 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isRtl ? 'flex-end' : 'flex-start'
                }}
              >
                <span>2. POST /api/cases/:id/verify-payment</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>
                  {isRtl ? 'يتطلب دور C أو AD | ينقل إلى WITH_CONSULTANT (M04)' : 'Requires C or AD | Advances to WITH_CONSULTANT (M04)'}
                </span>
              </button>

              <button
                onClick={simulateOpinion}
                disabled={mockCase.currentStage !== 'WITH_CONSULTANT'}
                style={{
                  padding: '1rem',
                  backgroundColor: mockCase.currentStage !== 'WITH_CONSULTANT' ? '#ccc' : PALETTE.whatsapp,
                  color: PALETTE.textLight,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: mockCase.currentStage !== 'WITH_CONSULTANT' ? 'not-allowed' : 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isRtl ? 'flex-end' : 'flex-start'
                }}
              >
                <span>3. POST /api/cases/:id/opinion</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>
                  {isRtl ? 'يتطلب دور K | ينقل إلى OPINION_READY (M05)' : 'Requires K | Advances to OPINION_READY (M05)'}
                </span>
              </button>

              <button
                onClick={simulateClose}
                disabled={mockCase.status === 'closed'}
                style={{
                  padding: '1rem',
                  backgroundColor: mockCase.status === 'closed' ? '#ccc' : PALETTE.error,
                  color: PALETTE.textLight,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: mockCase.status === 'closed' ? 'not-allowed' : 'pointer',
                  fontFamily: "'Cairo', sans-serif",
                  fontWeight: 700,
                  fontSize: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isRtl ? 'flex-end' : 'flex-start'
                }}
              >
                <span>4. POST /api/cases/:id/close</span>
                <span style={{ fontSize: '0.8rem', opacity: 0.9, marginTop: '0.25rem' }}>
                  {isRtl ? 'يتطلب دور C أو AD | يغلق الحالة ويطلق التقارير' : 'Requires C or AD | Closes case & releases reports'}
                </span>
              </button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'code' && (
        <section style={{
          backgroundColor: '#1E1E1E',
          padding: '2rem',
          borderRadius: '16px',
          overflowX: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: PALETTE.secondary, margin: 0, fontFamily: "'Cairo', sans-serif" }}>
              server/routes/cases.js
            </h3>
            <span style={{ color: '#888', fontSize: '0.8rem', fontFamily: "'Cairo', sans-serif" }}>
              {isRtl ? 'كود الإنتاج الجاهز' : 'Production Ready Code'}
            </span>
          </div>
          <pre style={{
            color: '#D4D4D4',
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontSize: '0.85rem',
            lineHeight: 1.6,
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            direction: 'ltr',
            textAlign: 'left'
          }}>
            <code>{generateServerRouteCode()}</code>
          </pre>
        </section>
      )}

      <footer style={{
        marginTop: '3rem',
        paddingTop: '1.5rem',
        borderTop: `1px solid ${PALETTE.secondary}`,
        textAlign: 'center',
        color: PALETTE.primary,
        fontSize: '0.9rem',
        fontWeight: 600
      }}>
        <p style={{ margin: 0 }}>
          {isRtl ? 'ALO DOCTOR الإصدار 2.4 نسخة المملكة العربية السعودية | هندسة البرمجيات السريرية' : 'ALO DOCTOR v2.4 Saudi Edition | Clinical Software Engineering'}
        </p>
        <p style={{ margin: '0.5rem 0 0 0', color: PALETTE.secondary, fontSize: '0.8rem' }}>
          {isRtl ? 'متوافق مع 11 شخصية | خط القاهرة | وصول نظيف بدون بوابات مصطنعة' : '11 Persona Compatible | Cairo Font | Zero Artificial Gates Clean Accessible State'}
        </p>
      </footer>
    </div>
  );
}