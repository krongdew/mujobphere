"use client";
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { logSecurityEvent } from '@/lib/security/logging';


const LoginWithSocial = () => {
  const t = useTranslations("Login");
  const handleGoogleLogin = async () => {
    try {
      logSecurityEvent('google_login_attempt', {});
      await signIn('google', {
        callbackUrl: '/api/auth/callback/redirect',
        redirect: true
      });
    } catch (error) {
      logSecurityEvent('google_login_error', { error: error.message });
      console.error('Login error:', error);
    }
  };

  return (
    <div className="btn-box row">
      <div className="col-lg-12 col-md-12">
        <button 
          onClick={handleGoogleLogin} 
          className="theme-btn social-btn-two facebook-btn"
        >
          <i className="fab fa-google"></i> {t('Login via')}
        </button>
      </div>
    </div>
  );
};

export default LoginWithSocial;