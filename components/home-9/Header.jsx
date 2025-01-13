'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderNavContent from "../header/HeaderNavContent";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const [navbar, setNavbar] = useState(false);
  const t = useTranslations("Common");
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    
    const changeBackground = () => {
      if (window.scrollY >= 10) {
        setNavbar(true);
      } else {
        setNavbar(false);
      }
    };

    window.addEventListener("scroll", changeBackground);
    return () => window.removeEventListener("scroll", changeBackground);
  }, [status]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // แสดง loading state
  if (status === "loading") {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
        </div>
      );
    }
  

  return (
    <header
      className={`main-header header-style-two alternate2 ${
        navbar ? "fixed-header animated slideInDown" : ""
      }`}
    >
      <div className="auto-container">
        <div className="main-box">
          <div className="nav-outer">
            <div className="logo-box">
              <div className="logo">
                <Link href="/">
                  <Image
                    width={40}
                    height={40}
                    src="/images/favicon.png"
                    alt="brand"
                  />
                </Link>
              </div>
            </div>

            <HeaderNavContent />
          </div>

          <div className="outer-box">
            <div className="btn-box">
            {session?.user ? (
                <>
                  <span className="theme-btn btn-style-six me-3">
                    {session.user.name}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="theme-btn btn-style-three"
                  >
                    {t('Logout')}
                  </button>
                </>
              ) : (
                <button
                  href="#"
                  className="theme-btn btn-style-six call-modal"
                  data-bs-toggle="modal"
                  data-bs-target="#loginPopupModal"
                >
                  {t('Login / Register')}
                </button>
              )}
           
            {/* แสดงปุ่ม Job Post เฉพาะ employer และ employeroutside */}
            {session?.user?.role && (session.user.role === 'employer' || session.user.role === 'employeroutside') && (
              <Link
                href="/employers-dashboard/post-jobs"
                className="theme-btn btn-style-five ms-3"
              >
                {t('Job Post')}
              </Link>
            )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;