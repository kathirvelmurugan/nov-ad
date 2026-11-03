import { ClinicalCase } from '../types';

export const SEED_CASES: ClinicalCase[] = [
  {
    id: 'case-001',
    caseNumber: 'ALO-2026-0001',
    patientName: 'سالم بن عبد العزيز العامري',
    patientNameAr: 'سالم بن عبد العزيز العامري',
    patientNameEn: 'Salem Abdulaziz Al-Ameri',
    cityAr: 'الرياض، المملكة العربية السعودية',
    cityEn: 'Riyadh, Saudi Arabia',
    specialtyAr: 'أمراض القلب وجراحة الصمامات',
    specialtyEn: 'Cardiology & Valvular Heart Disease',
    diagnosisAr: 'تضيق الصمام الأبهري الشديد والتكلس التاجي',
    diagnosisEn: 'Severe Calcific Aortic Stenosis & Annular Calcification',
    symptomsAr: 'ضيق تنفس تدريجي عند بذل الجهد (NYHA Class III) مع نوبات دوخة وألم ضاغط في الصدر ونوبة إغماء حديثة.',
    symptomsEn: 'Progressive exertional dyspnea (NYHA Class III), exertional angina, fatigue, and a recent syncopal episode 2 weeks ago.',
    nationalIdMasked: '1089****10',
    age: 58,
    gender: 'M',
    city: 'الرياض (Riyadh)',
    specialty: 'أمراض القلب والشرايين (Cardiology)',
    diagnosis: 'تضيق الصمام الأبهري الشديد والتكلس التاجي (Severe Calcific Aortic Stenosis)',
    symptoms: 'ضيق تنفس تدريجي عند بذل الجهد (NYHA Class III) مع نوبات دوخة وألم ضاغط في الصدر منذ 4 أشهر.',
    caregiver: {
      isProxy: true,
      name: 'فاطمة العتيبي',
      relationship: 'ابنة المريض (Daughter)',
      nationalId: '1098452103',
      phone: '+966 55 987 6543',
      hasLegalConsent: true
    },
    consultationType: 'video',
    currentStage: 'INTAKE_RECEIVED',
    treatingDoctor: {
      name: 'د. عبدالله الشمري',
      hospital: 'مستشفى رعاية الرياض (Riyadh Care)',
      city: 'الرياض',
      focusQuestions: [
        'هل توصي بإجراء استبدال الصمام عبر القسطرة (TAVR) أم الجراحة المفتوحة (SAVR) في ضوء درجة التكلس العالية ومعدل الخطورة؟',
        'ما هو التقييم الدقيق للشريان التاجي الأيسر المتفرع وهل يستدعي تداخلاً جراحياً مصاحباً (CABG)؟',
        'ما هي الخطة الإضافية المقترحة للمتابعة والتأهيل السريري لتقليل احتمالات الانتكاس؟'
      ],
      focusQuestionsEn: [
        'Do you recommend Transcatheter Aortic Valve Replacement (TAVR) or open Surgical Replacement (SAVR) in light of severe calcification and low STS score of 2.1%?',
        'What is your evaluation of the non-obstructive LAD coronary plaque, and does it warrant concurrent bypass grafting (CABG)?',
        'What post-procedural antithrombotic and anticoagulant regimen is optimal for long-term valve longevity and stroke prevention?'
      ]
    },
    consultant: {
      name: 'Dr. Arjun Mehta',
      center: 'KIMS Heart Institute',
      city: 'Hyderabad, India',
      opinionEnglish: 'Based on high-resolution Echo and Cardiac CT, severe calcific aortic stenosis with valve area 0.7 cm² and mean gradient 46 mmHg is confirmed. Given patient age 58 and low surgical STS score of 2.1%, Surgical Aortic Valve Replacement (SAVR) with a mechanical or bioprosthetic valve provides superior long-term durability over TAVR. Concomitant coronary angiography demonstrates mild LAD non-obstructive plaque not requiring bypass.',
      opinionArabic: 'بناءً على تخطيط صدى القلب والتصوير المقطعي، تأكد وجود تضيق أبهري كلسي شديد بمساحة صمام 0.7 سم² وتدرج ضغط متوسط 46 ملم زئبق. بالنظر لعمر المريض (58 سنة) ونسبة خطورة جراحية منخفضة (2.1%)، فإن الاستبدال الجراحي (SAVR) هو الخيار الأمثل لتحقيق كفاءة طويلة الأمد مقارنة بالقسطرة.',
      proposedSlot: 'Tue 5:00 PM KSA / 7:30 PM IST'
    },
    pricing: {
      tier: 2,
      tierName: 'مرئي + رأي مكتوب (Tier 2)',
      baseSar: 130.43,
      vatPercent: 15,
      vatSar: 19.57,
      totalSar: 150,
      paid: false,
      invoiceNumber: 'INV-2026-0941',
      tapChargeId: 'chg_tap_ksa_test_89214',
      tabbyInstallmentSar: 37.5
    },
    files: [
      { id: 'f1', name: 'Clinical_Echo_Summary.pdf', type: 'pdf', size: '2.4 MB', verified: true, url: '#' },
      { id: 'f2', name: 'Transthoracic_Echocardiogram_Loop.mp4', type: 'mp4', size: '28.5 MB', verified: true, url: '#' },
      { id: 'f3', name: 'Cardiac_MRI_CINE_Series.dcm', type: 'dicom', size: '84.2 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'تحليل وظائف كلى وشوارد (U&E) + زمن التخثر (PT/INR)', status: 'pending' },
      pharmacy: { meds: ['Bisoprolol 5mg', 'Atorvastatin 40mg', 'Aspirin 81mg'], substituteAllowed: true, status: 'pending' },
      homeNurse: { area: 'الرياض - حي الملقا (Riyadh Al-Malqa)', visits: 4, status: 'scheduled' },
      physio: { sessions: 8, status: 'planned' }
    },
    consultantOpinion: "Based on high-resolution Echo and Cardiac CT, severe calcific aortic stenosis with valve area 0.7 cm² and mean gradient 46 mmHg is confirmed. Given patient age 58 and low surgical STS score of 2.1%, Surgical Aortic Valve Replacement (SAVR) with a mechanical or bioprosthetic valve provides superior long-term durability over TAVR. Concomitant coronary angiography demonstrates mild LAD non-obstructive plaque not requiring bypass.",
    proposedCallSlot: "Tue 16:00 AST / 18:30 IST",
    finalClosureNote: "Post-consultation follow-up confirmed valve surgery scheduled at King Faisal Specialist Hospital. Anticoagulation protocol with Warfarin (target INR 2.0-3.0) approved. Patient recovery parameters optimal.",
    coordinatorQuestions: "Focus: TAVR vs SAVR valve durability at age 58 and stroke prophylaxis.",
    metadata: {
      "proposedSlots": [
            {
                  "id": "slot_1",
                  "time": "Tuesday 16:00 AST (18:30 IST)"
            },
            {
                  "id": "slot_2",
                  "time": "Wednesday 11:30 AST (14:00 IST)"
            },
            {
                  "id": "slot_3",
                  "time": "Thursday 17:00 AST (19:30 IST)"
            }
      ],
      "confirmedSlotId": "slot_1",
      "pdf1Released": true,
      "patientQuestions": [
            "هل يستدعي استخدام الصمام الميكانيكي الالتزام الدائم بفحوصات سيولة الدم المنزلية؟",
            "متى يمكنني العودة لممارسة المشي اليومي وصعود الدرج بعد العملية؟"
      ],
      "relayedQuestions": [
            "Patient inquiries regarding home INR self-monitoring frequency and post-op cardiac rehab milestones."
      ],
      "reportPdf1": {
            "titleAr": "تقرير الرأي الطبي الثاني المعتمد - جراحة القلب والصمامات",
            "titleEn": "Certified Second Opinion Report - Valvular Cardiac Surgery",
            "icd10": "I35.0 (Aortic Stenosis)",
            "summaryAr": "التوصية باعتماد الجراحة المفتوحة (SAVR) لضمان متانة الصمام لأكثر من 20 عاماً مع تجنب التداخل التاجي حالياً.",
            "summaryEn": "Definitive recommendation for SAVR over TAVR for optimal 20-year durability with conservative LAD management."
      },
      "reportPdf2": {
            "titleAr": "الملف السريري الشامل النهائي وأرشيف الحالة",
            "titleEn": "Comprehensive Final Clinical Dossier & Case Archive",
            "status": "مغلق ومعتمد نظامياً"
      }
}
  },
  {
    id: 'case-002',
    caseNumber: 'ALO-2026-0002',
    patientName: 'فاطمة بنت خالد الكعبي',
    patientNameAr: 'فاطمة بنت خالد الكعبي',
    patientNameEn: 'Fatima Khalid Al-Kaabi',
    nationalIdMasked: '1023****44',
    age: 62,
    gender: 'F',
    city: 'جدة (Jeddah)',
    specialty: 'أمراض القلب والتداخل الجراحي (Cardiology - CAD)',
    diagnosis: 'اعتلال الشرايين التاجية المتعدد (Triple Vessel CAD / CABG vs PCI)',
    symptoms: 'نوبات ذبحة صدرية غير مستقرة ومتكررة على الرغم من العلاج الدوائي المكثف.',
    consultationType: 'video',
    currentStage: 'NURSE_CHECK',
    treatingDoctor: {
      name: 'د. فيصل الغامدي',
      hospital: 'مستشفى الدكتور سليمان فقيه (Fakeeh Health)',
      city: 'جدة',
      focusQuestions: [
        'Is complete revascularization via CABG mandatory over multi-vessel PCI with DES given syntax score 34?',
        'Optimal timing for antiplatelet therapy discontinuation prior to intervention?',
        'ما هي الخطة الإضافية المقترحة للمتابعة والتأهيل السريري لتقليل احتمالات الانتكاس؟'
      ]
    },
    consultant: {
      name: 'Dr. Suresh Rao',
      center: 'Apollo Hospitals',
      city: 'Chennai, India'
    },
    pricing: {
      tier: 2,
      tierName: 'مرئي + رأي مكتوب (Tier 2)',
      baseSar: 130.43,
      vatPercent: 15,
      vatSar: 19.57,
      totalSar: 150,
      paid: false,
      invoiceNumber: 'INV-2026-0001',
      tapChargeId: 'chg_tap_ksa_test_89214',
      tabbyInstallmentSar: 37.5
    },
    files: [
      { id: 'f4', name: 'Coronary_Angio_Report.pdf', type: 'pdf', size: '3.1 MB', verified: true, url: '#' },
      { id: 'f5', name: 'Cath_Lab_Runs.mp4', type: 'mp4', size: '42.0 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'High-Sensitivity Troponin I + HbA1c', status: 'pending' },
      pharmacy: { meds: ['Clopidogrel 75mg', 'Rosuvastatin 20mg'], substituteAllowed: true, status: 'pending' },
      homeNurse: { area: 'جدة - حي الشاطئ (Jeddah Corniche)', visits: 2, status: 'scheduled' },
      physio: { sessions: 6, status: 'planned' }
    },
    consultantOpinion: "SYNTAX Score of 34 indicates complex multi-vessel coronary artery disease with diffuse calcification of LAD and proximal Circumflex. Coronary Artery Bypass Grafting (CABG) using Bilateral Internal Mammary Arteries (BIMA) is strongly indicated over multi-vessel PCI to achieve complete revascularization and superior 10-year survival.",
    proposedCallSlot: "Wed 14:00 AST / 16:30 IST",
    finalClosureNote: "BIMA-CABG surgical planning approved with Dr. Faisal Al-Ghamdi. Pre-operative glycemic optimization achieved (HbA1c < 7.0%).",
    coordinatorQuestions: "Focus: CABG with BIMA vs multi-vessel drug-eluting stenting in diabetic female.",
    metadata: {
      "proposedSlots": [
            {
                  "id": "slot_1",
                  "time": "Wednesday 14:00 AST (16:30 IST)"
            },
            {
                  "id": "slot_2",
                  "time": "Thursday 15:00 AST (17:30 IST)"
            }
      ],
      "confirmedSlotId": "slot_1",
      "pdf1Released": true,
      "patientQuestions": [
            "هل جراحة مجازة الشرايين التاجية بالماماري المزدوج تحتاج إلى نقل دم أثناء العملية؟",
            "كم المدة المقدرة للبقاء في العناية المركزة والمستشفى بعد الجراحة؟"
      ],
      "relayedQuestions": [
            "Inquiry regarding blood transfusion threshold and ICU stay duration for diabetic bypass surgery."
      ],
      "reportPdf1": {
            "titleAr": "تقرير الرأي الطبي الثاني المعتمد - جراحة الشرايين التاجية (CABG)",
            "titleEn": "Certified Second Opinion Report - Coronary Artery Bypass Grafting",
            "icd10": "I25.10 (Atherosclerotic Heart Disease)",
            "summaryAr": "التوصية بإجراء جراحة المجازة التاجية (CABG) باستخدام الشريان الصدري الباطن لتحقيق أعلى نسب البقاء على قيد الحياة.",
            "summaryEn": "Strong clinical recommendation for BIMA-CABG revascularization over PCI due to high SYNTAX score (34)."
      },
      "reportPdf2": {
            "titleAr": "الملف الطبي الختامي وإغلاق حالة جراحة الشرايين التاجية",
            "titleEn": "Final Closed Clinical Dossier - CAD Surgery",
            "status": "مغلق ومعتمد"
      }
}
  },
  {
    id: 'case-003',
    caseNumber: 'ALO-2026-0003',
    patientName: 'طارق بن مسفر المطيري',
    patientNameAr: 'طارق بن مسفر المطيري',
    patientNameEn: 'Tariq Mesfer Al-Mutairi',
    nationalIdMasked: '1077****89',
    age: 47,
    gender: 'M',
    city: 'الدمام (Dammam)',
    specialty: 'جراحة المخ والأعصاب (Neurology / Neurosurgery)',
    diagnosis: 'تمدد الأوعية الدموية في الشريان الدماغي الأمامي (Acom Aneurysm)',
    symptoms: 'صداع خافق حاد مفاجئ مع فترات تشوش في الرؤية.',
    consultationType: 'written',
    currentStage: 'DOCTOR_REVIEW',
    treatingDoctor: {
      name: 'د. منى العبدالله',
      hospital: 'مستشفى المانع العام (Al-Mana General)',
      city: 'الدمام',
      focusQuestions: [
        'Is endovascular coiling preferable over microsurgical clipping for this 7mm wide-neck aneurysm?',
        'Risk assessment of secondary rupture during conservative observation window?',
        'ما هي الخطة الإضافية المقترحة للمتابعة والتأهيل السريري لتقليل احتمالات الانتكاس؟'
      ]
    },
    consultant: {
      name: 'Dr. Rajesh Deshmukh',
      center: 'Fortis Memorial Research Institute',
      city: 'Delhi, India'
    },
    pricing: {
      tier: 1,
      tierName: 'رأي مكتوب فقط (Tier 1)',
      baseSar: 65.22,
      vatPercent: 15,
      vatSar: 9.78,
      totalSar: 75,
      paid: false,
      invoiceNumber: 'INV-2026-0001',
      tapChargeId: 'chg_tap_ksa_test_89214',
      tabbyInstallmentSar: 18.75
    },
    files: [
      { id: 'f6', name: 'Brain_MRA_3D.dcm', type: 'dicom', size: '120 MB', verified: true, url: '#' },
      { id: 'f7', name: 'Neuro_Consultation_Note.pdf', type: 'pdf', size: '1.8 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'CBC + Coagulation Panel', status: 'pending' },
      pharmacy: { meds: ['Nimodipine 60mg', 'Levetiracetam 500mg'], substituteAllowed: false, status: 'pending' },
      homeNurse: { area: 'الدمام - حي الشاطئ', visits: 1, status: 'scheduled' },
      physio: { sessions: 0, status: 'planned' }
    },
    consultantOpinion: "Lumbar MRI reveals severe central canal stenosis at L4-L5 with facet arthropathy. However, dynamic flexion-extension radiographs show no spondylolisthesis or mechanical instability. Therefore, minimally invasive bilateral decompression via unilateral laminotomy is indicated instead of aggressive 2-level fusion with instrumentation.",
    finalClosureNote: "Endoscopic decompression successfully performed with preservation of lumbar stability. Patient reports complete relief of neurogenic claudication.",
    coordinatorQuestions: "Focus: Decompression alone vs fusion instrumentation for L4-L5 spinal stenosis.",
    metadata: {
      "pdf1Released": true,
      "patientQuestions": [
            "هل إزالة الضغط بالمنظار تمنع الحاجة إلى تثبيت الفقرات بالمسامير في المستقبل؟",
            "متى يمكنني البدء في جلسات العلاج الطبيعي والتأهيل الحركي؟"
      ],
      "relayedQuestions": [
            "Patient questioning future fusion necessity after endoscopic laminotomy and physical therapy start date."
      ],
      "reportPdf1": {
            "titleAr": "تقرير الرأي الطبي الثاني المعتمد - جراحة العمود الفقري والأعصاب",
            "titleEn": "Certified Second Opinion Report - Minimally Invasive Spine Surgery",
            "icd10": "M48.06 (Spinal Stenosis, Lumbar Region)",
            "summaryAr": "التوصية بإجراء توسيع القناة العصبية بالتدخل المحدود دون الحاجة لدمج الفقرات أو تثبيت الشرائح والمسامير.",
            "summaryEn": "Recommendation for minimally invasive decompression alone without fusion instrumentation."
      },
      "reportPdf2": {
            "titleAr": "تقرير الإغلاق السريري النهائي - جراحة العمود الفقري",
            "titleEn": "Final Clinical Closure Dossier - Spine Surgery",
            "status": "مغلق ومؤرشف"
      }
}
  },
  {
    id: 'case-004',
    caseNumber: 'ALO-2026-0004',
    patientName: 'ريم بنت حسن الحارثي',
    patientNameAr: 'ريم بنت حسن الحارثي',
    patientNameEn: 'Reem Hassan Al-Harthi',
    nationalIdMasked: '1091****32',
    age: 34,
    gender: 'F',
    city: 'المدينة المنورة (Medina)',
    specialty: 'طب الأعصاب والصرع (Epileptology)',
    diagnosis: 'صرع الفص الصدغي المعند على العلاج الدوائي (Refractory Temporal Epilepsy)',
    symptoms: 'نوبات صرعية بؤرية أسبوعية متكررة غير مستجيبة لـ 3 أدوية مضادة للصرع.',
    consultationType: 'video',
    currentStage: 'AWAITING_PAYMENT',
    treatingDoctor: {
      name: 'د. هشام الفالح',
      hospital: 'مستشفى المواساة (Mouwasat)',
      city: 'المدينة المنورة',
      focusQuestions: [
        'Candidate evaluation for stereotactic laser amygdalohippocampotomy vs anterior temporal lobectomy?',
        'Relevance of responsive neurostimulation (RNS) given non-dominant hemisphere seizure onset?',
        'ما هي الخطة الإضافية المقترحة للمتابعة والتأهيل السريري لتقليل احتمالات الانتكاس؟'
      ]
    },
    consultant: {
      name: 'Dr. Alok Sharma',
      center: 'NIMHANS / Manipal',
      city: 'Bangalore, India'
    },
    pricing: {
      tier: 2,
      tierName: 'مرئي + رأي مكتوب (Tier 2)',
      baseSar: 130.43,
      vatPercent: 15,
      vatSar: 19.57,
      totalSar: 150,
      paid: false,
      invoiceNumber: 'INV-2026-0001',
      tapChargeId: 'chg_tap_ksa_test_89214',
      tabbyInstallmentSar: 37.5
    },
    files: [
      { id: 'f8', name: 'Video_EEG_Monitoring_72h.pdf', type: 'pdf', size: '5.6 MB', verified: true, url: '#' },
      { id: 'f9', name: 'Epilepsy_Protocol_Brain_MRI.dcm', type: 'dicom', size: '95 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'Serum Lamotrigine + Valproate Trough Levels', status: 'pending' },
      pharmacy: { meds: ['Brivaracetam 50mg', 'Clobazam 10mg'], substituteAllowed: true, status: 'pending' },
      homeNurse: { area: 'المدينة المنورة - حي سلطانة', visits: 2, status: 'scheduled' },
      physio: { sessions: 4, status: 'planned' }
    },
    consultantOpinion: "Right Heart Catheterization demonstrates mPAP 48 mmHg with normal wedge pressure, confirming Group 1 Pulmonary Arterial Hypertension (PAH). Upfront double oral combination therapy with Macitentan (10mg) and Tadalafil (40mg) is recommended, with close echocardiographic reassessment at 12 weeks before considering parenteral prostacyclins.",
    proposedCallSlot: "Mon 15:30 AST / 18:00 IST",
    finalClosureNote: "Patient commenced combination oral targeted therapy with marked improvement in 6-minute walk distance (+65m). Hemodynamics stable.",
    coordinatorQuestions: "Focus: Dual oral targeted therapy vs triple therapy upfront in idiopathic PAH.",
    metadata: {
      "proposedSlots": [
            {
                  "id": "slot_1",
                  "time": "Monday 15:30 AST (18:00 IST)"
            },
            {
                  "id": "slot_2",
                  "time": "Tuesday 12:00 AST (14:30 IST)"
            }
      ],
      "confirmedSlotId": "slot_1",
      "pdf1Released": true,
      "patientQuestions": [
            "هل يلزم فحص وظائف الكبد شهرياً مع علاج الماكتيتان والتادالافيل؟",
            "هل الرياضات الهوائية الخفيفة آمنة في هذه المرحلة؟"
      ],
      "relayedQuestions": [
            "Liver enzyme monitoring frequency on Macitentan and low-impact exercise safety boundaries."
      ],
      "reportPdf1": {
            "titleAr": "تقرير الرأي الطبي الثاني المعتمد - ارتفاع ضغط الشريان الرئوي (PAH)",
            "titleEn": "Certified Second Opinion Report - Pulmonary Arterial Hypertension",
            "icd10": "I27.0 (Primary Pulmonary Hypertension)",
            "summaryAr": "اعتماد خطة العلاج المزدوج الموجه بالفم مع متابعة القسطرة القلبية اليمنى بعد 3 أشهر لتقييم الاستجابة.",
            "summaryEn": "Initiation of upfront dual oral pathway combination therapy with close quarterly hemodynamic monitoring."
      },
      "reportPdf2": {
            "titleAr": "تقرير المتابعة السريرية وإغلاق الحالة - الشريان الرئوي",
            "titleEn": "Comprehensive Closure Dossier - PAH Specialty Care",
            "status": "مغلق ومعتمد"
      }
}
  },
  {
    id: 'case-005',
    caseNumber: 'ALO-2026-0005',
    patientName: 'نوف بنت سليمان السبيعي',
    patientNameAr: 'نوف بنت سليمان السبيعي',
    patientNameEn: 'Nouf Sulaiman Al-Subaie',
    nationalIdMasked: '1045****19',
    age: 51,
    gender: 'F',
    city: 'الرياض (Riyadh)',
    specialty: 'علاج الأورام وأمراض الدم (Oncology)',
    diagnosis: 'سرطان الثدي القنوي الغازي (Invasive Ductal Carcinoma, ER+/PR+/HER2-)',
    symptoms: 'كتلة غير مؤلمة في الثدي الأيمن تم اكتشافها سريرياً مع سلبية الغدد اللمفاوية بالسونار.',
    consultationType: 'video',
    currentStage: 'WITH_CONSULTANT',
    treatingDoctor: {
      name: 'د. نورة التويجري',
      hospital: 'مستشفى المملكة (Kingdom Hospital)',
      city: 'الرياض',
      focusQuestions: [
        'Is adjuvant chemotherapy required prior to endocrine therapy given Oncotype DX recurrence score of 24?',
        'Recommendation on CDK4/6 inhibitor inclusion in adjuvant setting?',
        'ما هي الخطة الإضافية المقترحة للمتابعة والتأهيل السريري لتقليل احتمالات الانتكاس؟'
      ]
    },
    consultant: {
      name: 'Dr. Priya Ramachandran',
      center: 'Tata Memorial / Apollo Cancer Center',
      city: 'Mumbai, India'
    },
    pricing: {
      tier: 2,
      tierName: 'مرئي + رأي مكتوب (Tier 2)',
      baseSar: 130.43,
      vatPercent: 15,
      vatSar: 19.57,
      totalSar: 150,
      paid: true,
      invoiceNumber: 'INV-2026-0812',
      tapChargeId: 'chg_tap_ksa_test_89214',
      tabbyInstallmentSar: 37.5
    },
    files: [
      { id: 'f10', name: 'Pathology_Biopsy_IHC.pdf', type: 'pdf', size: '3.4 MB', verified: true, url: '#' },
      { id: 'f11', name: 'Bilateral_Breast_MRI.dcm', type: 'dicom', size: '140 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'Complete Metabolic Panel + CA 15-3 Marker', status: 'pending' },
      pharmacy: { meds: ['Letrozole 2.5mg', 'Zoledronic Acid IV'], substituteAllowed: false, status: 'pending' },
      homeNurse: { area: 'الرياض - حي النخيل', visits: 3, status: 'scheduled' },
      physio: { sessions: 10, status: 'planned' }
    },
    consultantOpinion: "Colonoscopy confirms severe pancolitis with mucosal friability refractory to anti-TNF therapy (Infliximab with antibodies). Rather than proceeding immediately to total proctocolectomy, switching to advanced anti-IL23 biologic (Ustekinumab or Risankizumab) or JAK inhibitor (Upadacitinib) is strongly recommended with repeat mucosal assessment in 8 weeks.",
    proposedCallSlot: "Wed 16:30 AST / 19:00 IST",
    finalClosureNote: "Clinical remission achieved on Upadacitinib 45mg induction. Fecal calprotectin dropped from 1,240 to 180 ug/g. Surgical resection averted.",
    coordinatorQuestions: "Focus: Biologic class-switch to JAK inhibitor vs subtotal colectomy in refractory UC.",
    metadata: {
      "proposedSlots": [
            {
                  "id": "slot_1",
                  "time": "Wednesday 16:30 AST (19:00 IST)"
            },
            {
                  "id": "slot_2",
                  "time": "Thursday 13:00 AST (15:30 IST)"
            }
      ],
      "confirmedSlotId": "slot_1",
      "pdf1Released": true,
      "patientQuestions": [
            "هل علاج أوباداسيتينيب يغني تماماً عن عملية استئصال القولون؟",
            "ما هي الفحوصات الدورية المطلوبة للتأكد من عدم عودة الالتهاب؟"
      ],
      "relayedQuestions": [
            "Durability of JAK-inhibitor induced mucosal healing and long-term colectomy avoidance."
      ],
      "reportPdf1": {
            "titleAr": "تقرير الرأي الطبي الثاني المعتمد - أمراض الجهاز الهضمي والقولون التقرحي",
            "titleEn": "Certified Second Opinion Report - Inflammatory Bowel Disease",
            "icd10": "K51.00 (Ulcerative Pancolitis)",
            "summaryAr": "التوصية بالتحويل إلى مثبطات جاك (Upadacitinib) كخط علاجي أخير قبل اللجوء للجراحة لتفادي استئصال القولون.",
            "summaryEn": "Strong recommendation for advanced targeted small molecule (JAKi) trial to achieve mucosal healing and avoid colectomy."
      },
      "reportPdf2": {
            "titleAr": "الملف السريري الختامي - قسم أمراض الجهاز الهضمي",
            "titleEn": "Final Closed Clinical Dossier - IBD Management",
            "status": "مغلق ومؤرشف"
      }
}
  },
  {
    id: 'case-006',
    caseNumber: 'ALO-2026-0006',
    patientName: 'خالد بن بكر البارقي',
    patientNameAr: 'خالد بن بكر البارقي',
    patientNameEn: 'Khalid Bakr Al-Bariqi',
    nationalIdMasked: '1033****71',
    age: 65,
    gender: 'M',
    city: 'أبها (Abha)',
    specialty: 'أورام الجهاز الهضمي (Surgical Oncology)',
    diagnosis: 'سرطان القولون والمستقيم مع ورم ثانوي كبدي وحيد (Stage IV Oligometastatic CRC)',
    symptoms: 'فقر دم متكرر مع تغير في عادات الخروج ونقص وزن غير مبرر.',
    consultationType: 'video',
    currentStage: 'OPINION_READY',
    treatingDoctor: {
      name: 'د. بندر الشهري',
      hospital: 'مستشفى عسير المركزي (Asir Central)',
      city: 'أبها',
      focusQuestions: [
        'Simultaneous vs staged resection of primary tumor and single segment IV liver metastasis?',
        'First-line regimen: FOLFOXIRI + Bevacizumab vs FOLFIRI + Panitumumab (RAS wild-type confirmed)?',
        'ما هي الخطة الإضافية المقترحة للمتابعة والتأهيل السريري لتقليل احتمالات الانتكاس؟'
      ]
    },
    consultant: {
      name: 'Dr. Vikram Grover',
      center: 'Max Healthcare Institute',
      city: 'Delhi, India',
      opinionEnglish: 'Oligometastatic liver disease in segment IV is resectable with R0 margins. Recommend 4 cycles of induction FOLFOXIRI + Panitumumab, followed by restaging MRI. If stable or response observed, perform staged laparoscopic low anterior resection followed 6 weeks later by segment IV anatomic resection.',
      opinionArabic: 'الانبثاث الكبدي الوحيد في القطعة الرابعة قابل للاستئصال الجراحي التام. نوصي بـ 4 دورات علاج كيميائي حثي متبوعة بإعادة تصوير رنيني، ثم إجراء الاستئصال على مرحلتين لتحقيق أعلى معدلات الشفاء.'
    },
    pricing: {
      tier: 2,
      tierName: 'مرئي + رأي مكتوب (Tier 2)',
      baseSar: 130.43,
      vatPercent: 15,
      vatSar: 19.57,
      totalSar: 150,
      paid: true,
      invoiceNumber: 'INV-2026-0744',
      tapChargeId: 'chg_tap_ksa_test_89214',
      tabbyInstallmentSar: 37.5
    },
    files: [
      { id: 'f12', name: 'Abdominal_Pelvic_CT_TriplePhase.dcm', type: 'dicom', size: '210 MB', verified: true, url: '#' },
      { id: 'f13', name: 'Colonoscopy_Biopsy_Report.pdf', type: 'pdf', size: '2.1 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'CEA Tumor Marker + LFTs', status: 'completed' },
      pharmacy: { meds: ['Ondansetron 8mg', 'Aprepitant 125mg'], substituteAllowed: true, status: 'ready' },
      homeNurse: { area: 'أبها - حي الضباب', visits: 4, status: 'dispatched' },
      physio: { sessions: 6, status: 'in_progress' }
    },
    consultantOpinion: "Histopathology and molecular sequencing confirm IDH-wildtype, MGMT promoter methylated Glioblastoma. Maximal safe surgical resection followed by the Stupp protocol (Concurrent Temozolomide + RT 60 Gy) plus Tumor Treating Fields (Optune TTFields) is strongly recommended to optimize overall survival.",
    proposedCallSlot: "Tue 13:00 AST / 15:30 IST",
    finalClosureNote: "Radiotherapy with concurrent TMZ completed without grade 3/4 hematological toxicity. Optune array initiated.",
    coordinatorQuestions: "Focus: Addition of Tumor Treating Fields (TTFields) to Stupp protocol for MGMT methylated GBM.",
    metadata: {
      "proposedSlots": [
            {
                  "id": "slot_1",
                  "time": "Tuesday 13:00 AST (15:30 IST)"
            },
            {
                  "id": "slot_2",
                  "time": "Wednesday 17:00 AST (19:30 IST)"
            }
      ],
      "confirmedSlotId": "slot_1",
      "pdf1Released": true,
      "patientQuestions": [
            "كم ساعة يومياً يجب ارتداء جهاز المجالات الكهربائية (TTFields) لتحقيق الفائدة القصوى؟",
            "ما هي الأعراض الجانبية المتوقعة من دمج العلاج الإشعاعي مع التيموزولوميد؟"
      ],
      "relayedQuestions": [
            "Optune compliance minimum daily hours (>18h/day) and neuro-cognitive preservation protocols."
      ],
      "reportPdf1": {
            "titleAr": "تقرير الرأي الطبي الثاني المعتمد - أورام وجراحة المخ والأعصاب",
            "titleEn": "Certified Second Opinion Report - Neuro-Oncology",
            "icd10": "C71.9 (Malignant Neoplasm of Brain, GBM)",
            "summaryAr": "اعتماد بروتوكول ستوب بالتزامن مع جهاز الحقول الكهربائية المعالجة للأورام (Optune) نظراً لوجود فرط مثيلة MGMT.",
            "summaryEn": "Standard Stupp Protocol plus adjuvant Tumor Treating Fields (TTFields) indicated for MGMT-methylated GBM."
      },
      "reportPdf2": {
            "titleAr": "تقرير الإغلاق السريري وأرشيف أورام المخ",
            "titleEn": "Final Neuro-Oncology Dossier & Case Archive",
            "status": "مغلق ومعتمد"
      }
}
  },
  {
    id: 'case-007',
    caseNumber: 'ALO-2026-0007',
    patientName: 'عبدالله بن ناصر الدخيل',
    patientNameAr: 'عبدالله بن ناصر الدخيل',
    patientNameEn: 'Abdullah Nasser Al-Dakheel',
    nationalIdMasked: '1012****08',
    age: 70,
    gender: 'M',
    city: 'بريدة (Buraidah)',
    specialty: 'جراحة العظام والمفاصل (Orthopedics)',
    diagnosis: 'فشل مفصل الركبة الصناعي وتآكل العظم المحيط (Aseptic Loosening of TKA)',
    symptoms: 'ألم مستمر وصعوبة تحميل الوزن بعد 9 سنوات من استبدال الركبة اليسرى.',
    consultationType: 'written',
    currentStage: 'PARTNER_SERVICES',
    treatingDoctor: {
      name: 'د. سعد الرشيد',
      hospital: 'مستشفى القصيم الوطني (Qassim National)',
      city: 'بريدة',
      focusQuestions: [
        'Component selection for revision: hinged constrained vs semi-constrained with metal augments?',
        'Bone graft substitute choice for tibial metaphysical defect Anderson Type IIB?',
        'ما هي الخطة الإضافية المقترحة للمتابعة والتأهيل السريري لتقليل احتمالات الانتكاس؟'
      ]
    },
    consultant: {
      name: 'Dr. Ashok Rajgopal',
      center: 'Medanta / Hiranandani Hospital',
      city: 'Mumbai, India',
      opinionEnglish: 'Radiographs reveal extensive tibial lucency >2mm indicating aseptic mechanical loosening. Revision using modular rotating hinge prosthesis with porous titanium sleeves and tantalum cones for defect reconstruction is recommended.'
    },
    pricing: {
      tier: 1,
      tierName: 'رأي مكتوب فقط (Tier 1)',
      baseSar: 65.22,
      vatPercent: 15,
      vatSar: 9.78,
      totalSar: 75,
      paid: true,
      invoiceNumber: 'INV-2026-0610',
      tapChargeId: 'chg_tap_ksa_test_89214',
      tabbyInstallmentSar: 18.75
    },
    files: [
      { id: 'f14', name: 'WeightBearing_Knee_XRay.pdf', type: 'pdf', size: '4.8 MB', verified: true, url: '#' },
      { id: 'f15', name: 'CT_Scan_Left_Knee_MetalSuppressed.dcm', type: 'dicom', size: '88 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'ESR + High-Sensitivity CRP (Infection rule-out)', status: 'completed' },
      pharmacy: { meds: ['Celecoxib 200mg', 'Pregabalin 75mg'], substituteAllowed: true, status: 'ready' },
      homeNurse: { area: 'بريدة - حي الصفراء', visits: 6, status: 'dispatched' },
      physio: { sessions: 12, status: 'in_progress' }
    },
    consultantOpinion: "Weight-bearing knee radiographs reveal severe tricompartmental osteoarthritis with bone-on-bone medial contact, fixed flexion deformity (15 deg), and varus malalignment. Conservative injections and arthroscopy are ineffective at this stage. Robotic-assisted Total Knee Arthroplasty (TKA) with kinematic alignment is recommended.",
    finalClosureNote: "Robotic TKA successfully completed. Range of motion reached 0-110 degrees at week 3 post-op. Full weight-bearing achieved.",
    coordinatorQuestions: "Focus: Robotic-assisted kinematic alignment TKA vs unicompartmental arthroplasty.",
    metadata: {
      "pdf1Released": true,
      "patientQuestions": [
            "هل الركبة الاصطناعية تتيح لي السجود في الصلاة وممارسة رياضة السباحة؟",
            "ما هي خطة العلاج الطبيعي والتأهيل الموصى بها خلال أول 6 أسابيع؟"
      ],
      "relayedQuestions": [
            "Post-TKA high-flexion implant capability for kneeling during prayer and rehab protocol."
      ],
      "reportPdf1": {
            "titleAr": "تقرير الرأي الطبي الثاني المعتمد - جراحة العظام وتبديل المفاصل بالروبوت",
            "titleEn": "Certified Second Opinion Report - Robotic Total Knee Arthroplasty",
            "icd10": "M17.11 (Unilateral Primary Osteoarthritis, Right Knee)",
            "summaryAr": "التوصية باستبدال مفصل الركبة الكامل بالروبوت لتحقيق التوازن الحركي الدقيق وتفادي جراحات المناظير غير المجدية.",
            "summaryEn": "Recommendation for robotic-assisted TKA with kinematic alignment for complete symptom resolution."
      },
      "reportPdf2": {
            "titleAr": "الملف الختامي وأرشيف جراحة العظام",
            "titleEn": "Final Orthopedic Arthroplasty Dossier",
            "status": "مغلق ومؤرشف"
      }
}
  },
  {
    id: 'case-008',
    caseNumber: 'ALO-2026-0008',
    patientName: 'مشعل بن عادل البوعينين',
    patientNameAr: 'مشعل بن عادل البوعينين',
    patientNameEn: 'Mishal Adel Al-Buainain',
    nationalIdMasked: '1068****95',
    age: 42,
    gender: 'M',
    city: 'الخبر (Khobar)',
    specialty: 'جراحة العمود الفقري (Spine Surgery)',
    diagnosis: 'انزلاق فقاري وتضيق القناة القطنية (L4-L5 Spondylolisthesis Grade II)',
    symptoms: 'ألم عصبي قطني فخذي مشع للطرف السفلي الأيمن مع عرج عصبي المنشأ بعد مسافة 150 متر.',
    consultationType: 'video',
    currentStage: 'FOLLOW_UP_21_DAYS',
    treatingDoctor: {
      name: 'د. عمر الملحم',
      hospital: 'مستشفى بروكير رعاية (Procare Riaya)',
      city: 'الخبر',
      focusQuestions: [
        'Minimally invasive TLIF vs open decompressive laminectomy with pedicle screw fixation?',
        'Necessity of intraoperative neuro-monitoring during reduction of grade II slip?',
        'ما هي الخطة الإضافية المقترحة للمتابعة والتأهيل السريري لتقليل احتمالات الانتكاس؟'
      ]
    },
    consultant: {
      name: 'Dr. Senthil Nathan',
      center: 'Ganga Orthopaedic Hospital',
      city: 'Coimbatore, India',
      opinionEnglish: 'Grade II slip with severe canal stenosis requires stabilization. Minimally Invasive TLIF with expandable interbody cage provides excellent fusion rates with minimized paraspinal muscle damage.'
    },
    pricing: {
      tier: 2,
      tierName: 'مرئي + رأي مكتوب (Tier 2)',
      baseSar: 130.43,
      vatPercent: 15,
      vatSar: 19.57,
      totalSar: 150,
      paid: true,
      invoiceNumber: 'INV-2026-0504',
      tapChargeId: 'chg_tap_ksa_test_89214',
      tabbyInstallmentSar: 37.5
    },
    files: [
      { id: 'f16', name: 'Lumbar_Spine_MRI_T2_Axial_Sag.dcm', type: 'dicom', size: '110 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'Routine Pre-Op Panel', status: 'completed' },
      pharmacy: { meds: ['Tramadol 50mg', 'Paracetamol 1000mg'], substituteAllowed: false, status: 'ready' },
      homeNurse: { area: 'الخبر - حي الحزام الذهبي', visits: 4, status: 'completed' },
      physio: { sessions: 8, status: 'completed' }
    },
    consultantOpinion: "Staging CT and EUS confirm cT3N1M0 Gastric Adenocarcinoma of the antrum with HER2-negative status and MSS. Perioperative FLOT chemotherapy (4 cycles neoadjuvant followed by D2 Subtotal Gastrectomy, then 4 cycles adjuvant) is the international standard of care superior to upfront surgery.",
    proposedCallSlot: "Mon 11:30 AST / 14:00 IST",
    finalClosureNote: "Completed 4 cycles neoadjuvant FLOT with significant radiological regression of primary tumor and lymph nodes. D2 gastrectomy scheduled.",
    coordinatorQuestions: "Focus: Neoadjuvant FLOT chemotherapy protocol vs upfront surgical resection.",
    metadata: {
      "proposedSlots": [
            {
                  "id": "slot_1",
                  "time": "Monday 11:30 AST (14:00 IST)"
            },
            {
                  "id": "slot_2",
                  "time": "Tuesday 16:00 AST (18:30 IST)"
            }
      ],
      "confirmedSlotId": "slot_1",
      "pdf1Released": true,
      "patientQuestions": [
            "ما هي النصائح التغذوية لمنع فقدان الوزن أثناء جرعات علاج FLOT الكيماوي؟",
            "هل يلزم فحص مسحي PET-CT بعد انتهاء الدورات الأربع قبل الجراحة؟"
      ],
      "relayedQuestions": [
            "Enteral nutritional support protocols during FLOT chemotherapy and restaging PET-CT timing."
      ],
      "reportPdf1": {
            "titleAr": "تقرير الرأي الطبي الثاني المعتمد - أورام الجهاز الهضمي وجراحة المعدة",
            "titleEn": "Certified Second Opinion Report - Gastrointestinal Surgical Oncology",
            "icd10": "C16.3 (Malignant Neoplasm of Gastric Antrum)",
            "summaryAr": "التوصية ببروتوكول FLOT الكيماوي قبل الجراحة لتقليص الورم وتحسين فرص الشفاء التام قبل استئصال المعدة الجذري D2.",
            "summaryEn": "Perioperative FLOT chemotherapy protocol indicated to downstage tumor prior to curative-intent D2 gastrectomy."
      },
      "reportPdf2": {
            "titleAr": "تقرير الحالة الختامي - جراحة أورام المعدة",
            "titleEn": "Final Gastric Oncology Dossier & Closure",
            "status": "مغلق ومعتمد"
      }
}
  },
  {
    id: 'case-009',
    caseNumber: 'ALO-2026-0009',
    patientName: 'زياد بن سامي القرشي (طفل)',
    patientNameAr: 'زياد بن سامي القرشي (طفل)',
    patientNameEn: 'Ziyad Sami Al-Qurashi (Pediatric)',
    nationalIdMasked: '1120****55',
    age: 7,
    gender: 'M',
    city: 'الطائف (Taif)',
    specialty: 'أمراض قلب الأطفال (Pediatric Cardiology)',
    diagnosis: 'عيب الحاجز البطيني المحيطي مع فرط ضغط رئوي (Large Perimembranous VSD)',
    symptoms: 'التهابات تنفسية متكررة وضعف في النمو والتغذية مع نفخة قلبية شاملة للانقباض.',
    consultationType: 'video',
    currentStage: 'INTAKE_RECEIVED',
    treatingDoctor: {
      name: 'د. ليلى السفياني',
      hospital: 'مستشفى القوات المسلحة بالهدا (Hada Armed Forces)',
      city: 'الطائف',
      focusQuestions: [
        'Transcatheter device closure vs surgical patch closure given proximity to aortic valve?',
        'Reversibility of pulmonary vascular resistance index (PVRI) based on catheterization data?',
        'ما هي الخطة الإضافية المقترحة للمتابعة والتأهيل السريري لتقليل احتمالات الانتكاس؟'
      ]
    },
    consultant: {
      name: 'Dr. Devanand',
      center: 'Narayana Institute of Cardiac Sciences',
      city: 'Bangalore, India'
    },
    pricing: {
      tier: 2,
      tierName: 'مرئي + رأي مكتوب (Tier 2)',
      baseSar: 130.43,
      vatPercent: 15,
      vatSar: 19.57,
      totalSar: 150,
      paid: false,
      invoiceNumber: 'INV-2026-0001',
      tapChargeId: 'chg_tap_ksa_test_89214',
      tabbyInstallmentSar: 37.5
    },
    files: [
      { id: 'f17', name: 'Pediatric_Echo_Doppler_Series.mp4', type: 'mp4', size: '35 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'Arterial Blood Gas + Iron Studies', status: 'pending' },
      pharmacy: { meds: ['Furosemide oral sol', 'Spironolactone'], substituteAllowed: true, status: 'pending' },
      homeNurse: { area: 'الطائف - حي الشفا', visits: 3, status: 'scheduled' },
      physio: { sessions: 0, status: 'planned' }
    },
    consultantOpinion: "Clinical presentation with microangiopathic hemolytic anemia, thrombocytopenia, acute kidney injury, and normal ADAMTS13 activity confirms atypical Hemolytic Uremic Syndrome (aHUS). Urgent complement C5 inhibitor therapy (Eculizumab or Ravulizumab) is life-saving and mandatory to arrest renal microthrombi, alongside mandatory meningococcal vaccination.",
    proposedCallSlot: "Wed 11:00 AST / 13:30 IST",
    finalClosureNote: "Platelet count normalized to 240,000/uL and serum creatinine stabilized to 1.1 mg/dL on Ravulizumab maintenance. Renal replacement averted.",
    coordinatorQuestions: "Focus: Immediate C5 complement inhibitor therapy vs ongoing plasma exchange for aHUS.",
    metadata: {
      "proposedSlots": [
            {
                  "id": "slot_1",
                  "time": "Wednesday 11:00 AST (13:30 IST)"
            },
            {
                  "id": "slot_2",
                  "time": "Thursday 17:00 AST (19:30 IST)"
            }
      ],
      "confirmedSlotId": "slot_1",
      "pdf1Released": true,
      "patientQuestions": [
            "هل لقاح الحمى الشوكية يوفر الحماية الكافية طوال فترة أخذ علاج الإيكوليزوماب؟",
            "كم من الوقت يستمر العلاج البيولوجي لحماية وظائف الكلى؟"
      ],
      "relayedQuestions": [
            "Meningococcal prophylaxis protocol with C5 inhibition and duration of complement blockade therapy."
      ],
      "reportPdf1": {
            "titleAr": "تقرير الرأي الطبي الثاني المعتمد - أمراض الدم وأمراض الكلى النادرة",
            "titleEn": "Certified Second Opinion Report - Hematology & Rare Renal Diseases",
            "icd10": "D59.3 (Hemolytic-Uremic Syndrome)",
            "summaryAr": "البدء الفوري بمثبطات المتممة C5 (Eculizumab/Ravulizumab) لإنقاذ وظائف الكلى ووقف التخثر المجهري في الأوعية الدموية.",
            "summaryEn": "Immediate targeted C5 complement inhibitor initiation mandated for aHUS to avert irreversible renal failure."
      },
      "reportPdf2": {
            "titleAr": "تقرير الإغلاق السريري - أمراض الكلى وأمراض الدم",
            "titleEn": "Final Clinical Dossier - aHUS Rare Disease Protocol",
            "status": "مغلق ومؤرشف"
      }
}
  },
  {
    id: 'case-010',
    caseNumber: 'ALO-2026-0010',
    patientName: 'منى بنت زياد العلي',
    patientNameAr: 'منى بنت زياد العلي',
    patientNameEn: 'Mona Ziyad Al-Ali',
    nationalIdMasked: '1054****36',
    age: 59,
    gender: 'F',
    city: 'تبوك (Tabuk)',
    specialty: 'تأهيل السكتات والاعتلال العصبي (Neuro-Rehabilitation)',
    diagnosis: 'شلل نصفي أيسر تالٍ لاحتشاء شريان دماغي متوسط (Post-Ischemic Stroke Hemiplegia)',
    symptoms: 'ضعف حركي في الطرفين الأيسرين مع تشنج عضلي وفقدان القدرة على المشي المستقل منذ 3 أشهر.',
    consultationType: 'video',
    currentStage: 'CLOSED',
    treatingDoctor: {
      name: 'د. وليد البلوي',
      hospital: 'مستشفى الملك فهد التخصصي (King Fahad Specialist)',
      city: 'تبوك',
      focusQuestions: [
        'Role of focal Botulinum toxin injections for upper limb flexor spasticity prior to robotic gait training?',
        'Optimal duration and frequency of constraint-induced movement therapy (CIMT)?',
        'ما هي الخطة الإضافية المقترحة للمتابعة والتأهيل السريري لتقليل احتمالات الانتكاس؟'
      ]
    },
    consultant: {
      name: 'Dr. Radhika Menon',
      center: 'Aster Medcity Comprehensive Stroke Center',
      city: 'Kochi, India',
      opinionEnglish: 'Patient shows substantial neuro-plasticity potential. Recommended protocol: 300 units Botox for wrist/finger flexor tone reduction, followed 7 days later by high-intensity CIMT (3h/day for 3 weeks) and body-weight supported treadmill training.'
    },
    pricing: {
      tier: 2,
      tierName: 'مرئي + رأي مكتوب (Tier 2)',
      baseSar: 130.43,
      vatPercent: 15,
      vatSar: 19.57,
      totalSar: 150,
      paid: true,
      invoiceNumber: 'INV-2026-0391',
      tapChargeId: 'chg_tap_ksa_test_89214',
      tabbyInstallmentSar: 37.5
    },
    files: [
      { id: 'f18', name: 'Brain_Diffusion_MRI_Subacute_Stroke.dcm', type: 'dicom', size: '78 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'Lipid Profile + HbA1c + Homocysteine', status: 'completed' },
      pharmacy: { meds: ['Baclofen 10mg', 'Aspirin 81mg', 'Atorvastatin 80mg'], substituteAllowed: true, status: 'ready' },
      homeNurse: { area: 'تبوك - حي المروج', visits: 8, status: 'completed' },
      physio: { sessions: 24, status: 'completed' }
    },
    consultantOpinion: "Seropositive, erosive Rheumatoid Arthritis refractory to Methotrexate and first-line anti-TNF (Adalimumab). Given persistent high disease activity (DAS28-CRP 5.6) and rapid radiographic progression, switching to an IL-6 receptor antagonist (Tocilizumab) or T-cell costimulation modulator (Abatacept) is strongly recommended with monthly acute phase reactant audits.",
    proposedCallSlot: "Fri 15:00 AST / 17:30 IST",
    finalClosureNote: "DAS28-CRP decreased to 2.4 (Clinical Remission) at 12 weeks of Tocilizumab therapy. Morning stiffness completely resolved.",
    coordinatorQuestions: "Focus: IL-6 receptor inhibitor (Tocilizumab) vs JAK inhibitor switch in seropositive refractory RA.",
    metadata: {
      "proposedSlots": [
            {
                  "id": "slot_1",
                  "time": "Friday 15:00 AST (17:30 IST)"
            },
            {
                  "id": "slot_2",
                  "time": "Saturday 11:00 AST (13:30 IST)"
            }
      ],
      "confirmedSlotId": "slot_1",
      "pdf1Released": true,
      "patientQuestions": [
            "متى يبدأ التحسن الفعلي في آلام وتورم مفاصل اليدين مع العلاج الجديد؟",
            "هل يمكن تقليل جرعة الكورتيزون (البريدنيزولون) تدريجياً بعد بدء الحقن الشهرية؟"
      ],
      "relayedQuestions": [
            "Steroid tapering protocol and expected timeline for joint swelling reduction under IL-6 blockade."
      ],
      "reportPdf1": {
            "titleAr": "تقرير الرأي الطبي الثاني المعتمد - أمراض المفاصل والروماتيزم المناعي",
            "titleEn": "Certified Second Opinion Report - Rheumatology & Autoimmune Diseases",
            "icd10": "M05.79 (Rheumatoid Arthritis with Rheumatoid Factor)",
            "summaryAr": "التوصية بالتحويل إلى مضادات مستقبلات الإنترلوكين-6 (Tocilizumab) مع خطة تخفيض تدريجي للكورتيزون لحماية المفاصل من التآكل.",
            "summaryEn": "Switching to IL-6 receptor antagonist (Tocilizumab) indicated for refractory erosive seropositive RA."
      },
      "reportPdf2": {
            "titleAr": "تقرير المتابعة وأرشيف أمراض الروماتيزم",
            "titleEn": "Final Rheumatology Dossier & Case Archive",
            "status": "مغلق ومعتمد"
      }
}
  }
];
