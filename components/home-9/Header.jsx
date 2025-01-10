'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderNavContent from "../header/HeaderNavContent";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';

const Header = () => {
  const [navbar, setNavbar] = useState(false);
  const t = useTranslations("Common");
  const { data: session } = useSession();

  const changeBackground = () => {
    if (window.scrollY >= 10) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

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
              {session ? (
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
                < a
                  href="#"
                  className="theme-btn btn-style-six call-modal"
                  data-bs-toggle="modal"
                  data-bs-target="#loginPopupModal"
                >
                  {t('Login / Register')}
                </a>
              )}
              <Link
                href="/employers-dashboard/post-jobs"
                className="theme-btn btn-style-five ms-3"
              >
                {t('Job Post')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;