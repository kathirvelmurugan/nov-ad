import React, { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import type { PlatformConfig, TierConfig, PaymentRailConfig } from '../../../config/platformConfig';
import { DEFAULT_PLATFORM_CONFIG } from '../../../config/platformConfig';
import { USER_SESSION_KEY } from '../../../hooks/workflowConstants';

/* ── helpers ─────────────────────────────────────────────────────────── */

function getToken(): string {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (!raw) return '';
    const s = JSON.parse(raw);
    return s.token || '';
  } catch { return ''; }
}

function getApiBase(): string {
  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts.length > 0 && !parts[0].includes('.')) return `${window.location.origin}/${parts[0]}`;
  return window.location.origin;
}

function splitVat(total: number, vat: number) {
  const t = Math.round((total || 0) * 100) / 100;
  const b = Math.round((t / (1 + vat / 100)) * 100) / 100;
  return { baseSar: b, vatSar: Math.round((t - b) * 100) / 100, totalSar: t };
}

/* ── component ────────────────────────────────────────────────────────── */

interface Props { isRTL: boolean }

export const SuperAdminSettingsTab: React.FC<Props> = ({ isRTL }) => {
  /* ── state ───── */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [dbVersion, setDbVersion] = useState(1);

  const [draft, setDraft] = useState<PlatformConfig | null>(null);
  const [openSection, setOpenSection] = useState<string>('commercial');
  const [changed, setChanged] = useState(false);

  type Section = 'commercial' | 'catalogue' | 'payments' | 'policy';
  const toggleSection = (s: Section) => setOpenSection(prev => prev === s ? '' : s);

  /* ── fetch full config ───── */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) { setError('Not authenticated'); setLoading(false); return; }
      const res = await fetch(`${getApiBase()}/api/settings`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { setError(`HTTP ${res.status}`); setLoading(false); return; }
      const json = await res.json();
      if (json?.data?.config) {
        setDraft(JSON.parse(JSON.stringify(json.data.config)));
        setDbVersion(json.data.version || 1);
      }
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── update helpers ───── */
  const updateDraft = (fn: (d: PlatformConfig) => void) => {
    if (!draft) return;
    const next = JSON.parse(JSON.stringify(draft));
    fn(next);
    setDraft(next);
    setChanged(true);
  };

  const markChanged = () => { if (!changed) setChanged(true); };

  /* ── save ───── */
  const handleSave = async () => {
    if (!draft) return;
    setSaving(true); setError(''); setSaved(false);
    try {
      const token = getToken();
      const res = await fetch(`${getApiBase()}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ config: draft, version: dbVersion }),
      });
      const json = await res.json();
      if (res.status === 409) {
        setError(`Settings changed elsewhere (v${json.dbVersion}). Reload & try again.`);
        setSaving(false); return;
      }
      if (!res.ok || !json.success) {
        setError(json.error || 'Save failed');
        setSaving(false); return;
      }
      setDbVersion(json.data.version);
      setChanged(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDiscard = () => { load(); setChanged(false); setError(''); };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading settings...</div>;
  if (!draft) return <div className="p-8 text-center text-rose-500">{error || 'Failed to load settings'}</div>;

  const ccy = draft.currency || DEFAULT_PLATFORM_CONFIG.currency;
  const tiers: TierConfig[] = draft.pricing?.tiers || [];
  const rails: PaymentRailConfig[] = draft.payment?.rails || [];
  const services = draft.services || {};
  const policy = draft.policy || DEFAULT_PLATFORM_CONFIG.policy;
  const catalogs = draft.catalogs || DEFAULT_PLATFORM_CONFIG.catalogs;

  return (
    <div className="max-w-4xl mx-auto space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold">
          <CheckCircle2 className="w-4 h-4" /> Settings saved (v{dbVersion})
        </div>
      )}

      {/* ── Commercial ──────────────────────────────────────────────────── */}
      <Section title={isRTL ? 'الإعدادات التجارية' : 'Commercial'} icon="💳" open={openSection === 'commercial'} onToggle={() => toggleSection('commercial')}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label={isRTL ? 'رمز العملة' : 'Currency Code'} value={ccy.code} onChange={v => updateDraft(d => { d.currency.code = v; })} />
          <Field label={isRTL ? 'رمز العملة (عربي)' : 'Symbol (Ar)'} value={ccy.symbolAr || ''} onChange={v => updateDraft(d => { d.currency.symbolAr = v; })} />
          <Field label={isRTL ? 'رمز العملة (إنجليزي)' : 'Symbol (En)'} value={ccy.symbolEn || ''} onChange={v => updateDraft(d => { d.currency.symbolEn = v; })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label={isRTL ? 'نسبة الضريبة (%)' : 'VAT (%)'} type="number" value={String(ccy.vatPercent)} onChange={v => updateDraft(d => { d.currency.vatPercent = Number(v) || 0; })} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!ccy.taxInclusive} onChange={e => updateDraft(d => { d.currency.taxInclusive = e.target.checked; })} className="rounded" />
            <span className="text-sm font-medium text-slate-700">{isRTL ? 'الأسعار شاملة الضريبة' : 'Tax-inclusive pricing'}</span>
          </label>
        </div>
        {/* Tiers table */}
        <div className="mt-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{isRTL ? 'باقات الأسعار' : 'Price Tiers'}</h4>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="text-left bg-slate-50">
                <th className="px-3 py-2 font-bold text-slate-600">{isRTL ? 'المعرف' : 'ID'}</th>
                <th className="px-3 py-2 font-bold text-slate-600">{isRTL ? 'الاسم (عربي)' : 'Name (Ar)'}</th>
                <th className="px-3 py-2 font-bold text-slate-600">{isRTL ? 'الاسم (إنجليزي)' : 'Name (En)'}</th>
                <th className="px-3 py-2 font-bold text-slate-600">{isRTL ? 'الإجمالي (ر.س)' : 'Total (SAR)'}</th>
                <th className="px-3 py-2 font-bold text-slate-600">{isRTL ? 'الأساسي' : 'Base'}</th>
                <th className="px-3 py-2 font-bold text-slate-600">{isRTL ? 'الضريبة' : 'VAT'}</th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t, i) => {
                const { baseSar, vatSar } = splitVat(t.totalSar, ccy.vatPercent);
                return (
                  <tr key={t.id ?? i} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs">{t.id}</td>
                    <td className="px-3 py-2">
                      <input className="w-full border rounded px-2 py-1 text-xs" value={t.tierNameAr || ''} onChange={e => updateDraft(d => { d.pricing.tiers[i].tierNameAr = e.target.value; })} />
                    </td>
                    <td className="px-3 py-2">
                      <input className="w-full border rounded px-2 py-1 text-xs" value={t.tierNameEn || ''} onChange={e => updateDraft(d => { d.pricing.tiers[i].tierNameEn = e.target.value; })} />
                    </td>
                    <td className="px-3 py-2">
                      <input className="w-20 border rounded px-2 py-1 text-xs font-mono" type="number" value={t.totalSar} onChange={e => updateDraft(d => { d.pricing.tiers[i].totalSar = Number(e.target.value) || 0; })} />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{baseSar.toFixed(2)}</td>
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{vatSar.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Installments */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label={isRTL ? 'مزود التقسيط' : 'Installment Provider'} value={draft.pricing?.installmentPlan?.provider || 'tabby'} onChange={v => updateDraft(d => { d.pricing.installmentPlan.provider = v; })} />
          <Field label={isRTL ? 'عدد الأقساط' : 'Installments'} type="number" value={String(draft.pricing?.installmentPlan?.installments || 4)} onChange={v => updateDraft(d => { d.pricing.installmentPlan.installments = Number(v) || 1; })} />
        </div>
      </Section>

      {/* ── Catalogue ────────────────────────────────────────────────────── */}
      <Section title={isRTL ? 'الكتالوج الطبي' : 'Catalogue'} icon="📋" open={openSection === 'catalogue'} onToggle={() => toggleSection('catalogue')}>
        {Object.entries(services).map(([id, svc]) => (
          <div key={id} className="flex flex-wrap items-center gap-3 py-2 border-b border-slate-50">
            <label className="flex items-center gap-1 text-sm min-w-[140px]">
              <input type="checkbox" checked={svc.enabled !== false} onChange={e => updateDraft(d => { d.services[id].enabled = e.target.checked; })} className="rounded" />
              <span className="font-medium text-slate-700 text-xs">{id}</span>
            </label>
            <input className="flex-1 min-w-[120px] border rounded px-2 py-1 text-xs" placeholder={isRTL ? 'العنوان (عربي)' : 'Title (Ar)'} value={svc.titleAr || ''} onChange={e => updateDraft(d => { d.services[id].titleAr = e.target.value; })} />
            <input className="flex-1 min-w-[120px] border rounded px-2 py-1 text-xs" placeholder={isRTL ? 'العنوان (إنجليزي)' : 'Title (En)'} value={svc.titleEn || ''} onChange={e => updateDraft(d => { d.services[id].titleEn = e.target.value; })} />
            <input className="w-24 border rounded px-2 py-1 text-xs" placeholder={isRTL ? 'المهلة' : 'Turnaround'} value={svc.turnaroundAr || ''} onChange={e => updateDraft(d => { d.services[id].turnaroundAr = e.target.value; })} />
            <select className="border rounded px-2 py-1 text-xs" value={svc.priceTierId ?? 0} onChange={e => updateDraft(d => { d.services[id].priceTierId = Number(e.target.value) || null; })}>
              <option value={0}>{isRTL ? 'بدون سعر' : 'No tier'}</option>
              {tiers.map(t => <option key={t.id} value={t.id}>{isRTL ? t.tierNameAr : t.tierNameEn} ({t.totalSar})</option>)}
            </select>
          </div>
        ))}
        {/* Catalogs (specialties/lab/meds) */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <TagList label={isRTL ? 'التخصصات' : 'Specialties'} tags={catalogs.specialties || []} onAdd={v => updateDraft(d => { d.catalogs.specialties = [...(d.catalogs.specialties || []), v]; })} onRemove={v => updateDraft(d => { d.catalogs.specialties = (d.catalogs.specialties || []).filter(x => x !== v); })} />
          <TagList label={isRTL ? 'الفحوصات المخبرية' : 'Lab Tests'} tags={catalogs.labTests || []} onAdd={v => updateDraft(d => { d.catalogs.labTests = [...(d.catalogs.labTests || []), v]; })} onRemove={v => updateDraft(d => { d.catalogs.labTests = (d.catalogs.labTests || []).filter(x => x !== v); })} />
          <TagList label={isRTL ? 'الأدوية' : 'Medications'} tags={catalogs.medications || []} onAdd={v => updateDraft(d => { d.catalogs.medications = [...(d.catalogs.medications || []), v]; })} onRemove={v => updateDraft(d => { d.catalogs.medications = (d.catalogs.medications || []).filter(x => x !== v); })} />
        </div>
      </Section>

      {/* ── Payments ─────────────────────────────────────────────────────── */}
      <Section title={isRTL ? 'طرق الدفع' : 'Payments'} icon="💳" open={openSection === 'payments'} onToggle={() => toggleSection('payments')}>
        {rails.map((r, i) => (
          <div key={r.id ?? i} className="flex flex-wrap items-center gap-3 py-2 border-b border-slate-50">
            <label className="flex items-center gap-1 text-sm min-w-[100px]">
              <input type="checkbox" checked={r.enabled !== false} onChange={e => updateDraft(d => { d.payment.rails[i].enabled = e.target.checked; })} className="rounded" />
              <span className="font-medium text-slate-700 text-xs">{r.id}</span>
            </label>
            <input className="flex-1 min-w-[100px] border rounded px-2 py-1 text-xs" placeholder={isRTL ? 'التسمية (عربي)' : 'Label (Ar)'} value={r.labelAr || ''} onChange={e => updateDraft(d => { d.payment.rails[i].labelAr = e.target.value; })} />
            <input className="flex-1 min-w-[100px] border rounded px-2 py-1 text-xs" placeholder={isRTL ? 'التسمية (إنجليزي)' : 'Label (En)'} value={r.labelEn || ''} onChange={e => updateDraft(d => { d.payment.rails[i].labelEn = e.target.value; })} />
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={!!r.requiresInstallments} onChange={e => updateDraft(d => { d.payment.rails[i].requiresInstallments = e.target.checked; })} className="rounded" /> {isRTL ? 'يتطلب تقسيط' : 'Installments?'}</label>
          </div>
        ))}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label={isRTL ? 'بادئة الفاتورة' : 'Invoice Prefix'} value={draft.pricing?.invoicePrefix || 'INV'} onChange={v => updateDraft(d => { d.pricing.invoicePrefix = v; })} />
          <Field label={isRTL ? 'بادئة الملف' : 'Case Prefix'} value={draft.pricing?.casePrefix || 'ALO'} onChange={v => updateDraft(d => { d.pricing.casePrefix = v; })} />
        </div>
      </Section>

      {/* ── Clinical policy ───────────────────────────────────────────────── */}
      <Section title={isRTL ? 'السياسات السريرية' : 'Clinical Policy'} icon="🩺" open={openSection === 'policy'} onToggle={() => toggleSection('policy')}>
        <Field label={isRTL ? 'أيام المتابعة' : 'Follow-Up Days'} type="number" value={String(policy.followUpDays)} onChange={v => updateDraft(d => { d.policy.followUpDays = Number(v) || 1; })} />
        <h4 className="text-xs font-bold text-slate-500 uppercase mt-4 mb-2">{isRTL ? 'ساعات التعهد لكل مرحلة' : 'SLA Hours Per Stage'}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(policy.slaHours || {}).map(([stage, hrs]) => (
            <Field key={stage} label={stage} type="number" value={String(hrs)} onChange={v => updateDraft(d => { d.policy.slaHours[stage] = Number(v) || 0; })} />
          ))}
        </div>
      </Section>

      {/* ── Sticky footer ─────────────────────────────────────────────────── */}
      {changed && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3 flex items-center justify-between rounded-t-2xl shadow-lg z-10">
          <span className="text-xs text-slate-400 font-mono">v{dbVersion}</span>
          <div className="flex items-center gap-2">
            <button onClick={handleDiscard} className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors">
              {isRTL ? 'تراجع' : 'Discard'}
            </button>
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#007B6E] hover:bg-[#005B4F] disabled:opacity-50 transition-colors flex items-center gap-1.5">
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isRTL ? 'حفظ' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── sub-components ───────────────────────────────────────────────────── */

const Section: React.FC<{ title: string; icon: string; open: boolean; onToggle: () => void; children: React.ReactNode }> = ({ title, icon, open, onToggle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
    <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
      <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
        <span>{icon}</span> {title}
      </span>
      {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
    </button>
    {open && <div className="px-5 pb-5 space-y-3">{children}</div>}
  </div>
);

const Field: React.FC<{ label: string; value: string; type?: string; onChange: (v: string) => void }> = ({ label, value, type = 'text', onChange }) => (
  <div>
    <label className="block text-[11px] font-bold text-slate-500 mb-1">{label}</label>
    <input type={type} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#007B6E]/20 focus:border-[#007B6E]" value={value} onChange={e => onChange(e.target.value)} />
  </div>
);

const TagList: React.FC<{ label: string; tags: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void }> = ({ label, tags, onAdd, onRemove }) => {
  const [val, setVal] = useState('');
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1">{label}</label>
      <div className="flex gap-1 flex-wrap mb-1">
        {tags.map(t => (
          <span key={t} className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs font-medium text-slate-600">
            {t} <button type="button" onClick={() => onRemove(t)} className="text-slate-400 hover:text-rose-500">&times;</button>
          </span>
        ))}
      </div>
      <form onSubmit={e => { e.preventDefault(); if (val.trim()) { onAdd(val.trim()); setVal(''); }}} className="flex gap-1">
        <input className="flex-1 border rounded px-2 py-1 text-xs" value={val} onChange={e => setVal(e.target.value)} />
        <button type="submit" className="px-2 py-1 text-xs font-bold text-white bg-[#007B6E] rounded">+</button>
      </form>
    </div>
  );
};

export default SuperAdminSettingsTab;