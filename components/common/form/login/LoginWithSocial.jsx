"use client";
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

const LoginWithSocial = () => {
  const t = useTranslations("Login");

  const handleGoogleLogin = () => {
    signIn('google', { callbackUrl: '/' });
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