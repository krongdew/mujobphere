'use client'

import Link from "next/link";
import employerMenuData from "../../data/employerMenuData";
import { isActiveLink } from "../../utils/linkActiveChecker";
import { useDispatch, useSelector } from "react-redux";
import { menuToggle } from "../../features/toggle/toggleSlice";
import { usePathname } from "next/navigation";
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from "react";

const DashboardEmployerSidebar = () => {
    const { menu } = useSelector((state) => state.toggle);
    const dispatch = useDispatch();
    const { data: session, status } = useSession(); // เพิ่ม status
    const [navbar, setNavbar] = useState(false);

    // menu toggle handler
    const menuToggleHandler = () => {
        dispatch(menuToggle());
    };

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
    
    // handle sign out
    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    return (
        <div className={`user-sidebar ${menu ? "sidebar_open" : ""}`}>
            {/* Start sidebar close icon */}
            <div className="pro-header text-end pb-0 mb-0 show-1023">
                <div className="fix-icon" onClick={menuToggleHandler}>
                    <span className="flaticon-close"></span>
                </div>
            </div>
            {/* End sidebar close icon */}

            <div className="sidebar-inner">
                <ul className="navigation">
                    {employerMenuData.map((item) => (
                        <li
                            className={`${
                                isActiveLink(item.routePath, usePathname())
                                    ? "active"
                                    : ""
                            } mb-1`}
                            key={item.id}
                            onClick={() => {
                                menuToggleHandler();
                                // Handle logout separately
                                if (item.name === "Logout") {
                                    handleSignOut();
                                }
                            }}
                        >
                            <Link href={item.routePath}>
                                <i className={`la ${item.icon}`}></i>{" "}
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DashboardEmployerSidebar;