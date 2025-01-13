"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Sidebar,
  Menu,
  MenuItem,
  SubMenu,
} from "react-pro-sidebar";
import { useTranslations } from 'next-intl';
import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

// Dynamic import for LanguageSwitcher
const LanguageSwitcher = dynamic(() => import('../../LanguageSwitcher'), {
  ssr: false
});

const Index = () => {
  const t = useTranslations("Common");
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  return (
    <div
      className="offcanvas offcanvas-start mobile_menu-contnet"
      tabIndex="-1"
      id="offcanvasMenu"
      data-bs-scroll="true"
    >
      <SidebarHeader />
      
      <Sidebar>
        <Menu>
          <MenuItem 
            className={pathname === "/" ? "menu-active-link" : ""}
            onClick={() => router.push("/")}
          >
            {t('Home')}
          </MenuItem>

          <MenuItem 
            className={pathname === "/job-list-v2" ? "menu-active-link" : ""}
            onClick={() => router.push("/job-list-v2")}
          >
            {t('Find Jobs')}
          </MenuItem>

          {/* แก้ไขส่วนนี้ */}
          <SubMenu label={t('Language')}>
            {/* นำ LanguageSwitcher ออกมาวางข้างนอก SubMenu */}
            <LanguageSwitcher />
          </SubMenu>
           {/* แสดง Logout เฉพาะตอนที่ Login แล้ว */}
           {session?.user && (
            <MenuItem onClick={handleSignOut}>
              {t('Logout')}
            </MenuItem>
          )}
        </Menu>
      </Sidebar>

      <SidebarFooter />
    </div>
  );
};

export default Index;

