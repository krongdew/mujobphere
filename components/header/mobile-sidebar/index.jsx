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
import mobileMenuData from "../../../data/mobileMenuData";
import SidebarFooter from "./SidebarFooter";
import SidebarHeader from "./SidebarHeader";
import {
  isActiveLink,
  isActiveParentChaild,
} from "../../../utils/linkActiveChecker";
import { useRouter, usePathname } from 'next/navigation'; // แก้ไขบรรทัดนี้
// Dynamic import for LanguageSwitcher
const LanguageSwitcher = dynamic(() => import('../../LanguageSwitcher'), {
  ssr: false // ไม่ทำ server-side rendering
});

const Index = () => {
  const t = useTranslations("Common");
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // หรือแสดง loading state
  }

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
          {mobileMenuData.map((item) => (
            <SubMenu
              className={
                isActiveParentChaild(item.items, usePathname())
                  ? "menu-active"
                  : ""
              }
              label={t(item.label)}
              key={item.id}
            >
              {item.items.map((menuItem, i) => (
                <MenuItem
                  onClick={() => router.push(menuItem.routePath)}
                  className={
                    isActiveLink(menuItem.routePath, usePathname())
                      ? "menu-active-link"
                      : ""
                  }
                  key={i}
                >
                  {menuItem.name}
                </MenuItem>
              ))}
            </SubMenu>
          ))}
          
          {/* Language Switcher */}
          <SubMenu label={t('Language')}>
            <MenuItem>
              <LanguageSwitcher />
            </MenuItem>
          </SubMenu>
        </Menu>
      </Sidebar>

      <SidebarFooter />
    </div>
  );
};

export default Index;