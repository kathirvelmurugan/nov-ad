import { TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG, WHATSAPP_GREEN } from '../../theme/brandColors';

export { TEAL_PRIMARY, TEAL_SECONDARY, TEAL_BG, WHATSAPP_GREEN };

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
