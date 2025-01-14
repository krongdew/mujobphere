'use client';

import Link from "next/link";
import MobileSidebar from "./mobile-sidebar";
import Image from "next/image";
import { useSession } from 'next-auth/react';

const MobileMenu = () => {
  const { data: session } = useSession();

  // ฟังก์ชันสำหรับกำหนด URL ตาม role
  const getProfileUrl = () => {
    if (!session?.user?.role) return '#';
    return session.user.role === 'student'
      ? '/candidates-dashboard/my-profile'
      : '/employers-dashboard/company-profile';
  };


  return (
    <header className="main-header main-header-mobile">
      <div className="auto-container">
        <div className="inner-box">
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
            <MobileSidebar />
          </div>

          <div className="outer-box">
            <div className="login-box">
              {session.user ? (
                <Link href={getProfileUrl()}>
                  <span className="icon icon-user"></span>
                </Link>
              ) : (
                <a
                  href="#"
                  className="call-modal"
                  data-bs-toggle="modal"
                  data-bs-target="#loginPopupModal"
                >
                  <span className="icon icon-user"></span>
                </a>
              )}
            </div>

            <a
              href="#"
              className="mobile-nav-toggler"
              data-bs-toggle="offcanvas"
              data-bs-target="#offcanvasMenu"
            >
              <span className="flaticon-menu-1"></span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default MobileMenu;