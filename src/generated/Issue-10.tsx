import React, { useCallback, useEffect, useId, useMemo, useReducer, useState } from 'react';

export type Locale = 'en' | 'ar';

export type PersonaId =
  | 'super_admin'
  | 'clinical_admin'
  | 'doctor'
  | 'nurse'
  | 'pharmacist'
  | 'lab_admin'
  | 'receptionist'
  | 'billing'
  | 'patient'
  | 'it_admin'
  | 'quality';

export interface Persona {
  id: PersonaId;
  labelEn: string;
  labelAr: string;
}

export type CatalogKey =
  | 'doctors'
  | 'specialties'
  | 'labTests'
  | 'medications'
  | 'hospitalPartners';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'email'
  | 'tel'
  | 'url';

export interface FieldOption {
  value: string;
  labelEn: string;
  labelAr: string;
}

export interface CatalogField {
  name: string;
  labelEn: string;
  labelAr: string;
  type: FieldType;
  required?: boolean;
  table?: boolean;
  options?: FieldOption[];
  sourceCatalog?: CatalogKey;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string | number | boolean;
  placeholderEn?: string;
  placeholderAr?: string;
  helperEn?: string;
  helperAr?: string;
}

export interface CatalogConfig {
  key: CatalogKey;
  titleEn: string;
  titleAr: string;
  singularEn: string;
  singularAr: string;
  descriptionEn: string;
  descriptionAr: string;
  fields: CatalogField[];
}

export interface CatalogRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  [fieldName: string]: unknown;
}

export type CatalogData = Record<CatalogKey, CatalogRecord[]>;

type FormValues = Record<string, string | boolean>;

interface StatusState {
  tone: 'success' | 'error' | 'info';
  message: string;
}

interface DeletedBackup {
  catalog: CatalogKey;
  record: CatalogRecord;
  index: number;
}

const STORAGE_KEY = 'alo-doctor-v2.4-admin-dynamic-catalogs';

const PERSONAS: Persona[] = [
  { id: 'super_admin', labelEn: 'Super Admin', labelAr: 'المشرف العام' },
  { id: 'clinical_admin', labelEn: 'Clinical Admin', labelAr: 'الإدارة السريرية' },
  { id: 'doctor', labelEn: 'Doctor', labelAr: 'طبيب' },
  { id: 'nurse', labelEn: 'Nurse', labelAr: 'تمريض' },
  { id: 'pharmacist', labelEn: 'Pharmacist', labelAr: 'صيدلي' },
  { id: 'lab_admin', labelEn: 'Lab Admin', labelAr: 'إدارة المختبر' },
  { id: 'receptionist', labelEn: 'Receptionist', labelAr: 'موظف استقبال' },
  { id: 'billing', labelEn: 'Billing', labelAr: 'الفوترة' },
  { id: 'patient', labelEn: 'Patient', labelAr: 'مريض' },
  { id: 'it_admin', labelEn: 'IT Admin', labelAr: 'إدارة تقنية المعلومات' },
  { id: 'quality', labelEn: 'Quality Office', labelAr: 'مكتب الجودة' },
];

const STATUS_OPTIONS: FieldOption[] = [
  { value: 'active', labelEn: 'Active', labelAr: 'نشط' },
  { value: 'inactive', labelEn: 'Inactive', labelAr: 'غير نشط' },
];

const LAB_CATEGORY_OPTIONS: FieldOption[] = [
  { value: 'hematology', labelEn: 'Hematology', labelAr: 'أمراض الدم' },
  { value: 'biochemistry', labelEn: 'Biochemistry', labelAr: 'الكيمياء الحيوية' },
  { value: 'microbiology', labelEn: 'Microbiology', labelAr: 'الميكروبيولوجي' },
  { value: 'urine', labelEn: 'Urine', labelAr: 'البول' },
  { value: 'radiology', labelEn: 'Radiology', labelAr: 'الأشعة' },
  { value: 'genetics', labelEn: 'Genetics', labelAr: 'الوراثة' },
];

const MEDICATION_FORM_OPTIONS: FieldOption[] = [
  { value: 'tablet', labelEn: 'Tablet', labelAr: 'قرص' },
  { value: 'capsule', labelEn: 'Capsule', labelAr: 'كبسولة' },
  { value: 'syrup', labelEn: 'Syrup', labelAr: 'شراب' },
  { value: 'injection', labelEn: 'Injection', labelAr: 'حقنة' },
  { value: 'cream', labelEn: 'Cream', labelAr: 'كريم' },
  { value: 'drops', labelEn: 'Drops', labelAr: 'قطرة' },
  { value: 'inhaler', labelEn: 'Inhaler', labelAr: 'بخاخ' },
];

const MEDICATION_ROUTE_OPTIONS: FieldOption[] = [
  { value: 'oral', labelEn: 'Oral', labelAr: 'فموي' },
  { value: 'iv', labelEn: 'IV', labelAr: 'وريدي' },
  { value: 'im', labelEn: 'IM', labelAr: 'عضلي' },
  { value: 'topical', labelEn: 'Topical', labelAr: 'موضعي' },
  { value: 'inhalation', labelEn: 'Inhalation', labelAr: 'استنشاق' },
  { value: 'ophthalmic', labelEn: 'Ophthalmic', labelAr: 'عيون' },
];

const MEDICATION_CATEGORY_OPTIONS: FieldOption[] = [
  { value: 'antibiotic', labelEn: 'Antibiotic', labelAr: 'مضاد حيوي' },
  { value: 'analgesic', labelEn: 'Analgesic', labelAr: 'مسكن' },
  { value: 'antihistamine', labelEn: 'Antihistamine', labelAr: 'مضاد هيستامين' },
  { value: 'chronic', labelEn: 'Chronic Care', labelAr: 'أمراض مزمنة' },
  { value: 'vaccine', labelEn: 'Vaccine', labelAr: 'لقاح' },
  { value: 'supplement', labelEn: 'Supplement', labelAr: 'مكمل غذائي' },
];

const PARTNER_TYPE_OPTIONS: FieldOption[] = [
  { value: 'hospital', labelEn: 'Hospital', labelAr: 'مستشفى' },
  { value: 'clinic', labelEn: 'Clinic', labelAr: 'عيادة' },
  { value: 'lab', labelEn: 'Laboratory', labelAr: 'مختبر' },
  { value: 'pharmacy', labelEn: 'Pharmacy', labelAr: 'صيدلية' },
];

const CATALOG_ORDER: CatalogKey[] = [
  'doctors',
  'specialties',
  'labTests',
  'medications',
  'hospitalPartners',
];

const CATALOGS: Record<CatalogKey, CatalogConfig> = {
  doctors: {
    key: 'doctors',
    titleEn: 'Doctors',
    titleAr: 'الأطباء',
    singularEn: 'Doctor',
    singularAr: 'طبيب',
    descriptionEn: 'Manage physician profiles, specialties, licensing, and consultation settings.',
    descriptionAr: 'إدارة ملفات الأطباء والتخصصات والتراخيص وإعدادات الاستشارة.',
    fields: [
      {
        name: 'name_en',
        labelEn: 'Name (English)',
        labelAr: 'الاسم (الإنجليزية)',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'Dr. Sara Al-Harbi',
        placeholderAr: 'د. سارة الحربي',
      },
      {
        name: 'name_ar',
        labelEn: 'Name (Arabic)',
        labelAr: 'الاسم (العربية)',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'د. سارة الحربي',
        placeholderAr: 'د. سارة الحربي',
      },
      {
        name: 'specialtyId',
        labelEn: 'Specialty',
        labelAr: 'التخصص',
        type: 'select',
        required: true,
        table: true,
        sourceCatalog: 'specialties',
      },
      {
        name: 'licenseNumber',
        labelEn: 'License Number',
        labelAr: 'رقم الترخيص',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'MD-10021',
        placeholderAr: 'MD-10021',
      },
      {
        name: 'email',
        labelEn: 'Email',
        labelAr: 'البريد الإلكتروني',
        type: 'email',
        placeholderEn: 'doctor@alodoctor.sa',
        placeholderAr: 'doctor@alodoctor.sa',
      },
      {
        name: 'phone',
        labelEn: 'Phone',
        labelAr: 'الجوال',
        type: 'tel',
        placeholderEn: '+9665xxxxxxxx',
        placeholderAr: '+9665xxxxxxxx',
      },
      {
        name: 'consultationFee',
        labelEn: 'Consultation Fee (SAR)',
        labelAr: 'سعر الاستشارة (ر.س)',
        type: 'number',
        min: 0,
        step: 0.01,
        placeholderEn: '250',
        placeholderAr: '250',
      },
      {
        name: 'status',
        labelEn: 'Status',
        labelAr: 'الحالة',
        type: 'select',
        options: STATUS_OPTIONS,
        required: true,
        defaultValue: 'active',
        table: true,
      },
      {
        name: 'bio_en',
        labelEn: 'Biography (English)',
        labelAr: 'نبذة (الإنجليزية)',
        type: 'textarea',
      },
      {
        name: 'bio_ar',
        labelEn: 'Biography (Arabic)',
        labelAr: 'نبذة (العربية)',
        type: 'textarea',
      },
    ],
  },
  specialties: {
    key: 'specialties',
    titleEn: 'Medical Specialties',
    titleAr: 'التخصصات الطبية',
    singularEn: 'Specialty',
    singularAr: 'تخصص',
    descriptionEn: 'Create and maintain clinical specialties used by doctors and service catalogs.',
    descriptionAr: 'إنشاء وصيانة التخصصات السريرية المستخدمة للأطباء وكتالوجات الخدمات.',
    fields: [
      {
        name: 'name_en',
        labelEn: 'Name (English)',
        labelAr: 'الاسم (الإنجليزية)',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'Cardiology',
        placeholderAr: 'أمراض القلب',
      },
      {
        name: 'name_ar',
        labelEn: 'Name (Arabic)',
        labelAr: 'الاسم (العربية)',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'أمراض القلب',
        placeholderAr: 'أمراض القلب',
      },
      {
        name: 'code',
        labelEn: 'Code',
        labelAr: 'الرمز',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'CARD',
        placeholderAr: 'CARD',
      },
      {
        name: 'description_en',
        labelEn: 'Description (English)',
        labelAr: 'الوصف (الإنجليزية)',
        type: 'textarea',
      },
      {
        name: 'description_ar',
        labelEn: 'Description (Arabic)',
        labelAr: 'الوصف (العربية)',
        type: 'textarea',
      },
      {
        name: 'status',
        labelEn: 'Status',
        labelAr: 'الحالة',
        type: 'select',
        options: STATUS_OPTIONS,
        required: true,
        defaultValue: 'active',
        table: true,
      },
    ],
  },
  labTests: {
    key: 'labTests',
    titleEn: 'Lab Tests',
    titleAr: 'التحاليل المخبرية',
    singularEn: 'Lab Test',
    singularAr: 'تحليل مخبري',
    descriptionEn: 'Maintain laboratory test catalogs, pricing, specimen type, and turnaround time.',
    descriptionAr: 'إدارة كتالوجات التحاليل المخبرية والأسعار ونوع العينة ومدة الإنجاز.',
    fields: [
      {
        name: 'name_en',
        labelEn: 'Name (English)',
        labelAr: 'الاسم (الإنجليزية)',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'Complete Blood Count',
        placeholderAr: 'صورة الدم الكاملة',
      },
      {
        name: 'name_ar',
        labelEn: 'Name (Arabic)',
        labelAr: 'الاسم (العربية)',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'صورة الدم الكاملة',
        placeholderAr: 'صورة الدم الكاملة',
      },
      {
        name: 'code',
        labelEn: 'Code',
        labelAr: 'الرمز',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'CBC',
        placeholderAr: 'CBC',
      },
      {
        name: 'category',
        labelEn: 'Category',
        labelAr: 'الفئة',
        type: 'select',
        options: LAB_CATEGORY_OPTIONS,
        required: true,
        table: true,
      },
      {
        name: 'specimen',
        labelEn: 'Specimen',
        labelAr: 'العينة',
        type: 'text',
        placeholderEn: 'Whole blood',
        placeholderAr: 'دم كامل',
      },
      {
        name: 'turnaroundHours',
        labelEn: 'Turnaround (Hours)',
        labelAr: 'مدة الإنجاز (ساعات)',
        type: 'number',
        min: 0,
        table: true,
      },
      {
        name: 'price',
        labelEn: 'Price (SAR)',
        labelAr: 'السعر (ر.س)',
        type: 'number',
        min: 0,
        step: 0.01,
        table: true,
      },
      {
        name: 'active',
        labelEn: 'Active',
        labelAr: 'مفعل',
        type: 'checkbox',
        defaultValue: true,
        table: true,
      },
      {
        name: 'description_en',
        labelEn: 'Description (English)',
        labelAr: 'الوصف (الإنجليزية)',
        type: 'textarea',
      },
      {
        name: 'description_ar',
        labelEn: 'Description (Arabic)',
        labelAr: 'الوصف (العربية)',
        type: 'textarea',
      },
    ],
  },
  medications: {
    key: 'medications',
    titleEn: 'Formulary',
    titleAr: 'دليل الأدوية',
    singularEn: 'Medication',
    singularAr: 'دواء',
    descriptionEn: 'Manage medications, strengths, routes, pricing, stock, and prescription rules.',
    descriptionAr: 'إدارة الأدوية والتركيزات وطرق الإعطاء والأسعار والمخزون وقواعد الوصفة.',
    fields: [
      {
        name: 'name_en',
        labelEn: 'Name (English)',
        labelAr: 'الاسم (الإنجليزية)',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'Paracetamol',
        placeholderAr: 'باراسيتامول',
      },
      {
        name: 'name_ar',
        labelEn: 'Name (Arabic)',
        labelAr: 'الاسم (العربية)',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'باراسيتامول',
        placeholderAr: 'باراسيتامول',
      },
      {
        name: 'genericName',
        labelEn: 'Generic Name',
        labelAr: 'الاسم العلمي',
        type: 'text',
        table: true,
        placeholderEn: 'Paracetamol',
        placeholderAr: 'Paracetamol',
      },
      {
        name: 'strength',
        labelEn: 'Strength',
        labelAr: 'التركيز',
        type: 'text',
        table: true,
        placeholderEn: '500 mg',
        placeholderAr: '500 ملغ',
      },
      {
        name: 'form',
        labelEn: 'Form',
        labelAr: 'الشكل الدوائي',
        type: 'select',
        options: MEDICATION_FORM_OPTIONS,
        required: true,
        table: true,
      },
      {
        name: 'route',
        labelEn: 'Route',
        labelAr: 'طريقة الإعطاء',
        type: 'select',
        options: MEDICATION_ROUTE_OPTIONS,
      },
      {
        name: 'category',
        labelEn: 'Category',
        labelAr: 'الفئة',
        type: 'select',
        options: MEDICATION_CATEGORY_OPTIONS,
      },
      {
        name: 'unitPrice',
        labelEn: 'Unit Price (SAR)',
        labelAr: 'سعر الوحدة (ر.س)',
        type: 'number',
        min: 0,
        step: 0.01,
        table: true,
      },
      {
        name: 'stockQuantity',
        labelEn: 'Stock Quantity',
        labelAr: 'كمية المخزون',
        type: 'number',
        min: 0,
      },
      {
        name: 'requiresPrescription',
        labelEn: 'Requires Prescription',
        labelAr: 'يتطلب وصفة طبية',
        type: 'checkbox',
        defaultValue: true,
      },
      {
        name: 'active',
        labelEn: 'Active',
        labelAr: 'مفعل',
        type: 'checkbox',
        defaultValue: true,
        table: true,
      },
      {
        name: 'notes_en',
        labelEn: 'Notes (English)',
        labelAr: 'ملاحظات (الإنجليزية)',
        type: 'textarea',
      },
      {
        name: 'notes_ar',
        labelEn: 'Notes (Arabic)',
        labelAr: 'ملاحظات (العربية)',
        type: 'textarea',
      },
    ],
  },
  hospitalPartners: {
    key: 'hospitalPartners',
    titleEn: 'Hospital Partners',
    titleAr: 'شركاء المستشفيات',
    singularEn: 'Hospital Partner',
    singularAr: 'شريك مستشفى',
    descriptionEn: 'Add hospitals, clinics, labs, and pharmacies connected to ALO DOCTOR.',
    descriptionAr: 'إضافة المستشفيات والعيادات والمختبرات والصيدليات المرتبطة بألو دكتور.',
    fields: [
      {
        name: 'name_en',
        labelEn: 'Name (English)',
        labelAr: 'الاسم (الإنجليزية)',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'King Fahad Medical City',
        placeholderAr: 'مدينة الملك فهد الطبية',
      },
      {
        name: 'name_ar',
        labelEn: 'Name (Arabic)',
        labelAr: 'الاسم (العربية)',
        type: 'text',
        required: true,
        table: true,
        placeholderEn: 'مدينة الملك فهد الطبية',
        placeholderAr: 'مدينة الملك فهد الطبية',
      },
      {
        name: 'partnerType',
        labelEn: 'Partner Type',
        labelAr: 'نوع الشريك',
        type: 'select',
        options: PARTNER_TYPE_OPTIONS,
        required: true,
        table: true,
      },
      {
        name: 'city',
        labelEn: 'City',
        labelAr: 'المدينة',
        type: 'text',
        table: true,
        placeholderEn: 'Riyadh',
        placeholderAr: 'الرياض',
      },
      {
        name: 'phone',
        labelEn: 'Phone',
        labelAr: 'الهاتف',
        type: 'tel',
        table: true,
        placeholderEn: '+96611xxxxxxx',
        placeholderAr: '+96611xxxxxxx',
      },
      {
        name: 'email',
        labelEn: 'Email',
        labelAr: 'البريد الإلكتروني',
        type: 'email',
        placeholderEn: 'partner@hospital.sa',
        placeholderAr: 'partner@hospital.sa',
      },
      {
        name: 'address_en',
        labelEn: 'Address (English)',
        labelAr: 'العنوان (الإنجليزية)',
        type: 'textarea',
      },
      {
        name: 'address_ar',
        labelEn: 'Address (Arabic)',
        labelAr: 'العنوان (العربية)',
        type: 'textarea',
      },
      {
        name: 'services_en',
        labelEn: 'Services (English)',
        labelAr: 'الخدمات (الإنجليزية)',
        type: 'textarea',
      },
      {
        name: 'services_ar',
        labelEn: 'Services (Arabic)',
        labelAr: 'الخدمات (العربية)',
        type: 'textarea',
      },
      {
        name: 'active',
        labelEn: 'Active',
        labelAr: 'مفعل',
        type: 'checkbox',
        defaultValue: true,
        table: true,
      },
    ],
  },
};

const seedTimestamp = new Date().toISOString();

const seedData: CatalogData = {
  doctors: [
    {
      id: 'doctor-sara-alharbi',
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
      name_en: 'Dr. Sara Al-Harbi',
      name_ar: 'د. سارة الحربي',
      specialtyId: 'specialty-internal-medicine',
      licenseNumber: 'MD-10021',
      email: 'sara.alharbi@alodoctor.sa',
      phone: '+966501000001',
      consultationFee: 250,
      status: 'active',
      bio_en: 'Consultant internal medicine with focus on diabetes and preventive care.',
      bio_ar: 'استشارية باطنة مع تركيز على السكري والرعاية الوقائية.',
    },
    {
      id: 'doctor-khalid-alqahtani',
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
      name_en: 'Dr. Khalid Al-Qahtani',
      name_ar: 'د. خالد القحطاني',
      specialtyId: 'specialty-cardiology',
      licenseNumber: 'MD-20449',
      email: 'khalid.alqahtani@alodoctor.sa',
      phone: '+966501000002',
      consultationFee: 320,
      status: 'active',
      bio_en: 'Cardiology consultant specializing in non-invasive cardiac imaging.',
      bio_ar: 'استشاري أمراض قلب متخصص في التصوير القلبي غير التداخلي.',
    },
  ],
  specialties: [
    {
      id: 'specialty-internal-medicine',
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
      name_en: 'Internal Medicine',
      name_ar: 'الباطنية',
      code: 'IM',
      description_en: 'Adult medicine, chronic disease management, and preventive care.',
      description_ar: 'طب البالغين وإدارة الأمراض المزمنة والرعاية الوقائية.',
      status: 'active',
    },
    {
      id: 'specialty-cardiology',
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
      name_en: 'Cardiology',
      name_ar: 'أمراض القلب',
      code: 'CARD',
      description_en: 'Diagnosis and management of heart and vascular conditions.',
      description_ar: 'تشخيص وعلاج أمراض القلب والأوعية الدموية.',
      status: 'active',
    },
  ],
  labTests: [
    {
      id: 'lab-complete-blood-count',
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
      name_en: 'Complete Blood Count',
      name_ar: 'صورة الدم الكاملة',
      code: 'CBC',
      category: 'hematology',
      specimen: 'Whole blood',
      turnaroundHours: 2,
      price: 45,
      active: true,
      description_en: 'Measures red cells, white cells, hemoglobin, and platelets.',
      description_ar: 'يقيس خلايا الدم الحمراء والبيضاء والهيموغلوبين والصفائح.',
    },
    {
      id: 'lab-thyroid-stimulating-hormone',
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
      name_en: 'Thyroid Stimulating Hormone',
      name_ar: 'الهرمون المنبه للغدة الدرقية',
      code: 'TSH',
      category: 'biochemistry',
      specimen: 'Serum',
      turnaroundHours: 6,
      price: 65,
      active: true,
      description_en: 'Screens thyroid function.',
      description_ar: 'فحص لوظيفة الغدة الدرقية.',
    },
  ],
  medications: [
    {
      id: 'medication-paracetamol-500',
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
      name_en: 'Paracetamol',
      name_ar: 'باراسيتامول',
      genericName: 'Paracetamol',
      strength: '500 mg',
      form: 'tablet',
      route: 'oral',
      category: 'analgesic',
      unitPrice: 2.5,
      stockQuantity: 500,
      requiresPrescription: false,
      active: true,
      notes_en: 'Common analgesic and antipyretic.',
      notes_ar: 'مسكن وخافض حرارة شائع.',
    },
    {
      id: 'medication-amoxicillin-500',
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
      name_en: 'Amoxicillin',
      name_ar: 'أموكسيسيلين',
      genericName: 'Amoxicillin',
      strength: '500 mg',
      form: 'capsule',
      route: 'oral',
      category: 'antibiotic',
      unitPrice: 8.75,
      stockQuantity: 220,
      requiresPrescription: true,
      active: true,
      notes_en: 'Broad-spectrum penicillin antibiotic.',
      notes_ar: 'مضاد حيوي واسع الطيف من عائلة البنسلين.',
    },
  ],
  hospitalPartners: [
    {
      id: 'partner-king-fahad-medical-city',
      createdAt: seedTimestamp,
      updatedAt: seedTimestamp,
      name_en: 'King Fahad Medical City',
      name_ar: 'مدينة الملك فهد الطبية',
      partnerType: 'hospital',
      city: 'Riyadh',
      phone: '+966114655555',
      email: 'partners@kfmc.sa',
      address_en: 'Riyadh, Saudi Arabia',
      address_ar: 'الرياض، المملكة العربية السعودية',
      services_en: 'Emergency, inpatient, surgery, imaging, laboratories',
      services_ar: 'الطوارئ، التنويم، الجراحة، الأشعة، المختبرات',
      active: true,
    },
  ],
};

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `record-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getRecordLabel(record: CatalogRecord | undefined, locale: Locale): string {
  if (!record) {
    return '';
  }

  const preferredKeys = [`name_${locale}`, `title_${locale}`, `fullName_${locale}`];

  for (const key of preferredKeys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  const fallbackKeys = ['name_en', 'title_en', 'fullName_en', 'name', 'title', 'fullName'];

  for (const key of fallbackKeys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  const firstString = Object.values(record).find(
    (value): value is string => typeof value === 'string' && value.trim().length > 0
  );

  return firstString ?? record.id;
}

function getFieldDir(field: CatalogField, locale: Locale): 'ltr' | 'rtl' {
  if (field.name.endsWith('_ar')) {
    return 'rtl';
  }

  if (field.name.endsWith('_en')) {
    return 'ltr';
  }

  if (field.type === 'email' || field.type === 'tel' || field.type === 'url' || field.type === 'number') {
    return 'ltr';
  }

  return locale === 'ar' ? 'rtl' : 'ltr';
}

function buildEmptyForm(config: CatalogConfig): FormValues {
  const values: FormValues = {};

  for (const field of config.fields) {
    if (field.type === 'checkbox') {
      values[field.name] = Boolean(field.defaultValue ?? false);
    } else {
      values[field.name] = field.defaultValue == null ? '' : String(field.defaultValue);
    }
  }

  return values;
}

function buildFormFromRecord(config: CatalogConfig, record: CatalogRecord): FormValues {
  const values: FormValues = {};

  for (const field of config.fields) {
    const raw = record[field.name];

    if (field.type === 'checkbox') {
      values[field.name] = Boolean(raw);
      continue;
    }

    if (raw == null) {
      values[field.name] = '';
      continue;
    }

    if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') {
      values[field.name] = String(raw);
      continue;
    }

    values[field.name] = '';
  }

  return values;
}

function normalizeValues(config: CatalogConfig, values: FormValues): Record<string, unknown> {
  const output: Record<string, unknown> = {};

  for (const field of config.fields) {
    const raw = values[field.name];

    if (field.type === 'checkbox') {
      output[field.name] = Boolean(raw);
      continue;
    }

    if (field.type === 'number') {
      if (raw === '' || raw == null) {
        output[field.name] = null;
        continue;
      }

      const parsed = Number(raw);
      output[field.name] = Number.isFinite(parsed) ? parsed : null;
      continue;
    }

    output[field.name] = typeof raw === 'string' ? raw.trim() : raw ?? '';
  }

  return output;
}

function validateForm(config: CatalogConfig, values: FormValues, locale: Locale): Record<string, string> {
  const errors: Record<string, string> = {};

  const requiredMessage = locale === 'ar' ? 'هذا الحقل مطلوب' : 'This field is required.';
  const emailMessage = locale === 'ar' ? 'بريد إلكتروني غير صالح' : 'Invalid email address.';
  const numberMessage = locale === 'ar' ? 'رقم غير صالح' : 'Invalid number.';

  for (const field of config.fields) {
    const raw = values[field.name];

    if (field.type === 'checkbox') {
      if (field.required && raw !== true) {
        errors[field.name] = requiredMessage;
      }
      continue;
    }

    const stringValue = typeof raw === 'string' ? raw.trim() : raw == null ? '' : String(raw);

    if (field.required && stringValue === '') {
      errors[field.name] = requiredMessage;
      continue;
    }

    if (field.type === 'email' && stringValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
      errors[field.name] = emailMessage;
    }

    if (field.type === 'number' && stringValue !== '') {
      const parsed = Number(stringValue);

      if (!Number.isFinite(parsed)) {
        errors[field.name] = numberMessage;
        continue;
      }

      if (field.min != null && parsed < field.min) {
        errors[field.name] = locale === 'ar' ? `الحد الأدنى ${field.min}` : `Minimum ${field.min}`;
      }

      if (field.max != null && parsed > field.max) {
        errors[field.name] = locale === 'ar' ? `الحد الأقصى ${field.max}` : `Maximum ${field.max}`;
      }
    }
  }

  return errors;
}

function normalizeCatalogData(candidate?: Partial<CatalogData>): CatalogData {
  const output = {} as CatalogData;

  for (const key of CATALOG_ORDER) {
    const candidateValue = candidate?.[key] as unknown;
    const source = Array.isArray(candidateValue) ? (candidateValue as CatalogRecord[]) : seedData[key];

    output[key] = source
      .filter(
        (item): item is CatalogRecord =>
          Boolean(item && typeof item === 'object' && typeof (item as CatalogRecord).id === 'string')
      )
      .map((item) => {
        const record = item as CatalogRecord;

        return {
          ...record,
          createdAt: typeof record.createdAt === 'string' ? record.createdAt : seedTimestamp,
          updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : seedTimestamp,
        };
      });
  }

  return output;
}

function loadInitialData(): CatalogData {
  if (typeof window === 'undefined') {
    return normalizeCatalogData();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return normalizeCatalogData();
    }

    const parsed = JSON.parse(raw) as Partial<CatalogData>;
    return normalizeCatalogData(parsed);
  } catch {
    return normalizeCatalogData();
  }
}

type CatalogAction =
  | { type: 'add'; catalog: CatalogKey; record: CatalogRecord }
  | { type: 'update'; catalog: CatalogKey; id: string; record: CatalogRecord }
  | { type: 'delete'; catalog: CatalogKey; id: string }
  | { type: 'restore'; catalog: CatalogKey; record: CatalogRecord; index: number };

function catalogsReducer(state: CatalogData, action: CatalogAction): CatalogData {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        [action.catalog]: [...state[action.catalog], action.record],
      };

    case 'update':
      return {
        ...state,
        [action.catalog]: state[action.catalog].map((record) =>
          record.id === action.id ? action.record : record
        ),
      };

    case 'delete':
      return {
        ...state,
        [action.catalog]: state[action.catalog].filter((record) => record.id !== action.id),
      };

    case 'restore': {
      const next = [...state[action.catalog]];
      const safeIndex = Math.max(0, Math.min(action.index, next.length));
      next.splice(safeIndex, 0, action.record);

      return {
        ...state,
        [action.catalog]: next,
      };
    }

    default:
      return state;
  }
}

const UI: Record<Locale, Record<string, string>> = {
  en: {
    appTitle: 'ALO DOCTOR Admin Portal',
    subtitle: 'Dynamic catalogs for doctors, specialties, lab tests, formulary, and hospital partners without code changes.',
    persona: 'Persona',
    catalogs: 'Catalogs',
    search: 'Search records',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save changes',
    cancel: 'Cancel',
    actions: 'Actions',
    noRecords: 'No records found. Add the first record using the form.',
    yes: 'Yes',
    no: 'No',
    added: 'Record added successfully.',
    updated: 'Record updated successfully.',
    deleted: 'Record deleted.',
    restored: 'Record restored.',
    fixErrors: 'Please correct the highlighted fields.',
    skip: 'Skip to main content',
    recordsTable: 'records table',
    undo: 'Undo',
    clear: 'Clear',
    selectOption: 'Select an option',
    mainNavigation: 'Catalog navigation',
    selectedPersona: 'Selected persona',
  },
  ar: {
    appTitle: 'بوابة إدارة ألو دكتور',
    subtitle: 'كتالوجات ديناميكية للأطباء والتخصصات والتحاليل والأدوية وشركاء المستشفيات دون تعديل الكود.',
    persona: 'الملف التشغيلي',
    catalogs: 'الكتالوجات',
    search: 'ابحث في السجلات',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    save: 'حفظ التغييرات',
    cancel: 'إلغاء',
    actions: 'الإجراءات',
    noRecords: 'لا توجد سجلات. أضف أول سجل من النموذج.',
    yes: 'نعم',
    no: 'لا',
    added: 'تمت إضافة السجل بنجاح.',
    updated: 'تم تحديث السجل بنجاح.',
    deleted: 'تم حذف السجل.',
    restored: 'تمت استعادة السجل.',
    fixErrors: 'يرجى تصحيح الحقول المظللة.',
    skip: 'تخطَّ إلى المحتوى الرئيسي',
    recordsTable: 'جدول السجلات',
    undo: 'تراجع',
    clear: 'مسح',
    selectOption: 'اختر خيارًا',
    mainNavigation: 'التنقل بين الكتالوجات',
    selectedPersona: 'الملف المحدد',
  },
};

interface DynamicFieldProps {
  field: CatalogField;
  id: string;
  locale: Locale;
  value: string | boolean | undefined;
  error?: string;
  options: FieldOption[];
  emptyOptionLabel: string;
  onChange: (name: string, value: string | boolean) => void;
}

function DynamicField({ field, id, locale, value, error, options, emptyOptionLabel, onChange }: DynamicFieldProps) {
  const label = locale === 'ar' ? field.labelAr : field.labelEn;
  const placeholder = locale === 'ar' ? field.placeholderAr : field.placeholderEn;
  const helper = locale === 'ar' ? field.helperAr : field.helperEn;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const describedBy =
    [error ? errorId : null, helper ? helperId : null]
      .filter((item): item is string => Boolean(item))
      .join(' ') || undefined;

  if (field.type === 'checkbox') {
    return (
      <div className="ad-field">
        <label className="ad-checkbox" htmlFor={id}>
          <input
            id={id}
            name={field.name}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(field.name, event.target.checked)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          />
          <span>
            {label}
            {field.required ? <span aria-hidden="true"> *</span> : null}
          </span>
        </label>
        {helper ? (
          <p id={helperId} className="ad-hint">
            {helper}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="ad-fieldError">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="ad-field">
        <label className="ad-label" htmlFor={id}>
          {label}
          {field.required ? <span aria-hidden="true"> *</span> : null}
        </label>
        <select
          id={id}
          name={field.name}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(field.name, event.target.value)}
          required={field.required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          <option value="">{emptyOptionLabel}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {locale === 'ar' ? option.labelAr || option.labelEn : option.labelEn || option.labelAr}
            </option>
          ))}
        </select>
        {helper ? (
          <p id={helperId} className="ad-hint">
            {helper}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} className="ad-fieldError">
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  const inputDir = getFieldDir(field, locale);

  return (
    <div className="ad-field">
      <label className="ad-label" htmlFor={id}>
        {label}
        {field.required ? <span aria-hidden="true"> *</span> : null}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          id={id}
          name={field.name}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={placeholder}
          dir={inputDir}
          required={field.required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      ) : (
        <input
          id={id}
          name={field.name}
          type={field.type}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(field.name, event.target.value)}
          placeholder={placeholder}
          dir={inputDir}
          min={field.min}
          max={field.max}
          step={field.step}
          required={field.required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
        />
      )}

      {helper ? (
        <p id={helperId} className="ad-hint">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="ad-fieldError">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

.ad-admin {
  --ad-primary: #007B6E;
  --ad-accent: #00C6AE;
  --ad-surface: #E6FAF7;
  --ad-whatsapp: #25D366;
  --ad-ink: #123B36;
  --ad-muted: #486F69;
  --ad-line: rgba(0, 123, 110, 0.14);
  --ad-danger: #B42318;
  --ad-danger-dark: #8E1C1C;

  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(0, 198, 174, 0.18), transparent 32%),
    radial-gradient(circle at top left, rgba(0, 123, 110, 0.14), transparent 28%),
    var(--ad-surface);
  color: var(--ad-ink);
  font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
  padding: clamp(16px, 3vw, 36px);
}

.ad-admin,
.ad-admin * {
  box-sizing: border-box;
}

.ad-container {
  max-width: 1440px;
  margin: 0 auto;
}

.ad-skip {
  position: absolute;
  inset-inline-start: -9999px;
  background: #ffffff;
  color: var(--ad-primary);
  padding: 12px 16px;
  border-radius: 14px;
  font-weight: 800;
  z-index: 50;
}

.ad-skip:focus-visible {
  inset-inline-start: 18px;
  top: 18px;
  outline: 3px solid rgba(0, 198, 174, 0.5);
}

.ad-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 26px;
}

.ad-brand {
  margin: 0;
  color: var(--ad-primary);
  font-weight: 800;
  letter-spacing: 0.02em;
}

.ad-title {
  margin: 6px 0 0;
  font-size: clamp(30px, 4vw, 46px);
  line-height: 1.15;
}

.ad-subtitle {
  margin: 8px 0 0;
  color: var(--ad-muted);
  max-width: 760px;
}

.ad-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 14px;
}

.ad-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 24px;
  align-items: start;
}

@media (max-width: 1024px) {
  .ad-layout {
    grid-template-columns: 1fr;
  }
}

.ad-nav {
  display: grid;
  gap: 10px;
  position: sticky;
  top: 18px;
}

@media (max-width: 1024px) {
  .ad-nav {
    position: static;
    grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  }
}

.ad-navButton {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.62);
  color: var(--ad-ink);
  border-radius: 18px;
  padding: 14px 16px;
  font: inherit;
  font-weight: 700;
  text-align: start;
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
}

.ad-navButton:hover {
  background: rgba(255, 255, 255, 0.92);
  border-color: var(--ad-line);
}

.ad-navButton[aria-current='page'] {
  background: var(--ad-primary);
  color: #ffffff;
  box-shadow: 0 16px 34px rgba(0, 94, 84, 0.22);
}

.ad-count {
  min-width: 34px;
  text-align: center;
  border-radius: 999px;
  padding: 3px 10px;
  background: rgba(255, 255, 255, 0.22);
  font-size: 0.88em;
}

.ad-main {
  display: grid;
  gap: 24px;
  min-width: 0;
}

.ad-main:focus-visible {
  outline: 3px solid rgba(0, 198, 174, 0.45);
  border-radius: 24px;
}

.ad-panel {
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid var(--ad-line);
  border-radius: 26px;
  box-shadow: 0 18px 50px rgba(0, 70, 62, 0.08);
  padding: 24px;
}

.ad-panelTitle {
  margin: 0;
  font-size: clamp(24px, 3vw, 32px);
}

.ad-panelDescription {
  margin: 8px 0 0;
  color: var(--ad-muted);
}

.ad-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin: 20px 0;
}

.ad-search {
  min-width: min(100%, 360px);
}

.ad-field {
  display: grid;
  gap: 7px;
}

.ad-label {
  font-weight: 700;
}

.ad-field input,
.ad-field select,
.ad-field textarea {
  width: 100%;
  min-height: 48px;
  border: 1.5px solid #B9E9E2;
  border-radius: 15px;
  padding: 12px 14px;
  font: inherit;
  color: inherit;
  background: #ffffff;
}

.ad-field textarea {
  min-height: 104px;
  resize: vertical;
}

.ad-field input:focus-visible,
.ad-field select:focus-visible,
.ad-field textarea:focus-visible,
.ad-button:focus-visible,
.ad-navButton:focus-visible,
.ad-errorLink:focus-visible,
.ad-status button:focus-visible {
  outline: 3px solid rgba(0, 198, 174, 0.48);
  outline-offset: 2px;
}

.ad-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1.5px dashed #B9E9E2;
  border-radius: 15px;
  background: #FBFFFE;
  padding: 13px 14px;
  font-weight: 700;
}

.ad-checkbox input {
  width: 20px;
  height: 20px;
  min-height: auto;
  accent-color: var(--ad-primary);
}

.ad-hint {
  margin: 0;
  color: var(--ad-muted);
  font-size: 0.92rem;
}

.ad-fieldError {
  margin: 0;
  color: var(--ad-danger);
  font-weight: 700;
}

.ad-button {
  border: 0;
  border-radius: 999px;
  padding: 12px 18px;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  background: var(--ad-primary);
  color: #ffffff;
  transition: background 150ms ease, transform 150ms ease;
}

.ad-button:hover {
  background: #00685D;
}

.ad-button:active {
  transform: translateY(1px);
}

.ad-button.secondary {
  background: #ffffff;
  color: var(--ad-primary);
  border: 2px solid var(--ad-primary);
}

.ad-button.ghost {
  background: transparent;
  color: var(--ad-primary);
  border: 2px solid rgba(0, 123, 110, 0.28);
}

.ad-button.danger {
  background: var(--ad-danger);
}

.ad-button.danger:hover {
  background: var(--ad-danger-dark);
}

.ad-button.small {
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 12px;
}

.ad-tableWrap {
  overflow: auto;
  border: 1px solid #D5F2ED;
  border-radius: 20px;
  background: #ffffff;
}

.ad-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 820px;
}

.ad-table th,
.ad-table td {
  padding: 13px 14px;
  border-bottom: 1px solid #DFF6F2;
  text-align: start;
  vertical-align: top;
}

.ad-table th {
  position: sticky;
  top: 0;
  background: #F1FFFC;
  color: var(--ad-primary);
  font-weight: 800;
}

.ad-table tbody tr:hover {
  background: #F8FFFE;
}

.ad-editingRow {
  background: rgba(0, 198, 174, 0.10);
}

.ad-rowActions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  align-items: start;
}

.ad-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.ad-error {
  background: #FFF1F0;
  border: 1px solid #F0B7B7;
  color: var(--ad-danger-dark);
  border-radius: 18px;
  padding: 15px 16px;
  margin-bottom: 18px;
}

.ad-errorSummary {
  margin: 10px 0 0;
  padding-inline-start: 20px;
  display: grid;
  gap: 7px;
}

.ad-errorLink {
  background: transparent;
  border: 0;
  padding: 0;
  margin: 0;
  font: inherit;
  font-weight: 700;
  color: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.ad-status {
  position: fixed;
  bottom: 22px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  max-width: min(92vw, 780px);
  padding: 12px 16px;
  border-radius: 999px;
  color: #ffffff;
  background: #073B36;
  box-shadow: 0 20px 45px rgba(0, 45, 40, 0.28);
  z-index: 60;
}

.ad-status[data-tone='success'] {
  background: #045B4F;
  border: 1px solid rgba(37, 211, 102, 0.55);
}

.ad-status[data-tone='error'] {
  background: var(--ad-danger-dark);
}

.ad-status[data-tone='info'] {
  background: #073B36;
}

.ad-status button {
  border: 1px solid rgba(255, 255, 255, 0.34);
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
  border-radius: 999px;
  padding: 7px 12px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

[dir='rtl'] .ad-status {
  left: auto;
  right: 50%;
  transform: translateX(50%);
}

.ad-visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .ad-admin *,
  .ad-admin *::before,
  .ad-admin *::after {
    transition: none !important;
    animation: none !important;
  }
}
`;

export default function AloDoctorAdminCatalogs() {
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const mainId = `${instanceId}-main`;
  const formHeadingId = `${instanceId}-form-heading`;
  const searchId = `${instanceId}-search`;
  const personaId = `${instanceId}-persona`;

  const [locale, setLocale] = useState<Locale>('ar');
  const [persona, setPersona] = useState<PersonaId>('super_admin');
  const [activeCatalog, setActiveCatalog] = useState<CatalogKey>('doctors');
  const [data, dispatch] = useReducer(catalogsReducer, undefined, loadInitialData);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<FormValues>(() => buildEmptyForm(CATALOGS.doctors));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<StatusState | null>(null);
  const [lastDeleted, setLastDeleted] = useState<DeletedBackup | null>(null);

  const activeConfig = CATALOGS[activeCatalog];
  const activeRecords = data[activeCatalog];

  const t = useCallback((key: string): string => UI[locale][key] ?? key, [locale]);

  const activeTitle = locale === 'ar' ? activeConfig.titleAr : activeConfig.titleEn;
  const activeDescription = locale === 'ar' ? activeConfig.descriptionAr : activeConfig.descriptionEn;
  const activeSingular = locale === 'ar' ? activeConfig.singularAr : activeConfig.singularEn;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Storage may be unavailable in private mode or embedded contexts. The UI remains fully usable in-memory.
    }
  }, [data]);

  useEffect(() => {
    setErrors({});
    setStatus(null);
  }, [locale]);

  const fieldId = useCallback(
    (fieldName: string) => `${instanceId}-${activeCatalog}-${fieldName}`,
    [instanceId, activeCatalog]
  );

  const getOptionsForField = useCallback(
    (field: CatalogField): FieldOption[] => {
      if (field.options) {
        return field.options;
      }

      if (field.sourceCatalog) {
        return data[field.sourceCatalog].map((record) => ({
          value: record.id,
          labelEn: getRecordLabel(record, 'en'),
          labelAr: getRecordLabel(record, 'ar'),
        }));
      }

      return [];
    },
    [data]
  );

  const filteredRecords = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return activeRecords;
    }

    return activeRecords.filter((record) => {
      const haystack: string[] = [record.id];

      for (const field of activeConfig.fields) {
        const value = record[field.name];

        if (value != null && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
          haystack.push(String(value));
        }

        if (field.sourceCatalog && typeof value === 'string') {
          const linked = data[field.sourceCatalog].find((item) => item.id === value);

          if (linked) {
            haystack.push(getRecordLabel(linked, 'en'), getRecordLabel(linked, 'ar'));
          }
        }

        if (field.type === 'select' && field.options && typeof value === 'string') {
          const option = field.options.find((item) => item.value === value);

          if (option) {
            haystack.push(option.labelEn, option.labelAr);
          }
        }
      }

      return haystack.join(' ').toLowerCase().includes(normalizedQuery);
    });
  }, [activeRecords, query, activeConfig.fields, data]);

  const tableColumns = useMemo(() => {
    const flagged = activeConfig.fields.filter((field) => field.table);
    return flagged.length > 0 ? flagged.slice(0, 6) : activeConfig.fields.slice(0, 4);
  }, [activeConfig.fields]);

  const handleFieldChange = useCallback((name: string, value: string | boolean) => {
    setFormValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => {
      if (!previous[name]) {
        return previous;
      }

      const next = { ...previous };
      delete next[name];
      return next;
    });
  }, []);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormValues(buildEmptyForm(activeConfig));
    setErrors({});
  }, [activeConfig]);

  const clearStatus = useCallback(() => {
    setStatus(null);
    setLastDeleted(null);
  }, []);

  const selectCatalog = useCallback(
    (key: CatalogKey) => {
      if (key === activeCatalog) {
        return;
      }

      setActiveCatalog(key);
      setQuery('');
      setEditingId(null);
      setFormValues(buildEmptyForm(CATALOGS[key]));
      setErrors({});
      setStatus(null);
      setLastDeleted(null);
    },
    [activeCatalog]
  );

  const focusFirstField = useCallback(() => {
    const firstFieldName = activeConfig.fields[0]?.name;

    if (!firstFieldName) {
      return;
    }

    window.setTimeout(() => {
      document.getElementById(fieldId(firstFieldName))?.focus();
    }, 0);
  }, [activeConfig.fields, fieldId]);

  const handleNew = useCallback(() => {
    setEditingId(null);
    setFormValues(buildEmptyForm(activeConfig));
    setErrors({});
    setLastDeleted(null);
    setStatus({ tone: 'info', message: `${t('add')} ${activeSingular}` });
    focusFirstField();
  }, [activeConfig, activeSingular, focusFirstField, t]);

  const handleEdit = useCallback(
    (record: CatalogRecord) => {
      setEditingId(record.id);
      setFormValues(buildFormFromRecord(activeConfig, record));
      setErrors({});
      setLastDeleted(null);
      setStatus(null);
      focusFirstField();
    },
    [activeConfig, focusFirstField]
  );

  const handleDelete = useCallback(
    (record: CatalogRecord) => {
      const index = activeRecords.findIndex((item) => item.id === record.id);

      if (index < 0) {
        return;
      }

      dispatch({ type: 'delete', catalog: activeCatalog, id: record.id });
      setLastDeleted({ catalog: activeCatalog, record, index });

      if (editingId === record.id) {
        resetForm();
      }

      setStatus({
        tone: 'info',
        message: `${getRecordLabel(record, locale)} ${t('deleted')}`,
      });
    },
    [activeCatalog, activeRecords, editingId, locale, resetForm, t]
  );

  const undoDelete = useCallback(() => {
    if (!lastDeleted) {
      return;
    }

    dispatch({
      type: 'restore',
      catalog: lastDeleted.catalog,
      record: lastDeleted.record,
      index: lastDeleted.index,
    });

    setLastDeleted(null);
    setStatus({ tone: 'success', message: t('restored') });
  }, [lastDeleted, t]);

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const validation = validateForm(activeConfig, formValues, locale);
      setErrors(validation);

      if (Object.keys(validation).length > 0) {
        setStatus({ tone: 'error', message: t('fixErrors') });
        return;
      }

      const values = normalizeValues(activeConfig, formValues);
      const now = new Date().toISOString();

      if (editingId) {
        const existing = activeRecords.find((record) => record.id === editingId);

        if (existing) {
          const updated: CatalogRecord = {
            ...existing,
            ...values,
            updatedAt: now,
          };

          dispatch({
            type: 'update',
            catalog: activeCatalog,
            id: editingId,
            record: updated,
          });

          setStatus({ tone: 'success', message: t('updated') });
        }
      } else {
        const record: CatalogRecord = {
          ...values,
          id: createId(),
          createdAt: now,
          updatedAt: now,
        };

        dispatch({
          type: 'add',
          catalog: activeCatalog,
          record,
        });

        setStatus({ tone: 'success', message: t('added') });
      }

      setEditingId(null);
      setFormValues(buildEmptyForm(activeConfig));
      setLastDeleted(null);
    },
    [activeCatalog, activeConfig, activeRecords, editingId, formValues, locale, t]
  );

  const renderCellValue = useCallback(
    (record: CatalogRecord, field: CatalogField): string => {
      const value = record[field.name];

      if (field.type === 'checkbox') {
        return value ? t('yes') : t('no');
      }

      if (field.sourceCatalog && typeof value === 'string') {
        const linked = data[field.sourceCatalog].find((item) => item.id === value);
        return linked ? getRecordLabel(linked, locale) : '-';
      }

      if (field.type === 'select' && field.options && value != null) {
        const option = field.options.find((item) => item.value === String(value));

        if (option) {
          return locale === 'ar' ? option.labelAr || option.labelEn : option.labelEn || option.labelAr;
        }
      }

      if (value == null || value === '') {
        return '-';
      }

      if (typeof value === 'number') {
        return String(value);
      }

      if (typeof value === 'boolean') {
        return value ? t('yes') : t('no');
      }

      if (typeof value === 'object') {
        return '-';
      }

      return String(value);
    },
    [data, locale, t]
  );

  const errorFields = activeConfig.fields.filter((field) => errors[field.name]);

  return (
    <section
      className="ad-admin"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      lang={locale}
      data-persona={persona}
      data-catalog={activeCatalog}
      data-issue="AD01-AD03"
    >
      <style>{styles}</style>

      <a className="ad-skip" href={`#${mainId}`}>
        {t('skip')}
      </a>

      <div className="ad-container">
        <header className="ad-header">
          <div>
            <p className="ad-brand">ALO DOCTOR v2.4 Saudi Edition</p>
            <h1 className="ad-title">{t('appTitle')}</h1>
            <p className="ad-subtitle">{t('subtitle')}</p>
          </div>

          <div className="ad-controls">
            <div className="ad-field">
              <label htmlFor={personaId}>{t('persona')}</label>
              <select
                id={personaId}
                value={persona}
                onChange={(event) => setPersona(event.target.value as PersonaId)}
                aria-label={t('selectedPersona')}
              >
                {PERSONAS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {locale === 'ar' ? item.labelAr : item.labelEn}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              className="ad-button secondary"
              onClick={() => setLocale((previous) => (previous === 'ar' ? 'en' : 'ar'))}
              aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            >
              {locale === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </header>

        <div className="ad-layout">
          <nav className="ad-nav" aria-label={t('mainNavigation')}>
            {CATALOG_ORDER.map((key) => {
              const config = CATALOGS[key];
              const label = locale === 'ar' ? config.titleAr : config.titleEn;

              return (
                <button
                  key={key}
                  type="button"
                  className="ad-navButton"
                  aria-current={activeCatalog === key ? 'page' : undefined}
                  onClick={() => selectCatalog(key)}
                >
                  <span>{label}</span>
                  <span className="ad-count">{data[key].length}</span>
                </button>
              );
            })}
          </nav>

          <main id={mainId} className="ad-main" tabIndex={-1}>
            <section className="ad-panel" aria-label={activeTitle}>
              <h2 className="ad-panelTitle">{activeTitle}</h2>
              <p className="ad-panelDescription">{activeDescription}</p>

              <div className="ad-toolbar">
                <div className="ad-field ad-search">
                  <label htmlFor={searchId}>{t('search')}</label>
                  <input
                    id={searchId}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  />
                </div>

                <button type="button" className="ad-button" onClick={handleNew}>
                  {`${t('add')} ${activeSingular}`}
                </button>
              </div>

              <div
                className="ad-tableWrap"
                role="region"
                aria-label={`${activeTitle} ${t('recordsTable')}`}
                tabIndex={0}
              >
                <table className="ad-table">
                  <caption className="ad-visuallyHidden">
                    {`${activeTitle} ${t('recordsTable')}`}
                  </caption>
                  <thead>
                    <tr>
                      {tableColumns.map((field) => (
                        <th key={field.name} scope="col">
                          {locale === 'ar' ? field.labelAr : field.labelEn}
                        </th>
                      ))}
                      <th scope="col">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={tableColumns.length + 1}>{t('noRecords')}</td>
                      </tr>
                    ) : (
                      filteredRecords.map((record) => {
                        const recordLabel = getRecordLabel(record, locale);

                        return (
                          <tr key={record.id} className={editingId === record.id ? 'ad-editingRow' : undefined}>
                            {tableColumns.map((field) => (
                              <td key={field.name}>{renderCellValue(record, field)}</td>
                            ))}
                            <td>
                              <div className="ad-rowActions">
                                <button
                                  type="button"
                                  className="ad-button small secondary"
                                  onClick={() => handleEdit(record)}
                                  aria-label={`${t('edit')} ${recordLabel}`}
                                >
                                  {t('edit')}
                                </button>
                                <button
                                  type="button"
                                  className="ad-button small danger"
                                  onClick={() => handleDelete(record)}
                                  aria-label={`${t('delete')} ${recordLabel}`}
                                >
                                  {t('delete')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="ad-panel" aria-labelledby={formHeadingId}>
              <h3 id={formHeadingId}>
                {editingId ? `${t('edit')} ${activeSingular}` : `${t('add')} ${activeSingular}`}
              </h3>

              {errorFields.length > 0 ? (
                <div className="ad-error" role="alert">
                  <strong>{t('fixErrors')}</strong>
                  <ul className="ad-errorSummary">
                    {errorFields.map((field) => (
                      <li key={field.name}>
                        <button
                          type="button"
                          className="ad-errorLink"
                          onClick={() => document.getElementById(fieldId(field.name))?.focus()}
                        >
                          {(locale === 'ar' ? field.labelAr : field.labelEn)}: {errors[field.name]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <form onSubmit={handleSubmit} noValidate>
                <div className="ad-grid">
                  {activeConfig.fields.map((field) => (
                    <DynamicField
                      key={field.name}
                      field={field}
                      id={fieldId(field.name)}
                      locale={locale}
                      value={formValues[field.name]}
                      error={errors[field.name]}
                      options={getOptionsForField(field)}
                      emptyOptionLabel={t('selectOption')}
                      onChange={handleFieldChange}
                    />
                  ))}
                </div>

                <div className="ad-actions">
                  <button type="submit" className="ad-button">
                    {editingId ? t('save') : t('add')}
                  </button>

                  {editingId ? (
                    <button
                      type="button"
                      className="ad-button ghost"
                      onClick={() => {
                        resetForm();
                        clearStatus();
                      }}
                    >
                      {t('cancel')}
                    </button>
                  ) : null}
                </div>
              </form>
            </section>
          </main>
        </div>
      </div>

      <div
        className={status ? 'ad-status' : 'ad-visuallyHidden'}
        role="status"
        aria-live="polite"
        data-tone={status?.tone}
      >
        {status ? (
          <>
            <span>{status.message}</span>

            {lastDeleted ? (
              <button type="button" onClick={undoDelete}>
                {t('undo')}
              </button>
            ) : null}

            <button type="button" onClick={clearStatus} aria-label={t('clear')}>
              ×
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}