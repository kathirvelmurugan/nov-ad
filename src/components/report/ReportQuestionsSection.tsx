import React from 'react';
import { TEAL_PRIMARY, TEAL_SECONDARY } from '../cockpit/types';

export interface QuestionAndAnswerItem {
  num: number;
  qAr: string;
  qEn: string;
  ansEn: string;
  ansAr: string;
  clinicalRecommendation: string;
}

interface ReportQuestionsSectionProps {
  questionsAndAnswers: QuestionAndAnswerItem[];
  isAr: boolean;
}

export const ReportQuestionsSection: React.FC<ReportQuestionsSectionProps> = ({
  questionsAndAnswers,
  isAr,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ fontSize: '13px', fontWeight: 800, color: TEAL_PRIMARY, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>❓</span>
        <span>
          {isAr
            ? 'إجابة الأسئلة السريرية الثلاثة الموجهة من الطبيب السعودي (مترجمة ومعتمدة)'
            : 'Answers to the 3 Treating Physician Focus Questions (Bilingual Certified)'}
        </span>
      </div>

      {questionsAndAnswers.map((qa) => (
        <div
          key={qa.num}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1.5px solid #cbd5e1',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          }}
        >
          {/* Question Header */}
          <div
            style={{
              backgroundColor: '#f1f5f9',
              padding: '10px 16px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
              <span style={{ color: TEAL_PRIMARY, fontWeight: 900 }}>Q{qa.num}: </span>
              <span>{qa.qAr}</span>
            </div>
            <span
              style={{
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                padding: '3px 8px',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 700,
              }}
            >
              {qa.clinicalRecommendation}
            </span>
          </div>

          {/* Question English Subtitle */}
          <div style={{ padding: '6px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f1f5f9', fontSize: '10px', color: '#64748b', fontStyle: 'italic' }}>
            English Query: {qa.qEn}
          </div>

          {/* Dual-Column Answers (English Original + Certified Arabic Translation) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '12px',
              padding: '14px 16px',
            }}
          >
            {/* English Original */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid #e2e8f0',
                direction: 'ltr',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#475569', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🇬🇧 Indian Consultant Clinical Opinion (English):
              </div>
              <div style={{ fontSize: '11px', color: '#0f172a', lineHeight: 1.5 }}>
                {qa.ansEn}
              </div>
            </div>

            {/* Certified Arabic Localization */}
            <div
              style={{
                backgroundColor: '#f0fdfa',
                borderRadius: '8px',
                padding: '12px',
                border: `1px solid ${TEAL_SECONDARY}`,
                direction: 'rtl',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '10px', fontWeight: 800, color: TEAL_PRIMARY, marginBottom: '4px' }}>
                🇸🇦 الترجمة الطبية والتعريب السريري المعتمد (منسق رعاية ألو):
              </div>
              <div style={{ fontSize: '11px', color: '#0f172a', lineHeight: 1.5 }}>
                {qa.ansAr}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
