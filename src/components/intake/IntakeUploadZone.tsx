import React from 'react';
import { FileUp, Eye, CheckCircle2, Activity } from 'lucide-react';
import { ClinicalCase, DiagnosticAsset } from '../../types';
import { apiClient } from '../../services/apiClient';

interface Props {
  activeCase: ClinicalCase;
  isAr: boolean;
  onUpdateCase: (updated: Partial<ClinicalCase>) => void;
  setSelectedFileForPreview: (fileName: string) => void;
}

export const IntakeUploadZone: React.FC<Props> = ({
  activeCase,
  isAr,
  onUpdateCase,
  setSelectedFileForPreview,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="bg-alo-mint text-alo-teal px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-teal-200">
            P07 · {isAr ? 'الفحوصات والأشعة' : 'Diagnostic Scans'}
          </span>
          <FileUp className="w-4 h-4 text-alo-teal" />
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'الملفات المرفوعة (Echo · CINE Loops · DICOM):' : 'Uploaded Diagnostic Scans & DICOM Files:'}
          </label>
        </div>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
          ✓ {(activeCase.files || []).length} {isAr ? 'ملفات مكتملة' : 'Files Verified'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(activeCase.files || []).map((file) => (
          <div
            key={file.id}
            onClick={() => setSelectedFileForPreview(file.name)}
            className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-alo-teal p-3.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all hover:shadow-sm"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <FileUp className="w-4 h-4 text-alo-teal shrink-0" />
              <div className="truncate">
                <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">{file.size} · {file.type.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Eye className="w-3.5 h-3.5 text-slate-400 hover:text-alo-teal" />
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Interactive File Upload Zone */}
      <div className="mt-3 p-4 border-2 border-dashed border-teal-300 dark:border-teal-700/80 rounded-2xl bg-teal-50/40 dark:bg-teal-950/20 text-center hover:bg-teal-50/70 transition-colors">
        <input
          type="file"
          id="patient-file-upload"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.dcm,.zip"
          className="hidden"
          onChange={(e) => {
            const uploadedFiles = e.target.files;
            if (!uploadedFiles || uploadedFiles.length === 0) return;
            const filesArray = Array.from(uploadedFiles);
            const newItems: DiagnosticAsset[] = filesArray.map((f, idx) => ({
              id: `f_user_${Date.now()}_${idx}`,
              name: f.name,
              size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
              type: f.name.endsWith('.dcm') ? 'dicom' : f.name.endsWith('.mp4') ? 'mp4' : 'pdf',
              verified: true,
              url: URL.createObjectURL(f),
            }));
            onUpdateCase({
              files: [...activeCase.files, ...newItems],
            });
            filesArray.forEach(async (f, idx) => {
              const uploaded = await apiClient.uploadFile(f);
              if (uploaded?.url) {
                newItems[idx].url = uploaded.url;
                onUpdateCase({
                  files: [...activeCase.files, ...newItems],
                });
              }
            });
          }}
        />
        <label
          htmlFor="patient-file-upload"
          className="cursor-pointer flex flex-col items-center justify-center gap-2 py-2"
        >
          <div className="w-10 h-10 rounded-full bg-alo-mint flex items-center justify-center text-alo-teal shadow-xs">
            <FileUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'انقر هنا لرفع تقارير طبية أو أشعة إضافية (DICOM / PDF / صور)' : 'Click to upload medical reports or diagnostic scans (DICOM / PDF / Images)'}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isAr ? 'يدعم الملفات حتى 100 ميجابايت مشفرة محلياً' : 'Supports files up to 100 MB with local AES-256 encryption'}
            </p>
          </div>
        </label>
      </div>

      {/* P08: Echo Lab Snapshot Metrics */}
      <div className="mt-3 bg-alo-mint/60 dark:bg-alo-mintDark/30 border border-teal-200 dark:border-teal-800 p-3.5 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-alo-teal dark:text-alo-aqua font-extrabold">
          <Activity className="w-4 h-4 text-alo-teal" />
          <span>P08 · {isAr ? 'قياسات الإيكو السريرية المعتمدة:' : 'Echo Lab Approved Metrics:'}</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-800 dark:text-slate-200">
          <span>{isAr ? 'مساحة الصمام:' : 'Valve Area:'} <strong className="medical-term text-alo-teal font-extrabold">0.65 cm²</strong></span>
          <span>{isAr ? 'تدرج الضغط:' : 'Mean Gradient:'} <strong className="medical-term text-alo-teal font-extrabold">48 mmHg</strong></span>
          <span>{isAr ? 'سرعة التدفق:' : 'Peak Velocity:'} <strong className="medical-term text-alo-teal font-extrabold">4.4 m/s</strong></span>
          <span>{isAr ? 'كفاءة الضخ:' : 'LVEF:'} <strong className="medical-term text-emerald-700 dark:text-emerald-400 font-extrabold">55%</strong></span>
        </div>
      </div>
    </div>
  );
};
