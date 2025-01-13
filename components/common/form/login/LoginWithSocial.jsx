"use client";
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

const LoginWithSocial = () => {
  const t = useTranslations("Login");

  const handleGoogleLogin = async () => {
    try {
       // ใช้ callbackUrl ที่จะ redirect ไปหลัง login สำเร็จ
       await signIn('google', {
        callbackUrl: '/api/auth/callback/redirect', // สร้าง API route ใหม่สำหรับ redirect
        redirect: true
      });
    } catch (error) {
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