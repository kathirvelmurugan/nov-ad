import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';
import { PALETTE, AuthPortalTab } from './authTypesAndUtils';

interface AuthHeaderProps {
  activePortal: AuthPortalTab;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ activePortal }) => {
  const isSuperAdmin = activePortal === 'superadmin';

  return (
    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '16px',
          background: isSuperAdmin
            ? '#0f172a'
            : `linear-gradient(135deg, ${PALETTE.primary}, ${PALETTE.secondary})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto',
          color: '#ffffff',
        }}
      >
        {isSuperAdmin ? (
          <ShieldCheck style={{ width: 28, height: 28 }} />
        ) : (
          <Lock style={{ width: 26, height: 26 }} />
        )}
      </div>
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 800,
          color: isSuperAdmin ? '#0f172a' : PALETTE.primary,
          margin: 0,
        }}
      >
        ALO DOCTOR
      </h1>
      <p
        style={{
          fontSize: '13px',
          color: PALETTE.textMuted,
          margin: '4px 0 0 0',
          fontWeight: 500,
        }}
      >
        v3.0 Saudi Edition
      </p>
    </div>
  );
};

export default AuthHeader;
