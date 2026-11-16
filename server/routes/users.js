import React, { useState, useEffect, useCallback } from 'react';

const COLORS = {
  primary: '#007B6E',
  secondary: '#00C6AE',
  background: '#E6FAF7',
  whatsapp: '#25D366',
  white: '#FFFFFF',
  textDark: '#1A1A1A',
  textLight: '#4A4A4A',
  error: '#D32F2F'
};

const PERSONAS = [
  { code: 'AD', nameEn: 'Adrian Lewis', nameAr: 'أدريان لويس', roleEn: 'Administrator', roleAr: 'مدير النظام' },
  { code: 'HA', nameEn: 'David Nunez', nameAr: 'ديفيد نونيز', roleEn: 'Hospital Admin', roleAr: 'مدير المستشفى' },
  { code: 'C', nameEn: 'Emmanuel Arcon Gonzalez', nameAr: 'إيمانويل أركون غونزاليس', roleEn: 'Coordinator', roleAr: 'منسق' },
  { code: 'N', nameEn: 'Sara Al-Qahtani', nameAr: 'سارة القحطاني', roleEn: 'Nurse', roleAr: 'ممرضة' },
  { code: 'D', nameEn: 'Dr. Fahad Al-Harbi', nameAr: 'د. فهد الحربي', roleEn: 'Doctor', roleAr: 'طبيب' },
  { code: 'K', nameEn: 'Dr. V. Prasanth', nameAr: 'د. في. براسانث', roleEn: 'Consultant', roleAr: 'استشاري' },
  { code: 'L', nameEn: 'Lab Technician', nameAr: 'فني مختبر', roleEn: 'Laboratory', roleAr: 'مختبر' },
  { code: 'PH', nameEn: 'Pharmacist', nameAr: 'صيدلي', roleEn: 'Pharmacy', roleAr: 'صيدلية' },
  { code: 'REC', nameEn: 'Receptionist', nameAr: 'موظف استقبال', roleEn: 'Reception', roleAr: 'استقبال' },
  { code: 'P', nameEn: 'Patient', nameAr: 'مريض', roleEn: 'Patient', roleAr: 'مريض' }
];

const normalizePhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (/^05\d{8}$/.test(cleaned)) return `+966${cleaned.substring(1)}`;
  if (/^5\d{8}$/.test(cleaned)) return `+966${cleaned}`;
  if (/^\+9665\d{8}$/.test(cleaned)) return cleaned;
  if (/^\+91\d{10}$/.test(cleaned)) return cleaned;
  return cleaned;
};

export default function AloDoctorAuth() {
  const [lang, setLang] = useState('ar');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [activePersona, setActivePersona] = useState(PERSONAS[4]);

  const isRTL = lang === 'ar';
  const dir = isRTL ? 'rtl' : 'ltr';

  const t = {
    login: isRTL ? 'تسجيل الدخول' : 'Login',
    phone: isRTL ? 'رقم الجوال' : 'Phone Number',
    pin: isRTL ? 'الرمز السري' : 'PIN',
    submit: isRTL ? 'دخول' : 'Sign In',
    welcome: isRTL ? 'مرحباً بك في الو دكتور' : 'Welcome to ALO DOCTOR',
    logout: isRTL ? 'تسجيل الخروج' : 'Logout',
    switcher: isRTL ? 'تبديل الشخصية' : 'Persona Switcher',
    users: isRTL ? 'المستخدمين' : 'Users',
    errorInvalid: isRTL ? 'رقم الجوال أو الرمز السري غير صحيح' : 'Invalid phone or PIN',
    errorNetwork: isRTL ? 'خطأ في الاتصال بالخادم' : 'Network error occurred',
    version: isRTL ? 'الإصدار السعودي ٢.٤' : 'Saudi Edition v2.4'
  };

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    document.body.style.fontFamily = "'Cairo', sans-serif";
    document.body.style.backgroundColor = COLORS.background;
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, [dir, lang]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users');
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setUsersList(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const normalizedPhone = normalizePhone(phone);

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': lang
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          pin: pin
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setUser(result.data);
        const matchedPersona = PERSONAS.find(p => p.code === result.data.roleCode) || PERSONAS[0];
        setActivePersona(matchedPersona);
        setPhone('');
        setPin('');
      } else {
        setError(result.error || t.errorInvalid);
      }
    } catch (err) {
      setError(t.errorNetwork);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsersList([]);
    setError('');
  };

  const handlePersonaSwitch = (persona) => {
    setActivePersona(persona);
    if (user) {
      setUser({ ...user, roleCode: persona.code, fullName: persona.nameEn, fullNameAr: persona.nameAr });
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    direction: dir,
    fontFamily: "'Cairo', sans-serif"
  };

  const cardStyle = {
    backgroundColor: COLORS.white,
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0, 123, 110, 0.12)',
    border: `1px solid ${COLORS.secondary}20`
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '32px'
  };

  const logoStyle = {
    fontSize: '32px',
    fontWeight: 800,
    color: COLORS.primary,
    margin: '0 0 8px 0',
    letterSpacing: isRTL ? '0' : '1px'
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: COLORS.textLight,
    margin: 0,
    fontWeight: 500
  };

  const inputGroupStyle = {
    marginBottom: '20px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    color: COLORS.textDark,
    marginBottom: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 18px',
    fontSize: '16px',
    fontFamily: "'Cairo', sans-serif",
    border: `2px solid ${COLORS.secondary}40`,
    borderRadius: '12px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: COLORS.background,
    color: COLORS.textDark,
    direction: isRTL ? 'rtl' : 'ltr',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 700,
    fontFamily: "'Cairo', sans-serif",
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    border: 'none',
    borderRadius: '12px',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.7 : 1,
    marginTop: '8px'
  };

  const errorStyle = {
    backgroundColor: '#FDEDED',
    color: COLORS.error,
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '20px',
    textAlign: 'center',
    border: '1px solid #F5C6CB'
  };

  const langToggleStyle = {
    position: 'absolute',
    top: '20px',
    [isRTL ? 'left' : 'right']: '20px',
    backgroundColor: COLORS.white,
    border: `2px solid ${COLORS.secondary}`,
    borderRadius: '10px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 700,
    color: COLORS.primary,
    cursor: 'pointer',
    fontFamily: "'Cairo', sans-serif",
    transition: 'all 0.2s ease'
  };

  const personaGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
    marginTop: '24px',
    padding: '16px',
    backgroundColor: COLORS.background,
    borderRadius: '16px',
    border: `1px solid ${COLORS.secondary}30`
  };

  const personaChipStyle = (isActive) => ({
    padding: '8px 4px',
    fontSize: '11px',
    fontWeight: 700,
    textAlign: 'center',
    borderRadius: '8px',
    cursor: 'pointer',
    backgroundColor: isActive ? COLORS.primary : COLORS.white,
    color: isActive ? COLORS.white : COLORS.textDark,
    border: `1px solid ${isActive ? COLORS.primary : COLORS.secondary}40`,
    transition: 'all 0.15s ease',
    fontFamily: "'Cairo', sans-serif"
  });

  const userCardStyle = {
    backgroundColor: COLORS.background,
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    border: `1px solid ${COLORS.secondary}30`
  };

  const userListStyle = {
    maxHeight: '300px',
    overflowY: 'auto',
    marginTop: '16px'
  };

  const userItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: COLORS.white,
    borderRadius: '10px',
    marginBottom: '8px',
    border: `1px solid ${COLORS.secondary}20`,
    fontSize: '13px'
  };

  const whatsappBtnStyle = {
    position: 'fixed',
    bottom: '24px',
    [isRTL ? 'left' : 'right']: '24px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: COLORS.whatsapp,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
    cursor: 'pointer',
    border: 'none',
    transition: 'transform 0.2s ease'
  };

  return (
    <div style={containerStyle}>
      <button
        style={langToggleStyle}
        onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
        aria-label="Toggle Language"
        type="button"
      >
        {lang === 'ar' ? 'EN' : 'عربي'}
      </button>

      {!user ? (
        <div style={cardStyle}>
          <div style={headerStyle}>
            <h1 style={logoStyle}>ALO DOCTOR</h1>
            <p style={subtitleStyle}>{t.welcome}</p>
            <p style={{ fontSize: '11px', color: COLORS.secondary, margin: '4px 0 0 0', fontWeight: 600 }}>
              {t.version}
            </p>
          </div>

          {error && (
            <div style={errorStyle} role="alert" aria-live="assertive">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div style={inputGroupStyle}>
              <label htmlFor="phone-input" style={labelStyle}>
                {t.phone}
              </label>
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isRTL ? '05XXXXXXXX أو +9665XXXXXXXX' : '05XXXXXXXX or +9665XXXXXXXX'}
                style={inputStyle}
                required
                autoComplete="tel"
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${COLORS.secondary}30`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = `${COLORS.secondary}40`;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={inputGroupStyle}>
              <label htmlFor="pin-input" style={labelStyle}>
                {t.pin}
              </label>
              <input
                id="pin-input"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                style={{ ...inputStyle, letterSpacing: '8px', textAlign: 'center' }}
                required
                autoComplete="current-password"
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = COLORS.primary;
                  e.target.style.boxShadow = `0 0 0 3px ${COLORS.secondary}30`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = `${COLORS.secondary}40`;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              type="submit"
              style={buttonStyle}
              disabled={loading || !phone || !pin}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = COLORS.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.primary;
              }}
            >
              {loading ? (isRTL ? 'جاري التحقق...' : 'Verifying...') : t.submit}
            </button>
          </form>

          <div style={personaGridStyle}>
            <p style={{ gridColumn: '1 / -1', margin: '0 0 8px 0', fontSize: '12px', fontWeight: 700, color: COLORS.primary, textAlign: 'center' }}>
              {t.switcher}
            </p>
            {PERSONAS.map((persona) => (
              <button
                key={persona.code}
                type="button"
                style={personaChipStyle(activePersona.code === persona.code)}
                onClick={() => handlePersonaSwitch(persona)}
                aria-label={`${persona.nameEn} - ${persona.roleEn}`}
                title={`${isRTL ? persona.nameAr : persona.nameEn} (${persona.code})`}
              >
                {persona.code}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ ...cardStyle, maxWidth: '640px' }}>
          <div style={userCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 800, color: COLORS.primary }}>
                  {isRTL ? user.fullNameAr : user.fullName}
                </h2>
                <p style={{ margin: 0, fontSize: '14px', color: COLORS.textLight, fontWeight: 600 }}>
                  {user.roleCode} • {user.phone}
                </p>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: COLORS.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: COLORS.white,
                fontWeight: 800,
                fontSize: '18px'
              }}>
                {user.roleCode}
              </div>
            </div>

            <div style={personaGridStyle}>
              {PERSONAS.map((persona) => (
                <button
                  key={persona.code}
                  type="button"
                  style={personaChipStyle(user.roleCode === persona.code)}
                  onClick={() => handlePersonaSwitch(persona)}
                  aria-label={`Switch to ${persona.nameEn}`}
                >
                  {persona.code}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: COLORS.textDark, margin: '0 0 12px 0' }}>
              {t.users} ({usersList.length})
            </h3>
            <div style={userListStyle}>
              {usersList.length === 0 ? (
                <p style={{ textAlign: 'center', color: COLORS.textLight, fontSize: '14px', padding: '20px' }}>
                  {isRTL ? 'لا يوجد مستخدمين' : 'No users found'}
                </p>
              ) : (
                usersList.map((u, idx) => (
                  <div key={u.id || idx} style={userItemStyle}>
                    <span style={{ fontWeight: 700, color: COLORS.textDark }}>
                      {isRTL ? u.full_name_ar : u.full_name}
                    </span>
                    <span style={{
                      backgroundColor: COLORS.background,
                      color: COLORS.primary,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '11px'
                    }}>
                      {u.role_code}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              ...buttonStyle,
              backgroundColor: 'transparent',
              color: COLORS.error,
              border: `2px solid ${COLORS.error}`,
              marginTop: '0'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.error;
              e.currentTarget.style.color = COLORS.white;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = COLORS.error;
            }}
          >
            {t.logout}
          </button>
        </div>
      )}

      <a
        href="https://wa.me/966500000000"
        target="_blank"
        rel="noopener noreferrer"
        style={whatsappBtnStyle}
        aria-label="Contact via WhatsApp"
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap');
        
        *, *::before, *::after {
          box-sizing: border-box;
        }
        
        input::placeholder {
          color: #9CA3AF;
          font-family: 'Cairo', sans-serif;
          letter-spacing: normal;
        }
        
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${COLORS.background};
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${COLORS.secondary};
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${COLORS.primary};
        }
        
        @media (max-width: 520px) {
          .persona-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}