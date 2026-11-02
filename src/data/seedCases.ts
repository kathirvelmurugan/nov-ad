import { ClinicalCase } from '../types';

export const SEED_CASES: ClinicalCase[] = [
  {
    id: 'case-001',
    caseNumber: 'ALO-2026-0001',
    patientName: 'سالم بن عبد العزيز العامري',
    nationalIdMasked: '1089****10',
    age: 58,
    gender: 'M',
    city: 'الرياض (Riyadh)',
    specialty: 'أمراض القلب والشرايين (Cardiology)',
    diagnosis: 'تضيق الصمام الأبهري الشديد والتكلس التاجي (Severe Calcific Aortic Stenosis)',
    symptoms: 'ضيق تنفس تدريجي عند بذل الجهد (NYHA Class III) مع نوبات دوخة وألم ضاغط في الصدر منذ 4 أشهر.',
    consultationType: 'video',
    currentStage: 'INTAKE_RECEIVED',
    treatingDoctor: {
      name: 'د. عبدالله الشمري',
      hospital: 'مستشفى رعاية الرياض (Riyadh Care)',
      city: 'الرياض',
      focusQuestions: [
        'هل توصي بإجراء استبدال الصمام عبر القسطرة (TAVR) أم الجراحة المفتوحة (SAVR) في ضوء درجة التكلس العالية ومعدل الخطورة؟',
        'ما هو البروتوكول الدوائي الموصى به لمضادات التخثر ومثبطات الصفيحات بعد الإجراء؟'
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
      baseSar: 1800,
      vatPercent: 15,
      vatSar: 270,
      totalSar: 2070,
      paid: false,
      invoiceNumber: 'INV-2026-0941'
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
    }
  },
  {
    id: 'case-002',
    caseNumber: 'ALO-2026-0002',
    patientName: 'فاطمة بنت خالد الكعبي',
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
        'Optimal timing for antiplatelet therapy discontinuation prior to intervention?'
      ]
    },
    consultant: {
      name: 'Dr. Suresh Rao',
      center: 'Apollo Hospitals',
      city: 'Chennai, India'
    },
    pricing: { baseSar: 1800, vatPercent: 15, vatSar: 270, totalSar: 2070, paid: false },
    files: [
      { id: 'f4', name: 'Coronary_Angio_Report.pdf', type: 'pdf', size: '3.1 MB', verified: true, url: '#' },
      { id: 'f5', name: 'Cath_Lab_Runs.mp4', type: 'mp4', size: '42.0 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'High-Sensitivity Troponin I + HbA1c', status: 'pending' },
      pharmacy: { meds: ['Clopidogrel 75mg', 'Rosuvastatin 20mg'], substituteAllowed: true, status: 'pending' },
      homeNurse: { area: 'جدة - حي الشاطئ (Jeddah Corniche)', visits: 2, status: 'scheduled' },
      physio: { sessions: 6, status: 'planned' }
    }
  },
  {
    id: 'case-003',
    caseNumber: 'ALO-2026-0003',
    patientName: 'طارق بن مسفر المطيري',
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
        'Risk assessment of secondary rupture during conservative observation window?'
      ]
    },
    consultant: {
      name: 'Dr. Rajesh Deshmukh',
      center: 'Fortis Memorial Research Institute',
      city: 'Delhi, India'
    },
    pricing: { baseSar: 1500, vatPercent: 15, vatSar: 225, totalSar: 1725, paid: false },
    files: [
      { id: 'f6', name: 'Brain_MRA_3D.dcm', type: 'dicom', size: '120 MB', verified: true, url: '#' },
      { id: 'f7', name: 'Neuro_Consultation_Note.pdf', type: 'pdf', size: '1.8 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'CBC + Coagulation Panel', status: 'pending' },
      pharmacy: { meds: ['Nimodipine 60mg', 'Levetiracetam 500mg'], substituteAllowed: false, status: 'pending' },
      homeNurse: { area: 'الدمام - حي الشاطئ', visits: 1, status: 'scheduled' },
      physio: { sessions: 0, status: 'planned' }
    }
  },
  {
    id: 'case-004',
    caseNumber: 'ALO-2026-0004',
    patientName: 'ريم بنت حسن الحارثي',
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
        'Relevance of responsive neurostimulation (RNS) given non-dominant hemisphere seizure onset?'
      ]
    },
    consultant: {
      name: 'Dr. Alok Sharma',
      center: 'NIMHANS / Manipal',
      city: 'Bangalore, India'
    },
    pricing: { baseSar: 1800, vatPercent: 15, vatSar: 270, totalSar: 2070, paid: false },
    files: [
      { id: 'f8', name: 'Video_EEG_Monitoring_72h.pdf', type: 'pdf', size: '5.6 MB', verified: true, url: '#' },
      { id: 'f9', name: 'Epilepsy_Protocol_Brain_MRI.dcm', type: 'dicom', size: '95 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'Serum Lamotrigine + Valproate Trough Levels', status: 'pending' },
      pharmacy: { meds: ['Brivaracetam 50mg', 'Clobazam 10mg'], substituteAllowed: true, status: 'pending' },
      homeNurse: { area: 'المدينة المنورة - حي سلطانة', visits: 2, status: 'scheduled' },
      physio: { sessions: 4, status: 'planned' }
    }
  },
  {
    id: 'case-005',
    caseNumber: 'ALO-2026-0005',
    patientName: 'نوف بنت سليمان السبيعي',
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
        'Recommendation on CDK4/6 inhibitor inclusion in adjuvant setting?'
      ]
    },
    consultant: {
      name: 'Dr. Priya Ramachandran',
      center: 'Tata Memorial / Apollo Cancer Center',
      city: 'Mumbai, India'
    },
    pricing: { baseSar: 1800, vatPercent: 15, vatSar: 270, totalSar: 2070, paid: true, invoiceNumber: 'INV-2026-0812' },
    files: [
      { id: 'f10', name: 'Pathology_Biopsy_IHC.pdf', type: 'pdf', size: '3.4 MB', verified: true, url: '#' },
      { id: 'f11', name: 'Bilateral_Breast_MRI.dcm', type: 'dicom', size: '140 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'Complete Metabolic Panel + CA 15-3 Marker', status: 'pending' },
      pharmacy: { meds: ['Letrozole 2.5mg', 'Zoledronic Acid IV'], substituteAllowed: false, status: 'pending' },
      homeNurse: { area: 'الرياض - حي النخيل', visits: 3, status: 'scheduled' },
      physio: { sessions: 10, status: 'planned' }
    }
  },
  {
    id: 'case-006',
    caseNumber: 'ALO-2026-0006',
    patientName: 'خالد بن بكر البارقي',
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
        'First-line regimen: FOLFOXIRI + Bevacizumab vs FOLFIRI + Panitumumab (RAS wild-type confirmed)?'
      ]
    },
    consultant: {
      name: 'Dr. Vikram Grover',
      center: 'Max Healthcare Institute',
      city: 'Delhi, India',
      opinionEnglish: 'Oligometastatic liver disease in segment IV is resectable with R0 margins. Recommend 4 cycles of induction FOLFOXIRI + Panitumumab, followed by restaging MRI. If stable or response observed, perform staged laparoscopic low anterior resection followed 6 weeks later by segment IV anatomic resection.',
      opinionArabic: 'الانبثاث الكبدي الوحيد في القطعة الرابعة قابل للاستئصال الجراحي التام. نوصي بـ 4 دورات علاج كيميائي حثي متبوعة بإعادة تصوير رنيني، ثم إجراء الاستئصال على مرحلتين لتحقيق أعلى معدلات الشفاء.'
    },
    pricing: { baseSar: 1800, vatPercent: 15, vatSar: 270, totalSar: 2070, paid: true, invoiceNumber: 'INV-2026-0744' },
    files: [
      { id: 'f12', name: 'Abdominal_Pelvic_CT_TriplePhase.dcm', type: 'dicom', size: '210 MB', verified: true, url: '#' },
      { id: 'f13', name: 'Colonoscopy_Biopsy_Report.pdf', type: 'pdf', size: '2.1 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'CEA Tumor Marker + LFTs', status: 'completed' },
      pharmacy: { meds: ['Ondansetron 8mg', 'Aprepitant 125mg'], substituteAllowed: true, status: 'ready' },
      homeNurse: { area: 'أبها - حي الضباب', visits: 4, status: 'dispatched' },
      physio: { sessions: 6, status: 'in_progress' }
    }
  },
  {
    id: 'case-007',
    caseNumber: 'ALO-2026-0007',
    patientName: 'عبدالله بن ناصر الدخيل',
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
        'Bone graft substitute choice for tibial metaphysical defect Anderson Type IIB?'
      ]
    },
    consultant: {
      name: 'Dr. Ashok Rajgopal',
      center: 'Medanta / Hiranandani Hospital',
      city: 'Mumbai, India',
      opinionEnglish: 'Radiographs reveal extensive tibial lucency >2mm indicating aseptic mechanical loosening. Revision using modular rotating hinge prosthesis with porous titanium sleeves and tantalum cones for defect reconstruction is recommended.'
    },
    pricing: { baseSar: 1500, vatPercent: 15, vatSar: 225, totalSar: 1725, paid: true, invoiceNumber: 'INV-2026-0610' },
    files: [
      { id: 'f14', name: 'WeightBearing_Knee_XRay.pdf', type: 'pdf', size: '4.8 MB', verified: true, url: '#' },
      { id: 'f15', name: 'CT_Scan_Left_Knee_MetalSuppressed.dcm', type: 'dicom', size: '88 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'ESR + High-Sensitivity CRP (Infection rule-out)', status: 'completed' },
      pharmacy: { meds: ['Celecoxib 200mg', 'Pregabalin 75mg'], substituteAllowed: true, status: 'ready' },
      homeNurse: { area: 'بريدة - حي الصفراء', visits: 6, status: 'dispatched' },
      physio: { sessions: 12, status: 'in_progress' }
    }
  },
  {
    id: 'case-008',
    caseNumber: 'ALO-2026-0008',
    patientName: 'مشعل بن عادل البوعينين',
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
        'Necessity of intraoperative neuro-monitoring during reduction of grade II slip?'
      ]
    },
    consultant: {
      name: 'Dr. Senthil Nathan',
      center: 'Ganga Orthopaedic Hospital',
      city: 'Coimbatore, India',
      opinionEnglish: 'Grade II slip with severe canal stenosis requires stabilization. Minimally Invasive TLIF with expandable interbody cage provides excellent fusion rates with minimized paraspinal muscle damage.'
    },
    pricing: { baseSar: 1800, vatPercent: 15, vatSar: 270, totalSar: 2070, paid: true, invoiceNumber: 'INV-2026-0504' },
    files: [
      { id: 'f16', name: 'Lumbar_Spine_MRI_T2_Axial_Sag.dcm', type: 'dicom', size: '110 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'Routine Pre-Op Panel', status: 'completed' },
      pharmacy: { meds: ['Tramadol 50mg', 'Paracetamol 1000mg'], substituteAllowed: false, status: 'ready' },
      homeNurse: { area: 'الخبر - حي الحزام الذهبي', visits: 4, status: 'completed' },
      physio: { sessions: 8, status: 'completed' }
    }
  },
  {
    id: 'case-009',
    caseNumber: 'ALO-2026-0009',
    patientName: 'زياد بن سامي القرشي (طفل)',
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
        'Reversibility of pulmonary vascular resistance index (PVRI) based on catheterization data?'
      ]
    },
    consultant: {
      name: 'Dr. Devanand',
      center: 'Narayana Institute of Cardiac Sciences',
      city: 'Bangalore, India'
    },
    pricing: { baseSar: 1800, vatPercent: 15, vatSar: 270, totalSar: 2070, paid: false },
    files: [
      { id: 'f17', name: 'Pediatric_Echo_Doppler_Series.mp4', type: 'mp4', size: '35 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'Arterial Blood Gas + Iron Studies', status: 'pending' },
      pharmacy: { meds: ['Furosemide oral sol', 'Spironolactone'], substituteAllowed: true, status: 'pending' },
      homeNurse: { area: 'الطائف - حي الشفا', visits: 3, status: 'scheduled' },
      physio: { sessions: 0, status: 'planned' }
    }
  },
  {
    id: 'case-010',
    caseNumber: 'ALO-2026-0010',
    patientName: 'منى بنت زياد العلي',
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
        'Optimal duration and frequency of constraint-induced movement therapy (CIMT)?'
      ]
    },
    consultant: {
      name: 'Dr. Radhika Menon',
      center: 'Aster Medcity Comprehensive Stroke Center',
      city: 'Kochi, India',
      opinionEnglish: 'Patient shows substantial neuro-plasticity potential. Recommended protocol: 300 units Botox for wrist/finger flexor tone reduction, followed 7 days later by high-intensity CIMT (3h/day for 3 weeks) and body-weight supported treadmill training.'
    },
    pricing: { baseSar: 1800, vatPercent: 15, vatSar: 270, totalSar: 2070, paid: true, invoiceNumber: 'INV-2026-0391' },
    files: [
      { id: 'f18', name: 'Brain_Diffusion_MRI_Subacute_Stroke.dcm', type: 'dicom', size: '78 MB', verified: true, url: '#' }
    ],
    partnerOrders: {
      lab: { test: 'Lipid Profile + HbA1c + Homocysteine', status: 'completed' },
      pharmacy: { meds: ['Baclofen 10mg', 'Aspirin 81mg', 'Atorvastatin 80mg'], substituteAllowed: true, status: 'ready' },
      homeNurse: { area: 'تبوك - حي المروج', visits: 8, status: 'completed' },
      physio: { sessions: 24, status: 'completed' }
    }
  }
];
