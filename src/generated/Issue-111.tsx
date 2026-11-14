import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const ROLE_PATIENT = 'P';
const ROLE_DOCTOR = 'D';
const ROLE_NURSE = 'N';
const ROLE_STAFF = 'STAFF';
const ROLE_CONSULTANT = 'C';
const ROLE_ADMIN = 'AD';

const STAFF_ROLES = [ROLE_DOCTOR, ROLE_NURSE, ROLE_STAFF];

const extractAuthContext = (req: any) => ({
  role: req.headers['x-user-role'] as string | undefined,
  phone: req.headers['x-user-phone'] as string | undefined,
  userId: req.headers['x-user-id'] as string | undefined,
  tenantId: req.headers['x-tenant-id'] as string | undefined,
});

router.get('/api/cases', async (req: any, res: any) => {
  try {
    const { role, phone, userId, tenantId } = extractAuthContext(req);

    if (!role || !userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing authentication context',
        data: [],
      });
    }

    let whereClause: any = {};

    switch (role) {
      case ROLE_PATIENT:
        whereClause = {
          OR: [
            { createdBy: userId },
            ...(phone
              ? [
                  {
                    case_data: {
                      path: ['patientPhone'],
                      equals: phone,
                    },
                  },
                  {
                    case_data: {
                      path: ['national_id_masked'],
                      equals: phone,
                    },
                  },
                ]
              : []),
          ],
        };
        break;

      case ROLE_DOCTOR:
      case ROLE_NURSE:
      case ROLE_STAFF:
        if (!tenantId) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Staff must be associated with a hospital tenant',
            data: [],
          });
        }
        whereClause = {
          OR: [
            { tenant_id: tenantId },
            {
              case_data: {
                path: ['treatingDoctor', 'hospital'],
                equals: tenantId,
              },
            },
          ],
        };
        break;

      case ROLE_CONSULTANT:
        whereClause = {
          OR: [
            {
              case_data: {
                path: ['consultant', 'id'],
                equals: userId,
              },
            },
            {
              case_data: {
                path: ['referredTo'],
                equals: userId,
              },
            },
          ],
        };
        break;

      case ROLE_ADMIN:
        whereClause = {};
        break;

      default:
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Unrecognized persona role scope',
          data: [],
        });
    }

    const cases = await prisma.case.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: cases || [],
    });
  } catch (error: any) {
    console.error('[ALO DOCTOR v2.4] /api/cases scoping error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during case retrieval',
      data: [],
    });
  }
});

export default router;

import React, { useEffect, useState, useMemo } from 'react';

interface CaseRecord {
  id: string;
  case_data: any;
  tenant_id?: string;
  createdBy?: string;
  createdAt: string;
}

interface AuthContext {
  role: string;
  phone?: string;
  userId: string;
  tenantId?: string;
}

const PALETTE = {
  tealDark: '#007B6E',
  tealLight: '#00C6AE',
  tealBg: '#E6FAF7',
  whatsapp: '#25D366',
};

const PERSONA_PROFILES = [
  { id: 'P', labelEn: 'Patient', labelAr: 'مريض' },
  { id: 'D', labelEn: 'Doctor', labelAr: 'طبيب' },
  { id: 'N', labelEn: 'Nurse', labelAr: 'ممرض' },
  { id: 'STAFF', labelEn: 'Hospital Staff', labelAr: 'موظف مستشفى' },
  { id: 'C', labelEn: 'Consultant', labelAr: 'استشاري' },
  { id: 'AD', labelEn: 'Super Admin', labelAr: 'مدير النظام' },
  { id: 'LAB', labelEn: 'Lab Tech', labelAr: 'فني مختبر' },
  { id: 'PHARM', labelEn: 'Pharmacist', labelAr: 'صيدلي' },
  { id: 'RAD', labelEn: 'Radiologist', labelAr: 'أخصائي أشعة' },
  { id: 'EMT', labelEn: 'Paramedic', labelAr: 'مسعف' },
  { id: 'GUEST', labelEn: 'Guest', labelAr: 'زائر' },
];

const useDirection = (lang: string) => {
  return lang === 'ar' ? 'rtl' : 'ltr';
};

const CasesScopedView: React.FC<{ auth: AuthContext; lang: 'ar' | 'en' }> = ({ auth, lang }) => {
  const dir = useDirection(lang);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fontClass = useMemo(() => (lang === 'ar' ? 'font-cairo' : 'font-inter'), [lang]);

  useEffect(() => {
    const fetchScopedCases = async () => {
      setLoading(true);
      setError(null);
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-user-role': auth.role,
          'x-user-id': auth.userId,
        };
        if (auth.phone) headers['x-user-phone'] = auth.phone;
        if (auth.tenantId) headers['x-tenant-id'] = auth.tenantId;

        const response = await fetch('/api/cases', { headers });
        const result = await response.json();

        if (result.success) {
          setCases(result.data);
        } else {
          setError(result.message || 'Failed to load scoped cases');
          setCases([]);
        }
      } catch (err) {
        setError('Network error while fetching cases');
        setCases([]);
      } finally {
        setLoading(false);
      }
    };

    if (auth.userId && auth.role) {
      fetchScopedCases();
    }
  }, [auth.role, auth.userId, auth.phone, auth.tenantId]);

  const texts = useMemo(
    () => ({
      title: lang === 'ar' ? 'السجلات الطبية' : 'Medical Cases',
      empty: lang === 'ar' ? 'لا توجد سجلات طبية متاحة' : 'No medical cases available for your scope',
      loading: lang === 'ar' ? 'جاري التحميل...' : 'Loading...',
      error: lang === 'ar' ? 'خطأ في جلب البيانات' : 'Error fetching data',
      persona: lang === 'ar' ? 'الشخصية النشطة' : 'Active Persona',
    }),
    [lang]
  );

  const activePersona = PERSONA_PROFILES.find((p) => p.id === auth.role);

  return (
    <div
      dir={dir}
      className={`${fontClass} min-h-screen w-full`}
      style={{ backgroundColor: PALETTE.tealBg, fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif' }}
    >
      <header
        className="w-full px-6 py-4 flex items-center justify-between shadow-sm"
        style={{ backgroundColor: PALETTE.tealDark }}
      >
        <h1 className="text-xl font-bold text-white">{texts.title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-white opacity-80">{texts.persona}:</span>
          <select
            className="bg-white text-sm rounded-md px-3 py-1.5 outline-none border-none"
            style={{ color: PALETTE.tealDark }}
            defaultValue={auth.role}
            aria-label={texts.persona}
            disabled
          >
            {PERSONA_PROFILES.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {lang === 'ar' ? profile.labelAr : profile.labelEn}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-lg font-medium" style={{ color: PALETTE.tealDark }}>
              {texts.loading}
            </p>
          </div>
        )}

        {error && !loading && (
          <div
            className="rounded-lg p-4 border text-sm font-medium"
            style={{ backgroundColor: '#FFF0F0', borderColor: '#FFCDD2', color: '#D32F2F' }}
            role="alert"
          >
            {texts.error}: {error}
          </div>
        )}

        {!loading && !error && cases.length === 0 && (
          <div
            className="rounded-xl p-12 flex flex-col items-center justify-center text-center border-2 border-dashed"
            style={{ borderColor: PALETTE.tealLight, backgroundColor: '#FFFFFF' }}
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke={PALETTE.tealLight}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p className="mt-4 text-base font-semibold" style={{ color: PALETTE.tealDark }}>
              {texts.empty}
            </p>
          </div>
        )}

        {!loading && !error && cases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cases.map((caseItem) => (
              <article
                key={caseItem.id}
                className="rounded-xl p-5 shadow-sm transition-all duration-200 hover:shadow-md border"
                style={{ backgroundColor: '#FFFFFF', borderColor: PALETTE.tealLight }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-sm font-bold truncate" style={{ color: PALETTE.tealDark }}>
                    {lang === 'ar' ? `سجل #${caseItem.id.slice(-6)}` : `Case #${caseItem.id.slice(-6)}`}
                  </h2>
                  <span
                    className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide"
                    style={{ backgroundColor: PALETTE.tealBg, color: PALETTE.tealDark }}
                  >
                    {auth.role}
                  </span>
                </div>

                <div className="space-y-2 text-xs" style={{ color: '#334155' }}>
                  {caseItem.case_data?.patientPhone && (
                    <p>
                      <span className="font-semibold">{lang === 'ar' ? 'الهاتف: ' : 'Phone: '}</span>
                      {caseItem.case_data.patientPhone}
                    </p>
                  )}
                  {caseItem.tenant_id && (
                    <p>
                      <span className="font-semibold">{lang === 'ar' ? 'المستشفى: ' : 'Tenant: '}</span>
                      {caseItem.tenant_id}
                    </p>
                  )}
                  <p>
                    <span className="font-semibold">{lang === 'ar' ? 'التاريخ: ' : 'Date: '}</span>
                    {new Date(caseItem.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                </div>

                <button
                  className="mt-5 w-full py-2.5 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: PALETTE.tealDark, focusRingColor: PALETTE.tealLight } as any}
                  aria-label={lang === 'ar' ? `عرض تفاصيل السجل ${caseItem.id}` : `View details for case ${caseItem.id}`}
                >
                  {lang === 'ar' ? 'عرض التفاصيل السريرية' : 'View Clinical Details'}
                </button>
              </article>
            ))}
          </div>
        )}
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-cairo { font-family: 'Cairo', sans-serif; }
        .font-inter { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
};

export default CasesScopedView;