/**
 * Landing page FAQ.
 *
 * Lives apart from the service catalogue so that copy changes never sit next to
 * pricing or catalogue data. Moved verbatim from `data/healthcareServices.ts`.
 */
export interface FaqItem {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

export const LANDING_FAQ_ITEMS: FaqItem[] = [
  {
    qAr: 'ما هو الرأي الطبي الثاني ومتى أحتاجه؟',
    qEn: 'What is a second medical opinion and when do I need one?',
    aAr: 'الرأي الطبي الثاني هو تقييم سريري مستقل وشامل لتشخيصك وخطة علاجك من قبل استشاري عالمي متخصص ومستقل. تحتاجه عند تلقي تشخيص لمرض معقد، أو عندما يوصى بإجراء عملية جراحية كبرى، أو في حال عدم استجابة الأعراض للعلاج الحالي.',
    aEn: 'A second medical opinion is an independent, thorough review of your medical diagnosis and proposed treatment plan by an international senior specialist. It is recommended for complex diagnoses, before undergoing major surgery, or when current treatments are not yielding improvement.',
  },
  {
    qAr: 'كيف تضمن منصة ألو دكتور سرية بياناتي الطبية؟',
    qEn: 'How does ALO DOCTOR ensure the confidentiality of my medical records?',
    aAr: 'تلتزم المنصة بأعلى معايير الأمن السيبراني ونظام حماية البيانات الشخصية والبيانات الصحية في المملكة العربية السعودية (SDAIA & MOH). نقوم بحجب البيانات التعريفية الشخصية (PII Masking) وتشفير كافة المرفقات والأشعة ثلاثية الأبعاد (DICOM) قبل مشاركتها مع الاستشاري.',
    aEn: 'ALO DOCTOR strictly complies with Saudi Personal Data Protection Law (SDAIA) and Ministry of Health digital health guidelines. We apply automated PII de-identification and military-grade encryption on all diagnostic files and 3D DICOM scans prior to consultant access.',
  },
  {
    qAr: 'كم يستغرق استلام التقرير الطبي المعتمد؟',
    qEn: 'How long does it take to receive the certified medical report?',
    aAr: 'يستغرق إعداد التقرير الطبي المعتمد ثنائي اللغة ما بين 24 إلى 48 ساعة من اكتمال رفع التقارير وتأكيد الطلب. يشمل التقرير دراسة تفصيلية موقعة من الاستشاري الدولي ومصدقة من الطبيب السعودي المعالج المشرف على الحالة.',
    aEn: 'You will receive your certified bilingual report within 24 to 48 hours following document completion and intake approval. The report includes an in-depth clinical analysis signed by the international consultant and endorsed by your Saudi supervising physician.',
  },
  {
    qAr: 'هل أحتاج للسفر للخارج لتلقي الاستشارة؟',
    qEn: 'Do I need to travel abroad to receive the consultation?',
    aAr: 'لا، تتم جميع الاستشارات والدراسات عن بُعد وأنت في منزلك عبر المنصة، مع إمكانية عقد مكالمة مرئية تفاعلية مباشرة مع الاستشاري بمرافقة مترجم طبي معتمد.',
    aEn: 'No travel is required. The entire second opinion and telehealth consultation takes place securely online from the comfort of your home, with optional live video sessions featuring clinical translation.',
  },
  {
    qAr: 'ما هي خيارات السداد المتاحة؟',
    qEn: 'What payment options are available?',
    aAr: 'نوفر قنوات دفع إلكترونية آمنة ومعتمدة في المملكة، تشمل مدى (Mada)، البطاقات الائتمانية (Visa/Mastercard)، أبل باي (Apple Pay)، وخيارات التقسيط الميسر عبر تابي (Tabby) مع إصدار فاتورة ضريبية رسمية معتمدة من هيئة الزكاة والضريبة والجمارك (ZATCA).',
    aEn: 'We support all accredited Saudi digital payment methods including Mada, Visa, Mastercard, Apple Pay, and installment flexibility via Tabby, backed by ZATCA-compliant official e-invoicing.',
  },
];
