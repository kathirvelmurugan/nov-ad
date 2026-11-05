import React, { useState } from 'react';
import { ClinicalCase } from '../../types';
import {
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Video,
  FileCheck2,
  FlaskConical,
  Pill,
  Building2,
  Activity,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Globe,
  User,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Menu,
  X,
  FileText,
  Lock,
  Award,
  Users,
  FolderHeart,
  ChevronRight,
  ExternalLink,
  PhoneCall,
  Search
} from 'lucide-react';

interface Props {
  activeCase: ClinicalCase;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
  onSelectService: (serviceId: string) => void;
  onOpenMyCases: () => void;
  onOpenNewCaseModal?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onStartCase?: () => void;
}

export interface HealthcareServiceItem {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: React.ElementType;
  badgeAr: string;
  badgeEn: string;
  turnaroundAr: string;
  turnaroundEn: string;
  featuresAr: string[];
  featuresEn: string[];
}

export const HEALTHCARE_SERVICES: HealthcareServiceItem[] = [
  {
    id: 'second-opinion',
    titleAr: 'الرأي الطبي الثاني',
    titleEn: 'Second Medical Opinion',
    descAr: 'احصل على مراجعة شاملة لتقاريرك وفحوصاتك الطبية من استشاريين دوليين معتمدين.',
    descEn: 'Get an expert review of your medical reports and diagnostic scans from accredited international specialists.',
    icon: FileCheck2,
    badgeAr: 'الأكثر طلباً',
    badgeEn: 'Most Popular',
    turnaroundAr: 'خلال 24-48 ساعة',
    turnaroundEn: '24-48 Hours',
    featuresAr: [
      'مراجعة دقيقة لمقاطع الأشعة ونتائج الفحوصات',
      'تقرير طبي معتمد ثنائي اللغة (عربي / إنجليزي)',
      'إشراف طبيب استشاري سعودي معتمد بالمملكة'
    ],
    featuresEn: [
      'Detailed DICOM scan & lab analysis',
      'Certified bilingual report (Arabic & English)',
      'Governed by accredited Saudi treating physician'
    ]
  },
  {
    id: 'video-consultation',
    titleAr: 'الاستشارة المرئية',
    titleEn: 'Video Consultation',
    descAr: 'استشر نخبة الاستشاريين الدوليين مباشرة عبر مكالمة مرئية عالية الدقة وآمنة.',
    descEn: 'Consult with a specialist remotely through an encrypted, high-definition clinical video session.',
    icon: Video,
    badgeAr: 'مباشر وتفاعلي',
    badgeEn: 'Live & Direct',
    turnaroundAr: 'مواعيد مرنة ومجدولة',
    turnaroundEn: 'Scheduled Slots',
    featuresAr: [
      'مكالمة مرئية مشفرة بالكامل (WebRTC آمن)',
      'ترجمة طبية إكلينيكية فورية أثناء الاستشارة',
      'خطة علاجية مكتوبة ورأي طبي نهائي معتمد'
    ],
    featuresEn: [
      'End-to-end encrypted telehealth video',
      'Live Arabic clinical translation during call',
      'Signed treatment roadmap and formal opinion'
    ]
  },
  {
    id: 'lab-tests',
    titleAr: 'الفحوصات المخبرية',
    titleEn: 'Lab Tests',
    descAr: 'احجز باقات الفحوصات والتحاليل الدقيقة مع كبرى المختبرات المعتمدة بالمملكة.',
    descEn: 'Book diagnostic tests and blood panels with trusted, accredited laboratory networks across Saudi Arabia.',
    icon: FlaskConical,
    badgeAr: 'سحب منزلي متاح',
    badgeEn: 'Home Draw Available',
    turnaroundAr: 'نفس اليوم / 24 ساعة',
    turnaroundEn: 'Same Day / 24h',
    featuresAr: [
      'خدمة سحب العينات من المنزل أو زيارة الفرع',
      'ربط مباشر وفوري بالملف الطبي للمريض',
      'مختبرات مرجعية معتمدة (ألفا والبرج وغيرها)'
    ],
    featuresEn: [
      'Convenient home phlebotomy or walk-in',
      'Direct synchronization with patient EHR',
      'Accredited reference lab network (Alpha, etc.)'
    ]
  },
  {
    id: 'pharmacy',
    titleAr: 'الصيدلية والدواء',
    titleEn: 'Pharmacy',
    descAr: 'اصرف أدويتك الموصوفة واحصل على استشارات الصيدلة الإكلينيكية والبدائل المعتمدة.',
    descEn: 'Access prescribed medication, clinical pharmacy support, and generic substitution under Saudi regulations.',
    icon: Pill,
    badgeAr: 'توصيل مبرد وسريع',
    badgeEn: 'Doorstep Delivery',
    turnaroundAr: 'خلال 2-4 ساعات',
    turnaroundEn: '2-4 Hours',
    featuresAr: [
      'صرف الوصفات الطبية الإلكترونية المعتمدة',
      'تدقيق التداخلات الدوائية مع الأدوية الحالية',
      'توفير البدائل الجنيسة المكافئة (Generic Substitution)'
    ],
    featuresEn: [
      'Fulfillment of validated e-prescriptions',
      'Clinical drug-drug interaction screening',
      'Generic substitution per Saudi MOH guidelines'
    ]
  },
  {
    id: 'hospital-services',
    titleAr: 'خدمات المستشفيات',
    titleEn: 'Hospital Services',
    descAr: 'استكشف المستشفيات المرجعية المعتمدة والإجراءات التداخلية والتنويم.',
    descEn: 'Explore partner hospitals and further treatment with leading Saudi medical centers and specialized departments.',
    icon: Building2,
    badgeAr: 'مستشفيات مرجعية',
    badgeEn: 'Tertiary Centers',
    turnaroundAr: 'تنسيق فوري',
    turnaroundEn: 'Priority Referral',
    featuresAr: [
      'إحالة مباشرة لكبرى المستشفيات المعتمدة بالمملكة',
      'تنسيق عمليات القلب، العظام، الأورام، والعمود الفقري',
      'متابعة شاملة للإجراءات التداخلية وقسطرة القلب'
    ],
    featuresEn: [
      'Priority fast-track to top Saudi hospitals',
      'Surgical coordination (Cardiology, Ortho, Oncology)',
      'Continuous post-procedure & inpatient care'
    ]
  },
  {
    id: 'other-services',
    titleAr: 'خدمات الرعاية الصحية الأخرى',
    titleEn: 'Other Healthcare Services',
    descAr: 'التمريض المنزلي، العلاج الطبيعي والتأهيلي، واستشارات ما بعد التدخل الجراحي.',
    descEn: 'Physiotherapy, home nursing, follow-up care and comprehensive rehabilitation support.',
    icon: Activity,
    badgeAr: 'رعاية متكاملة',
    badgeEn: 'Comprehensive Care',
    turnaroundAr: 'حسب الخطة العلاجية',
    turnaroundEn: 'Custom Plan',
    featuresAr: [
      'زيارات تمريض منزلي مرخصة لمتابعة الجروح والعلامات',
      'جلسات علاج طبيعي وتأهيل حركي في المنزل',
      'نافذة متابعة سريرية مستمرة لمدة 21 يوماً'
    ],
    featuresEn: [
      'Licensed in-home nurse visits & vitals checks',
      'Post-operative physical therapy & rehab',
      'Dedicated 21-day direct clinical follow-up'
    ]
  }
];

export const PatientLandingView: React.FC<Props> = ({
  activeCase,
  lang,
  onToggleLang,
  onSelectService,
  onOpenMyCases,
  onOpenNewCaseModal,
  theme = 'light',
  onToggleTheme,
  onStartCase,
}) => {
  const isAr = lang === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('second-opinion');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleServiceClick = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    onSelectService(serviceId);
  };

  const faqItems = [
    {
      qAr: 'ما هو الرأي الطبي الثاني ومتى أحتاجه؟',
      qEn: 'What is a second medical opinion and when do I need one?',
      aAr: 'الرأي الطبي الثاني هو تقييم سريري مستقل وشامل لتشخيصك وخطة علاجك من قبل استشاري عالمي متخصص ومستقل. تحتاجه عند تلقي تشخيص لمرض معقد، أو عندما يوصى بإجراء عملية جراحية كبرى، أو في حال عدم استجابة الأعراض للعلاج الحالي.',
      aEn: 'A second medical opinion is an independent, thorough review of your medical diagnosis and proposed treatment plan by an international senior specialist. It is recommended for complex diagnoses, before undergoing major surgery, or when current treatments are not yielding improvement.'
    },
    {
      qAr: 'كيف تضمن منصة ألو دكتور سرية بياناتي الطبية؟',
      qEn: 'How does ALO DOCTOR ensure the confidentiality of my medical records?',
      aAr: 'تلتزم المنصة بأعلى معايير الأمن السيبراني ونظام حماية البيانات الشخصية والبيانات الصحية في المملكة العربية السعودية (SDAIA & MOH). نقوم بحجب البيانات التعريفية الشخصية (PII Masking) وتشفير كافة المرفقات والأشعة ثلاثية الأبعاد (DICOM) قبل مشاركتها مع الاستشاري.',
      aEn: 'ALO DOCTOR strictly complies with Saudi Personal Data Protection Law (SDAIA) and Ministry of Health digital health guidelines. We apply automated PII de-identification and military-grade encryption on all diagnostic files and 3D DICOM scans prior to consultant access.'
    },
    {
      qAr: 'كم يستغرق استلام التقرير الطبي المعتمد؟',
      qEn: 'How long does it take to receive the certified medical report?',
      aAr: 'يستغرق إعداد التقرير الطبي المعتمد ثنائي اللغة ما بين 24 إلى 48 ساعة من اكتمال رفع التقارير وتأكيد الطلب. يشمل التقرير دراسة تفصيلية موقعة من الاستشاري الدولي ومصدقة من الطبيب السعودي المعالج المشرف على الحالة.',
      aEn: 'You will receive your certified bilingual report within 24 to 48 hours following document completion and intake approval. The report includes an in-depth clinical analysis signed by the international consultant and endorsed by your Saudi supervising physician.'
    },
    {
      qAr: 'هل أحتاج للسفر للخارج لتلقي الاستشارة؟',
      qEn: 'Do I need to travel abroad to receive the consultation?',
      aAr: 'لا، تتم جميع الاستشارات والدراسات عن بُعد وأنت في منزلك عبر المنصة، مع إمكانية عقد مكالمة مرئية تفاعلية مباشرة مع الاستشاري بمرافقة مترجم طبي معتمد.',
      aEn: 'No travel is required. The entire second opinion and telehealth consultation takes place securely online from the comfort of your home, with optional live video sessions featuring clinical translation.'
    },
    {
      qAr: 'ما هي خيارات السداد المتاحة؟',
      qEn: 'What payment options are available?',
      aAr: 'نوفر قنوات دفع إلكترونية آمنة ومعتمدة في المملكة، تشمل مدى (Mada)، البطاقات الائتمانية (Visa/Mastercard)، أبل باي (Apple Pay)، وخيارات التقسيط الميسر عبر تابي (Tabby) مع إصدار فاتورة ضريبية رسمية معتمدة من هيئة الزكاة والضريبة والجمارك (ZATCA).',
      aEn: 'We support all accredited Saudi digital payment methods including Mada, Visa, Mastercard, Apple Pay, and installment flexibility via Tabby, backed by ZATCA-compliant official e-invoicing.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 antialiased font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* =========================================================================
          1. HEADER NAVIGATION
      ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scrollToSection('hero')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-teal-900 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-slate-900 font-sans">
                    ALO DOCTOR
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200/80">
                    {isAr ? 'ألو دكتور' : 'KSA'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {isAr ? 'الرأي الطبي الثاني والاستشارات السريرية' : 'Accredited Second Medical Opinion'}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              {isAr ? 'كيف يعمل' : 'How It Works'}
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              {isAr ? 'خدماتنا' : 'Our Services'}
            </button>
            <button
              onClick={() => scrollToSection('network')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              {isAr ? 'شبكتنا الطبية' : 'Our Network'}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-emerald-700 transition-colors cursor-pointer"
            >
              {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
            </button>
          </nav>

          {/* Right Header Utilities: Language Selector + Patient Account */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Universal Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 transition-all cursor-pointer"
              title={isAr ? 'Switch to English' : 'التحويل إلى اللغة العربية'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isAr ? 'English' : 'العربية'}</span>
            </button>

            {/* Login / Patient Account CTA */}
            <button
              onClick={() => setAccountModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAr ? 'حساب المريض' : 'Patient Account'}</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleLang}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold"
              aria-label="Toggle language"
            >
              {isAr ? 'EN' : 'ع'}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Open Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
            <nav className="flex flex-col space-y-2 text-sm font-bold text-slate-700">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-800"
              >
                {isAr ? 'كيف يعمل' : 'How It Works'}
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-800"
              >
                {isAr ? 'خدماتنا' : 'Our Services'}
              </button>
              <button
                onClick={() => scrollToSection('network')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-800"
              >
                {isAr ? 'شبكتنا الطبية' : 'Our Network'}
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-800"
              >
                {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
              </button>
            </nav>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAccountModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white shadow"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span>{isAr ? 'حساب المريض (دخول ومتابعة)' : 'Patient Account / Login'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onToggleLang();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs border border-slate-200 text-slate-700"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'English Interface' : 'التحويل إلى العربية'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION
      ========================================================================= */}
      <section id="hero" className="relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-teal-50/20 to-white py-16 lg:py-24">
        {/* Soft geometric background accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-start">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200/90 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {isAr 
                    ? '🇸🇦 المنصة السعودية للرأي الطبي الثاني والاستشارات الدولية' 
                    : '🇸🇦 Accredited Saudi Second Medical Opinion & Telehealth'}
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
                {isAr ? (
                  <>
                    صحتك. <span className="text-emerald-700">قرارات أفضل.</span>
                  </>
                ) : (
                  <>
                    Your Health. <span className="text-emerald-700">Better Decisions.</span>
                  </>
                )}
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed font-normal">
                {isAr
                  ? 'آراء طبية من نخبة الخبراء، أطباء موثوقون، ورعاية صحية متكاملة — تبدأ جميعها بطلب بسيط.'
                  : 'Expert medical opinions, trusted doctors and healthcare support — all starting with a simple request.'}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onStartCase ? onStartCase : () => scrollToSection('services')}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-teal-900 text-white font-black text-base shadow-lg shadow-emerald-700/25 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
                >
                  <span>{isAr ? 'ابدأ طلبك السريري' : 'Start Your Case'}</span>
                  <ArrowIcon className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => scrollToSection('how-it-works')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-sm border border-slate-200 shadow-xs transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'كيف تعمل المنصة' : 'How It Works'}</span>
                </button>
              </div>

              {/* Key Trust Checkmarks */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-semibold border-t border-slate-200/70">
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'حماية بيانات معتمدة (سدايا)' : 'SDAIA Compliant Privacy'}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'إشراف أطباء سعوديين معتمدين' : 'Saudi Physician Oversight'}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'تقرير موثق خلال 24-48 ساعة' : '24-48h Certified Report'}</span>
                </div>
              </div>
            </div>

            {/* Right Visual Column (5 cols) */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Hero Card Container */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_12px_40px_rgba(15,35,60,0.08)] border border-slate-100 space-y-5">
                  {/* Card Header with Saudi Medical Center Badge */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-sm font-extrabold text-slate-900">
                          {isAr ? 'د. عبدالله الشمري' : 'Dr. Abdullah Al-Shammari'}
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          {isAr ? 'استشاري أمراض القلب · مستشفى رعاية الرياض' : 'Senior Cardiologist · Riyadh Care'}
                        </p>
                      </div>
                    </div>
                    <span className="bg-emerald-100/70 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-300/60">
                      {isAr ? 'طبيب سعودي معتمد' : 'Verified MD'}
                    </span>
                  </div>

                  {/* Active Clinical Sample Preview */}
                  <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-2xl p-4 border border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">
                        {isAr ? 'ملف الاستشارة الطبية المباشرة' : 'Clinical Second Opinion Case'}
                      </span>
                      <span className="font-mono text-emerald-700 font-extrabold text-[11px]">
                        ALO-2026-LIVE
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-400">{isAr ? 'التخصص الطبي:' : 'Specialty:'}</span>
                        <span className="font-bold text-slate-800">
                          {isAr ? 'أمراض القلب وجراحة الصمامات' : 'Cardiology & Valvular Care'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                        <span className="text-slate-400">{isAr ? 'الاستشاري الدولي:' : 'Consultant:'}</span>
                        <span className="font-bold text-slate-800">Dr. Arjun Mehta (KIMS / Apollo)</span>
                      </div>
                      <div className="flex items-center justify-between py-1">
                        <span className="text-slate-400">{isAr ? 'حالة التقرير:' : 'Status:'}</span>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{isAr ? 'جاهز للاعتماد' : 'Ready for Endorsement'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Stamp & Compliance Footer */}
                  <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span>{isAr ? 'تقرير ثنائي اللغة معتمد' : 'Certified Bilingual Report'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400 font-medium font-mono text-[10px]">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>SDAIA / MOH / ZATCA</span>
                    </div>
                  </div>
                </div>

                {/* Floating Micro-Badge */}
                <div className="absolute -bottom-4 -left-4 sm:-bottom-5 sm:-left-5 bg-white rounded-2xl p-3.5 shadow-lg border border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">
                      {isAr ? '99.4% نسبة الدقة والتوافق' : '99.4% Diagnostic Concordance'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {isAr ? 'مستندة لمعايير الجودة العالمية' : 'Benchmarked by Top Centers'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. HEALTHCARE SERVICE SELECTION (Primary Functional Hub)
      ========================================================================= */}
      <section id="services" className="py-20 bg-slate-50/60 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full inline-block">
              {isAr ? 'الخدمات السريرية المعتمدة' : 'Accredited Clinical Services'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isAr ? 'اختر الخدمة الصحية' : 'Choose a Healthcare Service'}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              {isAr
                ? 'حدد الخدمة التي تحتاجها للبدء في طلبك الطبي، وسنقوم بتوجيهك للنموذج السريري المخصص لها.'
                : 'Select the service you need to get started with your medical request, connecting directly into our specialized clinical intake flow.'}
            </p>
          </div>

          {/* Six Healthcare Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {HEALTHCARE_SERVICES.map((service) => {
              const IconComp = service.icon;
              const isSelected = selectedServiceId === service.id;

              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceClick(service.id)}
                  className={`group relative bg-white rounded-3xl p-6 sm:p-7 border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-700/10 -translate-y-1'
                      : 'border-slate-200/90 hover:border-emerald-400 hover:shadow-lg hover:-translate-y-1'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/70">
                        {isAr ? service.badgeAr : service.badgeEn}
                      </span>
                    </div>

                    {/* Service Title */}
                    <div>
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {isAr ? service.titleAr : service.titleEn}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {isAr ? service.descAr : service.descEn}
                      </p>
                    </div>

                    {/* Turnaround Time Indicator */}
                    <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50/70 px-3 py-1.5 rounded-xl border border-emerald-200/60">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{isAr ? service.turnaroundAr : service.turnaroundEn}</span>
                    </div>

                    {/* Key Highlights Bullet List */}
                    <ul className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                      {(isAr ? service.featuresAr : service.featuresEn).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card Bottom CTA Button */}
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleServiceClick(service.id);
                      }}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-50 hover:bg-emerald-600 text-slate-800 hover:text-white border border-slate-200/80 hover:border-emerald-600'
                      }`}
                    >
                      <span>
                        {isAr ? `اختيار ${service.titleAr}` : `Select ${service.titleEn}`}
                      </span>
                      <ArrowIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fast-Track Guidance Note */}
          <div className="mt-12 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {isAr ? 'لست متأكداً من الخدمة المناسبة لحالتك؟' : 'Unsure which service best fits your condition?'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isAr 
                    ? 'فريق التمريض السريري لدينا متواجد لمساعدتك في توجيه ملفك لأفضل مسار ملائم.'
                    : 'Our clinical triage nursing team is available to guide your records to the optimal clinical path.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleServiceClick('second-opinion')}
              className="text-xs font-black text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-4 py-2.5 rounded-xl border border-emerald-200 transition-colors shrink-0 cursor-pointer"
            >
              {isAr ? 'البدء بالاستشارة الشاملة ←' : 'Start Comprehensive Intake →'}
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HOW IT WORKS SECTION (Visual 4-Step Timeline)
      ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full inline-block">
              {isAr ? 'بساطة وأمان' : 'Streamlined & Secure'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isAr ? 'كيف تعمل منصة ألو دكتور' : 'How ALO DOCTOR Works'}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              {isAr
                ? 'أربع خطوات متكاملة تبدأ بطلبك وتنتهي باستلام تقرير استشاري معتمد مع رعاية ومتابعة مستمرة.'
                : 'A seamless 4-step clinical pathway ensuring verified diagnosis, expert review, and continuous support.'}
            </p>
          </div>

          {/* Desktop Timeline (Horizontal with connectors) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 hover:border-emerald-300 transition-all space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/30">
                  1
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                  STEP 01
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isAr ? '1. اختيار الخدمة' : '1. Choose a Service'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'حدد الخدمة الطبية التي تحتاجها سواءً كانت رأياً ثانياً مكتوباً، استشارة فيديو، أو فحوصات مخبرية.'
                  : 'Select the healthcare service you require, from written second opinion to video consultation or labs.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 hover:border-emerald-300 transition-all space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/30">
                  2
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                  STEP 02
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isAr ? '2. تعبئة النموذج ورفع التقارير' : '2. Fill Intake Form'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'شارك تفاصيل الأعراض وارفع مقاطع الأشعة والفحوصات، مع تطبيق حجب الهوية الآلي لحماية خصوصيتك.'
                  : 'Share symptoms, previous diagnosis, and upload diagnostic imaging with automated PII masking.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 hover:border-emerald-300 transition-all space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/30">
                  3
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                  STEP 03
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isAr ? '3. مراجعة الاستشاريين' : '3. Expert Review'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'يتولى التمريض فرز الملف، ويشرف طبيبك السعودي على صياغة الأسئلة التخصصية للمستشار الدولي.'
                  : 'ALO triage nurses audit the file, and your Saudi physician frames targeted clinical questions for the consultant.'}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200/70 hover:border-emerald-300 transition-all space-y-4 relative">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-2xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-emerald-600/30">
                  4
                </span>
                <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                  STEP 04
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                {isAr ? '4. استلام الرأي والدعم' : '4. Get Support'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isAr
                  ? 'استلم تقريرك الطبي المعتمد ثنائي اللغة، مع جلسة مرئية ومتابعة سريرية مستمرة لمدة 21 يوماً.'
                  : 'Receive your endorsed bilingual report, optional live telehealth session, and 21-day follow-up.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. OUR NETWORK SECTION
      ========================================================================= */}
      <section id="network" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3.5 py-1.5 rounded-full inline-block">
              {isAr ? 'شراكات رعاية معتمدة' : 'Accredited Healthcare Network'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {isAr ? 'شبكتنا الطبية في المملكة وحول العالم' : 'Our Healthcare & Hospital Network'}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {isAr
                ? 'نربط المرضى في المملكة العربية السعودية بأعرق المستشفيات المرجعية المحلية والمراكز الاستشارية الدولية الرائدة.'
                : 'Connecting patients in Saudi Arabia with leading domestic tertiary hospitals and renowned international centers of excellence.'}
            </p>
          </div>

          {/* Network Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
              <Building2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-slate-100">{isAr ? 'مستشفى رعاية الرياض' : 'Riyadh Care'}</p>
              <p className="text-[10px] text-slate-400 font-mono">Saudi Partner</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
              <Building2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-slate-100">{isAr ? 'سليمان فقيه جدة' : 'Fakeeh Health'}</p>
              <p className="text-[10px] text-slate-400 font-mono">Saudi Partner</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
              <Building2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-slate-100">{isAr ? 'مستشفى بروكير الخبر' : 'Procare Khobar'}</p>
              <p className="text-[10px] text-slate-400 font-mono">Saudi Partner</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
              <Award className="w-6 h-6 text-teal-400 mx-auto" />
              <p className="text-xs font-bold text-slate-100">Apollo Hospitals</p>
              <p className="text-[10px] text-slate-400 font-mono">Chennai / Hyderabad</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
              <Award className="w-6 h-6 text-teal-400 mx-auto" />
              <p className="text-xs font-bold text-slate-100">Fortis Memorial</p>
              <p className="text-[10px] text-slate-400 font-mono">Gurugram / Delhi</p>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/70 p-4 rounded-2xl text-center space-y-1.5 hover:border-emerald-500 transition-colors">
              <FlaskConical className="w-6 h-6 text-sky-400 mx-auto" />
              <p className="text-xs font-bold text-slate-100">{isAr ? 'مختبرات ألفا والبرج' : 'Alpha & Al-Borg'}</p>
              <p className="text-[10px] text-slate-400 font-mono">Diagnostic Labs</p>
            </div>
          </div>

          {/* Regulatory Accreditation Strip */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 flex flex-wrap items-center justify-around gap-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SDAIA Personal Data Protection Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Saudi Ministry of Health Telehealth Protocols</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>ZATCA Phase 2 E-Invoicing Integration</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. PATIENT ACCOUNT / HEALTHCARE MANAGEMENT SECTION
      ========================================================================= */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full inline-block">
              {isAr ? 'منصة المريض الرقمية' : 'Digital Patient Portal'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isAr ? 'إدارة رعايتك الصحية في مكان واحد' : 'Manage Your Healthcare in One Place'}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              {isAr
                ? 'تتبع طلباتك، استعرض تقاريرك الطبية، أدر مواعيدك وأكثر عبر ملفك السريري الشخصي.'
                : 'Track your requests, access certified reports, manage telehealth appointments, and coordinate family care.'}
            </p>
          </div>

          {/* 4 Feature Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: My Cases */}
            <div
              onClick={onOpenMyCases}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all space-y-4 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FolderHeart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {isAr ? 'حالاتي الطبية' : 'My Cases'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isAr
                    ? 'متابعة مسار الحالة خطوة بخطوة من الفرز حتى استلام التقرير النهائي.'
                    : 'Track live status across all 9 stages from nurse intake to final closure.'}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <span>{isAr ? 'عرض الحالات النشطة' : 'View Active Cases'}</span>
                <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 2: Appointments */}
            <div
              onClick={() => handleServiceClick('video-consultation')}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all space-y-4 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {isAr ? 'المواعيد والاستشارات' : 'Appointments'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isAr
                    ? 'جدولة وإدارة جلسات الاستشارة المرئية المباشرة مع الاستشاريين الدوليين.'
                    : 'Schedule and manage live video consultations with international consultants.'}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-teal-700">
                <span>{isAr ? 'حجز جلسة مرئية' : 'Book Video Session'}</span>
                <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 3: Medical Records */}
            <div
              onClick={() => handleServiceClick('second-opinion')}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all space-y-4 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-sky-700 transition-colors">
                  {isAr ? 'السجلات والفحوصات' : 'Medical Records'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isAr
                    ? 'تخزين آمن لصور الأشعة ثلاثية الأبعاد (DICOM) والتقارير الطبية المختومة.'
                    : 'Secure cloud repository for diagnostic scans, echo loops, and stamped PDF reports.'}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-sky-700">
                <span>{isAr ? 'رفع ملفات جديدة' : 'Upload Diagnostic Files'}</span>
                <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Feature 4: Family Profiles */}
            <div
              onClick={() => handleServiceClick('second-opinion')}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all space-y-4 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
                  {isAr ? 'الملفات العائلية' : 'Family Profiles'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {isAr
                    ? 'إدارة طلبات الوالدين والأبناء بصفتك وكيلاً شرعياً معتمداً ومخولاً.'
                    : 'Submit and oversee cases for parents and dependents under legal proxy consent.'}
                </p>
              </div>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <span>{isAr ? 'إدارة المرافقين' : 'Manage Caregiver Proxy'}</span>
                <ArrowIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FAQ SECTION
      ========================================================================= */}
      <section id="faq" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Header */}
          <div className="text-center space-y-3">
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full inline-block">
              {isAr ? 'إجابات واضحة' : 'Answers & Clarity'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-base text-slate-600 leading-relaxed font-normal">
              {isAr
                ? 'كل ما تود معرفته عن مسار الرأي الطبي الثاني، سرية البيانات، وخيارات الاستشارة.'
                : 'Key details about the second opinion process, privacy compliance, timelines, and payment options.'}
            </p>
          </div>

          {/* Accordion List */}
          <div className="space-y-3">
            {faqItems.map((item, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div
                  key={index}
                  className="border border-slate-200/90 rounded-2xl overflow-hidden bg-white shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-extrabold text-slate-900 hover:bg-slate-50/80 transition-colors cursor-pointer text-sm sm:text-base"
                  >
                    <span>{isAr ? item.qAr : item.qEn}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-emerald-600 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-emerald-700' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/40">
                      {isAr ? item.aAr : item.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. FOOTER
      ========================================================================= */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-lg font-black text-white tracking-wider">
                    ALO DOCTOR
                  </span>
                  <span className="text-emerald-400 text-xs font-bold block">
                    {isAr ? 'منصة الرأي الطبي الثاني' : 'Saudi Second Medical Opinion'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                {isAr
                  ? 'منصة سعودية رائدة تربط المرضى بنخبة الاستشاريين الدوليين والمستشفيات المرجعية المعتمدة، بإشراف أطباء سعوديين وتوافق كامل مع أنظمة وزارة الصحة وسدايا.'
                  : 'Premier Saudi telehealth network connecting patients with accredited international specialists and leading tertiary hospitals under Saudi physician oversight.'}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
                <span className="bg-slate-900 border border-slate-800 px-2.5 py-1 rounded text-emerald-400 font-bold">
                  🇸🇦 Kingdom of Saudi Arabia
                </span>
                <span className="text-slate-500">·</span>
                <span>v2.4 Accredited Edition</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {isAr ? 'روابط سريعة' : 'Quick Navigation'}
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => scrollToSection('hero')} className="hover:text-emerald-400 transition-colors">
                    {isAr ? 'الرئيسية' : 'Home'}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('services')} className="hover:text-emerald-400 transition-colors">
                    {isAr ? 'الخدمات السريرية' : 'Healthcare Services'}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-400 transition-colors">
                    {isAr ? 'كيف يعمل' : 'How It Works'}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('network')} className="hover:text-emerald-400 transition-colors">
                    {isAr ? 'الشبكة المعتمدة' : 'Accredited Network'}
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="hover:text-emerald-400 transition-colors">
                    {isAr ? 'الأسئلة الشائعة' : 'FAQ'}
                  </button>
                </li>
              </ul>
            </div>

            {/* Regulatory & Emergency Disclaimers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                {isAr ? 'إخلاء المسؤولية الطبية' : 'Clinical Disclaimer'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isAr
                  ? 'منصة ألو دكتور مخصصة للاستشارات الطبية المجدولة والآراء السريرية الثانية وليست مخصصة لحالات الطوارئ المهددة للحياة. في حال الطوارئ، يرجى الاتصال فوراً بالهلال الأحمر السعودي (997).'
                  : 'ALO DOCTOR is designed for elective second opinions and scheduled consultations. For acute medical emergencies, call the Saudi Red Crescent immediately at 997.'}
              </p>
              <div className="pt-2 text-[10px] text-slate-500 font-mono">
                MOH License: #KSA-TELEHEALTH-2026 · SDAIA Compliant
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 ALO DOCTOR. All rights reserved. Kingdom of Saudi Arabia.</p>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="hover:text-slate-300 cursor-pointer">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
              <span>·</span>
              <span className="hover:text-slate-300 cursor-pointer">{isAr ? 'شروط الخدمة' : 'Terms of Service'}</span>
              <span>·</span>
              <span className="hover:text-slate-300 cursor-pointer">{isAr ? 'الدعم والمساعدة' : 'Support'}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          9. PATIENT ACCOUNT QUICK-ACCESS MODAL
      ========================================================================= */}
      {accountModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {isAr ? 'حساب المريض' : 'Patient Account'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isAr ? 'بوابة المرضى المعتمدة · ألو دكتور' : 'Verified Patient Portal'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAccountModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Logged in patient card */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 p-4 rounded-2xl text-white space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-300">
                <span className="font-mono">{activeCase.caseNumber || 'ALO-2026-LIVE'}</span>
                <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-400/30">
                  {isAr ? 'هوية موثقة' : 'Verified ID'}
                </span>
              </div>
              <p className="text-base font-black">
                {isAr
                  ? (activeCase.patientNameAr || activeCase.patientName || 'سالم العامري')
                  : (activeCase.patientNameEn || activeCase.patientName || 'Salem Al-Ameri')}
              </p>
              <p className="text-[11px] text-slate-300">
                {isAr ? 'الهوية الوطنية:' : 'National ID:'} <span className="font-mono text-emerald-300">{activeCase.nationalIdMasked || '1089****10'}</span> · {isAr ? 'المدينة:' : 'City:'} {isAr ? (activeCase.cityAr || 'الرياض') : (activeCase.cityEn || 'Riyadh')}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setAccountModalOpen(false);
                  onOpenMyCases();
                }}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-between transition-colors shadow-sm cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FolderHeart className="w-4 h-4" />
                  <span>{isAr ? 'متابعة حالتي النشطة (Live Tracker)' : 'View My Active Case'}</span>
                </div>
                <ArrowIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setAccountModalOpen(false);
                  if (onStartCase) {
                    onStartCase();
                  } else {
                    scrollToSection('services');
                  }
                }}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'بدء طلب خدمة جديدة' : 'Start a New Service Request'}</span>
                </div>
                <ArrowIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Privacy notice in modal */}
            <p className="text-[10px] text-slate-400 text-center leading-normal">
              {isAr
                ? '🔒 يتم تشفير وحماية بياناتك بالكامل وفقاً لنظام حماية البيانات الشخصية والبيانات الصحية بالمملكة العربية السعودية.'
                : '🔒 Your data is fully encrypted under Saudi Personal Data Protection and MOH Health Information Security regulations.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

