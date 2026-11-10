export const TEAL_PRIMARY = '#007B6E';
export const TEAL_SECONDARY = '#00C6AE';
export const TEAL_BG = '#E6FAF7';
export const WHATSAPP_GREEN = '#25D366';

export const FEEDBACK_TAGS_AR = ['دقة التشخيص', 'وضوح التفسير الطبي', 'سرعة الاستجابة', 'التعامل الراقي', 'جودة التقرير'];
export const FEEDBACK_TAGS_EN = ['Diagnostic Accuracy', 'Clear Explanation', 'Fast Response', 'Professionalism', 'Report Quality'];

export const generateMockSHA256 = (): string => {
  const chars = 'abcdef0123456789';
  let hash = '';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};
