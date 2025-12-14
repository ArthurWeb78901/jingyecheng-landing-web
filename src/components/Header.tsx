// src/components/Header.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type SiteConfigForHeader = {
  logoMark: string;
  logoTextZh: string;
  logoTextEn: string;
  logoImageUrl?: string;
};

const HEADER_DEFAULTS: SiteConfigForHeader = {
  logoMark: "JYC",
  logoTextZh: "太原精业城重工设备有限公司",
  logoTextEn: "JYC Steel Equip",
  logoImageUrl: "",
};

export function Header() {
  const rawPathname = usePathname() || "/";

  // 更嚴謹的英文路由判斷：/en 或 /en/ 或 /en/xxx
  const isEnglish =
    rawPathname === "/en" || rawPathname.startsWith("/en/");

  const [loggedIn, setLoggedIn] = useState(false);
  const [siteConfig, setSiteConfig] =
    useState<SiteConfigForHeader>(HEADER_DEFAULTS);

  // 讀取登入狀態（localStorage）
  useEffect(() => {
    if (typeof window !== "undefined") {
      const flag =
        window.localStorage.getItem("jyc_admin_logged_in") === "true";
      setLoggedIn(flag);
    }
  }, []);

  // 從 Firestore 讀取 config/site（logo 文字 + 圖片）
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

  // ===== 語言切換路徑計算 =====
  // 把 /en 前綴去掉，得到「對應中文的 path」
  const withoutEnPrefix = isEnglish
    ? rawPathname.replace(/^\/en/, "") || "/"
    : rawPathname;

  const chinesePath =
    withoutEnPrefix === "" ? "/" : withoutEnPrefix;

  const englishPath = isEnglish
    ? rawPathname // 已經在英文，不改路徑
    : rawPathname === "/"
    ? "/en"
    : `/en${rawPathname}`;

  // ===== 導覽列 =====
  const navLinks = isEnglish
    ? [
        { href: "/en", label: "Home" },
        { href: "/en/products", label: "Products" },
        { href: "/en/about", label: "About" },
        { href: "/en/gallery", label: "Gallery" },
        { href: "/en/contact", label: "Contact" },
      ]
    : [
        { href: "/zh", label: "首页" },
        // ✅ 這裡改成真正的中文產品頁路由
        { href: "/products", label: "产品介绍" },
        { href: "/about", label: "公司介绍" },
        { href: "/gallery", label: "图片集" },
        { href: "/contact", label: "联系我们" },
      ];

  const logoHref = isEnglish ? "/en" : "/";
  const logoText = isEnglish ? siteConfig.logoTextEn : siteConfig.logoTextZh;

  return (
    <header className="jyc-header">
      {/* Logo：有圖片就顯示圖片，沒有就顯示字 JYC */}
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
          {/* EN */}
          <Link
            href={englishPath}
            className={isEnglish ? "jyc-lang-active" : ""}
          >
            EN
          </Link>

          {/* 中文：不論現在在 /en 或 /en/... 都會導回對應中文路徑 */}
          <Link
            href={chinesePath}
            className={isEnglish ? "" : "jyc-lang-active"}
          >
            中文
          </Link>
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
