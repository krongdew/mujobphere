"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import HeaderNavContent from "../header/HeaderNavContent";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";

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
    signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return null;
  }

  return (
    <>
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
                  <div className="d-flex align-items-center">
                    {session?.user.role === "employer" || session?.user.role === "employeroutside" ? (
                      <Link 
                        className="theme-btn btn-style-six me-3"
                        href="/employers-dashboard/company-profile"
                      >
                        {session.user.name}
                      </Link>
                    ) : session?.user.role === "student" ? (
                      <Link 
                        className="theme-btn btn-style-six me-3"
                        href="/candidates-dashboard/my-profile"
                      >
                    
                        {session.user.name}
                      </Link>
                    ) : session?.user.role === "admin" ? (
                      <Link 
                        className="theme-btn btn-style-six me-3"
                        href="/admin-dashboard/users"
                      >

                        {session.user.name}
                      </Link>
                    ) : null}
                    
                    {session.user.role === "waituser" ? (
                      <span className="badge bg-warning text-dark me-3">
                        {t('Waiting for Approve')}
                      </span>
                    ) : (
                      // แสดงปุ่ม Job Post เฉพาะสำหรับ employer ที่ได้รับการอนุมัติแล้ว
                      (session.user.role === "employer" ||
                        session.user.role === "employeroutside") && (
                        <Link
                          href="/employers-dashboard/post-jobs"
                          className="theme-btn btn-style-five ms-3"
                        >
                          {t("Job Post")}
                        </Link>
                      )
                    )}

                    <button
                      onClick={handleSignOut}
                      className="theme-btn btn-style-one ms-3"
                    >
                      {t("Logout")}
                    </button>
                  </div>
                ) : (
                  <button
                    className="theme-btn btn-style-six call-modal"
                    data-bs-toggle="modal"
                    data-bs-target="#loginPopupModal"
                  >
                    {t("Login / Register")}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;