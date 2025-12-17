// src/components/Footer.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type SiteConfigForFooter = {
  footerEn?: string;
  footerHi?: string;
  footerId?: string;

  addressEn?: string;
  addressHi?: string;
  addressId?: string;

  phone?: string;
  email?: string;
};

const FOOTER_DEFAULTS: Required<Pick<SiteConfigForFooter, "phone" | "email">> &
  Omit<SiteConfigForFooter, "phone" | "email"> = {
  footerEn: "All rights reserved: JYC Steel Equip",
  footerHi: "",
  footerId: "",

  addressEn: "Baihuagu, Taiyuan, Shanxi Province, China",
  addressHi: "",
  addressId: "",

  phone: "0351-2028121",
  email: "wendy@jycsteelequip.com",
};

const SUPPORTED_LOCALES = ["en", "hi", "id"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function pickLocaleFromPath(pathname: string): Locale {
  const seg = pathname.split("/")[1];
  if (SUPPORTED_LOCALES.includes(seg as Locale)) return seg as Locale;
  return "en";
}

export function Footer() {
  const pathname = usePathname() || "/";
  const locale = useMemo(() => pickLocaleFromPath(pathname), [pathname]);

  const [siteConfig, setSiteConfig] = useState<SiteConfigForFooter>(FOOTER_DEFAULTS);

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

  const footerText =
    locale === "hi"
      ? (siteConfig.footerHi?.trim() || siteConfig.footerEn?.trim() || FOOTER_DEFAULTS.footerEn)
      : locale === "id"
        ? (siteConfig.footerId?.trim() || siteConfig.footerEn?.trim() || FOOTER_DEFAULTS.footerEn)
        : (siteConfig.footerEn?.trim() || FOOTER_DEFAULTS.footerEn);

  const address =
    locale === "hi"
      ? (siteConfig.addressHi?.trim() || siteConfig.addressEn?.trim() || FOOTER_DEFAULTS.addressEn)
      : locale === "id"
        ? (siteConfig.addressId?.trim() || siteConfig.addressEn?.trim() || FOOTER_DEFAULTS.addressEn)
        : (siteConfig.addressEn?.trim() || FOOTER_DEFAULTS.addressEn);

  const email = (siteConfig.email || FOOTER_DEFAULTS.email).trim();
  const phone = (siteConfig.phone || FOOTER_DEFAULTS.phone).trim();

  return (
    <footer className="jyc-footer">
      <div>
        © {year} {footerText}
      </div>

      <div className="jyc-footer-sub">
        {address && <span>{address}</span>}
        {(phone || email) && (
          <>
            {address ? " · " : null}
            {phone ? <span>Tel: {phone}</span> : null}
            {phone && email ? " · " : null}
            {email ? <span>Email: {email}</span> : null}
          </>
        )}
      </div>
    </footer>
  );
}
