import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FaqItem } from '../../data/healthcareServices';

interface Props {
  isAr: boolean;
  faqItems: FaqItem[];
}

export const LandingFaqSection: React.FC<Props> = ({ isAr, faqItems }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
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
  );
};
