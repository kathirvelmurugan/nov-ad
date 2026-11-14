import React from 'react';

export interface PersonaDefinition {
  roleCode: string;
  titleAr: string;
  titleEn: string;
  icon?: React.ReactNode;
}

export interface AuthRoleSelectorGridProps {
  personas: PersonaDefinition[];
  selectedRole: string;
  onSelectRole: (roleCode: string) => void;
  lang: 'ar' | 'en';
}

const PINTEREST_TEAL = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  light: '#E6FAF7',
  whatsapp: '#25D366',
};

const AuthRoleSelectorGrid: React.FC<AuthRoleSelectorGridProps> = ({
  personas,
  selectedRole,
  onSelectRole,
  lang,
}) => {
  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  return (
    <div
      dir={dir}
      className="w-full max-w-4xl mx-auto px-4 py-8 font-cairo"
      style={{ fontFamily: "'Cairo', sans-serif" }}
    >
      <h2
        className={`text-2xl font-bold mb-6 text-center ${
          isRTL ? 'text-right' : 'text-left'
        } text-gray-900 dark:text-gray-100`}
      >
        {isRTL ? 'اختر دورك في النظام' : 'Select Your System Role'}
      </h2>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 ${
          isRTL ? 'rtl' : 'ltr'
        }`}
      >
        {personas.map((persona) => {
          const isSelected = selectedRole === persona.roleCode;
          const title = isRTL ? persona.titleAr : persona.titleEn;

          return (
            <button
              key={persona.roleCode}
              type="button"
              onClick={() => onSelectRole(persona.roleCode)}
              aria-pressed={isSelected}
              aria-label={`${isRTL ? 'اختيار الدور' : 'Select role'}: ${title}`}
              className={`
                relative flex flex-col items-center justify-center p-6 rounded-2xl
                transition-all duration-300 ease-in-out outline-none
                focus-visible:ring-4 focus-visible:ring-offset-2
                dark:focus-visible:ring-offset-gray-900
                ${
                  isSelected
                    ? 'bg-[#E6FAF7] dark:bg-[#007B6E]/20 ring-4 ring-[#007B6E] dark:ring-[#00C6AE] shadow-lg scale-[1.02]'
                    : 'bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 hover:ring-2 hover:ring-[#00C6AE] dark:hover:ring-[#00C6AE] hover:shadow-md hover:scale-[1.01]'
                }
                ${isRTL ? 'text-right' : 'text-left'}
              `}
              style={{
                // @ts-ignore - CSS custom properties for dynamic theming if needed
                '--tw-ring-color': isSelected ? PINTEREST_TEAL.primary : undefined,
              }}
            >
              {/* Selection Indicator Dot */}
              {isSelected && (
                <span
                  className={`absolute top-3 ${
                    isRTL ? 'left-3' : 'right-3'
                  } w-3 h-3 rounded-full bg-[#007B6E] dark:bg-[#00C6AE] animate-pulse`}
                  aria-hidden="true"
                />
              )}

              {/* Icon Container */}
              <div
                className={`
                  mb-4 p-4 rounded-full
                  ${
                    isSelected
                      ? 'bg-[#007B6E] text-white dark:bg-[#00C6AE] dark:text-gray-900'
                      : 'bg-[#E6FAF7] text-[#007B6E] dark:bg-gray-700 dark:text-[#00C6AE]'
                  }
                  transition-colors duration-300
                `}
              >
                {persona.icon || (
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>

              {/* Bilingual Title */}
              <span
                className={`
                  text-lg font-semibold mb-2 text-center
                  ${
                    isSelected
                      ? 'text-[#007B6E] dark:text-[#00C6AE]'
                      : 'text-gray-800 dark:text-gray-200'
                  }
                  transition-colors duration-300
                `}
              >
                {title}
              </span>

              {/* Secondary Title (opposite language for context) */}
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center">
                {isRTL ? persona.titleEn : persona.titleAr}
              </span>

              {/* Role Code Badge */}
              <span
                className={`
                  inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wider uppercase
                  ${
                    isSelected
                      ? 'bg-[#007B6E] text-white dark:bg-[#00C6AE] dark:text-gray-900'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                  }
                  transition-colors duration-300
                `}
                dir="ltr"
              >
                {persona.roleCode}
              </span>

              {/* Accessibility hidden text */}
              <span className="sr-only">
                {isSelected
                  ? isRTL
                    ? 'محدد حالياً'
                    : 'Currently selected'
                  : isRTL
                  ? 'اضغط للتحديد'
                  : 'Press to select'}
              </span>
            </button>
          );
        })}
      </div>

      {/* WhatsApp-style support hint */}
      <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={PINTEREST_TEAL.whatsapp}
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span>{isRTL ? 'بحاجة إلى مساعدة؟ تواصل مع الدعم' : 'Need help? Contact support'}</span>
      </div>
    </div>
  );
};

AuthRoleSelectorGrid.displayName = 'AuthRoleSelectorGrid';

export default AuthRoleSelectorGrid;