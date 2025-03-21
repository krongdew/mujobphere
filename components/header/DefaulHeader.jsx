
'use client'

import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderNavContent from "./HeaderNavContent";
import Image from "next/image";

const DefaulHeader = () => {
  const [navbar, setNavbar] = useState(false);

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
          <div className="btn-box">
            {status === "loading" ? (
              // แสดง loading state
              <span>Loading...</span>
            ) : session?.user ? (
              <>
                <span className="theme-btn btn-style-three me-3">
                  {session.user?.name || 'User'} {/* เพิ่ม fallback value */}
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

export default DefaulHeader;
