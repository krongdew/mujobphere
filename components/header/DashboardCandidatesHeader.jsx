"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import candidatesMenuData from "../../data/candidatesMenuData";
import HeaderNavContent from "./HeaderNavContent";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const DashboardCandidatesHeader = () => {
  const [navbar, setNavbar] = useState(false);
  const { data: session, status } = useSession();
  const [profileImage, setProfileImage] = useState(
    "/images/resource/company-6.png"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (session?.user?.image) {
      setProfileImage(session.user.image);
      setImageError(false); // รีเซ็ต error state
    }
  }, [session]);

  const changeBackground = () => {
    if (window.scrollY >= 0) {
      setNavbar(true);
    } else {
      setNavbar(false);
    }
  };
  useEffect(() => {
    window.addEventListener("scroll", changeBackground);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  // เพิ่ม useEffect สำหรับ Bootstrap
  useEffect(() => {
    // Import Bootstrap เฉพาะฝั่ง client
    require("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (status === "loading") {
    return null;
  }

  return (
    // <!-- Main Header-->
    <header
      className={`main-header header-shaddow  ${navbar ? "fixed-header " : ""}`}
    >
      <div className="container-fluid">
        {/* <!-- Main box --> */}
        <div className="main-box">
          {/* <!--Nav Outer --> */}
          <div className="nav-outer">
            <div className="logo-box">
              <div className="logo">
                <Link href="/">
                  <Image
                    alt="brand"
                    src="/images/favicon.png"
                    width={40}
                    height={40}
                    priority
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
            <button className="menu-btn">
              <span className="count">1</span>
              <span className="icon la la-heart-o"></span>
            </button>
            {/* wishlisted menu */}

            <button className="menu-btn">
              <span className="icon la la-bell"></span>
            </button>
            {/* End notification-icon */}

            {/* <!-- Dashboard Option --> */}
            <div
              className={`dropdown dashboard-option ${
                isDropdownOpen ? "show" : ""
              }`}
            >
              <button
                className="dropdown-toggle"
                onClick={toggleDropdown}
                aria-expanded={isDropdownOpen}
              >
                {imageError ? (
                  // ถ้ามี error ให้ใช้ img tag แทน
                  <img
                    alt="avatar"
                    className="thumb"
                    src="/images/resource/company-6.png"
                    width={50}
                    height={50}
                  />
                ) : (
                  <Image
                    alt="avatar"
                    className="thumb"
                    src={profileImage}
                    width={50}
                    height={50}
                    onError={() => setImageError(true)}
                    unoptimized
                  />
                )}
                <span className="name">
                  {session?.user?.name || "My Account"}
                </span>
              </button>

              <ul className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
                {candidatesMenuData.map((item) => (
                  <li
                    className={`${
                      isActiveLink(item.routePath, usePathname())
                        ? "active"
                        : ""
                    } mb-1`}
                    key={item.id}
                    onClick={() => {
                      setIsDropdownOpen(false);
                      // เพิ่มเงื่อนไขสำหรับ Logout
                      if (item.name === "Logout") {
                        handleSignOut();
                      }
                    }}
                  >
                    <Link href={item.routePath}>
                      <i className={`la ${item.icon}`}></i> {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            {/* End dropdown */}
          </div>
          {/* End outer-box */}
        </div>
      </div>
    </header>
  );
};

export default DashboardCandidatesHeader;
