"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type SiteConfigForHeader = {
  logoMark: string;
  logoTextEn: string;
  logoTextHi?: string;
  logoTextId?: string;
  logoImageUrl?: string;
};

const HEADER_DEFAULTS: SiteConfigForHeader = {
  logoMark: "JYC",
  logoTextEn: "JYC Steel Equipment Ltd",
  logoTextHi: "JYC स्टील उपकरण Ltd",
  logoTextId: "Peralatan Baja JYC Ltd",
  logoImageUrl: "",
};

const SUPPORTED_LOCALES = ["en", "hi", "id"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

// 這些頁面不是語系路由
const NON_LOCALE_PATH_PREFIXES = ["/admin", "/login", "/logout"];

function pickLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split("/")[1];
  if (SUPPORTED_LOCALES.includes(seg as Locale)) return seg as Locale;
  return "en";
}

function stripLocalePrefix(pathname: string) {
  const parts = pathname.split("/");
  const first = parts[1];
  if (SUPPORTED_LOCALES.includes(first as Locale)) {
    const rest = "/" + parts.slice(2).join("/");
    return rest === "/" ? "/" : rest;
  }
  return pathname;
}

function isNonLocalePage(path: string) {
  return NON_LOCALE_PATH_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
}

export function Header() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const locale = useMemo(() => pickLocaleFromPath(pathname), [pathname]);

  const [loggedIn, setLoggedIn] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfigForHeader>(HEADER_DEFAULTS);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const flag = window.localStorage.getItem("jyc_admin_logged_in") === "true";
      setLoggedIn(flag);
    }
  }, []);

  useEffect(() => {
    async function loadConfig() {
      try {
        const snap = await getDoc(doc(db, "config", "site"));
        if (snap.exists()) {
          const data = snap.data() as Partial<SiteConfigForHeader>;
          setSiteConfig((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("load site config in Header error:", err);
      }
    }
    loadConfig();
  }, []);

  const navByLocale: Record<Locale, { path: string; label: string }[]> = {
    en: [
      { path: "", label: "Home" },
      { path: "/about", label: "About" },
      { path: "/products", label: "Products" },
      { path: "/gallery", label: "Gallery" },
      { path: "/contact", label: "Contact" },
    ],
    hi: [
      { path: "", label: "मुखपृष्ठ" },
      { path: "/about", label: "हमारे बारे में" },
      { path: "/products", label: "उत्पाद" },
      { path: "/gallery", label: "गैलरी" },
      { path: "/contact", label: "संपर्क" },
    ],
    id: [
      { path: "", label: "Beranda" },
      { path: "/about", label: "Tentang" },
      { path: "/products", label: "Produk" },
      { path: "/gallery", label: "Galeri" },
      { path: "/contact", label: "Kontak" },
    ],
  };

  const navLinks = useMemo(() => {
    return navByLocale[locale].map((item) => ({
      href: `/${locale}${item.path}`,
      label: item.label,
    }));
  }, [locale]);

  const logoHref = `/${locale}`;
  const logoText =
    locale === "hi"
      ? siteConfig.logoTextHi || siteConfig.logoTextEn
      : locale === "id"
        ? siteConfig.logoTextId || siteConfig.logoTextEn
        : siteConfig.logoTextEn;

  // ✅ 只有在 /admin /login /logout 這些「內部頁」才顯示後台 UI
  const showAdminUi = useMemo(() => {
    const withoutLocale = stripLocalePrefix(pathname);
    return isNonLocalePage(withoutLocale);
  }, [pathname]);

  // 切換語言：保留目前子路徑，例如 /hi/products -> /id/products
  function buildPathForLocale(target: Locale) {
    const withoutLocale = stripLocalePrefix(pathname);
    if (isNonLocalePage(withoutLocale)) return `/${target}`;

    const parts = pathname.split("/");
    const first = parts[1];

    const rest = SUPPORTED_LOCALES.includes(first as Locale)
      ? "/" + parts.slice(2).join("/")
      : pathname;

    const cleanRest = rest === "/" ? "" : rest;
    return `/${target}${cleanRest}`;
  }

  function onLocaleChange(nextLocale: Locale) {
    router.push(buildPathForLocale(nextLocale));
  }

  // ✅ Active nav：Home / About / Products / Gallery / Contact 全部支援
  const activeChecker = (href: string) => {
    // Home: 只在 /{locale} 或 /{locale}/ 時亮
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    // 其他：完全相等 or 子路徑（例如 /en/products/abc）
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="jyc-header">
      <Link href={logoHref} className="jyc-logo">
        <span className="jyc-logo-mark">
          {siteConfig.logoImageUrl ? (
            <img
              src={siteConfig.logoImageUrl}
              alt={logoText}
              className="jyc-logo-mark-img"
            />
          ) : (
            siteConfig.logoMark
          )}
        </span>
        <span className="jyc-logo-text">
          <span className="jyc-logo-main">JYC</span>
          <span className="jyc-logo-sub">Steel Equipment</span>
        </span>
      </Link>

      <nav className="jyc-nav" aria-label="Primary">
        {navLinks.map((item) => {
          const isActive = activeChecker(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "jyc-nav-link is-active" : "jyc-nav-link"}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="jyc-header-right">
        {/* ✅ 永遠顯示三顆語言按鈕（不用下拉） */}
        <div className="jyc-lang-switch" role="group" aria-label="Language">
          <button
            type="button"
            onClick={() => onLocaleChange("en")}
            className={locale === "en" ? "jyc-lang-active" : ""}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onLocaleChange("hi")}
            className={locale === "hi" ? "jyc-lang-active" : ""}
          >
            Hindi
          </button>
          <button
            type="button"
            onClick={() => onLocaleChange("id")}
            className={locale === "id" ? "jyc-lang-active" : ""}
          >
            Indonesian
          </button>
        </div>

        {/* ✅ 保留但永遠隱藏（避免你其他地方還有依賴） */}
        <div className="jyc-lang-select-wrap" aria-hidden="true">
          <select
            className="jyc-lang-select"
            value={locale}
            onChange={(e) => onLocaleChange(e.target.value as Locale)}
            aria-label="Language"
            tabIndex={-1}
          >
            <option value="en">EN</option>
            <option value="hi">Hindi</option>
            <option value="id">Indonesian</option>
          </select>
        </div>

        {/* ✅ 只有內部頁才顯示後台 UI（訪客完全看不到） */}
        {showAdminUi &&
          (loggedIn ? (
            <>
              <span className="jyc-login-status">已登入（内部）</span>
              <Link href="/admin" className="jyc-login-link">
                后台首页
              </Link>
              <Link href="/logout" className="jyc-login-link">
                登出
              </Link>
            </>
          ) : (
            <Link href="/login" className="jyc-login-link">
              后台登入
            </Link>
          ))}
      </div>
    </header>
  );
}
