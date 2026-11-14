import React from 'react';

interface DossierRecommendationsSectionProps {
  caseItem: any;
  lang: 'ar' | 'en';
  consultantName: string;
}

const DossierRecommendationsSection: React.FC<DossierRecommendationsSectionProps> = ({
  caseItem,
  lang,
  consultantName,
}) => {
  const isAr = lang === 'ar';
  const dir = isAr ? 'rtl' : 'ltr';
  const fontClass = isAr ? 'font-cairo' : 'font-sans';

  const copy = {
    specialistOpinionTitle: isAr ? 'رأي الأخصائي الدولي' : 'International Specialist Opinion',
    treatmentProtocolTitle: isAr ? 'بروتوكول العلاج والتوصيات التدخلية' : 'Treatment Protocol & Intervention Recommendations',
    clinicalRationaleTitle: isAr ? 'المبررات السريرية' : 'Clinical Rationale',
    consultantCredentialsTitle: isAr ? 'بيانات الاستشاري' : 'Consultant Credentials',
    opinionStatement: isAr
      ? 'بناءً على المراجعة الشاملة للسجل الطبي والبيانات التشخيصية، تم صياغة التوصيات التالية وفقاً لأحدث الإرشادات الطبية الدولية.'
      : 'Based on the comprehensive review of the medical dossier and diagnostic data, the following recommendations have been formulated in accordance with the latest international clinical guidelines.',
    primaryIntervention: isAr ? 'التدخل الأساسي المقترح' : 'Proposed Primary Intervention',
    pharmacologicalRegimen: isAr ? 'النظام الدوائي' : 'Pharmacological Regimen',
    followUpPlan: isAr ? 'خطة المتابعة' : 'Follow-up Plan',
    rationaleText: isAr
      ? 'تم تقييم الخيارات المتاحة بناءً على الحالة الفسيولوجية للمريض، عوامل الخطورة الجراحية، والأدلة العلمية الحديثة لضمان أفضل النتائج السريرية الممكنة.'
      : 'Available options were evaluated based on the physiological status, surgical risk factors, and recent scientific evidence to ensure the best possible clinical outcomes.',
    boardCertification: isAr ? 'البورد والتصنيف المهني' : 'Board Certification & Professional Classification',
    specialty: isAr ? 'التخصص الدقيق' : 'Sub-specialty',
    experience: isAr ? 'سنوات الخبرة' : 'Years of Experience',
    yearsSuffix: isAr ? 'سنة' : 'years',
  };

  const interventionData = caseItem?.recommendations?.intervention || {
    type: 'TAVR',
    comparison: 'TAVR vs SAVR',
    details: isAr
      ? 'يُوصى بإجراء استبدال الصمام الأبهري عبر القسطرة (TAVR) بدلاً من الاستبدال الجراحي (SAVR) نظراً لانخفاض المخاطر الإجرائية وسرعة التعافي.'
      : 'Transcatheter Aortic Valve Replacement (TAVR) is recommended over Surgical Aortic Valve Replacement (SAVR) due to lower procedural risks and faster recovery profile.',
  };

  const medicationData = caseItem?.recommendations?.medications || [
    { name: isAr ? 'حمض الأسيتيل ساليسيليك' : 'Acetylsalicylic Acid', dose: '75mg', frequency: isAr ? 'يومياً' : 'Daily' },
    { name: isAr ? 'كلوبيدوجريل' : 'Clopidogrel', dose: '75mg', frequency: isAr ? 'يومياً' : 'Daily' },
  ];

  const followUpData = caseItem?.recommendations?.followUp || {
    timeline: isAr ? 'بعد 30 يوماً من الإجراء' : '30 days post-procedure',
    imaging: isAr ? 'تخطيط صدى القلب عبر الصدر (TTE)' : 'Transthoracic Echocardiogram (TTE)',
    labs: isAr ? 'صورة دم كاملة، وظائف كلى، تخثر' : 'CBC, Renal Panel, Coagulation Profile',
  };

  const credentialData = caseItem?.consultant || {
    board: isAr ? 'البورد السعودي / الزمالة' : 'Saudi Board / Fellowship',
    specialty: isAr ? 'طب القلب التدخلي وهيكلة القلب' : 'Interventional Cardiology & Structural Heart',
    experienceYears: '15+',
  };

  return (
    <section
      dir={dir}
      className={`w-full max-w-4xl mx-auto p-6 md:p-8 bg-white rounded-2xl shadow-sm border border-[#E6FAF7] print:shadow-none print:border-[#007B6E] print:p-0 print:rounded-none ${fontClass}`}
      aria-label={copy.specialistOpinionTitle}
    >
      {/* International Specialist Opinion Statement Card */}
      <div className="mb-8 p-6 bg-[#E6FAF7] rounded-xl border-r-4 border-[#007B6E] rtl:border-r-4 rtl:border-l-0 ltr:border-l-4 ltr:border-r-0 print:bg-transparent print:border print:border-[#007B6E]">
        <h2 className="text-xl font-bold text-[#007B6E] mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#00C6AE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {copy.specialistOpinionTitle}
        </h2>
        <p className="text-gray-800 leading-relaxed text-base">
          {copy.opinionStatement}
        </p>
      </div>

      {/* Treatment Protocol & Intervention Recommendation */}
      <div className="mb-8 space-y-6">
        <h2 className="text-xl font-bold text-[#007B6E] border-b-2 border-[#E6FAF7] pb-2 print:border-[#007B6E]">
          {copy.treatmentProtocolTitle}
        </h2>

        {/* Primary Intervention */}
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm print:border-gray-300 print:shadow-none">
          <h3 className="text-lg font-semibold text-[#00C6AE] mb-2">{copy.primaryIntervention}</h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-[#007B6E] text-white">
              {interventionData.type}
            </span>
            <span className="text-sm text-gray-600 font-medium">
              ({interventionData.comparison})
            </span>
          </div>
          <p className="text-gray-700 text-sm leading-relaxed">
            {interventionData.details}
          </p>
        </div>

        {/* Pharmacological Regimen (Antiplatelet) */}
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm print:border-gray-300 print:shadow-none">
          <h3 className="text-lg font-semibold text-[#00C6AE] mb-3">{copy.pharmacologicalRegimen}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right rtl:text-right ltr:text-left">
              <thead>
                <tr className="border-b border-[#E6FAF7] text-[#007B6E]">
                  <th className="py-2 px-3 font-bold">{isAr ? 'الدواء' : 'Medication'}</th>
                  <th className="py-2 px-3 font-bold">{isAr ? 'الجرعة' : 'Dosage'}</th>
                  <th className="py-2 px-3 font-bold">{isAr ? 'التكرار' : 'Frequency'}</th>
                </tr>
              </thead>
              <tbody>
                {medicationData.map((med: any, index: number) => (
                  <tr key={index} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 px-3 text-gray-800 font-medium">{med.name}</td>
                    <td className="py-3 px-3 text-gray-600">{med.dose}</td>
                    <td className="py-3 px-3 text-gray-600">{med.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Follow-up Plan */}
        <div className="bg-white p-5 rounded-lg border border-gray-100 shadow-sm print:border-gray-300 print:shadow-none">
          <h3 className="text-lg font-semibold text-[#00C6AE] mb-3">{copy.followUpPlan}</h3>
          <ul className="space-y-2 text-sm text-gray-700 list-disc list-inside rtl:list-inside">
            <li><span className="font-semibold text-gray-800">{isAr ? 'الإطار الزمني:' : 'Timeline:'}</span> {followUpData.timeline}</li>
            <li><span className="font-semibold text-gray-800">{isAr ? 'التصوير الطبي:' : 'Imaging:'}</span> {followUpData.imaging}</li>
            <li><span className="font-semibold text-gray-800">{isAr ? 'التحاليل المخبرية:' : 'Labs:'}</span> {followUpData.labs}</li>
          </ul>
        </div>
      </div>

      {/* Consultant Credentials and Clinical Rationale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#E6FAF7] print:border-[#007B6E]">
        
        {/* Clinical Rationale */}
        <div className="p-4 bg-gray-50 rounded-lg print:bg-transparent print:border print:border-gray-200">
          <h3 className="text-md font-bold text-[#007B6E] mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00C6AE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {copy.clinicalRationaleTitle}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {copy.rationaleText}
          </p>
        </div>

        {/* Consultant Credentials */}
        <div className="p-4 bg-gray-50 rounded-lg print:bg-transparent print:border print:border-gray-200">
          <h3 className="text-md font-bold text-[#007B6E] mb-2 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#00C6AE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
            {copy.consultantCredentialsTitle}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center border-b border-gray-200 pb-1">
              <span className="text-gray-500 font-medium">{copy.boardCertification}</span>
              <span className="text-gray-800 font-bold">{credentialData.board}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-200 pb-1">
              <span className="text-gray-500 font-medium">{copy.specialty}</span>
              <span className="text-gray-800 font-bold">{credentialData.specialty}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">{copy.experience}</span>
              <span className="text-[#007B6E] font-bold">{credentialData.experienceYears} {copy.yearsSuffix}</span>
            </div>
          </div>
        </div>

      </div>

      {/* WhatsApp Integration Hint for Live Consultation (Optional UI Element) */}
      <div className="mt-8 flex justify-end print:hidden">
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-bold rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
          aria-label={isAr ? 'تواصل عبر واتساب' : 'Contact via WhatsApp'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          {isAr ? 'استشارة فورية' : 'Instant Consultation'}
        </button>
      </div>
    </section>
  );
};

export default DossierRecommendationsSection;