// src/components/Footer.tsx
"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type SiteConfigForFooter = {
  footerZh: string;
  footerEn: string;
  addressZh: string;
  addressEn: string;
  phone: string;
  email: string;
};

const FOOTER_DEFAULTS: SiteConfigForFooter = {
  footerZh: "版权所有：太原精业城重工设备有限公司",
  footerEn: "All rights reserved: JYC Steel Equip",
  addressZh: "山西省太原市百花谷",
  addressEn: "Baihuagu, Taiyuan, Shanxi Province, China",
  phone: "0351-2028121",
  email: "Wendy@jycsteelequip.com",
};

export function Footer() {
  const pathname = usePathname() || "/";
  const isEnglish = pathname.startsWith("/en");

  const [siteConfig, setSiteConfig] =
    useState<SiteConfigForFooter>(FOOTER_DEFAULTS);

  // 從 Firestore 讀取 config/site（footer & 聯絡資訊）
  useEffect(() => {
    async function loadConfig() {
      try {
        const snap = await getDoc(doc(db, "config", "site"));
        if (snap.exists()) {
          const data = snap.data() as Partial<SiteConfigForFooter>;
          setSiteConfig((prev) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error("load site config in Footer error:", err);
      }
    }

    loadConfig();
  }, []);

  const year = new Date().getFullYear();
  const footerText = isEnglish ? siteConfig.footerEn : siteConfig.footerZh;
  const address = isEnglish ? siteConfig.addressEn : siteConfig.addressZh;

  return (
    <footer className="jyc-footer">
      <div>
        © 2025 All rights reserved: JYC Steel Equip {year} {footerText}
      </div>
      <div className="jyc-footer-sub">
        {isEnglish ? (
          <>
            Email:{" "}
            {siteConfig.email}
          </>
        ) : (
          <>
            邮箱：
            {siteConfig.email}
          </>
        )}
      </div>
    </footer>
  );
}
