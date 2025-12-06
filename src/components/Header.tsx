// src/components/Header.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname() || "/";
  const isEnglish = pathname.startsWith("/en");

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const flag = window.localStorage.getItem("jyc_admin_logged_in") === "true";
      setLoggedIn(flag);
    }
  }, []);

  // 用目前路径推算对应的中 / 英路径（保持同一页）
  const basePath = isEnglish ? pathname.slice(3) || "/" : pathname;
  const chinesePath = basePath === "/" ? "/" : basePath;
  const englishPath = "/en" + (basePath === "/" ? "" : basePath);

  const navLinks = isEnglish
    ? [
        { href: "/en", label: "Home" },
        { href: "/en/products", label: "Products" },
        { href: "/en/about", label: "About" },
        { href: "/en/gallery", label: "Gallery" },
        { href: "/en/contact", label: "Contact" },
      ]
    : [
        { href: "/", label: "首页" },
        { href: "/products", label: "产品介绍" },
        { href: "/about", label: "公司介绍" },
        { href: "/gallery", label: "图片集" },
        { href: "/contact", label: "联系我们" },
      ];

  return (
    <header className="jyc-header">
      <div className="jyc-logo">山西太矿钢管设备有限公司</div>

      <nav className="jyc-nav">
        {navLinks.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="jyc-header-right">
        <div className="jyc-lang-switch">
          <Link
            href={chinesePath}
            className={isEnglish ? "" : "jyc-lang-active"}
          >
            中文
          </Link>
          <Link
            href={englishPath}
            className={isEnglish ? "jyc-lang-active" : ""}
          >
            EN
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
