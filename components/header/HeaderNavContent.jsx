"use client";

import Link from "next/link";
// import {
//   blogItems,
//   candidateItems,
//   employerItems,
//   findJobItems,
//   homeItems,
//   pageItems,
//   shopItems,
// } from "../../data/mainMenuData";
// import {
//   isActiveParent,
//   isActiveLink,
//   isActiveParentChaild,
// } from "../../utils/linkActiveChecker";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTranslations } from 'next-intl';

const HeaderNavContent = () => {
  const t = useTranslations("Common");

  return (
    <>
      <nav className="nav main-menu">
        <ul className="navigation" id="navbar">
          {/* Home menu item */}
          <li
            className={`${
              usePathname() === "/" ? "current" : ""
            }`}
          >
            <Link href="/">{t('Home')}</Link>
          </li>
          {/* End homepage menu item */}

          <li
            className={`${
              usePathname() === "/job-list-v2" ? "current" : ""
            }`}
          >
            <Link href="/job-list-v2">{t('Find Jobs')}</Link>
          </li>
          {/* End findjobs menu items */}

          {/* <li
            className={`${
              isActiveParent(employerItems, usePathname()) ||
              usePathname()?.split("/")[1] === "employers-dashboard"
                ? "current"
                : ""
            } dropdown`}
          >
            <span>{t('Employers')}</span>
            <ul>
              {employerItems.map((item) => (
                <li className="dropdown" key={item.id}>
                  <span
                    className={
                      isActiveParentChaild(item.items, usePathname())
                        ? "current"
                        : ""
                    }
                  >
                    {item.title}
                  </span>
                  <ul>
                    {item.items.map((menu, i) => (
                      <li
                        className={
                          isActiveLink(menu.routePath, usePathname())
                            ? "current"
                            : ""
                        }
                        key={i}
                      >
                        <Link href={menu.routePath}>{menu.name}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li
                className={
                  usePathname()?.includes("/employers-dashboard")
                    ? "current"
                    : ""
                }
              >
                <Link href="/employers-dashboard/dashboard">
                  {t('Employers Dashboard')}
                </Link>
              </li>
            </ul>
          </li> */}
          {/* End Employers menu items */}

          {/* <li
            className={`${
              isActiveParent(candidateItems, usePathname()) ||
              usePathname()?.split("/")[1] === "candidates-dashboard"
                ? "current"
                : ""
            } dropdown`}
          >
            <span>{t('Candidates')}</span>
            <ul>
              {candidateItems.map((item) => (
                <li className="dropdown" key={item.id}>
                  <span
                    className={
                      isActiveParentChaild(item.items, usePathname())
                        ? "current"
                        : ""
                    }
                  >
                    {item.title}
                  </span>
                  <ul>
                    {item.items.map((menu, i) => (
                      <li
                        className={
                          isActiveLink(menu.routePath, usePathname())
                            ? "current"
                            : ""
                        }
                        key={i}
                      >
                        <Link href={menu.routePath}>{menu.name}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li
                className={
                  usePathname()?.includes("/candidates-dashboard/")
                    ? "current"
                    : ""
                }
              >
                <Link href="/candidates-dashboard/dashboard">
                  {t('Candidates Dashboard')}
                </Link>
              </li>
            </ul>
          </li> */}
          {/* End Candidates menu items */}

          {/* <li
            className={`${
              isActiveParentChaild(pageItems, usePathname()) ||
              isActiveParentChaild(shopItems[0].items, usePathname())
                ? "current "
                : ""
            } dropdown`}
          >
            <span>{t('Pages')}</span>
            <ul>
              {shopItems.map((item) => (
                <li className="dropdown" key={item.id}>
                  <span
                    className={`${
                      isActiveParentChaild(shopItems[0].items, usePathname())
                        ? "current "
                        : ""
                    }`}
                  >
                    {item.title}
                  </span>
                  <ul>
                    {item.items.map((menu, i) => (
                      <li
                        className={
                          isActiveLink(menu.routePath, usePathname())
                            ? "current"
                            : ""
                        }
                        key={i}
                      >
                        <Link href={menu.routePath}>{menu.name}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              {pageItems.map((item, i) => (
                <li
                  className={
                    isActiveLink(item.routePath, usePathname()) ? "current" : ""
                  }
                  key={i}
                >
                  <Link href={item.routePath}>{item.name}</Link>
                </li>
              ))}
            </ul>
          </li> */}
          {/* End Pages menu items */}

          <li className="dropdown">
            <span>{t('Language')}</span>
            <ul>
              <LanguageSwitcher />
            </ul>
          </li>
          {/* End Language menu items */}
        </ul>
      </nav>
    </>
  );
};

export default HeaderNavContent;