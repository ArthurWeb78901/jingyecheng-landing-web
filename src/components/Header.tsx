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
  logoTextEn: "JYC Steel Equipment",
  logoTextHi: "JYC स्टील उपकरण",
  logoTextId: "Peralatan Baja JYC",
  logoImageUrl: "",
};

const SUPPORTED_LOCALES = ["en", "hi", "id"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

// 這些頁面不是語系路由，切換語言時不要拼 /hi/admin 之類
const NON_LOCALE_PATH_PREFIXES = ["/admin", "/login", "/logout"];

function pickLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split("/")[1];
  if (SUPPORTED_LOCALES.includes(seg as Locale)) return seg as Locale;
  return "en";
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

  const navLinks = navByLocale[locale].map((item) => ({
    href: `/${locale}${item.path}`,
    label: item.label,
  }));

  const logoHref = `/${locale}`;
  const logoText =
    locale === "hi"
      ? siteConfig.logoTextHi || siteConfig.logoTextEn
      : locale === "id"
        ? siteConfig.logoTextId || siteConfig.logoTextEn
        : siteConfig.logoTextEn;

  function isNonLocalePage(path: string) {
    return NON_LOCALE_PATH_PREFIXES.some((p) => path === p || path.startsWith(p + "/"));
  }

  // 切換語言：保留目前子路徑，例如 /hi/products -> /id/products
  function buildPathForLocale(target: Locale) {
    // 在 /admin /login /logout 這類頁面，切換語言就回到該語言首頁
    if (isNonLocalePage(pathname)) return `/${target}`;

    const parts = pathname.split("/");
    const first = parts[1];

    // 已經是 /en /hi /id 開頭 -> 取後面的 path
    const rest = SUPPORTED_LOCALES.includes(first as Locale)
      ? "/" + parts.slice(2).join("/")
      : pathname;

    const cleanRest = rest === "/" ? "" : rest;
    return `/${target}${cleanRest}`;
  }

  function onLocaleChange(nextLocale: Locale) {
    router.push(buildPathForLocale(nextLocale));
  }

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
        <span className="jyc-logo-text">{logoText}</span>
      </Link>

      <nav className="jyc-nav">
        {navLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="jyc-header-right">
        <div className="jyc-lang-switch">
          <select
            className="jyc-lang-select"
            value={locale}
            onChange={(e) => onLocaleChange(e.target.value as Locale)}
            aria-label="Language"
          >
            <option value="en">EN</option>
          </select>
        </div>

        {loggedIn ? (
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
        )}
      </div>
    </header>
  );
}
