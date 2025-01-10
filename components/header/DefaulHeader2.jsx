
'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderNavContent from "./HeaderNavContent";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';

const DefaulHeader2 = () => {
  const t = useTranslations("Common");
  const [navbar, setNavbar] = useState(false);
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
    // <!-- Main Header-->
    <header
      className={`main-header  ${
        navbar ? "fixed-header animated slideInDown" : ""
      }`}
    >
      {/* <!-- Main box --> */}
      <div className="main-box">
        {/* <!--Nav Outer --> */}
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
          {/* End .logo-box */}

          <HeaderNavContent />
          {/* <!-- Main Menu End--> */}
        </div>
        {/* End .nav-outer */}

        <div className="outer-box">
          {/* <!-- Add Listing --> */}
          {/* <Link href="/candidates-dashboard/cv-manager" className="upload-cv">
          {t('UploadCV')}
          </Link> */}
          {/* <!-- Login/Register --> */}
          <div className="btn-box">
                {session ? (
                    <>
                    <span className="theme-btn btn-style-three me-3">
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
                  <a
                    href="#"
                    className="theme-btn btn-style-three call-modal"
                    data-bs-toggle="modal"
                    data-bs-target="#loginPopupModal"
                  >
                      {t('Login / Register')}
                  </a>
                  )}
            <Link
              href="/employers-dashboard/post-jobs"
              className="theme-btn btn-style-one"
            >
              {t('Job Post')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DefaulHeader2;


